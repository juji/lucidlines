import { type ChildProcess, spawn } from "node:child_process";
import { Transform } from "node:stream";
import type { LogEntry } from "./databank";
import type { LucidEvent } from "./lucid-event";

type CommandInput = {
	command: string;
	name: string;
};

function wait(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function nodeStream(
	commands: CommandInput[],
	dev?: boolean,
	lucidEvent?: LucidEvent,
	databank?: ReturnType<typeof import("./databank").createDatabank>,
) {
	// Store running processes for cleanup
	const processes: Array<{
		name: string;
		command: string;
		process: ChildProcess;
		kill: () => void;
		restart: () => void;
	}> = [];

	// Create a custom writable stream that transforms output to JSON
	const transformStream = new Transform({
		objectMode: true,
		transform(chunk, _, callback) {
			try {
				// chunk should be { name, output }
				this.push(chunk);
				callback();
			} catch (error) {
				callback(error as Error);
			}
		},
	});

	function start() {
		if (dev) {
			console.log(`Starting ${commands.length} commands concurrently...`);
			console.log(JSON.stringify(commands, null, 2));
		}

		// Function to start a single process
		const startProcess = (cmd: CommandInput, index: number) => {
			lucidEvent?.emit("start", { index, name: cmd.name });
			try {
				// Parse command and arguments
				const [command, ...args] = cmd.command.split(" ");

				const proc = spawn(command, args, {
					stdio: ["ignore", "pipe", "pipe"],
					shell: true, // Allow shell commands
					env: {
						...process.env,
						// Force color output for commands that support it
						FORCE_COLOR: "1",
						CLICOLOR_FORCE: "1",
						COLORTERM: "truecolor",
					},
				});

				// Handle stdout
				proc.stdout?.on("data", (data) => {
					const output = data.toString().trim();
					if (output) {
						// Split multi-line output
						const lines = output.split("\n");
						for (const line of lines) {
							if (line.trim()) {
								transformStream.write({ name: cmd.name, output: line });
							}
						}
					}
				});

				// Handle stderr
				proc.stderr?.on("data", (data) => {
					const output = data.toString().trim();
					if (output) {
						// Split multi-line output
						const lines = output.split("\n");
						for (const line of lines) {
							if (line.trim()) {
								transformStream.write({ name: cmd.name, output: line });
							}
						}
					}
				});

				// Handle process exit
				proc.on("exit", (code) => {
					if (code !== 0) {
						transformStream.write({
							name: cmd.name,
							output: `Process exited with code ${code}`,
						});
					}
				});

				const kill = async () => {
					try {
						lucidEvent?.emit("kill", { index, name: cmd.name });
						proc.kill("SIGTERM");
						// Give it a moment, then force kill if needed
						await wait(1000);
						if (!proc.killed) {
							lucidEvent?.emit("forcekill", { index, name: cmd.name });
							proc.kill("SIGKILL");
						}
					} catch (_error) {
						// Ignore kill errors
					}
				};

				const restart = async () => {
					await kill();
					// Start new process after a brief delay
					await wait(1000);
					startProcess(cmd, index);
				};

				processes[index] = {
					name: cmd.name,
					command: cmd.command,
					process: proc,
					kill,
					restart,
				};
			} catch (error) {
				transformStream.write({
					name: cmd.name,
					output: `Failed to start command: ${error}`,
				});
			}
		};

		// Start each command with execa-like control
		for (let i = 0; i < commands.length; i++) {
			const cmd = commands[i];
			startProcess(cmd, i);
		}

		// Set up the handling for object mode transform stream
		transformStream.on("data", (data: any) => {
			// Use the name as the type and output as the data for databank
			databank?.addData(data.name, data.output);

			// In dev mode, also log to console
			if (dev) {
				console.log(`[${data.name}] ${data.output}`);
			}
		});
	}

	// Return interface compatible with existing code
	const result = {
		start,
		transformStream,
		processes, // Expose processes array for external access
		restartProcess: async (index: number) => {
			if (index >= 0 && index < processes.length) {
				return await processes[index].restart();
			}
			return null;
		},
		restartAll: async () => {
			return await Promise.all(processes.map((proc) => proc.restart()));
		},
		async stop() {
			await Promise.all(processes.map((proc) => proc.kill()));
		},
	};

	return result;
}

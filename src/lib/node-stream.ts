import { spawn } from "node:child_process";
import { Transform } from "node:stream";

type CommandInput = {
	command: string;
	name: string;
};

export function start(commands: CommandInput[], dev?: boolean) {
	if (dev) {
		console.log(`Starting ${commands.length} commands concurrently...`);
		console.log(JSON.stringify(commands, null, 2));
	}

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

	// Store running processes for cleanup
	const processes: Array<{ name: string; process: any; kill: () => void }> = [];

	// Start each command with execa-like control
	for (const cmd of commands) {
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

			processes.push({
				name: cmd.name,
				process: proc,
				kill: () => {
					try {
						console.log(`Killing process "${cmd.name}"...`);
						proc.kill("SIGTERM");
						// Give it a moment, then force kill if needed
						setTimeout(() => {
							if (!proc.killed) {
								console.log(`Force killing process "${cmd.name}"...`);
								proc.kill("SIGKILL");
							}
						}, 5000);
					} catch (error) {
						// Ignore kill errors
					}
				},
			});
		} catch (error) {
			transformStream.write({
				name: cmd.name,
				output: `Failed to start command: ${error}`,
			});
		}
	}

	// Return interface compatible with existing code
	return {
		result: Promise.resolve(), // Not used in current code
		transformStream,
		stop() {
			processes.forEach((proc) => {
				try {
					proc.kill();
				} catch (_error) {
					// Ignore errors during kill
				}
			});
		},
	};
}

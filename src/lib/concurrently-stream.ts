import { Transform } from "node:stream";
import concurrently from "concurrently";

type CommandInput = {
	command: string;
	name: string;
};

export function start(commands: CommandInput[]) {
	// Set to store already processed lines
	let buffer = "";

	// Use a distinctive three-character combination as a delimiter
	const DELIMITER = "§¶≈"; // Section sign, paragraph sign, and approximately equal sign

	// Create a custom writable stream that transforms output to JSON
	const transformStream = new Transform({
		transform(chunk, _, callback) {
			try {
				buffer += chunk.toString();

				// check if buffer contains new line
				if (!buffer.includes("\n")) {
					callback();
					return;
				}

				const lines = buffer.split("\n");
				buffer = lines.pop() || "";

				for (const line of lines) {
					// Simplest possible extraction - just get the command name between brackets
					const match = line.match(/\[([A-Z]+)\]/);
					if (!match) continue;

					const name = match[1];
					const output = line.substring(line.indexOf("]") + 1);

					// Remove ANSI escape sequences only from the beginning of the output
					// Using a safer approach without control characters
					const ansiPattern = /^\s*\[\d+m/;
					const cleanOutput = output.replace(ansiPattern, "");

					this.push(JSON.stringify({ name, output: cleanOutput }) + DELIMITER);
				}

				callback();
			} catch (error) {
				callback(error as Error);
			}
		},
	});

	// Run client and server concurrently
	const { result, commands: processedCommands } = concurrently(
		commands.map((v) => ({
			command: v.command,
			name: v.name,
		})),
		{
			prefix: "name",
			killOthersOn: ["failure"],
			restartTries: 0,
			outputStream: transformStream,
		},
	);

	// return the result
	return {
		result,
		transformStream,
		delimiter: DELIMITER,
		stop() {
			processedCommands.forEach((cmd) => {
				try {
					cmd.kill();
				} catch (_error) {
					// Ignore errors during kill
				}
			});
		},
	};
}

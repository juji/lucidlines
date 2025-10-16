import { Transform } from "node:stream";
import concurrently from "concurrently";

type CommandInput = {
	command: string;
	name: string;
};

export function start(commands: CommandInput[], dev?: boolean) {
	// Set to store already processed lines
	let buffer = "";

	if (dev) {
		console.log(`Starting ${commands.length} commands concurrently...`);
		console.log(JSON.stringify(commands, null, 2));
	}

	// Create set of valid command names for validation
	const validCommandNames = new Set(commands.map((cmd) => cmd.name));

	// Function to extract name from bracketed output
	function extractBracketedName(
		line: string,
	): { name: string; afterBracket: string } | null {
		// Find all complete bracketed sections
		const bracketRegex = /\[([^[\]]*(?:\[[^[\]]*\][^[\]]*)*)\]/g;
		const matches: Array<{ content: string; endPos: number }> = [];
		let match: RegExpExecArray | null;

		match = bracketRegex.exec(line);
		while (match !== null) {
			matches.push({
				content: match[1],
				endPos: match.index + match[0].length - 1, // Position of closing ]
			});
			match = bracketRegex.exec(line);
		}

		if (matches.length === 0) return null;

		// Find the bracketed section that matches a known command name
		for (const match of matches.reverse()) {
			// Check from right to left (most likely to be command name)
			if (validCommandNames.has(match.content)) {
				const afterBracket = line.substring(match.endPos + 1);
				return { name: match.content, afterBracket };
			}
		}

		// Fallback: use the rightmost bracketed section
		const lastMatch = matches[matches.length - 1];
		const afterBracket = line.substring(lastMatch.endPos + 1);
		return { name: lastMatch.content, afterBracket };
	}

	// Create a custom writable stream that transforms output to JSON
	const transformStream = new Transform({
		objectMode: true,
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
					// Extract command name from [NAME] prefix, handling nested brackets
					const bracketMatch = extractBracketedName(line);
					if (!bracketMatch) continue;

					const { name, afterBracket } = bracketMatch;
					const output = afterBracket;

					this.push({ name, output });
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
			restartTries: 0,
			outputStream: transformStream,
		},
	);

	// return the result
	return {
		result,
		transformStream,
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

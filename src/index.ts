import path from "node:path";
import { fileURLToPath } from "node:url";
import { createDatabank } from "./lib/databank";
import { createLucidEvent } from "./lib/lucid-event";
import { nodeStream } from "./lib/node-stream";
import { start as startServer } from "./lib/server";

// get current directory for esm and cjs
const moduleDirname = (() => {
	// CommonJS environment - __dirname is available
	if (typeof __dirname !== "undefined") {
		return __dirname;
	}

	// ESM environment - use import.meta.url if available
	try {
		// Check if we're in an ESM context by checking if import.meta exists
		const metaUrl = (globalThis as { import?: { meta?: { url?: string } } })
			.import?.meta?.url;
		if (metaUrl) {
			return path.dirname(fileURLToPath(metaUrl));
		}
	} catch {
		// Ignore errors in CommonJS context
	}

	throw new Error("Cannot determine module directory");
})();

// check for validity of command names
function validateCommandName(name: string): boolean {
	// Prevent names that would break parsing or cause issues
	return name.length > 0 && !name.includes("\n") && !name.includes("\r");
}

function wait(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Main entry point for LucidLines
 * Starts the server and configures the concurrently-stream
 */
export function start(options: {
	serverPort?: number;
	frontEnd?: string | number;
	commands?: Array<{
		command: string;
		name: string;
	}>;
	dev?: boolean;
}) {
	// Validate command names
	if (options.commands) {
		for (const cmd of options.commands) {
			if (!validateCommandName(cmd.name)) {
				throw new Error(
					`Invalid command name "${cmd.name}". Command names cannot be empty and cannot contain newlines.`,
				);
			}
		}
	}

	const {
		serverPort,
		frontEnd = moduleDirname,
		commands = [],
		dev = false,
	} = options;

	// Create instance-specific resources
	const lucidEvent = createLucidEvent();
	const databank = createDatabank();

	// Start the server
	const server = serverPort
		? startServer({
				port: serverPort,
				frontEnd,
				wsPath: "/ws",
				dev,
				databank,
			})
		: null;

	// If commands are provided, start node-stream
	const currentNodeStream = nodeStream(commands, dev, lucidEvent, databank);

	// wait so that it doesn't hog down the cli
	// this also let the log events be listened by the user after the start() call
	wait(100).then(() => {
		if (commands.length > 0) {
			currentNodeStream.start();
		}
	});

	let stopping = false;
	async function stop() {
		if (stopping) return;
		stopping = true;

		await currentNodeStream.stop();
		server?.stop();
		databank.cleanup();
	}

	return {
		server,
		nodeStream: currentNodeStream,
		databank,
		lucidEvent,
		stop,
	};
}

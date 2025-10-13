import path from "node:path";
import { fileURLToPath } from "node:url";
import { start as startConcurrentlyStream } from "./lib/concurrently-stream";
import databank from "./lib/databank";
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
		const metaUrl = (globalThis as any).import?.meta?.url;
		if (metaUrl) {
			return path.dirname(fileURLToPath(metaUrl));
		}
	} catch {
		// Ignore errors in CommonJS context
	}

	throw new Error("Cannot determine module directory");
})();

/**
 * Main entry point for LucidLines
 * Starts the server and configures the concurrently-stream
 */
export function start(options: {
	serverPort?: number;
	frontEnd?: string | number;
	wsPath?: string;
	commands?: Array<{
		command: string;
		name: string;
	}>;
	dev?: boolean;
}) {
	const {
		serverPort = 8080,
		frontEnd = path.join(moduleDirname, "./client"),
		wsPath = "/ws",
		commands = [],
		dev = false,
	} = options;

	// Start the server
	const server = startServer({
		port: serverPort,
		frontEnd,
		wsPath,
	});

	// If commands are provided, start concurrently-stream
	let concurrentlyStream:
		| ReturnType<typeof startConcurrentlyStream>
		| undefined;
	if (commands.length > 0) {
		concurrentlyStream = startConcurrentlyStream(commands);

		// Set up the handling for object mode transform stream
		concurrentlyStream.transformStream.on("data", (data) => {
			// Use the name as the type and output as the data for databank
			databank.addData(data.name, data.output);

			// In dev mode, also log to console
			if (dev) {
				console.log(`[${data.name}] ${data.output}`);
			}
		});
	}

	function stop() {
		concurrentlyStream?.stop();
		server.stop();
		databank.cleanup();
	}

	// Setup process termination handler
	process.on("SIGINT", () => {
		stop();
		process.exit(0);
	});

	return {
		server,
		concurrentlyStream,
		databank,
		stop,
	};
}

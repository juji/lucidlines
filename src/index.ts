import { start as startConcurrentlyStream } from "./lib/concurrently-stream";
import databank from "./lib/databank";
import { start as startServer } from "./lib/server";

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
		frontEnd,
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

		// Set up the piping based on dev mode
		if (dev) {
			// In dev mode, pipe to both stdout and dataReceiver
			// This will display output in the console and broadcast to WebSocket clients
			concurrentlyStream.transformStream
				.pipe(process.stdout)
				.pipe(server.dataReceiver);
		} else {
			// In production mode, only pipe to dataReceiver (no console output)
			concurrentlyStream.transformStream.pipe(server.dataReceiver);
		}

		// Setup process termination handler
		process.on("SIGINT", () => {
			console.log("\nShutting down processes...");
			concurrentlyStream?.stop();
			server.stop();
			databank.cleanup();
			process.exit(0);
		});
	} else {
		// Setup process termination handler for server only
		process.on("SIGINT", () => {
			console.log("\nShutting down server...");
			server.stop();
			databank.cleanup();
			process.exit(0);
		});
	}

	return {
		server,
		concurrentlyStream,
		databank,
		stop: () => {
			if (concurrentlyStream) {
				concurrentlyStream.stop();
			}
			server.stop();
			databank.cleanup();
		},
	};
}

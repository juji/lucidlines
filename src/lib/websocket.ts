import type { Server as HttpServer } from "node:http";
import { type WebSocket, WebSocketServer } from "ws";
import databank from "./databank";

/**
 * WebSocket manager for LucidLines
 * Handles WebSocket connections, client tracking, and data distribution
 */
export interface WebSocketManagerOptions {
	httpServer: HttpServer;
	wsPath: string;
}

export class WebSocketManager {
	private wss: WebSocketServer;

	constructor(options: WebSocketManagerOptions) {
		const { httpServer, wsPath } = options;

		// Create WebSocket server with specific path
		this.wss = new WebSocketServer({
			server: httpServer,
			path: wsPath,
		});

		this.setupEventHandlers();
	}

	private setupEventHandlers(): void {
		// Handle WebSocket connections
		this.wss.on("connection", (ws, _req) => this.handleConnection(ws));
	}

	private handleConnection(ws: WebSocket): void {
		console.log("WebSocket client connected");

		// Send recent messages from the databank to new client
		const recentMessages = databank.getRecentMessages();
		if (recentMessages.length > 0) {
			// Loop through each message and send it individually
			for (let i = recentMessages.length - 1; i >= 0; i--) {
				ws.send(
					JSON.stringify({
						type: "log",
						messages: recentMessages[i],
					}),
				);
			}
		}

		// Subscribe this client to databank events
		const unsubscribe = databank.subscribe(
			(data: { type: string; data: string; timestamp: number }) => {
				if (ws.readyState === ws.OPEN) {
					ws.send(
						JSON.stringify({
							type: "log",
							messages: data,
						}),
					);
				}
			},
		);

		// Handle incoming messages
		ws.on("message", (data) => {
			try {
				console.log("Received: %s", data);

				// not implemented yet,
				// will be used for getting historical data
			} catch (error) {
				console.error("Error processing message:", error);
				ws.send(
					JSON.stringify({
						type: "error",
						message: "Invalid message format",
					}),
				);
			}
		});

		// Handle disconnection
		ws.on("close", () => {
			console.log("WebSocket client disconnected");
			unsubscribe(); // Clean up databank subscription
		});

		// Handle errors
		ws.on("error", (error) => {
			console.error("WebSocket error:", error);
			unsubscribe(); // Clean up databank subscription
		});
	}

	/**
	 * Close all WebSocket connections and clean up resources
	 */
	public close(): void {
		// Close WebSocket server (this will terminate all connections)
		this.wss.close();
	}

	/**
	 * Get the WebSocket server instance
	 */
	public getServer(): WebSocketServer {
		return this.wss;
	}
}

/**
 * Create a new WebSocket manager
 */
export function createWebSocketManager(
	options: WebSocketManagerOptions,
): WebSocketManager {
	return new WebSocketManager(options);
}

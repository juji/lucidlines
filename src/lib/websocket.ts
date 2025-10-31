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
		// console.log("WebSocket client connected");

		// get total length of messages in databank
		// this includes data in loki and in-memory
		const totalMessages = databank.getTotalMessageCount();
		const types = databank.getAvailableTypes();
		const totalByTypes = types.map((type) => ({
			type,
			count: databank.getMessageCountByType(type),
		}));

		// send those to the client
		ws.send(
			JSON.stringify({
				type: "info",
				message: {
					types: types,
					total: totalMessages,
					byType: totalByTypes,
				},
			}),
		);

		// Send recent messages from the databank to new client
		const recentMessages = databank.getRecentMessages();
		if (recentMessages.length > 0) {
			ws.send(
				JSON.stringify({
					type: "history",
					messages: recentMessages,
				}),
			);
		}

		// Subscribe this client to databank events
		const unsubscribe = databank.subscribe(
			(data: { type: string; data: string; timestamp: number }) => {
				if (ws.readyState === ws.OPEN) {
					ws.send(
						JSON.stringify({
							type: "log",
							message: data,
						}),
					);
				}
			},
		);

		// Handle incoming messages
		ws.on("message", (data) => {
			try {
				console.log("Received: %s", data);

				const message = JSON.parse(data.toString());
				if (message.type === "history") {
					const lastTimestamp = message.lastTimestamp;
					const type = message.logType;
					const history = databank.getMessageByType(type, lastTimestamp, 100);
					ws.send(
						JSON.stringify({
							type: "history",
							messages: history,
						}),
					);
				}

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
			// console.log("WebSocket client disconnected");
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

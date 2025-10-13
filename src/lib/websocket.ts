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
	private clients = new Map<
		string,
		{
			id: string;
			socket: WebSocket;
			lastActivity: number;
		}
	>();

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
		const clientId = `client_${Math.random().toString(36).substring(2, 10)}`;
		console.log(`WebSocket client connected: ${clientId}`);

		// Store client information
		this.clients.set(clientId, {
			id: clientId,
			socket: ws,
			lastActivity: Date.now(),
		});

		// Send welcome message with client ID
		ws.send(
			JSON.stringify({
				type: "connection",
				clientId,
				message: "Connected to LucidLines server",
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
					ws.send(JSON.stringify(data));
				}
			},
		);

		// Handle incoming messages
		ws.on("message", (data) => {
			try {
				console.log("Received: %s", data);
				const message = JSON.parse(data.toString());

				// Process message (you can extend this with your logic)
				ws.send(
					JSON.stringify({
						type: "response",
						originalMessage: message,
						timestamp: Date.now(),
					}),
				);

				// Add message to databank if needed
				// databank.addData('client-message', JSON.stringify(message));
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
			console.log(`WebSocket client disconnected: ${clientId}`);
			this.clients.delete(clientId);
			unsubscribe(); // Clean up databank subscription
		});

		// Handle errors
		ws.on("error", (error) => {
			console.error(`WebSocket error for client ${clientId}:`, error);
			this.clients.delete(clientId);
			unsubscribe(); // Clean up databank subscription
		});
	}

	/**
	 * Close all WebSocket connections and clean up resources
	 */
	public close(): void {
		// Close all client connections
		for (const client of this.clients.values()) {
			client.socket.terminate();
		}
		this.clients.clear();

		// Close WebSocket server
		this.wss.close();
	}

	/**
	 * Get the WebSocket server instance
	 */
	public getServer(): WebSocketServer {
		return this.wss;
	}

	/**
	 * Get the count of connected clients
	 */
	public getClientCount(): number {
		return this.clients.size;
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

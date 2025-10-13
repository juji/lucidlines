import { existsSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import {
	createServer,
	type IncomingMessage,
	type ServerResponse,
} from "node:http";
import { extname, join } from "node:path";
import { createProxyServer } from "http-proxy";
import { type WebSocket, WebSocketServer } from "ws";
import databank from "./databank";

// MIME types for common file extensions
const MIME_TYPES: Record<string, string> = {
	".html": "text/html",
	".js": "text/javascript",
	".css": "text/css",
	".json": "application/json",
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".gif": "image/gif",
	".svg": "image/svg+xml",
	".ico": "image/x-icon",
	".woff": "font/woff",
	".woff2": "font/woff2",
	".ttf": "font/ttf",
	".otf": "font/otf",
	".eot": "application/vnd.ms-fontobject",
};

export interface ServerOptions {
	port: number;
	frontEnd?: string | number;
	wsPath?: string;
}

export function start({
	port = 8080,
	frontEnd,
	wsPath = "/ws",
}: ServerOptions) {
	// Create HTTP server
	const server = createServer();

	// Create WebSocket server with specific path
	const wss = new WebSocketServer({
		server,
		path: wsPath,
	});

	// Create proxy server for development mode
	const frontendPort = typeof frontEnd === "number" ? frontEnd : null;
	const frontEndDir = typeof frontEnd === "string" ? frontEnd : null;

	const proxy = frontendPort
		? createProxyServer({
				target: `http://localhost:${frontendPort}`,
				ws: false, // We'll handle WebSockets separately
			})
		: null;

	// Track connected clients
	const clients = new Map();

	// Handle WebSocket connections
	wss.on("connection", function connection(ws, _req) {
		const clientId = `client_${Math.random().toString(36).substring(2, 10)}`;
		console.log(`WebSocket client connected: ${clientId}`);

		// Store client information
		clients.set(clientId, {
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
		ws.on("message", function message(data) {
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
			clients.delete(clientId);
			unsubscribe(); // Clean up databank subscription
		});

		// Handle errors
		ws.on("error", (error) => {
			console.error(`WebSocket error for client ${clientId}:`, error);
			clients.delete(clientId);
			unsubscribe(); // Clean up databank subscription
		});
	});

	// Handle HTTP requests
	server.on("request", async (req: IncomingMessage, res: ServerResponse) => {
		const url = new URL(req.url || "/", `http://${req.headers.host}`);

		// Skip handling WebSocket upgrade requests
		if (url.pathname === wsPath) {
			return;
		}

		try {
			// Development mode: Proxy to frontend dev server
			if (frontendPort) {
				console.log(`Proxying request to frontend dev server: ${url.pathname}`);
				proxy?.web(req, res, {}, (err: Error) => {
					console.error("Proxy error:", err);
					res.statusCode = 500;
					res.end("Proxy error");
				});
			}
			// Production mode: Serve static files
			else if (frontEndDir && existsSync(frontEndDir)) {
				await serveStaticFile(req, res, frontEndDir);
			}
			// No frontend configuration
			else {
				res.statusCode = 404;
				res.end("Not found");
			}
		} catch (error) {
			console.error("Error handling request:", error);
			res.statusCode = 500;
			res.end("Internal server error");
		}
	});

	// Start the server
	server.listen(port, () => {
		console.log(`LucidLines server running on port ${port}`);

		if (frontendPort) {
			console.log(
				`Development mode: Proxying requests to http://localhost:${frontendPort}`,
			);
		} else if (frontEndDir) {
			console.log(`Production mode: Serving static files from ${frontEndDir}`);
		}

		console.log(
			`WebSocket server available at ws://localhost:${port}${wsPath}`,
		);
	});

	// Get the writable stream from databank for receiving data
	const dataReceiver = databank.getWritable();

	return {
		server,
		dataReceiver,
		stop: () => {
			// Close all WebSocket connections
			for (const client of clients.values()) {
				// Use a more specific type for WebSocket
				(client.socket as WebSocket).terminate();
			}
			clients.clear();

			// Close proxy if it exists
			if (proxy) {
				proxy.close();
			}

			// Close WebSocket server
			wss.close();

			// Close HTTP server
			server.close();
			console.log("LucidLines server stopped");
		},
	};
}

// Utility function to serve static files
async function serveStaticFile(
	req: IncomingMessage,
	res: ServerResponse,
	rootDir: string,
): Promise<void> {
	try {
		// Get the requested file path
		const url = new URL(req.url || "/", `http://${req.headers.host}`);
		let filePath = join(rootDir, url.pathname);

		// If path ends with '/', serve index.html
		if (filePath.endsWith("/")) {
			filePath = join(filePath, "index.html");
		}

		// Check if file exists and is a regular file
		if (!existsSync(filePath) || !statSync(filePath).isFile()) {
			// Fallback to index.html for SPA routing
			filePath = join(rootDir, "index.html");
			if (!existsSync(filePath)) {
				res.statusCode = 404;
				res.end("Not found");
				return;
			}
		}

		// Get file extension and set content type
		const ext = extname(filePath).toLowerCase();
		const contentType = MIME_TYPES[ext] || "application/octet-stream";

		// Read and serve the file
		const content = await readFile(filePath);
		res.setHeader("Content-Type", contentType);
		res.end(content);
	} catch (error) {
		console.error("Error serving static file:", error);
		res.statusCode = 500;
		res.end("Internal server error");
	}
}

import { existsSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import {
	createServer,
	type IncomingMessage,
	type ServerResponse,
} from "node:http";
import { extname, join } from "node:path";
import { createProxyServer } from "http-proxy";
import { createWebSocketManager, type WebSocketManager } from "./websocket";

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
	dev?: boolean;
}

export function start({
	port = 8080,
	frontEnd,
	wsPath = "/ws",
	dev,
}: ServerOptions) {
	// Create HTTP server
	const server = createServer();

	// Create proxy server for development mode
	const frontendPort = typeof frontEnd === "number" ? frontEnd : null;
	const frontEndDir = typeof frontEnd === "string" ? frontEnd : null;

	const proxy = frontendPort
		? createProxyServer({
				target: `http://localhost:${frontendPort}`,
				ws: false, // We'll handle WebSockets separately
			})
		: null;

	// Initialize WebSocket manager
	const wsManager = createWebSocketManager({
		httpServer: server,
		wsPath,
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
				if (dev)
					console.log(
						`Proxying request to frontend dev server: ${url.pathname}`,
					);
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
		if (dev) console.log(`LucidLines server running on port ${port}`);

		if (frontendPort) {
			if (dev)
				console.log(
					`Development mode: Proxying requests to http://localhost:${frontendPort}`,
				);
		} else if (frontEndDir) {
			if (dev)
				console.log(
					`Production mode: Serving static files from ${frontEndDir}`,
				);
		}

		if (dev)
			console.log(
				`WebSocket server available at ws://localhost:${port}${wsPath}`,
			);
	});

	return {
		server,
		stop: () => {
			// Close WebSocket connections
			wsManager.close();

			// Close proxy if it exists
			if (proxy) {
				proxy.close();
			}

			// Close HTTP server
			server.close();
			console.log("LucidLines server stopped");
		},
	};
}

// Utility function to serve static files
async function serveStaticFile(
	_req: IncomingMessage,
	res: ServerResponse,
	rootDir: string,
): Promise<void> {
	try {
		// Get the requested file path
		let filePath = rootDir;

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

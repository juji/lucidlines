import { start } from "./server";

// Configuration for development mode
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
const FRONTEND_PORT = process.env.FRONTEND_PORT
	? parseInt(process.env.FRONTEND_PORT, 10)
	: 5173;

// Start the server in development mode
console.log(
	`Starting development server on port ${PORT}, proxying to localhost:${FRONTEND_PORT}`,
);

const server = start({
	port: PORT,
	frontendPort: FRONTEND_PORT,
	wsPath: "/ws",
});

// Handle process termination
process.on("SIGINT", () => {
	console.log("\nShutting down development server...");
	server.stop();
	process.exit(0);
});

console.log(`
✨ Development server running ✨
- WebSocket server: ws://localhost:${PORT}/ws
- HTTP proxy: http://localhost:${PORT} -> http://localhost:${FRONTEND_PORT}
- Press Ctrl+C to stop
`);

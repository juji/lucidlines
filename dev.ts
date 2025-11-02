#!/usr/bin/env tsx

import { start } from "./src/index";
// import path from "node:path";
// import { start } from "./dist/index";

const dir = __dirname

console.log("Starting LucidLines Dev Server at", dir);
console.log("go to http://localhost:8080 to view the client");
console.log("");

// Start the app using our own implementation
const { stop, lucidEvent } = start({
	serverPort: 8080,
	frontEnd: 5173, // Vite's default port for the client
	// frontEnd: path.join(__dirname, "./dist"), // Serve static files from the client build directory
	commands: [
		// Data simulation commands
		{
			command: "tsx ./dev/weather.ts",
			name: "WEATHER",
		},
		{
			command: "tsx ./dev/stocks.ts",
			name: "STOCKS",
		},
		
		// {
		// 	command: "tsx ./dev/stocks.ts wqer",
		// 	name: "af-asf@lass",
		// },
		// {
		// 	command: "tsx ./dev/stocks.ts wqer",
		// 	name: "[][][]@)_+!~!~@#$%^&*()_+{}[]:\";'<>?,./",
		// },
		{
			command: "tsx --watch ./dev/server-logs.ts",
			name: "SERVER",
		},
		// {
		// 	command: "tsx ./dev/server-logs.ts",
		// 	name: "SERVER3",
		// },
		// {
		// 	command: "tsx ./dev/server-logs.ts",
		// 	name: "SERVER2",
		// },
		{
			command: "cd ./client && npm run dev",
			name: "REACT",
		},
	],
	dev: false, // Enable dev mode for console logging
});

// Listen for all LucidEvent events and log them
lucidEvent.on("start", (data) => {
	console.log(`[${data.index}] ${data.name} \u001b[32mstarted\u001b[0m`);
});

lucidEvent.on("kill", (data) => {
	console.log(`[${data.index}] ${data.name} \u001b[31mkilled\u001b[0m`);
});

lucidEvent.on("forcekill", (data) => {
	console.log(`[${data.index}] ${data.name} \u001b[90mforce killed\u001b[0m`);
});

// Handle various termination signals
process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGHUP", () => handleShutdown("SIGHUP")); // Terminal closed
process.on("SIGINT", () => handleShutdown("SIGINT")); // Ctrl+C
process.on("SIGQUIT", () => handleShutdown("SIGQUIT")); // Ctrl+\

async function handleShutdown(signal?: string) {
	try {
		await stop();
		console.log("LucidLines cleanly exited.");
		process.exit(0);
	} catch (error) {
		console.error(
			`Error during shutdown${signal ? ` (${signal})` : ""}:`,
			error,
		);
		process.exit(1);
	}
}

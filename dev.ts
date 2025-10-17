#!/usr/bin/env tsx

import { start } from "./src/index";
import path from "node:path";
// import { start } from "./dist/index";

const dir = __dirname

console.log("Starting LucidLines Dev Server at", dir);

// Start the app using our own implementation
start({
	serverPort: 8080,
	// frontEnd: 5173, // Vite's default port for the client
	frontEnd: path.join(__dirname, "./dist"), // Serve static files from the client build directory
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
			command: "tsx ./dev/server-logs.ts",
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
		// {
		// 	command: "cd ./client && npm run dev",
		// 	name: "REACT",
		// },
		// {
		// 	command: "cd ./client && npm run dev",
		// 	name: "REACT",
		// },
	],
	// dev: true, // Enable dev mode for console logging
});

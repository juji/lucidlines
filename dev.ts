#!/usr/bin/env tsx

import { start } from "./src/index";

// Start the app using our own implementation
start({
	serverPort: 8080,
	frontEnd: 5173, // Vite's default port for the client
	commands: [
		// Data simulation commands
		{
			command: "tsx ./dev/weather.ts",
			name: "WEATHER",
		},
		{
			command: "tsx ./dev/stocks.ts asdf",
			name: "STOCKS",
		},
		{
			command: "tsx ./dev/stocks.ts wqer",
			name: "STOCKS2",
		},
		{
			command: "tsx ./dev/server-logs.ts",
			name: "SERVER",
		},
		{
			command: "cd ./client && npm run dev",
			name: "REACT",
		},
	],
	dev: true, // Enable dev mode for console logging
});

#!/usr/bin/env tsx

import { start } from "./src/index";

// Start the app using our own implementation
start({
	serverPort: 8080,
	frontEnd: 5173, // Vite's default port for the client
	commands: [
		{
			command: "tsx ./dev/weather.ts",
			name: "WEATHER",
		},
		{
			command: "tsx ./dev/stocks.ts",
			name: "STOCKS",
		},
		{
			command: "tsx ./dev/server-logs.ts",
			name: "SERVER",
		},
	],
	dev: true, // Enable dev mode for console logging
});

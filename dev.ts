#!/usr/bin/env tsx

import { start } from "./src/index";

// Start the app using our own implementation
start({
	serverPort: 8080,
	frontEnd: 5173, // Vite's default port for the client
	commands: [
		{
			command: "cd client && npm run dev",
			name: "CLIENT",
		},
	],
	dev: true, // Enable dev mode for console logging
});

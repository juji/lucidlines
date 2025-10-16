#!/usr/bin/env node

import { start } from "./index.js";

interface Command {
	name: string;
	command: string;
}

function parseArgs(): {
	serverPort: number;
	commands: Command[];
	dev: boolean;
} {
	const args = process.argv.slice(2);
	let serverPort = 8080;
	const commands: Command[] = [];
	let dev = false;

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];

		switch (arg) {
			case "--port":
			case "-p": {
				const portValue = args[++i];
				if (!portValue || isNaN(Number(portValue))) {
					console.error(`Invalid port value: ${portValue}`);
					process.exit(1);
				}
				serverPort = Number(portValue);
				break;
			}

			case "--command":
			case "-c": {
				const commandValue = args[++i];
				if (!commandValue) {
					console.error("Command value is required after --command");
					process.exit(1);
				}

				// Parse command in format "name:command"
				const colonIndex = commandValue.indexOf(":");
				if (colonIndex === -1) {
					console.error(
						`Invalid command format: ${commandValue}. Use "name:command"`,
					);
					process.exit(1);
				}

				const name = commandValue.substring(0, colonIndex).trim();
				const command = commandValue.substring(colonIndex + 1).trim();

				if (!name || !command) {
					console.error(
						`Invalid command format: ${commandValue}. Both name and command must be non-empty`,
					);
					process.exit(1);
				}

				commands.push({ name, command });
				break;
			}

			case "--dev":
			case "-d":
				dev = true;
				break;

			case "--help":
			case "-h":
				showHelp();
				process.exit(0);
				break;

			default:
				console.error(`Unknown argument: ${arg}`);
				showHelp();
				process.exit(1);
		}
	}

	return { serverPort, commands, dev };
}

function showHelp() {
	console.log(`
LucidLines - Terminal streaming server

Usage:
  lucidlines [options]

Options:
  -p, --port <port>          Server port (default: 8080)
  -c, --command <name:cmd>   Add command to run (can be used multiple times)
  -d, --dev                  Enable development mode (console logging)
  -h, --help                 Show this help message

Examples:
  lucidlines --port 3000 --command "server:npm run dev" --command "logs:tail -f /var/log/app.log"
  lucidlines -p 8081 -c "web:python app.py" -c "db:mongod" --dev
`);
}

// Parse arguments and start the server
const options = parseArgs();

console.log(`Starting LucidLines on port ${options.serverPort}...`);
if (options.commands.length > 0) {
	console.log(
		`Commands: ${options.commands.map((cmd) => `${cmd.name} (${cmd.command})`).join(", ")}`,
	);
}
if (options.dev) {
	console.log("Development mode enabled");
}

start({
	serverPort: options.serverPort,
	commands: options.commands,
	dev: options.dev,
});

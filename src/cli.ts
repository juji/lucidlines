#!/usr/bin/env node

import { join } from "node:path";
import { start } from "./index.js";
import { createConfig, loadConfig } from "./lib/create-config.js";

interface Command {
	name: string;
	command: string;
}

function parseArgs(): {
	subcommand?: string;
	serverPort: number;
	commands: Command[];
	dev: boolean;
	configFile?: string;
} {
	const args = process.argv.slice(2);
	let subcommand: string | undefined;
	let serverPort = 8080;
	const commands: Command[] = [];
	let dev = false;
	let configFile: string | undefined;

	// Check for subcommand (first argument without --)
	if (args.length > 0 && !args[0].startsWith("-")) {
		subcommand = args.shift();
	}

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

			case "--config":
			case "-C": {
				const configValue = args[++i];
				if (!configValue) {
					console.error("Config file path is required after --config");
					process.exit(1);
				}
				configFile = configValue;
				break;
			}

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

	return { subcommand, serverPort, commands, dev, configFile };
}

function showHelp() {
	console.log(`
LucidLines - Terminal streaming server

Usage:
  lucidlines [subcommand] [options]

Subcommands:
  init                    Create a .lucidlines.json5 configuration file

Options:
  -p, --port <port>          Server port (default: 8080)
  -c, --command <name:cmd>   Add command to run (can be used multiple times)
  -C, --config <file>        Path to JSON5 config file (default: .lucidlines.json5)
  -d, --dev                  Enable development mode (console logging)
  -h, --help                 Show this help message

Examples:
  lucidlines init
  lucidlines --port 3000 --command "server:npm run dev" --command "logs:tail -f /var/log/app.log"
  lucidlines -p 8081 -c "web:python app.py" -c "db:mongod" --dev
`);
}

// Parse arguments
const options = parseArgs();

// Handle subcommands
if (options.subcommand === "init") {
	try {
		createConfig();
	} catch (error) {
		console.error("❌ Failed to create configuration file:", error);
		process.exit(1);
	}
	process.exit(0);
}

// Load configuration if it exists (except for help)
let configLoaded = false;
let configFilePath = ".lucidlines.json5";
if (options.subcommand !== "help") {
	// Use specified config file or default
	const configFile = options.configFile || ".lucidlines.json5";
	configFilePath = options.configFile
		? options.configFile
		: join(process.cwd(), ".lucidlines.json5");

	const config = loadConfig(options.configFile);
	if (config) {
		configLoaded = true;
		// Merge config with command line options (command line takes precedence)
		if (config.port !== undefined && options.serverPort === 8080) {
			options.serverPort = config.port;
		}
		if (config.commands && options.commands.length === 0) {
			options.commands = config.commands;
		}
		if (config.dev !== undefined && !options.dev) {
			options.dev = config.dev;
		}
	}
}

// Print configuration status
if (configLoaded) {
	console.log(`📄 Configuration loaded from ${configFilePath}`);
} else {
	console.log(`📄 No configuration file found (${configFilePath})`);
}

// Print all parameters beautifully
console.log("\n🚀 Starting LucidLines with configuration:");
console.log(`   Port: ${options.serverPort}`);
console.log(`   Development mode: ${options.dev ? "enabled" : "disabled"}`);
if (options.commands.length > 0) {
	console.log("   Commands:");
	options.commands.forEach((cmd, index) => {
		console.log(`     ${index + 1}. ${cmd.name}: ${cmd.command}`);
	});
} else {
	console.log("   Commands: none");
}
console.log("");
console.log(`URL: http://localhost:${options.serverPort}`);
console.log("");

start({
	serverPort: options.serverPort,
	commands: options.commands,
	dev: options.dev,
});

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
				if (!portValue || Number.isNaN(Number(portValue))) {
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

// Print hello
console.log("\n🚀 Starting LucidLines!");
console.log("");

const {
	server: _server,
	nodeStream,
	databank: _databank,
	lucidEvent,
	stop,
} = start({
	serverPort: options.serverPort,
	commands: options.commands,
	dev: options.dev,
});

// Listen for all LucidEvent events and log them
lucidEvent.on("start", (data) => {
	console.log(`\u001b[32mstarted\u001b[0m ${data.name}`);
});

lucidEvent.on("kill", (data) => {
	console.log(`\u001b[31mkilled\u001b[0m ${data.name}`);
});

lucidEvent.on("forcekill", (data) => {
	console.log(`\u001b[90mforce killed\u001b[0m ${data.name}`);
});

// Handle various termination signals
process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGHUP", () => handleShutdown("SIGHUP")); // Terminal closed
process.on("SIGINT", () => handleShutdown("SIGINT")); // Ctrl+C
process.on("SIGQUIT", () => handleShutdown("SIGQUIT")); // Ctrl+\

async function handleShutdown(signal?: string) {
	try {
		await stop();
		process.exit(0);
	} catch (error) {
		console.error(
			`Error during shutdown${signal ? ` (${signal})` : ""}:`,
			error,
		);
		process.exit(1);
	}
}

function logControls() {
	console.log(
		`\nURL: \u001b[36m\u001b[4mhttp://localhost:${options.serverPort}\u001b[0m`,
	);
	console.log("");
	console.log(`Process restart controls:`);
	options.commands.forEach((cmd, index) => {
		console.log(`  \u001b[32m${index + 1}\u001b[0m: Restart ${cmd.name}`);
	});
	console.log(`  \u001b[32mr\u001b[0m: Restart all processes`);
	console.log(`  \u001b[35mctrl+c\u001b[0m: Quit\n`);
}

function clearLines(n: number) {
	for (let i = 0; i < n; i++) {
		process.stdout.write("\u001b[1A"); // Move cursor up
		process.stdout.write("\u001b[2K"); // Clear the line
	}
}

// needs to wait for processes to start
(async () => {
	// wait for processes to start
	await new Promise((resolve) => setTimeout(resolve, 500));

	// Setup keyboard input handling for process restart
	if (options.commands.length > 0 && nodeStream && process.stdin.isTTY) {
		// Set up raw mode for keyboard input
		logControls();

		process.stdin.setRawMode(true);
		process.stdin.resume();
		process.stdin.setEncoding("utf8");

		let processing = false;
		process.stdin.on("data", async (key: string) => {
			// Handle number keys for individual process restart
			if (processing) return;
			processing = true;
			const num = parseInt(key, 10);
			if (num >= 1 && num <= options.commands.length) {
				const procIndex = num - 1;
				clearLines(options.commands.length + 6);
				await nodeStream.restartProcess(procIndex);
				logControls();
				processing = false;
				return;
			}

			// Handle 'r' for restart all
			if (key === "r") {
				clearLines(options.commands.length + 6);
				await nodeStream.restartAll();
				logControls();
				processing = false;
				return;
			}

			if (key === "\u0003") {
				// Ctrl+C
				console.log("Quitting...\n");
				await handleShutdown("SIGINT");
			}
		});
	}
})();

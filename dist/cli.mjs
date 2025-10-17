#!/usr/bin/env node
import {
  start
} from "./chunk-ILAGZVRU.mjs";

// src/cli.ts
import { join as join2 } from "path";

// src/lib/create-config.ts
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import JSON5 from "json5";
var defaultConfig = {
  port: 8080,
  commands: [
    {
      name: "ECHO",
      command: "echo 'Hello, World!'"
    },
    {
      name: "COUNT",
      command: 'for i in {5..1}; do echo "$i..."; sleep 1; done; echo "BOOM!"'
    },
    {
      name: "YESLOOP",
      command: 'while true; do yes "Are we there yet?"; done'
    },
    {
      name: "YOU",
      command: "npm run dev"
    }
  ],
  dev: false
};
function loadConfig(configPath) {
  const filePath = configPath || join(process.cwd(), ".lucidlines.json5");
  if (!existsSync(filePath)) {
    return null;
  }
  try {
    const configContent = readFileSync(filePath, "utf-8");
    return JSON5.parse(configContent);
  } catch (error) {
    console.error(
      `\u274C Failed to parse configuration file ${filePath}: ${error}`
    );
    process.exit(1);
  }
}
function createConfig() {
  const configPath = join(process.cwd(), ".lucidlines.json5");
  if (existsSync(configPath)) {
    console.log(
      `\u2139\uFE0F  Configuration file .lucidlines.json5 already exists in ${process.cwd()}`
    );
    return;
  }
  const configContent = `{
	// LucidLines configuration file
	// This file configures the LucidLines terminal streaming server
	// See https://github.com/juji/lucidlines for documentation

	// Port to run the server on (default: 8080)
	port: ${defaultConfig.port},

	// Commands to run when the server starts
	commands: [
		${defaultConfig.commands?.map(
    (cmd) => `{
			// Display name for this command (shown in UI)
			name: "${cmd.name}",

			// Shell command to execute
			command: "${cmd.command.replace(/"/g, '\\"')}",
		}`
  ).join(",\n		")}
	],

	// Enable development mode (default: false)
	dev: ${defaultConfig.dev},
}`;
  writeFileSync(configPath, configContent, "utf-8");
  console.log("\u2705 Configuration file created successfully!");
  console.log("Edit .lucidlines.json5 to customize your LucidLines setup.");
  updatePackageJsonScripts();
}
function updatePackageJsonScripts() {
  const packageJsonPath = join(process.cwd(), "package.json");
  if (!existsSync(packageJsonPath)) {
    console.log("\u2139\uFE0F  No package.json found, skipping script addition");
    return;
  }
  try {
    const packageJsonContent = readFileSync(packageJsonPath, "utf-8");
    const packageJson = JSON.parse(packageJsonContent);
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    if (!packageJson.scripts.lucidlines) {
      packageJson.scripts.lucidlines = "lucidlines";
      writeFileSync(
        packageJsonPath,
        JSON.stringify(packageJson, null, 2) + "\n",
        "utf-8"
      );
      console.log("\u2705 Added 'lucidlines' script to package.json");
    } else {
      console.log("\u2139\uFE0F  'lucidlines' script already exists in package.json");
    }
  } catch (error) {
    console.log(`\u26A0\uFE0F  Could not update package.json: ${error}`);
  }
}

// src/cli.ts
function parseArgs() {
  const args = process.argv.slice(2);
  let subcommand;
  let serverPort = 8080;
  const commands = [];
  let dev = false;
  let configFile;
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
        const colonIndex = commandValue.indexOf(":");
        if (colonIndex === -1) {
          console.error(
            `Invalid command format: ${commandValue}. Use "name:command"`
          );
          process.exit(1);
        }
        const name = commandValue.substring(0, colonIndex).trim();
        const command = commandValue.substring(colonIndex + 1).trim();
        if (!name || !command) {
          console.error(
            `Invalid command format: ${commandValue}. Both name and command must be non-empty`
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
var options = parseArgs();
if (options.subcommand === "init") {
  try {
    createConfig();
  } catch (error) {
    console.error("\u274C Failed to create configuration file:", error);
    process.exit(1);
  }
  process.exit(0);
}
var configLoaded = false;
var configFilePath = ".lucidlines.json5";
if (options.subcommand !== "help") {
  const configFile = options.configFile || ".lucidlines.json5";
  configFilePath = options.configFile ? options.configFile : join2(process.cwd(), ".lucidlines.json5");
  const config = loadConfig(options.configFile);
  if (config) {
    configLoaded = true;
    if (config.port !== void 0 && options.serverPort === 8080) {
      options.serverPort = config.port;
    }
    if (config.commands && options.commands.length === 0) {
      options.commands = config.commands;
    }
    if (config.dev !== void 0 && !options.dev) {
      options.dev = config.dev;
    }
  }
}
if (configLoaded) {
  console.log(`\u{1F4C4} Configuration loaded from ${configFilePath}`);
} else {
  console.log(`\u{1F4C4} No configuration file found (${configFilePath})`);
}
console.log("\n\u{1F680} Starting LucidLines with configuration:");
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
  dev: options.dev
});
//# sourceMappingURL=cli.mjs.map
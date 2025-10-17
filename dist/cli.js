#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/cli.ts
var import_node_path4 = require("path");

// src/index.ts
var import_node_path2 = __toESM(require("path"));
var import_node_url = require("url");

// src/lib/databank.ts
var import_node_events = require("events");
var import_lokijs = __toESM(require("lokijs"));
var import_object_code = require("object-code");
var tmp = __toESM(require("tmp"));
var databank = (() => {
  const RECENT_MESSAGE_LIMIT = 1e3;
  const emitter = new import_node_events.EventEmitter();
  const availableTypes = /* @__PURE__ */ new Set();
  const tempFile = tmp.fileSync({
    prefix: "lucidlines-db-",
    postfix: ".json",
    keep: false
  });
  const db = new import_lokijs.default(tempFile.name, {
    autoload: false,
    autosave: true,
    autosaveInterval: 5e3,
    // Save every 5 seconds
    verbose: false
  });
  const collection = db.addCollection("logs", {
    indices: ["timestamp", "type"],
    disableMeta: true
    // Disable metadata for better performance
  });
  const addEntry = (type, data, timestamp, hash2) => {
    const entry = { type, data, timestamp, hash: hash2 };
    availableTypes.add(type);
    collection.insert(entry);
    emitter.emit("data", {
      type,
      data,
      timestamp,
      hash: hash2
    });
  };
  return {
    /**
     * Clean up resources - should be called by the user of this instance when shutting down
     * This ensures all data is saved and resources are properly released
     */
    cleanup() {
      try {
        if (db) {
          db.close();
        }
        availableTypes.clear();
        console.log(
          "DataBank cleanup: temporary database file will be removed"
        );
      } catch (error) {
        console.error("Error cleaning up DataBank resources:", error);
      }
    },
    /**
     * Get recent messages for a newly connected client
     * @param limit Optional limit of messages to return (defaults to 20)
     */
    getRecentMessages(limit) {
      const requestedLimit = limit || RECENT_MESSAGE_LIMIT;
      return collection.chain().find().simplesort("timestamp", true).limit(requestedLimit).data().sort((a, b) => a.timestamp - b.timestamp);
    },
    /**
     * Get all available messages (may be a very large dataset)
     * Use with caution!
     */
    getAllMessages() {
      return collection.chain().find().simplesort("timestamp", true).data();
    },
    /**
     * Get the total count of all messages stored
     */
    getTotalMessageCount() {
      return collection.count();
    },
    /**
     * Get the count of messages for a specific type
     */
    getMessageCountByType(type) {
      return collection.chain().find({ type }).count();
    },
    /**
     * Get all unique message types stored
     */
    getAvailableTypes() {
      return Array.from(availableTypes);
    },
    /**
     * Get messages by type with an optional limit
     */
    getMessageByType(type, lastTimestamp, limit) {
      const requestedLimit = limit || 20;
      const query = collection.chain().find({ type });
      if (lastTimestamp) {
        query.where((obj) => obj.timestamp < lastTimestamp);
      }
      return query.simplesort("timestamp", true).limit(requestedLimit).data().sort((a, b) => a.timestamp - b.timestamp);
    },
    /**
     * Add custom data to the databank (not from the stream)
     */
    addData(type, data) {
      const timestamp = Date.now();
      const entryHash = (0, import_object_code.hash)({ type, data, timestamp });
      addEntry(type, data, timestamp, entryHash);
    },
    /**
     * Subscribe to data events
     */
    subscribe(callback) {
      emitter.on("data", callback);
      return () => emitter.off("data", callback);
    }
  };
})();
var databank_default = databank;

// src/lib/node-stream.ts
var import_node_child_process = require("child_process");
var import_node_stream = require("stream");
function start(commands, dev) {
  if (dev) {
    console.log(`Starting ${commands.length} commands concurrently...`);
    console.log(JSON.stringify(commands, null, 2));
  }
  const transformStream = new import_node_stream.Transform({
    objectMode: true,
    transform(chunk, _, callback) {
      try {
        this.push(chunk);
        callback();
      } catch (error) {
        callback(error);
      }
    }
  });
  const processes = [];
  for (const cmd of commands) {
    try {
      const [command, ...args] = cmd.command.split(" ");
      const proc = (0, import_node_child_process.spawn)(command, args, {
        stdio: ["ignore", "pipe", "pipe"],
        shell: true,
        // Allow shell commands
        env: {
          ...process.env,
          // Force color output for commands that support it
          FORCE_COLOR: "1",
          CLICOLOR_FORCE: "1",
          COLORTERM: "truecolor"
        }
      });
      proc.stdout?.on("data", (data) => {
        const output = data.toString().trim();
        if (output) {
          const lines = output.split("\n");
          for (const line of lines) {
            if (line.trim()) {
              transformStream.write({ name: cmd.name, output: line });
            }
          }
        }
      });
      proc.stderr?.on("data", (data) => {
        const output = data.toString().trim();
        if (output) {
          const lines = output.split("\n");
          for (const line of lines) {
            if (line.trim()) {
              transformStream.write({ name: cmd.name, output: line });
            }
          }
        }
      });
      proc.on("exit", (code) => {
        if (code !== 0) {
          transformStream.write({
            name: cmd.name,
            output: `Process exited with code ${code}`
          });
        }
      });
      processes.push({
        name: cmd.name,
        process: proc,
        kill: () => {
          try {
            proc.kill("SIGTERM");
            setTimeout(() => {
              if (!proc.killed) {
                proc.kill("SIGKILL");
              }
            }, 5e3);
          } catch (error) {
          }
        }
      });
    } catch (error) {
      transformStream.write({
        name: cmd.name,
        output: `Failed to start command: ${error}`
      });
    }
  }
  return {
    result: Promise.resolve(),
    // Not used in current code
    transformStream,
    stop() {
      processes.forEach((proc) => {
        try {
          proc.kill();
        } catch (_error) {
        }
      });
    }
  };
}

// src/lib/server.ts
var import_node_fs = require("fs");
var import_promises = require("fs/promises");
var import_node_http = require("http");
var import_node_path = require("path");
var import_http_proxy = require("http-proxy");

// src/lib/websocket.ts
var import_ws = require("ws");
var WebSocketManager = class {
  wss;
  constructor(options2) {
    const { httpServer, wsPath } = options2;
    this.wss = new import_ws.WebSocketServer({
      server: httpServer,
      path: wsPath
    });
    this.setupEventHandlers();
  }
  setupEventHandlers() {
    this.wss.on("connection", (ws, _req) => this.handleConnection(ws));
  }
  handleConnection(ws) {
    console.log("WebSocket client connected");
    const totalMessages = databank_default.getTotalMessageCount();
    const types = databank_default.getAvailableTypes();
    const totalByTypes = types.map((type) => ({
      type,
      count: databank_default.getMessageCountByType(type)
    }));
    ws.send(
      JSON.stringify({
        type: "info",
        message: {
          types,
          total: totalMessages,
          byType: totalByTypes
        }
      })
    );
    const recentMessages = databank_default.getRecentMessages();
    if (recentMessages.length > 0) {
      ws.send(
        JSON.stringify({
          type: "history",
          messages: recentMessages
        })
      );
    }
    const unsubscribe = databank_default.subscribe(
      (data) => {
        if (ws.readyState === ws.OPEN) {
          ws.send(
            JSON.stringify({
              type: "log",
              message: data
            })
          );
        }
      }
    );
    ws.on("message", (data) => {
      try {
        console.log("Received: %s", data);
        const message = JSON.parse(data.toString());
        if (message.type === "history") {
          const lastTimestamp = message.lastTimestamp;
          const type = message.logType;
          const history = databank_default.getMessageByType(type, lastTimestamp, 100);
          ws.send(
            JSON.stringify({
              type: "history",
              messages: history
            })
          );
        }
      } catch (error) {
        console.error("Error processing message:", error);
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Invalid message format"
          })
        );
      }
    });
    ws.on("close", () => {
      console.log("WebSocket client disconnected");
      unsubscribe();
    });
    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      unsubscribe();
    });
  }
  /**
   * Close all WebSocket connections and clean up resources
   */
  close() {
    this.wss.close();
  }
  /**
   * Get the WebSocket server instance
   */
  getServer() {
    return this.wss;
  }
};
function createWebSocketManager(options2) {
  return new WebSocketManager(options2);
}

// src/lib/server.ts
var MIME_TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".eot": "application/vnd.ms-fontobject"
};
function start2({
  port = 8080,
  frontEnd,
  wsPath = "/ws",
  dev
}) {
  const server = (0, import_node_http.createServer)();
  const frontendPort = typeof frontEnd === "number" ? frontEnd : null;
  const frontEndDir = typeof frontEnd === "string" ? frontEnd : null;
  const proxy = frontendPort ? (0, import_http_proxy.createProxyServer)({
    target: `http://localhost:${frontendPort}`,
    ws: false
    // We'll handle WebSockets separately
  }) : null;
  const wsManager = createWebSocketManager({
    httpServer: server,
    wsPath
  });
  server.on("request", async (req, res) => {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);
    if (url.pathname === wsPath) {
      return;
    }
    try {
      if (frontendPort) {
        if (dev)
          console.log(
            `Proxying request to frontend dev server: ${url.pathname}`
          );
        proxy?.web(req, res, {}, (err) => {
          console.error("Proxy error:", err);
          res.statusCode = 500;
          res.end("Proxy error");
        });
      } else if (frontEndDir && (0, import_node_fs.existsSync)(frontEndDir)) {
        await serveStaticFile(req, res, frontEndDir);
      } else {
        res.statusCode = 404;
        res.end("Not found");
      }
    } catch (error) {
      console.error("Error handling request:", error);
      res.statusCode = 500;
      res.end("Internal server error");
    }
  });
  server.listen(port, () => {
    if (dev) console.log(`LucidLines server running on port ${port}`);
    if (frontendPort) {
      if (dev)
        console.log(
          `Development mode: Proxying requests to http://localhost:${frontendPort}`
        );
    } else if (frontEndDir) {
      if (dev)
        console.log(
          `Production mode: Serving static files from ${frontEndDir}`
        );
    }
    if (dev)
      console.log(
        `WebSocket server available at ws://localhost:${port}${wsPath}`
      );
  });
  return {
    server,
    stop: () => {
      wsManager.close();
      if (proxy) {
        proxy.close();
      }
      server.close();
      console.log("LucidLines server stopped");
    }
  };
}
async function serveStaticFile(req, res, rootDir) {
  try {
    const url = new URL(`http://${req.headers.host}` + (req.url || "/"));
    let filePath = rootDir + url.pathname;
    if (url.pathname === "/") {
      res.statusCode = 302;
      res.setHeader("Location", `http://${req.headers.host}/dash`);
      res.end("");
      return;
    }
    if (url.pathname === "/dash") {
      filePath += "/index.html";
    }
    if (url.pathname === "/dash/") {
      filePath += "index.html";
    }
    if (!(0, import_node_fs.existsSync)(filePath) || !(0, import_node_fs.statSync)(filePath).isFile()) {
      res.statusCode = 302;
      res.setHeader("Location", `http://${req.headers.host}/dash`);
      res.end("");
      return;
    }
    const ext = (0, import_node_path.extname)(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const content = await (0, import_promises.readFile)(filePath);
    res.setHeader("Content-Type", contentType);
    res.end(content);
  } catch (error) {
    console.error("Error serving static file:", error);
    res.statusCode = 500;
    res.end("Internal server error");
  }
}

// src/index.ts
var moduleDirname = (() => {
  if (typeof __dirname !== "undefined") {
    return __dirname;
  }
  try {
    const metaUrl = globalThis.import?.meta?.url;
    if (metaUrl) {
      return import_node_path2.default.dirname((0, import_node_url.fileURLToPath)(metaUrl));
    }
  } catch {
  }
  throw new Error("Cannot determine module directory");
})();
function validateCommandName(name) {
  return name.length > 0 && !name.includes("\n") && !name.includes("\r");
}
function start3(options2) {
  if (options2.commands) {
    for (const cmd of options2.commands) {
      if (!validateCommandName(cmd.name)) {
        throw new Error(
          `Invalid command name "${cmd.name}". Command names cannot be empty and cannot contain newlines.`
        );
      }
    }
  }
  const {
    serverPort = 8080,
    frontEnd = moduleDirname,
    wsPath = "/ws",
    commands = [],
    dev = false
  } = options2;
  const server = start2({
    port: serverPort,
    frontEnd,
    wsPath,
    dev
  });
  let nodeStream;
  if (commands.length > 0) {
    nodeStream = start(commands, dev);
    nodeStream.transformStream.on("data", (data) => {
      databank_default.addData(data.name, data.output);
      if (dev) {
        console.log(`[${data.name}] ${data.output}`);
      }
    });
  }
  function stop() {
    nodeStream?.stop();
    server.stop();
    databank_default.cleanup();
  }
  process.on("SIGINT", () => {
    stop();
    process.exit(0);
  });
  return {
    server,
    nodeStream,
    databank: databank_default,
    stop
  };
}

// src/lib/create-config.ts
var import_node_fs2 = require("fs");
var import_node_path3 = require("path");
var import_json5 = __toESM(require("json5"));
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
  const filePath = configPath || (0, import_node_path3.join)(process.cwd(), ".lucidlines.json5");
  if (!(0, import_node_fs2.existsSync)(filePath)) {
    return null;
  }
  try {
    const configContent = (0, import_node_fs2.readFileSync)(filePath, "utf-8");
    return import_json5.default.parse(configContent);
  } catch (error) {
    console.error(
      `\u274C Failed to parse configuration file ${filePath}: ${error}`
    );
    process.exit(1);
  }
}
function createConfig() {
  const configPath = (0, import_node_path3.join)(process.cwd(), ".lucidlines.json5");
  if ((0, import_node_fs2.existsSync)(configPath)) {
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
  (0, import_node_fs2.writeFileSync)(configPath, configContent, "utf-8");
  console.log("\u2705 Configuration file created successfully!");
  console.log("Edit .lucidlines.json5 to customize your LucidLines setup.");
  updatePackageJsonScripts();
}
function updatePackageJsonScripts() {
  const packageJsonPath = (0, import_node_path3.join)(process.cwd(), "package.json");
  if (!(0, import_node_fs2.existsSync)(packageJsonPath)) {
    console.log("\u2139\uFE0F  No package.json found, skipping script addition");
    return;
  }
  try {
    const packageJsonContent = (0, import_node_fs2.readFileSync)(packageJsonPath, "utf-8");
    const packageJson = JSON.parse(packageJsonContent);
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    if (!packageJson.scripts.lucidlines) {
      packageJson.scripts.lucidlines = "lucidlines";
      (0, import_node_fs2.writeFileSync)(
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
  configFilePath = options.configFile ? options.configFile : (0, import_node_path4.join)(process.cwd(), ".lucidlines.json5");
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
start3({
  serverPort: options.serverPort,
  commands: options.commands,
  dev: options.dev
});
//# sourceMappingURL=cli.js.map
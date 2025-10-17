// src/index.ts
import path from "path";
import { fileURLToPath } from "url";

// src/lib/databank.ts
import { EventEmitter } from "events";
import Loki from "lokijs";
import { hash } from "object-code";
import * as tmp from "tmp";
var databank = (() => {
  const RECENT_MESSAGE_LIMIT = 1e3;
  const emitter = new EventEmitter();
  const availableTypes = /* @__PURE__ */ new Set();
  const tempFile = tmp.fileSync({
    prefix: "lucidlines-db-",
    postfix: ".json",
    keep: false
  });
  const db = new Loki(tempFile.name, {
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
      const entryHash = hash({ type, data, timestamp });
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
import { spawn } from "child_process";
import { Transform } from "stream";
function start(commands, dev) {
  if (dev) {
    console.log(`Starting ${commands.length} commands concurrently...`);
    console.log(JSON.stringify(commands, null, 2));
  }
  const transformStream = new Transform({
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
      const proc = spawn(command, args, {
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
import { existsSync, statSync } from "fs";
import { readFile } from "fs/promises";
import {
  createServer
} from "http";
import { extname } from "path";
import { createProxyServer } from "http-proxy";

// src/lib/websocket.ts
import { WebSocketServer } from "ws";
var WebSocketManager = class {
  wss;
  constructor(options) {
    const { httpServer, wsPath } = options;
    this.wss = new WebSocketServer({
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
function createWebSocketManager(options) {
  return new WebSocketManager(options);
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
  const server = createServer();
  const frontendPort = typeof frontEnd === "number" ? frontEnd : null;
  const frontEndDir = typeof frontEnd === "string" ? frontEnd : null;
  const proxy = frontendPort ? createProxyServer({
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
      } else if (frontEndDir && existsSync(frontEndDir)) {
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
    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
      res.statusCode = 302;
      res.setHeader("Location", `http://${req.headers.host}/dash`);
      res.end("");
      return;
    }
    const ext = extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const content = await readFile(filePath);
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
      return path.dirname(fileURLToPath(metaUrl));
    }
  } catch {
  }
  throw new Error("Cannot determine module directory");
})();
function validateCommandName(name) {
  return name.length > 0 && !name.includes("\n") && !name.includes("\r");
}
function start3(options) {
  if (options.commands) {
    for (const cmd of options.commands) {
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
  } = options;
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

export {
  start3 as start
};
//# sourceMappingURL=chunk-ILAGZVRU.mjs.map
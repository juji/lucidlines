```json5
commands: [
  // Node.js applications
  { name: "frontend", command: "npm run dev" },
  { name: "backend", command: "npm run server" },

  // Python applications
  { name: "api", command: "python -m flask run" },
  { name: "worker", command: "python worker.py" },

  // Databases
  { name: "postgres", command: "docker run -p 5432:5432 postgres" },
  { name: "redis", command: "redis-server" },

  // Log monitoring
  { name: "logs", command: "tail -f /var/log/app.log" },
  { name: "errors", command: "tail -f /var/log/error.log" }
]
```
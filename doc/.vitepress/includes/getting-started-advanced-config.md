```json5
{
  port: 8080,
  dev: true,
  commands: [
    { name: "frontend", command: "npm run dev" },
    { name: "backend", command: "npm run server" },
    { name: "database", command: "docker-compose up db" },
    { name: "tests", command: "npm run test:watch" }
  ]
}
```
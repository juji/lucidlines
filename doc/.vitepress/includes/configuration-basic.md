```json5
{
  // Server port (default: 8080)
  port: 3000,

  // Enable development mode (default: false)
  dev: true,

  // Commands to run
  commands: [
    {
      name: "web",
      command: "npm run dev"
    },
    {
      name: "api",
      command: "python -m flask run"
    }
  ]
}
```
```json5
{
  // Server port
  port: 8080,

  // Enable development mode with console logging
  dev: true,

  // List of commands to run
  commands: [
    {
      // Display name for the process
      name: "frontend",

      // Command to execute
      command: "npm run dev"
    },
    {
      name: "backend",
      command: "npm run server"
    }
  ]
}
```
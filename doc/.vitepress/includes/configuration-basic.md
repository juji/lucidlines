```json5
{
  // Port to run the server on
  port: 8080,

  // Commands to run when the server starts
  commands: [
    {
      // Display name for this command (shown in UI)
      name: "ECHO",

      // Shell command to execute
      command: "echo 'Hello, World!'",
    },
    {
      name: "YOU",
      command: "npm run dev",
    },
  ],

  // Enable development mode
  // true: will output logs to console
  dev: false,
}
```
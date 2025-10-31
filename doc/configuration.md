# Configuration

LucidLines can be configured through configuration files.

## Configuration File

LucidLines looks for a `.lucidlines.json5` file in the current directory. You can also specify a custom config file with the `-C` flag.

### Basic Configuration

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

## Command Format

Commands are specified with a name and command:

```json5
commands: [
  {
    name: "web",
    command: "npm run dev"
  }
]
```

### Command Names

- Must be non-empty
- Cannot contain newlines
- Should be descriptive and unique

### Command Examples

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

## Environment Variables

LucidLines automatically sets these environment variables for better output:

- `FORCE_COLOR=1` - Force colored output
- `CLICOLOR_FORCE=1` - Force CLI colors
- `COLORTERM=truecolor` - Enable true color support

## Development Mode

When `dev: true` is set:

- Console logging is enabled
- More verbose output

## Configuration Precedence

Configuration values are merged in this order (later overrides earlier):

1. Default values
2. Configuration file
3. Command-line arguments
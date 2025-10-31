# Command Line Interface

Complete reference for LucidLines CLI commands and options.

## Synopsis

```bash
lucidlines [subcommand] [options]
```

## Help Output

```
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
```

## Examples

### Basic Usage

```bash
# Start with two processes
lucidlines -c "frontend:npm run dev" -c "backend:npm run server"

# Use custom port
lucidlines -p 3000 -c "app:npm start"

# Development mode
lucidlines --dev -c "web:npm run dev" -c "logs:tail -f app.log"

# Use configuration file
lucidlines -C my-config.json5
```

### Advanced Examples

```bash
# Multiple services
lucidlines \
  -c "web:npm run dev" \
  -c "api:python -m flask run" \
  -c "db:docker run -p 5432:5432 postgres" \
  -c "redis:redis-server"

# Production setup
lucidlines -C production.json5

# Development with custom port
lucidlines -p 3001 --dev -c "app:npm run dev"
```
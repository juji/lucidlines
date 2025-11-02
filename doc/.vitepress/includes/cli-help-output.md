```
LucidLines - Terminal streaming server

Usage:
  lucidlines [subcommand] [options]

Subcommands:
  init                    Create a .lucidlines.json5 configuration file

Options:
  -p, --port <port>          Server port
  -c, --command <name:cmd>   Add command to run (can be used multiple times)
  -C, --config <file>        Path to JSON5 config file (default: .lucidlines.json5)
  -d, --dev                  Enable development mode (console logging)
  -h, --help                 Show this help message

Examples:
  lucidlines init
  lucidlines --port 3000 --command "server:npm run dev" --command "logs:tail -f /var/log/app.log"
  lucidlines -p 8081 -c "web:python app.py" -c "db:mongod" --dev
```
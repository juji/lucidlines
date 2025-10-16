# LucidLines

> **Terminal streaming server** - Run multiple commands concurrently and view their output in a beautiful web interface.

[![npm version](https://badge.fury.io/js/lucidlines.svg)](https://badge.fury.io/js/lucidlines)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen)](https://nodejs.org/)

LucidLines is a powerful CLI tool that runs multiple terminal commands concurrently and streams their output to a modern web interface. Perfect for development workflows, monitoring multiple services, or any scenario where you need to watch multiple command outputs simultaneously.

## ✨ Features

- 🚀 **Concurrent Command Execution** - Run multiple commands simultaneously
- 🌐 **Web Interface** - Beautiful, real-time terminal output in your browser
- ⚙️ **Flexible Configuration** - JSON5 config files for easy setup
- 🎨 **Modern UI** - Clean, responsive web interface with command tabs
- 🔧 **CLI Options** - Command-line overrides and custom config files
- 📱 **Real-time Streaming** - Live output updates via WebSocket
- 🛠️ **Development Mode** - Enhanced logging for debugging

## 🚀 Quick Start

### Installation

```bash
npm install -g lucidlines
# or
npx lucidlines
```

### Initialize Configuration

```bash
lucidlines init
```

This creates a `.lucidlines.json5` configuration file in your current directory.

### Basic Usage

```bash
# Run with default configuration
lucidlines

# Run on custom port
lucidlines --port 3000

# Run specific commands
lucidlines --command "server:npm run dev" --command "logs:tail -f app.log"
```

## 📋 Configuration

LucidLines uses JSON5 format for configuration files, allowing comments and a more human-readable syntax.

### Example `.lucidlines.json5`

```json5
{
  // Server configuration
  port: 8080,

  // Commands to run concurrently
  commands: [
    {
      // Display name for this command
      name: "Frontend",
      // Shell command to execute
      command: "npm run dev"
    },
    {
      name: "Backend",
      command: "cd ./server && npm run start"
    },
    {
      name: "Database",
      command: "docker-compose up db"
    }
  ],

  // Enable development mode for enhanced logging
  dev: false
}
```

### Configuration Options

- **`port`** (number): Server port (default: 8080)
- **`commands`** (array): List of commands to run
  - **`name`** (string): Display name for the command
  - **`command`** (string): Shell command to execute
- **`dev`** (boolean): Enable development mode with verbose logging

## 🎯 CLI Reference

### Commands

```bash
lucidlines [subcommand] [options]
```

### Subcommands

- **`init`** - Create a `.lucidlines.json5` configuration file

### Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--port <port>` | `-p` | Server port | 8080 |
| `--command <name:cmd>` | `-c` | Add command (can be used multiple times) | - |
| `--config <file>` | `-C` | Path to JSON5 config file | `.lucidlines.json5` |
| `--dev` | `-d` | Enable development mode | false |
| `--help` | `-h` | Show help message | - |

### Examples

```bash
# Initialize configuration
lucidlines init

# Run with custom config file
lucidlines --config my-config.json5

# Run specific commands with custom port
lucidlines --port 3000 \
  --command "api:cd api && npm run dev" \
  --command "web:cd web && npm run start" \
  --command "logs:tail -f combined.log"

# Development mode with verbose logging
lucidlines --dev --config dev.json5
```

## 🌐 Web Interface

Once LucidLines is running, open your browser to the displayed URL (e.g., `http://localhost:8080`). The interface provides:

- **Real-time Output**: Live streaming of command output
- **Command Tabs**: Switch between different command outputs
- **Clean UI**: Modern, responsive design
- **Auto-scroll**: Automatically follows new output
- **History**: View previous output with manual history loading

## 🔧 Development

### Prerequisites

- Node.js >= 22.0.0
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/juji/lucidlines.git
cd lucidlines

# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev
```

### Project Structure

```
lucidlines/
├── src/                    # Server-side TypeScript source
│   ├── cli.ts             # CLI entry point
│   ├── index.ts           # Main server logic
│   ├── lib/
│   │   ├── server.ts      # HTTP/WebSocket server
│   │   ├── websocket.ts   # WebSocket handling
│   │   └── create-config.ts # Configuration management
├── client/                # React web client
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── store/         # State management
│   │   └── hooks/         # Custom hooks
├── dist/                  # Built output
└── dev/                   # Development utilities
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [TypeScript](https://www.typescriptlang.org/)
- Web client powered by [React](https://reactjs.org/) and [Vite](https://vitejs.dev/)
- Configuration parsing with [JSON5](https://json5.org/)
- CLI built with [Node.js](https://nodejs.org/)

---

**Happy coding!** 🎉 
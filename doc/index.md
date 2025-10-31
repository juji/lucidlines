---
next:
  text: Configuration Options
  link: /configuration.html
---

# LucidLines

LucidLines is a CLI tool that runs multiple terminal commands concurrently and streams their output to a modern web interface. Perfect for development workflows, monitoring multiple services, or any scenario where you need to watch multiple command outputs simultaneously.

![LucidLines Web Interface](/screenshot.png)

## Installation & Setup

:::tabs
== npm

```bash
# Install LucidLines
npm install -D lucidlines

# Initialize configuration
npx lucidlines init
```

== pnpm

```bash
# Install LucidLines
pnpm add -D lucidlines

# Initialize configuration
pnpx lucidlines init
```

== bun

```bash
# Install LucidLines
bun add -D lucidlines

# Initialize configuration
bunx lucidlines init
```

== yarn

```bash
# Install LucidLines
yarn add -D lucidlines

# Initialize configuration
yarn dlx lucidlines init
```

:::

This will create a `.lucidlines.json5` configuration file in your project and add a script to your `package.json`:

```json
{
  "scripts": {
    "lucidlines": "lucidlines"
  }
}
```

## Configuration

The `.lucidlines.json5` file contains your process definitions and settings. After initialization, edit this file to add your commands:

```json5
{
  // Server port (default: 8080)
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

## Starting LucidLines

Once your configuration is set up, start LucidLines using one of these methods:

:::tabs
== npm

```bash
npx lucidlines
# or
npm run lucidlines
```

== pnpm

```bash
pnpx lucidlines
# or
pnpm run lucidlines
```

== bun

```bash
bunx lucidlines
# or
bun run lucidlines
```

== yarn

```bash
yarn dlx lucidlines
# or
yarn run lucidlines
```

:::

This will start all the processes defined in your `.lucidlines.json5` file, example output:

![LucidLines Started Preview](/lucidlines-cli.png)

### Web Interface

Once started, open your browser to `http://localhost:8080` (or your configured port) to access the web dashboard.

## Keyboard Controls

When running LucidLines, you can use these keyboard shortcuts:

- `1`, `2`, `3`, etc. - Restart individual processes
- `r` - Restart all processes
- `ctrl+c` - Quit the application
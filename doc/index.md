---
next:
  text: Configuration Options
  link: /configuration.html
---

# LucidLines

LucidLines is a CLI tool that runs multiple terminal commands concurrently and streams their output to a modern web interface. Perfect for development workflows, monitoring multiple services, or any scenario where you need to watch multiple command outputs simultaneously.

![LucidLines Web Interface](/screenshot.png)

## Installation & Setup

<!--@include: ./.vitepress/includes/installation-code-group.md-->

This will create a `.lucidlines.json5` configuration file in your project and add a script to your `package.json`:

<!--@include: ./.vitepress/includes/package-json-script.md-->

## Configuration

The `.lucidlines.json5` file contains your process definitions and settings. After initialization, edit this file to add your commands:

<!--@include: ./.vitepress/includes/configuration-basic.md-->

## Starting LucidLines

Once your configuration is set up, start LucidLines using one of these methods:

<!--@include: ./.vitepress/includes/starting-commands.md-->

This will start all the processes defined in your `.lucidlines.json5` file, example output:

![LucidLines Started Preview](/lucidlines-cli.png)

### Web Interface

Once started, open your browser to `http://localhost:8080` (or your configured port) to access the web dashboard.

## Keyboard Controls

When running LucidLines, you can use these keyboard shortcuts:

- `1`, `2`, `3`, etc. - Restart individual processes
- `r` - Restart all processes
- `ctrl+c` - Quit the application
# Getting Started

Welcome to LucidLines! If you haven't already, check out the [home page](./) for installation and basic setup instructions.

This guide covers advanced getting started topics and best practices for using LucidLines effectively.

## Prerequisites

- Node.js 18 or higher
- npm or yarn

## Project Structure

After installation, your project will have:

```
your-project/
├── .lucidlines.json5    # Configuration file
├── package.json         # Your project dependencies
└── ...                  # Your application code
```

## Advanced Configuration

For more advanced configuration options, see the [Configuration Guide](./configuration).

## Development Workflow

### Running in Development Mode

<!--@include: ./.vitepress/includes/getting-started-dev-mode.md-->

### Adding More Processes

You can add as many processes as needed to your `.lucidlines.json5`:

<!--@include: ./.vitepress/includes/getting-started-advanced-config.md-->

## Keyboard Controls

When running LucidLines in a terminal:

- **Number keys** (1, 2, 3...) - Restart individual processes
- **r** - Restart all processes
- **ctrl+c** - Quit the application

## Troubleshooting

### Common Issues

- **Port already in use**: Change the port in your `.lucidlines.json5` file
- **Process won't start**: Check that the command is correct and dependencies are installed
- **Web interface not loading**: Ensure the server started successfully and check the port

## Next Steps

- Learn about [configuration options](./configuration)
- Explore the [CLI reference](./cli)
- Check out the [API documentation](./core)
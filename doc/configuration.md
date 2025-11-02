# Configuration

LucidLines can be configured through configuration files.

## Configuration File

LucidLines looks for a `.lucidlines.json5` file in the current directory. You can also specify a custom config file with the `-C` flag.

### Basic Configuration

<!--@include: ./.vitepress/includes/configuration-basic.md-->

## Command Format

Commands are specified with a name and command:

<!--@include: ./.vitepress/includes/configuration-command-format.md-->

### Command Names

- Must be non-empty
- Cannot contain newlines
- Should be descriptive and unique

### Command Examples

<!--@include: ./.vitepress/includes/configuration-command-examples.md-->

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
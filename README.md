# CLI Boilerplate

A minimal TypeScript-based boilerplate for creating Node.js CLI applications with dual ESM/CommonJS support.

## Overview

This project provides a straightforward starting point for building command-line tools using modern TypeScript. It includes the essential configuration for creating both a library and a CLI executable from the same codebase.

## Features

- **TypeScript with Node 22**: Built for the latest Node.js LTS
- **Dual Module Format**: Outputs both CommonJS and ES Modules
- **CLI Ready**: Preconfigured binary setup with proper entry points
- **Modern Build System**: Uses tsup for optimized bundling
- **Code Quality**: Biome for formatting and linting
- **Git Hooks**: Husky and lint-staged for pre-commit checks

## Getting Started

1. Clone this repository:
   ```bash
   git clone https://github.com/juji/lucidlines.git my-cli
   cd my-cli
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start developing:
   ```bash
   # Edit src/cli.ts and src/index.ts
   ```

4. Build for distribution:
   ```bash
   npm run build
   ```

## Project Structure

```
lucidlines/
├── src/
│   ├── cli.ts       # CLI entry point
│   └── index.ts     # Library entry point
├── dist/            # Compiled output (generated)
└── ... configuration files
```

## Output Formats

This boilerplate outputs:
- `dist/cli.cjs` - CLI executable (CommonJS)
- `dist/index.js` - CommonJS library
- `dist/index.mjs` - ES Module
- Type declarations for library usage

## License

MIT

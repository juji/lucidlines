# LucidLines

A minimal TypeScript-based boilerplate for creating Node.js CLI applications with dual ESM/CommonJS support.

## Overview

This project provides a straightforward starting point for building command-line tools using modern TypeScript. It includes the essential configuration for creating both a library and a CLI executable from the same codebase.

## Features

- **TypeScript with Node 22**: Uses TypeScript 5.9.3 with @tsconfig/node22 base configuration
- **Dual Module Format**: Outputs both CommonJS and ES Modules via tsup configuration
- **CLI Ready**: Preconfigured binary setup with entry point in dist/cli.cjs
- **Development Tools**:
  - **tsup** (v8.5.0): For bundling TypeScript with minimal configuration
  - **tsx** (v4.20.6): For running TypeScript files directly
  - **@biomejs/biome** (v2.2.5): Modern linting and formatting
  - **husky** (v9.1.7): Git hooks management
  - **lint-staged** (v16.2.4): Run linters against staged files
- **Type Definitions**: @types/node v24.7.2

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
./
├── src/
│   ├── cli.ts       # CLI entry point
│   └── index.ts     # Library entry point
├── dist/            # Compiled output (generated)
├── .husky/          # Git hooks configuration
├── biome.json       # Biome configuration
├── .lintstagedrc.json # Lint-staged configuration
├── tsconfig.json    # TypeScript configuration
└── tsup.config.ts   # Build configuration
```

## Output Formats

This boilerplate outputs:
- `dist/cli.cjs` - CLI executable (CommonJS)
- `dist/index.js` - CommonJS library
- `dist/index.mjs` - ES Module
- Type declarations for library usage


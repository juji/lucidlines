# LucidLines Documentation

This directory contains the VitePress documentation for LucidLines.

## Development

### Prerequisites

- Node.js 18 or higher
- pnpm

### Installation

```bash
cd doc
pnpm install
```

### Development Server

```bash
pnpm dev
```

This will start the development server at `http://localhost:5173`.

### Build for Production

```bash
pnpm build
```

### Preview Production Build

```bash
pnpm preview
```

## Writing Documentation

### Adding New Pages

1. Create a new `.md` file in the appropriate directory
2. Add the page to the sidebar in `.vitepress/config.js`
3. Use standard Markdown syntax

### Frontmatter

Use YAML frontmatter for page metadata:

```yaml
---
title: Page Title
description: Page description for SEO
---
```

### Code Examples

Use fenced code blocks with language specification:

```javascript
console.log('Hello, LucidLines!');
```

### Links

Use relative links for internal navigation:

```markdown
[Getting Started](../guide/getting-started.md)
[API Reference](../api/core.md)
```

## Contributing

When contributing to the documentation:

1. Follow the existing structure and style
2. Keep language clear and concise
3. Include practical examples
4. Test links and code examples
5. Update the sidebar configuration if adding new pages

<!-- check build -->
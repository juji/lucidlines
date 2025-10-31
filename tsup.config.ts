import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    cli: 'src/cli.ts',
    index: 'src/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
});
import { defineConfig } from 'tsup';

export default defineConfig({
  bundle: true,
  entry: ['src/server.ts'],
  format: 'esm',
  treeshake: true,
});

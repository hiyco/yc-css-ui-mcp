import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    server: 'src/server.ts'
  },
  format: ['cjs'],
  dts: false,
  clean: true,
  splitting: false,
  sourcemap: true,
  minify: false,
  target: 'node18',
  outDir: 'dist',
  banner: {
    js: '// Fix for createRequire in bundled CommonJS\nconst { pathToFileURL } = require("url");\nconst __IMPORT_META_URL__ = pathToFileURL(__filename).href;'
  },
  external: ['mdn-data', 'css-tree'],
  noExternal: ['@modelcontextprotocol/sdk', '@yc-css-ui/core', 'postcss', 'postcss-value-parser', 'specificity'],
  esbuildOptions(options) {
    options.platform = 'node';
    options.packages = 'bundle';
    options.define = {
      'import.meta.url': '__IMPORT_META_URL__'
    };
  }
});
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: false, // 暂时禁用类型声明生成 - 有路径问题
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
  noExternal: ['postcss', 'postcss-value-parser', 'specificity'],
  esbuildOptions(options) {
    options.platform = 'node';
    options.packages = 'bundle';
    options.define = {
      'import.meta.url': '__IMPORT_META_URL__'
    };
  }
});
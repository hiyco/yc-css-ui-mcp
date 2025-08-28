import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: false, // 暂时禁用类型声明生成
  clean: true,
  splitting: false,
  sourcemap: true,
  minify: false,
  target: 'node18',
  outDir: 'dist',
  // banner: {
  //   js: '#!/usr/bin/env node'
  // },
  external: [],
  noExternal: ['@css-mcp/core', 'commander', 'postcss', 'css-tree', 'postcss-value-parser', 'specificity'],
});
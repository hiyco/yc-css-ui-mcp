

# YC-CSS-UI MCP CSS Debugging & Optimization

<div align="center">

**YC-CSS-UI 智能CSS调试与优化MCP服务**

**Languages:** [English](README.en.md) | [简体中文](README.md)

[![npm version](https://badge.fury.io/js/@yc-css-ui%2Fcore.svg)](https://badge.fury.io/js/@yc-css-ui%2Fcore)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>
---

## ✨ Features

- **Smart CSS analysis** — Detect layout, performance, and compatibility issues.
- **Auto-fix suggestions** — AI-assisted, actionable code fixes.
- **Real-time debugging** — Seamless workflow with Claude Code (MCP).
- **Performance optimization** — Rules for slimming CSS and improving runtime cost.
- **Accurate parsing** — Precise syntax analysis powered by PostCSS & friends.
- **Cross-browser checks** — Vendor prefix and support verification.
- **Accessibility** — Basic WCAG checks (contrast, focus, font size, etc.).

---

## Requirements

- **Node.js** ≥ 18
- **Yarn** ≥ 3.8

> This is a monorepo managed with Yarn 3 (PnP). See commands below.

---

## Quick Start (Clone & Local Dev)

```bash
git clone https://github.com/hiyco/yc-css-ui-mcp.git
cd yc-css-ui-mcp

# Install
yarn install

# Build all packages
yarn build

# Run tests
yarn test

# Start dev mode
yarn dev
````

> **NPM availability:** Packages are being prepared for publish.
> Until then, install via cloning this repo. Planned packages include:
> `@yc-css-ui/core`, `@yc-css-ui/server`.

---

## Basic Usage (Programmatic)

```ts
import { analyzeCSS } from '@yc-css-ui/core';

const css = `
  .flex-container {
    display: flex;
    align-items: center; /* potential issue: container may miss a height */
  }
`;

const result = await analyzeCSS(css);

console.log(result.summary); // e.g. { totalIssues: 1, warningCount: 1, ... }
console.log(result.issues[0].message); // e.g. "Flex container lacks an explicit height"
```

---

## Claude Code (MCP) Integration

1. **Configure MCP server** in your Claude settings:

```json
{
  "mcp_servers": {
    "yc-css-ui": {
      "command": "npx",
      "args": ["@yc-css-ui/server"]
    }
  }
}
```

2. **In Claude Code**, you can run prompts/commands such as:

```
# Ask the agent to analyze CSS
请使用 YC-CSS-UI 分析以下 CSS 代码问题：
“.header {
  font-size: 12px;
  background-color: #f0f0f0;
  color: #999;
}”

# Diagnose a file
/css:debug styles/main.css

# Auto-fix in a folder
/css:fix layout-issues styles/components/

# Optimize for performance
/css:optimize --performance styles/
```

---

## Monorepo Packages

* **@yc-css-ui/core** — Core CSS analysis engine
* **@yc-css-ui/server** — MCP server implementation
* **@yc-css-ui/cli** — Command-line tool *(in development)*
* **@yc-css-ui/vscode-extension** — VS Code extension *(planned)*

---

## What We Detect

### Layout

* Flexbox misalignment / missing container sizing
* Grid templates missing or invalid
* Positioning issues, z-index stacking problems

### Performance

* Oversized files
* Too many selectors / deep nesting
* Unused CSS rules

### Compatibility

* Modern CSS feature support checks
* Missing vendor prefixes
* Browser support validation

### Accessibility

* Insufficient color contrast
* Too-small font sizes
* Missing focus styles

### Maintainability

* Overly high specificity / specificity conflicts
* Duplicate rules

---

## Testing

```bash
# Run all tests
yarn test

# Run tests in a specific workspace
yarn workspace @yc-css-ui/core test

# With coverage
yarn test --coverage
```

---

## Documentation

* [Usage Guide](./USAGE.md)
* [Demo](./DEMO.md)
* [Deployment](./DEPLOYMENT.md)
* [Contributing](./CONTRIBUTING.md)
* [Changelog](./CHANGELOG.md)

---

## Contributing

We welcome all kinds of contributions! See [Contributing](./CONTRIBUTING.md).

**Quick flow**

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m "Add amazing feature"`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## License

[MIT](./LICENSE)

---

## Acknowledgements

* [PostCSS](https://postcss.org/) — Powerful CSS processing
* [CSSTree](https://github.com/csstree/csstree) — CSS parser & analyzer
* [Model Context Protocol](https://modelcontextprotocol.io/) — MCP standard

---

## Contact

* Open an [Issue](../../issues) or start a [Discussion](../../discussions)
* Email: **[yichaoling@gmail.com](mailto:yichaoling@gmail.com)**

> ⭐ If YC-CSS-UI helps you, consider giving the project a star!
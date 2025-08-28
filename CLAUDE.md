# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

YC-CSS-UI MCP is an AI-powered CSS debugging and optimization MCP (Model Context Protocol) server designed for Claude Code integration. The project provides intelligent CSS analysis, issue detection, and automatic fix suggestions through a structured monorepo architecture.

**Key Service Identifier**: When analysis is complete, the system displays "YC-CSS-UI服务" to confirm the service is active.

## Commands

### Development Commands
```bash
# Install dependencies
yarn install

# Build all packages (uses Turbo for orchestration)
yarn build

# Start development mode with watch
yarn dev

# Run all tests
yarn test

# Run tests for specific workspace
yarn workspace @yc-css-ui/core test
yarn workspace @yc-css-ui/server test

# Lint all packages
yarn lint

# Type checking
yarn type-check

# Clean all build artifacts
yarn clean
```

### MCP Server Operations
```bash
# Start the YC-CSS-UI MCP server
yarn workspace @yc-css-ui/server start

# Expected output on successful start:
# "YC-CSS-UI MCP Server started successfully"
# "YC-CSS-UI服务 - 已成功启动并准备就绪"
# "Available tools: analyze_css, fix_css_issues"
```

### Package Management
```bash
# Add dependency to specific workspace
yarn workspace @yc-css-ui/core add <package>

# Run command in specific workspace
yarn workspace @yc-css-ui/server <command>

# Version management (uses changesets)
yarn changeset
yarn version-packages
yarn release
```

## Architecture

### Monorepo Structure
The project uses Yarn workspaces with Turbo for build orchestration:

- **`packages/core/`**: Core CSS analysis engine (`@yc-css-ui/core`)
  - Built on PostCSS and css-tree for accurate CSS parsing
  - Modular analyzer system (Layout, Specificity, Performance, etc.)
  - Main entry: `CSSAnalyzer` class with `analyzeCSS()` convenience function
  
- **`packages/server/`**: MCP server implementation (`@yc-css-ui/server`)  
  - Implements Model Context Protocol for Claude Code integration
  - Exports `YCCSSUIMCPServer` class
  - Provides two MCP tools: `analyze_css` and `fix_css_issues`
  
- **`packages/cli/`**: Command-line interface (`@yc-css-ui/cli`)
  - Binary name: `yc-css-ui`
  - Built with Commander.js

### Core Analysis Flow
1. **CSS Parsing**: Uses `CSSParser` (wraps css-tree) for syntax validation and AST generation
2. **Modular Analysis**: 
   - `LayoutAnalyzer`: Detects flexbox/grid issues, positioning problems
   - `SpecificityAnalyzer`: Checks selector specificity conflicts
   - Additional analyzers for performance, compatibility, accessibility
3. **Issue Aggregation**: Collects all issues into `CSSAnalysisResult` with severity levels
4. **MCP Integration**: Server exposes analysis via MCP tools for Claude Code

### Key Design Patterns
- **Analyzer Pattern**: Each analysis type is a separate class implementing consistent interface
- **Options-based Configuration**: `CSSAnalysisOptions` allows fine-tuned control over checks and thresholds
- **Promise-based APIs**: All analysis operations are async for future extensibility
- **Error Boundaries**: Parser validation occurs before analysis to provide clear error messages

## Build System

### Turbo Pipeline
The monorepo uses Turbo with these pipeline stages:
- `build`: Depends on `^build` (builds dependencies first)
- `test`: Depends on `build` 
- `lint`: Depends on `^build`
- `dev`: Persistent cache-disabled mode for development

### TypeScript Configuration
- Target: Node 18+ 
- Uses tsup for bundling with esbuild
- Special handling for `createRequire` issues in bundled CommonJS (see tsup.config.ts banner fixes)

### Package Dependencies
- Core: postcss, css-tree, specificity
- Server: @modelcontextprotocol/sdk + core package
- Development: turbo, changesets, typescript, vitest

## MCP Integration

### Server Configuration
The MCP server (`YCCSSUIMCPServer`) implements:
- **Tool Registration**: `analyze_css` and `fix_css_issues` tools
- **Request Handling**: CallToolRequest processing with proper error boundaries
- **Transport**: StdioServerTransport for Claude Code communication

### Claude Code Setup
Add to MCP configuration:
```json
{
  "mcpServers": {
    "yc-css-ui": {
      "command": "yarn",
      "args": ["workspace", "@yc-css-ui/server", "start"],
      "cwd": "/path/to/project",
      "description": "YC-CSS-UI智能CSS分析与优化工具"
    }
  }
}
```

### Usage Pattern in Claude Code
```
Please use YC-CSS-UI to analyze this CSS:
[CSS code here]
```

The service will respond with detailed analysis and display the "YC-CSS-UI服务" identifier upon completion.

## Testing Strategy

- **Unit Tests**: Individual analyzers and core functions
- **Integration Tests**: End-to-end CSS analysis workflows  
- **Coverage**: Vitest with coverage reporting enabled
- **Test Runner**: `yarn test` runs all workspace tests via Turbo

## Critical Implementation Details

### ESM/CommonJS Compatibility
The build system includes special handling for `import.meta.url` in bundled contexts - see the banner fixes in tsup configurations that resolve `createRequire` issues.

### Dependency Management
- External packages (mdn-data, css-tree) are kept external to avoid bundling issues
- Core analysis dependencies are bundled for distribution
- Yarn PnP compatibility maintained through proper external/noExternal configurations
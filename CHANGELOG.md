# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release preparations

## [0.1.0] - 2024-08-28

### Added
- 🎉 Initial release of YC-CSS-UI MCP
- Core CSS analysis engine (@yc-css-ui/core)
- MCP server implementation (@yc-css-ui/server)  
- CLI tool foundation (@yc-css-ui/cli)
- Claude Code integration support
- Intelligent CSS issue detection:
  - Flexbox layout problems
  - Grid template issues
  - Specificity conflicts
  - Performance bottlenecks
  - Accessibility concerns
- Automatic fix suggestions
- Service identifier: "YC-CSS-UI服务"
- Comprehensive documentation and usage guides

### Technical
- Monorepo architecture with Yarn workspaces
- TypeScript support throughout
- Turbo build orchestration
- ESM/CommonJS compatibility
- PostCSS and css-tree based analysis
- Model Context Protocol (MCP) integration

[Unreleased]: https://github.com/yc-css-ui/yc-css-ui-mcp/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/yc-css-ui/yc-css-ui-mcp/releases/tag/v0.1.0
# CSS MCP Service 使用说明

## 项目概述

CSS MCP (Model Context Protocol) Service 是一个智能的CSS调试和优化服务，通过Claude Code集成，为开发者提供自动化的CSS分析、问题检测和修复建议。

## 安装和构建

```bash
# 安装依赖
yarn install

# 构建项目
yarn build

# 运行测试
yarn test
```

## 核心功能

### 1. CSS分析引擎 (@css-mcp/core)

提供全面的CSS代码分析功能：

- ✅ **布局分析**: Flexbox/Grid布局问题检测
- ✅ **性能分析**: 文件大小、选择器数量、嵌套深度
- ✅ **特异性分析**: 选择器特异性冲突检测
- ✅ **可访问性分析**: 颜色对比度、字体大小、焦点样式
- ✅ **兼容性分析**: 现代CSS特性浏览器支持情况

### 2. MCP服务器 (@css-mcp/server)

为Claude Code提供CSS分析工具：

- `analyze_css`: 分析CSS代码并返回详细报告
- `fix_css_issues`: 提供自动修复建议

### 3. 使用示例

```javascript
import { analyzeCSS } from '@css-mcp/core';

const cssCode = `
.container {
  display: flex;
  flex-direction: row;
}

.item {
  flex: 1;
  min-width: 300px; /* 可能导致溢出 */
}
`;

const result = await analyzeCSS(cssCode);
console.log('分析结果:', result);
```

## MCP集成

### 在Claude Code中使用

1. 启动MCP服务器：
```bash
node packages/server/dist/server.js
```

2. 在Claude Code配置中添加MCP服务器：
```json
{
  "mcpServers": {
    "css-mcp": {
      "command": "node",
      "args": ["path/to/packages/server/dist/server.js"],
      "env": {}
    }
  }
}
```

3. 使用CSS分析工具：
```
请使用analyze_css工具分析这段CSS代码：
.header { margin-top: 20px; }
```

## 项目架构

```
packages/
├── core/           # CSS分析引擎核心
│   ├── src/
│   │   ├── types/      # 类型定义
│   │   ├── parser/     # CSS解析器
│   │   ├── analyzers/  # 各种分析器
│   │   └── core/       # 主分析器
│   └── dist/          # 构建输出
├── server/         # MCP服务器
│   ├── src/
│   │   ├── tools/      # MCP工具实现
│   │   └── server.ts   # 服务器主文件
│   └── dist/          # 构建输出
├── cli/           # 命令行工具 (未完成)
├── vscode-extension/ # VS Code扩展 (未完成)
└── web-app/       # Web应用 (未完成)
```

## 构建状态

- ✅ Monorepo项目结构搭建完成
- ✅ TypeScript配置和构建系统
- ✅ CSS分析引擎核心功能
- ✅ MCP服务器基本实现
- ✅ 基础测试框架
- ✅ CI/CD流水线配置

## 开发计划

### Phase 1 (已完成)
- [x] 项目结构和构建系统
- [x] CSS分析引擎核心
- [x] MCP服务器基础功能

### Phase 2 (计划中)
- [ ] CLI工具开发
- [ ] VS Code扩展
- [ ] 更完善的测试覆盖
- [ ] 性能优化

### Phase 3 (计划中)
- [ ] Web应用界面
- [ ] 更多CSS分析规则
- [ ] 集成更多外部工具

## 贡献指南

1. Fork项目
2. 创建特性分支
3. 提交更改
4. 创建Pull Request

## 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件。

---

**项目状态**: 🚧 开发中 - 核心功能已实现，持续改进中
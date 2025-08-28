# YC-CSS-UI MCP - AI-Powered CSS Debugging & Optimization

<div align="center">

![YC-CSS-UI Logo](https://via.placeholder.com/200x100?text=YC-CSS-UI+MCP)

**YC-CSS-UI 智能CSS调试与优化MCP服务**

[![CI](https://github.com/yc-css-ui/yc-css-ui-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/yc-css-ui/yc-css-ui-mcp/actions/workflows/ci.yml)
[![Release](https://github.com/yc-css-ui/yc-css-ui-mcp/actions/workflows/release.yml/badge.svg)](https://github.com/yc-css-ui/yc-css-ui-mcp/actions/workflows/release.yml)
[![npm version](https://badge.fury.io/js/@yc-css-ui%2Fcore.svg)](https://badge.fury.io/js/@yc-css-ui%2Fcore)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

## ✨ 特性

- 🔍 **智能CSS分析** - 检测布局、性能、兼容性问题
- 🛠️ **自动修复建议** - AI驱动的代码修复方案
- ⚡ **实时调试** - 与Claude Code无缝集成
- 📊 **性能优化** - CSS性能分析和优化建议
- 🎯 **准确性优化** - 基于PostCSS的精确语法分析
- 🌐 **兼容性检查** - 跨浏览器兼容性验证
- ♿ **可访问性** - WCAG合规性检查

## 🚀 快速开始

### 安装

```bash
# 使用npm
npm install @yc-css-ui/core @yc-css-ui/server

# 使用yarn
yarn add @yc-css-ui/core @yc-css-ui/server

# 使用pnpm
pnpm add @yc-css-ui/core @yc-css-ui/server
```

### 基础使用

```typescript
import { analyzeCSS } from '@yc-css-ui/core';

const css = `
  .flex-container {
    display: flex;
    align-items: center; /* 可能的问题：缺少高度 */
  }
`;

const result = await analyzeCSS(css);
console.log(result.summary); // { totalIssues: 1, warningCount: 1, ... }
console.log(result.issues[0].message); // "flex容器缺少明确高度"
```

### Claude Code集成

1. 配置MCP服务器：

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

2. 在Claude Code中使用：

```bash
# 分析CSS文件
/css:debug styles/main.css

# 自动修复CSS问题
/css:fix layout-issues styles/components/

# 优化CSS性能
/css:optimize --performance styles/
```

## 📦 包结构

这是一个Monorepo项目，包含以下包：

- **[@yc-css-ui/core](packages/core)** - 核心CSS分析引擎
- **[@yc-css-ui/server](packages/server)** - MCP服务器实现
- **[@yc-css-ui/cli](packages/cli)** - 命令行工具（开发中）
- **[@yc-css-ui/vscode-extension](packages/vscode-extension)** - VS Code扩展（计划中）

## 🔧 支持的问题类型

### 布局问题
- ✅ Flexbox对齐失效
- ✅ Grid模板缺失
- ✅ 定位属性无效
- ✅ Z-index层叠问题

### 性能问题
- ✅ 文件大小过大
- ✅ 选择器数量过多
- ✅ 深层嵌套
- ✅ 未使用的CSS规则

### 兼容性问题
- ✅ 现代CSS特性检测
- ✅ 供应商前缀缺失
- ✅ 浏览器支持验证

### 可访问性问题
- ✅ 颜色对比度不足
- ✅ 字体大小过小
- ✅ Focus样式缺失

### 维护性问题
- ✅ 选择器特异性过高
- ✅ 特异性冲突
- ✅ 代码重复

## 💡 使用示例

### 1. 检测Flexbox问题

```css
/* 问题CSS */
.navbar {
  display: flex;
  align-items: center; /* ⚠️ 警告：容器没有明确高度 */
}

/* 修复建议 */
.navbar {
  display: flex;
  align-items: center;
  min-height: 60px; /* ✅ 添加明确高度 */
}
```

### 2. Grid布局诊断

```css
/* 问题CSS */
.grid-container {
  display: grid; /* ❌ 错误：缺少grid模板 */
}

/* 修复建议 */
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* ✅ 添加模板 */
}
```

### 3. 性能优化

```css
/* 问题CSS - 深层嵌套 */
body div#main .content ul li.item a.link {
  color: blue; /* ⚠️ 警告：选择器嵌套过深 */
}

/* 优化建议 */
.nav-link {
  color: blue; /* ✅ 使用简单的类选择器 */
}
```

## 🛠️ 开发

### 环境要求

- Node.js 18+
- Yarn 3.8+

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/yc-css-ui/yc-css-ui-mcp.git
cd yc-css-ui-mcp

# 安装依赖
yarn install

# 构建所有包
yarn build

# 运行测试
yarn test

# 启动开发模式
yarn dev
```

### 测试

```bash
# 运行所有测试
yarn test

# 运行特定包的测试
yarn workspace @yc-css-ui/core test

# 运行测试并生成覆盖率报告
yarn test --coverage
```

## 📚 文档

- [用户指南](docs/user-guide.md) - 详细使用说明
- [API参考](docs/api-reference.md) - 完整API文档
- [贡献指南](CONTRIBUTING.md) - 如何参与贡献
- [更新日志](CHANGELOG.md) - 版本更新记录

## 🤝 贡献

我们欢迎所有形式的贡献！请查看 [贡献指南](CONTRIBUTING.md) 了解详情。

### 贡献方式

- 🐛 报告Bug
- 💡 提出新功能建议
- 📖 改进文档
- 💻 提交代码
- 🧪 编写测试
- 🌐 翻译文档

### 快速贡献

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [PostCSS](https://postcss.org/) - 强大的CSS处理工具
- [CSS Tree](https://github.com/csstree/csstree) - CSS解析和分析
- [Claude](https://claude.ai) - AI能力支持
- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP标准

## 📞 联系我们

- 🐛 [报告问题](https://github.com/yc-css-ui/yc-css-ui-mcp/issues)
- 💬 [讨论](https://github.com/yc-css-ui/yc-css-ui-mcp/discussions)
- 📧 Email: contact@yc-css-ui.org
- 🐦 Twitter: [@yccssui](https://twitter.com/yccssui)

---

<div align="center">

**[⭐ 给我们点个星](https://github.com/yc-css-ui/yc-css-ui-mcp) 如果这个项目对你有帮助！**

</div>

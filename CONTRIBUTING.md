# 贡献指南

感谢你对 YC-CSS-UI MCP 项目的贡献兴趣！

## 开发设置

### 环境要求

- Node.js 18+
- Yarn 4.x+
- Git

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/yc-css-ui/yc-css-ui-mcp.git
cd yc-css-ui-mcp

# 安装依赖
yarn install

# 构建项目
yarn build

# 运行测试
yarn test

# 启动开发模式
yarn dev
```

## 贡献流程

1. Fork 这个项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

## 代码规范

- 使用 TypeScript
- 遵循现有的代码风格
- 添加适当的测试
- 更新相关文档

## 提交消息规范

使用 [Conventional Commits](https://conventionalcommits.org/) 格式：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 类型

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 仅文档更改
- `style`: 不影响代码含义的更改（空白、格式、缺少分号等）
- `refactor`: 既不修复错误也不添加功能的代码更改
- `perf`: 提高性能的代码更改
- `test`: 添加缺失测试或修正现有测试
- `chore`: 对构建过程或辅助工具和库的更改

## 报告问题

使用 GitHub Issues 报告问题，请包含：

- 问题描述
- 重现步骤
- 预期行为
- 实际行为
- 环境信息

## 许可

通过贡献，你同意你的贡献将在 MIT 许可下授权。
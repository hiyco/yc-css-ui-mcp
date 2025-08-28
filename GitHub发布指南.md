# YC-CSS-UI MCP GitHub 发布完整指南

## 概述

本指南将带你完成将 YC-CSS-UI MCP 项目发布到 GitHub 的所有步骤，包括创建仓库、设置CI/CD、发布包等。

## 第一阶段：准备和初始化

### 1. 初始化Git仓库

```bash
# 在项目根目录
cd /Users/yichao/web/plugcss

# 初始化Git仓库
git init

# 添加所有文件
git add .

# 创建初始提交
git commit -m "🎉 Initial commit: YC-CSS-UI MCP v0.1.0

- 重命名项目从 CSS MCP 到 YC-CSS-UI MCP
- 更新所有包名称和依赖
- 添加服务标识和 Claude Code 集成指南
- 修复 createRequire 兼容性问题
- 完整的 monorepo 架构和构建系统

包含组件：
- @yc-css-ui/core: CSS 分析核心引擎
- @yc-css-ui/server: MCP 服务器实现  
- @yc-css-ui/cli: 命令行工具

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 2. 在GitHub创建新仓库

#### 方法一：使用GitHub网页界面

1. 访问 [GitHub](https://github.com)
2. 点击右上角的 "+" → "New repository"
3. 填写仓库信息：
   - **Repository name**: `yc-css-ui-mcp`
   - **Description**: `YC-CSS-UI智能CSS调试与优化MCP服务 - AI-powered CSS debugging and optimization for Claude Code`
   - **Visibility**: Public (推荐) 或 Private
   - **不要**勾选 "Initialize this repository with..."（因为我们已有代码）
4. 点击 "Create repository"

#### 方法二：使用GitHub CLI（推荐）

```bash
# 安装GitHub CLI（如果未安装）
# macOS: brew install gh
# Windows: scoop install gh

# 登录GitHub
gh auth login

# 创建远程仓库并推送
gh repo create yc-css-ui-mcp --public --description "YC-CSS-UI智能CSS调试与优化MCP服务 - AI-powered CSS debugging and optimization for Claude Code" --push --source .
```

#### 方法三：手动添加远程仓库

```bash
# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/yc-css-ui-mcp.git

# 推送代码
git branch -M main
git push -u origin main
```

### 3. 运行发布准备脚本

```bash
# 运行预准备脚本
./scripts/prepare-release.sh
```

## 第二阶段：GitHub仓库配置

### 1. 创建仓库模板文件

#### Issue 模板

创建 `.github/ISSUE_TEMPLATE/` 目录：

```bash
mkdir -p .github/ISSUE_TEMPLATE
```

**Bug报告模板** (`.github/ISSUE_TEMPLATE/bug_report.yml`):

```yaml
name: 🐛 Bug Report
description: Create a report to help us improve YC-CSS-UI MCP
title: '[Bug]: '
labels: ['bug', 'needs-triage']
body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to fill out this bug report! Please provide as much detail as possible.
        
  - type: textarea
    id: description
    attributes:
      label: Bug Description
      description: A clear and concise description of what the bug is.
      placeholder: Describe the bug...
    validations:
      required: true
      
  - type: textarea
    id: reproduction
    attributes:
      label: Steps to Reproduce
      description: Steps to reproduce the behavior
      placeholder: |
        1. Go to '...'
        2. Click on '...'
        3. See error
    validations:
      required: true
      
  - type: textarea
    id: expected
    attributes:
      label: Expected Behavior
      description: What you expected to happen
      placeholder: Describe expected behavior...
    validations:
      required: true
      
  - type: textarea
    id: css-sample
    attributes:
      label: CSS Sample
      description: If applicable, provide the CSS code that causes the issue
      render: css
      placeholder: |
        .example {
          display: flex;
          /* CSS code that reproduces the issue */
        }
        
  - type: dropdown
    id: severity
    attributes:
      label: Severity
      description: How severe is this bug?
      options:
        - Low - Minor inconvenience
        - Medium - Affects functionality
        - High - Blocks critical functionality
        - Critical - System unusable
    validations:
      required: true
      
  - type: textarea
    id: environment
    attributes:
      label: Environment
      description: |
        Provide details about your environment:
      value: |
        - OS: 
        - Node.js version: 
        - Yarn version: 
        - Package version: 
        - Claude Code version: 
      render: markdown
    validations:
      required: true
      
  - type: textarea
    id: additional
    attributes:
      label: Additional Context
      description: Add any other context about the problem here
      placeholder: Additional information...
```

**功能请求模板** (`.github/ISSUE_TEMPLATE/feature_request.yml`):

```yaml
name: 💡 Feature Request
description: Suggest an idea for YC-CSS-UI MCP
title: '[Feature]: '
labels: ['enhancement', 'needs-triage']
body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to suggest a new feature!
        
  - type: textarea
    id: problem
    attributes:
      label: Problem Description
      description: Is your feature request related to a problem? Please describe.
      placeholder: A clear and concise description of what the problem is...
    validations:
      required: true
      
  - type: textarea
    id: solution
    attributes:
      label: Proposed Solution
      description: Describe the solution you'd like
      placeholder: A clear and concise description of what you want to happen...
    validations:
      required: true
      
  - type: dropdown
    id: component
    attributes:
      label: Component
      description: Which component does this feature request relate to?
      options:
        - Core Analysis Engine
        - MCP Server
        - CLI Tool
        - Documentation
        - Build System
        - Other
    validations:
      required: true
      
  - type: textarea
    id: alternatives
    attributes:
      label: Alternatives Considered
      description: Describe alternatives you've considered
      placeholder: Any alternative solutions or features you've considered...
      
  - type: textarea
    id: additional
    attributes:
      label: Additional Context
      description: Add any other context about the feature request here
      placeholder: Additional information...
```

#### Pull Request 模板

**PR 模板** (`.github/PULL_REQUEST_TEMPLATE.md`):

```markdown
## 📋 Description

Brief description of changes made in this pull request.

## 🔧 Type of Change

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation update
- [ ] 🔨 Refactoring (no functional changes)
- [ ] ⚡ Performance improvement
- [ ] 🧪 Test updates

## 🧪 Testing

Describe the tests that you ran to verify your changes:

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] CSS analysis accuracy verified

## 📝 Checklist

- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## 🔗 Related Issues

Fixes #(issue number)

## 📸 Screenshots (if applicable)

Add screenshots to help explain your changes.

## 🚀 Deployment Notes

Any special deployment considerations or steps needed.
```

### 2. 创建GitHub Actions工作流

创建 `.github/workflows/` 目录：

```bash
mkdir -p .github/workflows
```

**CI 工作流** (`.github/workflows/ci.yml`):

```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    name: Test on Node ${{ matrix.node-version }}
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x, 22.x]

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        
    - name: Enable Corepack
      run: corepack enable
      
    - name: Install dependencies
      run: yarn install --frozen-lockfile

    - name: Run type checking
      run: yarn type-check

    - name: Run linting
      run: yarn lint

    - name: Run tests
      run: yarn test --coverage

    - name: Build packages
      run: yarn build
      
    - name: Test MCP Server startup
      run: timeout 10s yarn workspace @yc-css-ui/server start || exit_code=$?; if [ $exit_code -ne 124 ]; then exit $exit_code; fi

    - name: Upload coverage reports
      if: matrix.node-version == '20.x'
      uses: codecov/codecov-action@v4
      with:
        token: ${{ secrets.CODECOV_TOKEN }}
```

**发布工作流** (`.github/workflows/release.yml`):

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

permissions:
  contents: write
  id-token: write

jobs:
  release:
    name: Create Release
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      with:
        fetch-depth: 0

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        registry-url: 'https://registry.npmjs.org/'
        
    - name: Enable Corepack
      run: corepack enable

    - name: Install dependencies
      run: yarn install --frozen-lockfile

    - name: Build packages
      run: yarn build

    - name: Run tests
      run: yarn test

    - name: Create Release
      uses: actions/create-release@v1
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      with:
        tag_name: ${{ github.ref }}
        release_name: YC-CSS-UI MCP ${{ github.ref }}
        draft: false
        prerelease: false
        body: |
          ## What's Changed
          
          See [CHANGELOG.md](CHANGELOG.md) for full details.
          
          ## Installation
          
          ```bash
          npm install @yc-css-ui/core @yc-css-ui/server
          ```
          
          ## 🤖 Automated Release
          
          This release was created automatically by GitHub Actions.

  publish:
    name: Publish to NPM
    runs-on: ubuntu-latest
    needs: release
    if: startsWith(github.ref, 'refs/tags/')
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        registry-url: 'https://registry.npmjs.org/'
        
    - name: Enable Corepack
      run: corepack enable

    - name: Install dependencies
      run: yarn install --frozen-lockfile

    - name: Build packages
      run: yarn build

    - name: Publish to NPM
      run: yarn changeset publish
      env:
        NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
        NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 3. 创建项目文档

**CONTRIBUTING.md**:

```markdown
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
```

**CHANGELOG.md**:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release preparations

## [0.1.0] - 2024-XX-XX

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
```

## 第三阶段：发布流程

### 1. 提交所有更改

```bash
# 添加新创建的文件
git add .

# 提交GitHub配置文件
git commit -m "🔧 Add GitHub repository configuration

- Add issue and PR templates for better contributor experience
- Set up CI/CD workflows for automated testing and releases
- Create comprehensive documentation (CONTRIBUTING.md, CHANGELOG.md)
- Configure codecov integration and NPM publishing

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 推送到GitHub
git push origin main
```

### 2. 创建第一个发布

```bash
# 创建发布标签
git tag -a v0.1.0 -m "🚀 YC-CSS-UI MCP v0.1.0

Initial release with core CSS analysis engine and MCP server implementation.

Features:
- 🔍 Intelligent CSS analysis (layout, performance, compatibility, accessibility)
- 🛠️ Automatic fix suggestions
- ⚡ Claude Code integration via MCP
- 📊 Comprehensive issue detection and reporting
- 🌐 Service identifier: YC-CSS-UI服务

Packages:
- @yc-css-ui/core v0.1.0 - Core analysis engine
- @yc-css-ui/server v0.1.0 - MCP server implementation
- @yc-css-ui/cli v0.1.0 - Command line interface

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 推送标签
git push origin v0.1.0
```

### 3. 配置仓库设置

1. 在GitHub仓库页面，点击 "Settings"
2. **General** → **Features**:
   - ✅ Issues
   - ✅ Projects  
   - ✅ Wiki
   - ✅ Discussions
3. **General** → **Pull Requests**:
   - ✅ Allow merge commits
   - ✅ Allow squash merging
   - ✅ Allow rebase merging
   - ✅ Delete head branches automatically
4. **Branches** → **Branch protection rules** → Add rule for `main`:
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include CI checks
5. **Secrets and variables** → **Actions**:
   - Add `NPM_TOKEN` (用于NPM发布)
   - Add `CODECOV_TOKEN` (用于代码覆盖率)

### 4. 设置NPM发布（可选）

```bash
# 登录NPM
npm login

# 发布包（如果需要）
yarn changeset publish
```

## 第四阶段：推广和维护

### 1. 创建项目页面

在GitHub Pages创建项目展示页面（可选）

### 2. 添加徽章和状态

在README.md中的徽章会自动更新：
- CI状态
- 发布版本
- 许可证信息
- NPM下载量

### 3. 社区建设

1. 启用GitHub Discussions
2. 创建项目Wiki
3. 设置GitHub Sponsors（如果适用）
4. 在社交媒体宣传

## 验证清单

发布前请确认：

- [ ] 所有测试通过
- [ ] 构建成功
- [ ] 文档完整且准确
- [ ] LICENSE文件存在
- [ ] README.md包含安装和使用说明
- [ ] CHANGELOG.md记录了变更
- [ ] 版本号在所有package.json中一致
- [ ] GitHub Actions配置正确
- [ ] 仓库设置完成（分支保护、标签等）

## 故障排除

### 常见问题

1. **CI失败**: 检查Node.js版本兼容性
2. **构建错误**: 确认所有依赖已安装
3. **NPM发布失败**: 验证NPM_TOKEN配置
4. **测试超时**: 调整MCP服务器启动测试的超时时间

### 获取帮助

- 查看项目的 CLAUDE.md 文件
- 检查GitHub Actions日志
- 在GitHub Issues中搜索类似问题
- 查阅Model Context Protocol文档

---

## 总结

完成以上步骤后，YC-CSS-UI MCP项目将完全配置好并发布到GitHub，包括：

1. ✅ 完整的Git历史和标签
2. ✅ 专业的GitHub仓库配置  
3. ✅ 自动化CI/CD流程
4. ✅ 完整的项目文档
5. ✅ 社区贡献指南
6. ✅ 发布和版本管理

项目现在已准备好接受贡献并为用户提供服务！

🎉 **欢迎来到YC-CSS-UI MCP的开源社区！**
#!/bin/bash

# YC-CSS-UI MCP 发布准备脚本
# 准备项目用于GitHub发布

set -e

echo "🚀 准备 YC-CSS-UI MCP 项目发布..."

# 检查Node.js和Yarn版本
echo "📋 检查环境..."
node --version
yarn --version

# 清理之前的构建
echo "🧹 清理构建产物..."
yarn clean

# 安装依赖
echo "📦 安装依赖..."
yarn install --frozen-lockfile

# 类型检查
echo "🔍 类型检查..."
yarn type-check

# 代码检查
echo "📝 代码检查..."
yarn lint

# 运行测试
echo "🧪 运行测试..."
yarn test

# 构建所有包
echo "🔨 构建项目..."
yarn build

# 验证MCP服务器启动
echo "✅ 验证MCP服务器..."
timeout 5s yarn workspace @yc-css-ui/server start || true

# 生成包大小报告
echo "📊 生成包大小报告..."
du -sh packages/*/dist/* 2>/dev/null || echo "无构建产物"

echo "✨ 发布准备完成！"
echo ""
echo "下一步："
echo "1. 提交所有更改到Git"
echo "2. 创建GitHub仓库"
echo "3. 推送代码到GitHub"
echo "4. 创建发布标签"
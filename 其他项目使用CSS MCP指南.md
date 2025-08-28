# 在其他项目中使用Claude Code CSS MCP分析指南

## 🎯 使用场景

您可以在任何项目中使用YC-CSS MCP服务来分析CSS代码，无论是：
- React、Vue、Angular项目
- 传统HTML/CSS项目
- WordPress主题开发
- 小程序样式文件
- 任何包含CSS的项目

## 🚀 使用方法

### 方法一：直接粘贴CSS代码（推荐）

在Claude Code中直接粘贴您的CSS代码进行分析：

```
请使用CSS MCP分析以下代码：

/* 主页样式 */
.header {
  font-size: 12px;
  background-color: #f0f0f0;
  color: #999;
}

.nav-menu ul li a {
  text-decoration: none;
  padding: 10px;
}

.nav-menu ul li a:focus {
  outline: none;
}

.content #main .sidebar .widget ul li a.active {
  font-weight: bold;
  color: red;
}

@media (max-width: 768px) {
  .header {
    font-size: 10px;
  }
}

请重点检查可访问性问题、选择器复杂度和移动端兼容性。
```

### 方法二：上传CSS文件内容

```
我有一个CSS文件需要分析，内容如下：

[粘贴整个CSS文件内容]

文件名：styles.css
项目：电商网站前端
请帮我检查性能问题和代码质量。
```

### 方法三：分析特定CSS片段

```
我在开发React组件时遇到样式问题，请分析这段CSS：

.product-card {
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.product-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  transform: translateY(-2px);
}

.product-card .title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.product-card .price {
  font-size: 16px;
  color: #e74c3c;
  font-weight: bold;
}

请检查是否有性能问题和可访问性问题。
```

## 📂 不同项目类型的使用示例

### React项目

```
我在开发React项目，请分析组件样式：

/* Header.module.css */
.header {
  position: fixed;
  top: 0;
  width: 100%;
  background: white;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.nav-link {
  color: #333;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
}

.nav-link:focus {
  outline: 0;
}

项目特点：
- 使用CSS Modules
- 需要支持移动端
- 注重可访问性

请重点检查移动端适配和无障碍访问问题。
```

### Vue项目

```
Vue项目中的样式需要优化，请分析：

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 16px;
}

.card-title {
  font-size: 18px;
  color: #212121;
  margin-bottom: 12px;
}

.card-content {
  font-size: 14px;
  color: #757575;
  line-height: 1.5;
}

.btn-primary {
  background: linear-gradient(45deg, #2196F3, #21CBF3);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-primary:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.3);
}
</style>

请检查性能和用户体验问题。
```

### 小程序项目

```
微信小程序样式文件分析：

/* pages/index/index.wxss */
.container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.banner {
  width: 100%;
  height: 300rpx;
  border-radius: 10rpx;
  margin-bottom: 20rpx;
}

.product-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.product-item {
  width: 48%;
  background: white;
  border-radius: 8rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.product-title {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.product-price {
  font-size: 32rpx;
  color: #ff4444;
  margin-top: 10rpx;
}

请检查小程序平台的兼容性和性能问题。
```

### WordPress主题

```
WordPress主题样式需要优化：

/* style.css */
.site-header {
  background: #fff;
  padding: 1rem 0;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.site-navigation ul {
  list-style: none;
  display: flex;
  margin: 0;
  padding: 0;
}

.site-navigation li {
  margin-right: 2rem;
}

.site-navigation a {
  color: #333;
  text-decoration: none;
  font-weight: 500;
}

.site-navigation a:hover {
  color: #0073aa;
}

.entry-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.entry-content h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #222;
}

.entry-content p {
  line-height: 1.6;
  margin-bottom: 1rem;
  color: #444;
}

/* 移动端 */
@media (max-width: 768px) {
  .site-navigation ul {
    flex-direction: column;
  }
  
  .entry-content h1 {
    font-size: 2rem;
  }
}

请检查WordPress主题的最佳实践和移动端兼容性。
```

## 🎯 特定分析需求

### 性能优化分析

```
请重点分析CSS性能问题：

[粘贴CSS代码]

关注点：
- 选择器复杂度
- 重绘和重排问题
- 文件大小优化
- 关键渲染路径
```

### 可访问性检查

```
请检查CSS的可访问性问题：

[粘贴CSS代码]

重点关注：
- 颜色对比度
- 字体大小
- 焦点样式
- 屏幕阅读器支持
```

### 移动端适配检查

```
请检查移动端CSS适配：

[粘贴CSS代码]

检查要点：
- 响应式布局
- 触摸友好
- 性能优化
- 兼容性问题
```

### 浏览器兼容性分析

```
请分析CSS浏览器兼容性：

[粘贴CSS代码]

目标浏览器：
- Chrome 90+
- Safari 14+
- Firefox 88+
- Edge 90+
- IE 11 (如需支持)
```

## 📋 分析类型对照表

| 分析类型 | Claude Code提示词 | 重点检查项 |
|---------|-----------------|----------|
| **全面分析** | "请全面分析这段CSS代码" | 所有问题类型 |
| **性能优化** | "请检查CSS性能问题" | 选择器、文件大小、渲染 |
| **可访问性** | "请检查可访问性问题" | 对比度、字体、焦点样式 |
| **代码质量** | "请检查代码质量和维护性" | 特异性、重复代码、命名 |
| **移动端** | "请检查移动端适配" | 响应式、触摸、性能 |
| **兼容性** | "请检查浏览器兼容性" | 前缀、降级方案 |

## 🔧 高级使用技巧

### 1. 批量文件分析

```
我有多个CSS文件需要分析：

文件1: main.css
[粘贴main.css内容]

文件2: components.css
[粘贴components.css内容]

文件3: responsive.css
[粘贴responsive.css内容]

请分别分析每个文件的问题，并提供整体优化建议。
```

### 2. 对比分析

```
请对比分析这两种CSS写法：

方案A：
.card {
  background: white;
  border: 1px solid #ddd;
  padding: 20px;
}

方案B：
.card {
  background-color: #ffffff;
  border: 1px solid #dddddd;
  padding: 1.25rem;
}

哪种写法更好？为什么？
```

### 3. 问题修复验证

```
根据之前的分析建议，我修改了CSS：

修改前：
[粘贴原始CSS]

修改后：
[粘贴修改后的CSS]

请验证修改是否正确，还有哪些可以改进的地方？
```

## 📊 分析报告解读

YC-CSS MCP会生成详细的分析报告，包含：

### 报告结构
```
🎨 YC-CSS MCP 智能分析报告

📊 分析概览
- 文件信息
- 问题统计
- 严重程度分布

🚨 发现的问题
1. ❌ 错误级问题
2. ⚠️ 警告级问题  
3. ℹ️ 信息级问题

📋 修复优先级
🔴 立即修复
🟡 建议修复

🔧 本次分析使用的YC-CSS MCP服务
- 服务信息
- 分析时间
- 功能特性
```

### 问题类型说明
- **❌ 错误**: 必须修复的问题，影响用户体验
- **⚠️ 警告**: 建议修复的问题，影响代码质量
- **ℹ️ 信息**: 优化建议，提升最佳实践

## ⚡ 快速上手检查清单

- [ ] 确认Claude Code已配置YC-CSS MCP
- [ ] 准备要分析的CSS代码
- [ ] 明确分析需求（性能/可访问性/质量）
- [ ] 在Claude Code中粘贴CSS代码
- [ ] 添加具体的分析要求
- [ ] 查看分析报告
- [ ] 根据建议修复问题
- [ ] 可选：验证修复效果

## 🎯 实际使用案例

### 案例1：电商网站首页优化

**需求**: 电商网站首页CSS性能优化

**使用方式**:
```
电商网站首页CSS需要性能优化：

[粘贴CSS代码]

背景：
- 日PV 10万+
- 主要用户群体：移动端
- 需要快速加载
- 重视SEO性能

请重点分析：
1. 关键渲染路径优化
2. 移动端性能问题
3. 文件大小优化建议
```

**获得结果**: 详细的性能分析报告和具体优化建议

### 案例2：组件库样式规范检查

**需求**: 确保组件库CSS符合团队规范

**使用方式**:
```
团队组件库CSS规范检查：

[粘贴组件CSS代码]

团队规范：
- BEM命名规范
- 选择器特异性不超过100
- 必须支持暗色模式
- 可访问性AA级标准

请检查是否符合规范。
```

**获得结果**: 规范合规性检查和改进建议

## 💡 最佳实践建议

1. **定期检查**: 在开发过程中定期使用CSS MCP检查
2. **分类分析**: 根据需求选择特定类型的分析
3. **问题追踪**: 记录分析结果，跟踪修复进度
4. **团队协作**: 将分析报告分享给团队成员
5. **持续改进**: 根据分析结果优化开发流程

**🚀 现在您可以在任何项目中享受YC-CSS MCP的专业CSS分析服务了！**
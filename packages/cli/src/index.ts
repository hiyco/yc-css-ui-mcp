#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
// @ts-ignore - 使用构建后的产物
const { analyzeCSS } = require('@yc-css-ui/core');

const program = new Command();

program
  .name('css-mcp')
  .description('CSS MCP - 智能CSS分析和调试工具')
  .version('0.1.0');

program
  .command('analyze')
  .description('分析CSS文件')
  .argument('<file>', 'CSS文件路径')
  .option('-o, --output <file>', '输出报告到文件')
  .option('-f, --format <format>', '输出格式 (json|markdown)', 'markdown')
  .option('--no-layout', '禁用布局分析')
  .option('--no-performance', '禁用性能分析')
  .option('--no-accessibility', '禁用可访问性分析')
  .option('--no-compatibility', '禁用兼容性分析')
  .option('--no-maintainability', '禁用维护性分析')
  .action(async (file: string, options: any) => {
    try {
      console.log('🔍 分析CSS文件:', file);
      
      const filePath = resolve(file);
      const cssCode = readFileSync(filePath, 'utf-8');
      
      const analysisOptions = {
        checks: {
          layout: options.layout,
          performance: options.performance,
          accessibility: options.accessibility,
          compatibility: options.compatibility,
          maintainability: options.maintainability,
        }
      };
      
      console.log('⚙️ 分析选项:', analysisOptions);
      
      const result = await analyzeCSS(cssCode, analysisOptions);
      
      let output: string;
      
      if (options.format === 'json') {
        output = JSON.stringify(result, null, 2);
      } else {
        output = formatAsMarkdown(result, file);
      }
      
      if (options.output) {
        writeFileSync(options.output, output);
        console.log('✅ 分析报告已保存到:', options.output);
      } else {
        console.log('\n' + output);
      }
      
      // 输出简要统计
      console.log('\n📊 分析完成统计:');
      console.log(`  总问题数: ${result.summary.totalIssues}`);
      console.log(`  错误: ${result.summary.errorCount}`);
      console.log(`  警告: ${result.summary.warningCount}`);
      console.log(`  信息: ${result.summary.infoCount}`);
      console.log(`  提示: ${result.summary.hintCount}`);
      
      // 非零退出码表示发现问题
      if (result.summary.errorCount > 0) {
        process.exit(2); // 有错误
      } else if (result.summary.warningCount > 0) {
        process.exit(1); // 有警告
      }
      
    } catch (error) {
      console.error('❌ 分析失败:', error instanceof Error ? error.message : String(error));
      process.exit(3);
    }
  });

program
  .command('server')
  .description('启动MCP服务器')
  .option('-p, --port <port>', '服务器端口', '3000')
  .action(async (options: any) => {
    console.log('🚀 启动CSS MCP服务器...');
    console.log('💡 提示：使用Ctrl+C停止服务器');
    
    // 动态导入服务器
    try {
      const { YCCSSUIMCPServer } = await import('@yc-css-ui/server');
      const server = new YCCSSUIMCPServer();
      await server.start();
    } catch (error) {
      console.error('❌ 服务器启动失败:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

function formatAsMarkdown(result: any, filename: string): string {
  let output = `# CSS分析报告\n\n`;
  output += `**文件**: ${filename}\n`;
  output += `**分析时间**: ${new Date().toLocaleString()}\n\n`;
  
  // 汇总统计
  output += `## 📊 分析统计\n\n`;
  output += `- **总问题数**: ${result.summary.totalIssues}\n`;
  output += `- **错误**: ${result.summary.errorCount}\n`;
  output += `- **警告**: ${result.summary.warningCount}\n`;
  output += `- **信息**: ${result.summary.infoCount}\n`;
  output += `- **提示**: ${result.summary.hintCount}\n\n`;
  
  // 文件度量
  output += `## 📈 文件度量\n\n`;
  output += `- **文件大小**: ${(result.metrics.fileSize / 1024).toFixed(2)}KB\n`;
  output += `- **选择器数量**: ${result.metrics.selectorsCount}\n`;
  output += `- **属性数量**: ${result.metrics.propertiesCount}\n`;
  output += `- **最大特异性**: ${result.metrics.maxSpecificity}\n`;
  output += `- **平均特异性**: ${result.metrics.avgSpecificity}\n\n`;
  
  // 问题列表
  if (result.issues.length > 0) {
    output += `## 🚨 发现的问题\n\n`;
    
    result.issues.forEach((issue: any, index: number) => {
      const severityEmojis: Record<string, string> = {
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',
        hint: '💡'
      };
      const severityEmoji = severityEmojis[issue.severity as string] || '•';
      
      output += `### ${index + 1}. ${severityEmoji} ${issue.type}\n\n`;
      output += `**消息**: ${issue.message}\n\n`;
      
      if (issue.description) {
        output += `**描述**: ${issue.description}\n\n`;
      }
      
      if (issue.location.selector) {
        output += `**选择器**: \`${issue.location.selector}\`\n\n`;
      }
      
      if (issue.location.line) {
        output += `**位置**: 第${issue.location.line}行\n\n`;
      }
      
      if (issue.fix) {
        output += `**🔧 修复建议**: ${issue.fix.description}\n\n`;
        if (issue.fix.code) {
          output += `\`\`\`css\n${issue.fix.code}\n\`\`\`\n\n`;
        }
        output += `**置信度**: ${issue.fix.confidence}%\n\n`;
      }
      
      output += `---\n\n`;
    });
  }
  
  // 优化建议
  if (result.suggestions.optimizations.length > 0 || 
      result.suggestions.refactoring.length > 0 || 
      result.suggestions.modernization.length > 0) {
    
    output += `## 💡 改进建议\n\n`;
    
    if (result.suggestions.optimizations.length > 0) {
      output += `### 性能优化\n\n`;
      result.suggestions.optimizations.forEach((suggestion: string, index: number) => {
        output += `${index + 1}. ${suggestion}\n`;
      });
      output += `\n`;
    }
    
    if (result.suggestions.refactoring.length > 0) {
      output += `### 代码重构\n\n`;
      result.suggestions.refactoring.forEach((suggestion: string, index: number) => {
        output += `${index + 1}. ${suggestion}\n`;
      });
      output += `\n`;
    }
    
    if (result.suggestions.modernization.length > 0) {
      output += `### 现代化建议\n\n`;
      result.suggestions.modernization.forEach((suggestion: string, index: number) => {
        output += `${index + 1}. ${suggestion}\n`;
      });
      output += `\n`;
    }
  }
  
  output += `---\n\n*报告由 CSS MCP 生成*`;
  
  return output;
}

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('❌ 未处理的异常:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未处理的Promise拒绝:', reason);
  process.exit(1);
});

program.parse();
import { Tool, CallToolRequest, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
// @ts-ignore - 使用构建后的产物
const { CSSAnalyzer } = require('@yc-css-ui/core');
import type { CSSAnalysisOptions, CSSAnalysisResult } from '@yc-css-ui/core';

/**
 * CSS分析工具 - MCP工具实现
 */
export class CSSAnalyzerTool implements Tool {
  name = 'analyze_css';
  description = '分析CSS代码，检测布局、性能、兼容性等问题';
  
  inputSchema = {
    type: 'object' as const,
    properties: {
      css_code: {
        type: 'string',
        description: '要分析的CSS代码'
      },
      filename: {
        type: 'string',
        description: 'CSS文件名（可选）'
      },
      options: {
        type: 'object',
        description: '分析选项',
        properties: {
          checks: {
            type: 'object',
            properties: {
              layout: { type: 'boolean', description: '启用布局问题检测' },
              performance: { type: 'boolean', description: '启用性能问题检测' },
              compatibility: { type: 'boolean', description: '启用兼容性检测' },
              accessibility: { type: 'boolean', description: '启用可访问性检测' },
              maintainability: { type: 'boolean', description: '启用可维护性检测' }
            }
          },
          thresholds: {
            type: 'object',
            properties: {
              maxFileSize: { type: 'number', description: '最大文件大小（字节）' },
              maxSelectors: { type: 'number', description: '最大选择器数量' },
              maxNesting: { type: 'number', description: '最大嵌套深度' }
            }
          },
          browsers: {
            type: 'array',
            items: { type: 'string' },
            description: '目标浏览器列表'
          }
        }
      }
    },
    required: ['css_code'] as string[]
  };

  private analyzer: CSSAnalyzer;

  constructor() {
    this.analyzer = new CSSAnalyzer();
  }

  async call(request: CallToolRequest): Promise<CallToolResult> {
    try {
      const args = request.params?.arguments as any;
      const { css_code, filename, options } = {
        css_code: args?.css_code as string,
        filename: args?.filename as string,
        options: args?.options as CSSAnalysisOptions
      };

      if (!css_code || typeof css_code !== 'string') {
        return {
          content: [
            {
              type: 'text',
              text: 'Error: css_code parameter is required and must be a string'
            }
          ]
        };
      }

      // 创建带有选项的分析器
      const analyzer = options ? new CSSAnalyzer(options) : this.analyzer;
      
      // 执行CSS分析
      const result: CSSAnalysisResult = await analyzer.analyze(css_code, filename);

      // 格式化结果为可读的文本输出
      const output = this.formatAnalysisResult(result, filename);

      return {
        content: [
          {
            type: 'text',
            text: output
          }
        ]
      };

    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `CSS Analysis Error: ${error instanceof Error ? error.message : String(error)}`
          }
        ],
        isError: true
      };
    }
  }

  private formatAnalysisResult(result: CSSAnalysisResult, filename?: string): string {
    const { summary, issues, metrics, suggestions } = result;
    
    let output = '';
    
    // 文件头信息
    if (filename) {
      output += `📄 **CSS Analysis Report: ${filename}**\n\n`;
    } else {
      output += `📄 **CSS Analysis Report**\n\n`;
    }

    // 汇总统计
    output += `## 📊 Summary\n`;
    output += `- **Total Issues**: ${summary.totalIssues}\n`;
    output += `- **Errors**: ${summary.errorCount} 🔴\n`;
    output += `- **Warnings**: ${summary.warningCount} 🟡\n`;
    output += `- **Info**: ${summary.infoCount} 🔵\n`;
    output += `- **Hints**: ${summary.hintCount} 💡\n\n`;

    // 文件度量
    output += `## 📐 Metrics\n`;
    output += `- **File Size**: ${Math.round(metrics.fileSize / 1024 * 100) / 100} KB\n`;
    output += `- **Selectors**: ${metrics.selectorsCount}\n`;
    output += `- **Properties**: ${metrics.propertiesCount}\n`;
    output += `- **Max Specificity**: ${metrics.maxSpecificity}\n`;
    output += `- **Avg Specificity**: ${metrics.avgSpecificity}\n\n`;

    // 问题列表
    if (issues.length > 0) {
      output += `## 🔍 Issues Found\n\n`;
      
      // 按严重级别分组
      const errorIssues = issues.filter((i: any) => i.severity === 'error');
      const warningIssues = issues.filter((i: any) => i.severity === 'warning');
      const infoIssues = issues.filter((i: any) => i.severity === 'info');
      const hintIssues = issues.filter((i: any) => i.severity === 'hint');

      // 错误
      if (errorIssues.length > 0) {
        output += `### 🔴 Errors (${errorIssues.length})\n\n`;
        errorIssues.forEach((issue: any, index: number) => {
          output += this.formatIssue(issue, index + 1);
        });
      }

      // 警告
      if (warningIssues.length > 0) {
        output += `### 🟡 Warnings (${warningIssues.length})\n\n`;
        warningIssues.forEach((issue: any, index: number) => {
          output += this.formatIssue(issue, index + 1);
        });
      }

      // 信息
      if (infoIssues.length > 0) {
        output += `### 🔵 Info (${infoIssues.length})\n\n`;
        infoIssues.forEach((issue: any, index: number) => {
          output += this.formatIssue(issue, index + 1);
        });
      }

      // 提示
      if (hintIssues.length > 0) {
        output += `### 💡 Hints (${hintIssues.length})\n\n`;
        hintIssues.forEach((issue: any, index: number) => {
          output += this.formatIssue(issue, index + 1);
        });
      }
    } else {
      output += `## ✅ No Issues Found\n\nYour CSS code looks good! No problems detected.\n\n`;
    }

    // 优化建议
    if (suggestions.optimizations.length > 0 || 
        suggestions.refactoring.length > 0 || 
        suggestions.modernization.length > 0) {
      
      output += `## 💡 Suggestions\n\n`;

      if (suggestions.optimizations.length > 0) {
        output += `### ⚡ Performance Optimizations\n`;
        suggestions.optimizations.forEach((suggestion: any) => {
          output += `- ${suggestion}\n`;
        });
        output += '\n';
      }

      if (suggestions.refactoring.length > 0) {
        output += `### 🔧 Code Refactoring\n`;
        suggestions.refactoring.forEach((suggestion: any) => {
          output += `- ${suggestion}\n`;
        });
        output += '\n';
      }

      if (suggestions.modernization.length > 0) {
        output += `### 🚀 Modernization\n`;
        suggestions.modernization.forEach((suggestion: any) => {
          output += `- ${suggestion}\n`;
        });
        output += '\n';
      }
    }

    output += `---\n*Analysis completed with CSS-MCP v0.1.0*`;
    
    return output;
  }

  private formatIssue(issue: any, index: number): string {
    let output = `**${index}. ${issue.message}**\n`;
    
    if (issue.description) {
      output += `   ${issue.description}\n`;
    }

    // 位置信息
    if (issue.location) {
      const location = [];
      if (issue.location.selector) location.push(`Selector: \`${issue.location.selector}\``);
      if (issue.location.property) location.push(`Property: \`${issue.location.property}\``);
      if (issue.location.line) location.push(`Line: ${issue.location.line}`);
      
      if (location.length > 0) {
        output += `   📍 ${location.join(', ')}\n`;
      }
    }

    // 修复建议
    if (issue.fix) {
      output += `   🔧 **Fix**: ${issue.fix.description}\n`;
      if (issue.fix.code && issue.fix.code.trim() !== '') {
        output += `   \`\`\`css\n${issue.fix.code.split('\n').map((line: string) => `   ${line}`).join('\n')}\n   \`\`\`\n`;
      }
      if (issue.fix.confidence) {
        output += `   📊 Confidence: ${issue.fix.confidence}%\n`;
      }
    }

    // 相关资源
    if (issue.resources?.documentation) {
      output += `   📚 Documentation: ${issue.resources.documentation.join(', ')}\n`;
    }

    output += '\n';
    return output;
  }
}
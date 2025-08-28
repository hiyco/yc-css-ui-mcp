import { Tool, CallToolRequest, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
// @ts-ignore - 使用构建后的产物
const { CSSAnalyzer } = require('@yc-css-ui/core');
import type { CSSAnalysisOptions, CSSIssue } from '@yc-css-ui/core';

/**
 * CSS自动修复工具 - 生成修复建议和代码
 */
export class CSSFixTool implements Tool {
  name = 'fix_css_issues';
  description = '自动修复CSS问题，生成修复后的代码';
  
  inputSchema = {
    type: 'object' as const,
    properties: {
      css_code: {
        type: 'string',
        description: '要修复的CSS代码'
      },
      issue_types: {
        type: 'array',
        items: { type: 'string' },
        description: '要修复的问题类型（可选，不指定则修复所有可自动修复的问题）'
      },
      confidence_threshold: {
        type: 'number',
        minimum: 0,
        maximum: 100,
        description: '修复置信度阈值（默认70%）'
      },
      preserve_formatting: {
        type: 'boolean',
        description: '是否保持原有格式（默认true）'
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
      const { 
        css_code, 
        issue_types, 
        confidence_threshold = 70,
        preserve_formatting = true 
      } = {
        css_code: args?.css_code as string,
        issue_types: args?.issue_types as string[],
        confidence_threshold: args?.confidence_threshold as number || 70,
        preserve_formatting: args?.preserve_formatting as boolean ?? true
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

      // 先分析CSS找出问题
      const analysis = await this.analyzer.analyze(css_code);
      
      // 过滤需要修复的问题
      const issuesNeedFix = analysis.issues.filter((issue: any) => {
        // 检查是否有修复建议
        if (!issue.fix || !issue.fix.confidence) return false;
        
        // 检查置信度是否满足阈值
        if (issue.fix.confidence < confidence_threshold) return false;
        
        // 如果指定了问题类型，检查是否匹配
        if (issue_types && issue_types.length > 0) {
          return issue_types.includes(issue.type);
        }
        
        return true;
      });

      if (issuesNeedFix.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `No fixable issues found with confidence >= ${confidence_threshold}%`
            }
          ]
        };
      }

      // 应用修复
      const fixResult = await this.applyFixes(css_code, issuesNeedFix, preserve_formatting);

      return {
        content: [
          {
            type: 'text',
            text: this.formatFixResult(fixResult, issuesNeedFix)
          }
        ]
      };

    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `CSS Fix Error: ${error instanceof Error ? error.message : String(error)}`
          }
        ],
        isError: true
      };
    }
  }

  private async applyFixes(
    originalCSS: string, 
    issues: CSSIssue[], 
    preserveFormatting: boolean
  ): Promise<CSSFixResult> {
    let fixedCSS = originalCSS;
    const appliedFixes: AppliedFix[] = [];
    const skippedFixes: SkippedFix[] = [];

    for (const issue of issues) {
      try {
        const fixResult = this.applySingleFix(fixedCSS, issue, preserveFormatting);
        
        if (fixResult.success) {
          fixedCSS = fixResult.code;
          appliedFixes.push({
            issueId: issue.id,
            issueType: issue.type,
            description: issue.fix!.description,
            confidence: issue.fix!.confidence,
            originalCode: this.extractRelevantCode(originalCSS, issue),
            fixedCode: this.extractRelevantCode(fixResult.code, issue)
          });
        } else {
          skippedFixes.push({
            issueId: issue.id,
            issueType: issue.type,
            reason: fixResult.error || 'Failed to apply fix'
          });
        }
      } catch (error) {
        skippedFixes.push({
          issueId: issue.id,
          issueType: issue.type,
          reason: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return {
      originalCSS,
      fixedCSS,
      appliedFixes,
      skippedFixes,
      totalIssues: issues.length,
      fixedIssues: appliedFixes.length,
      skippedIssues: skippedFixes.length
    };
  }

  private applySingleFix(css: string, issue: CSSIssue, preserveFormatting: boolean): FixAttemptResult {
    try {
      // 根据问题类型应用相应的修复策略
      switch (issue.type) {
        case 'flexbox-alignment-failed':
          return this.fixFlexboxIssue(css, issue);
          
        case 'grid-template-missing':
          return this.fixGridIssue(css, issue);
          
        case 'specificity-conflict':
          return this.fixSpecificityIssue(css, issue);
          
        case 'positioning-z-index':
          return this.fixPositioningIssue(css, issue);
          
        case 'accessibility-contrast':
          return this.fixAccessibilityIssue(css, issue);
          
        case 'compatibility-unsupported':
          return this.fixCompatibilityIssue(css, issue);
          
        default:
          return this.applyGenericFix(css, issue);
      }
    } catch (error) {
      return {
        success: false,
        code: css,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private fixFlexboxIssue(css: string, issue: CSSIssue): FixAttemptResult {
    const selector = issue.location?.selector;
    if (!selector) {
      return { success: false, code: css, error: 'No selector found for flexbox issue' };
    }

    // 为flex容器添加明确高度
    if (issue.message.includes('高度')) {
      const selectorRegex = new RegExp(`(${this.escapeRegExp(selector)}\\s*{[^}]*)(})`);
      const replacement = css.replace(selectorRegex, (match, p1, p2) => {
        if (p1.includes('min-height') || p1.includes('height')) {
          return match; // 已经有高度定义
        }
        return `${p1.trim()}\n  min-height: 100vh;${p2}`;
      });
      
      if (replacement !== css) {
        return { success: true, code: replacement };
      }
    }

    // 添加flex-wrap以支持align-content
    if (issue.message.includes('单行flex容器')) {
      const selectorRegex = new RegExp(`(${this.escapeRegExp(selector)}\\s*{[^}]*)(})`);
      const replacement = css.replace(selectorRegex, (match, p1, p2) => {
        return `${p1.trim()}\n  flex-wrap: wrap;${p2}`;
      });
      
      if (replacement !== css) {
        return { success: true, code: replacement };
      }
    }

    return this.applyGenericFix(css, issue);
  }

  private fixGridIssue(css: string, issue: CSSIssue): FixAttemptResult {
    const selector = issue.location?.selector;
    if (!selector) {
      return { success: false, code: css, error: 'No selector found for grid issue' };
    }

    // 添加缺失的grid模板
    if (issue.message.includes('缺少template')) {
      const selectorRegex = new RegExp(`(${this.escapeRegExp(selector)}\\s*{[^}]*)(})`);
      const replacement = css.replace(selectorRegex, (match, p1, p2) => {
        return `${p1.trim()}\n  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));${p2}`;
      });
      
      if (replacement !== css) {
        return { success: true, code: replacement };
      }
    }

    // 替换废弃的grid-gap
    if (issue.message.includes('grid-gap')) {
      const replacement = css.replace(/grid-gap:/g, 'gap:');
      if (replacement !== css) {
        return { success: true, code: replacement };
      }
    }

    return this.applyGenericFix(css, issue);
  }

  private fixSpecificityIssue(css: string, issue: CSSIssue): FixAttemptResult {
    // 对于特异性问题，通常需要手动重构，这里提供一些基础修复
    if (issue.fix?.code && issue.fix.code.includes('建议简化为')) {
      // 这种情况需要用户手动处理
      return { success: false, code: css, error: 'Specificity issues require manual refactoring' };
    }

    return this.applyGenericFix(css, issue);
  }

  private fixPositioningIssue(css: string, issue: CSSIssue): FixAttemptResult {
    const selector = issue.location?.selector;
    if (!selector) {
      return { success: false, code: css, error: 'No selector found for positioning issue' };
    }

    // 添加position属性
    if (issue.message.includes('需要设置position值')) {
      const selectorRegex = new RegExp(`(${this.escapeRegExp(selector)}\\s*{[^}]*)(})`);
      const replacement = css.replace(selectorRegex, (match, p1, p2) => {
        if (p1.includes('position:')) {
          return match; // 已经有position定义
        }
        return `${p1.trim()}\n  position: relative;${p2}`;
      });
      
      if (replacement !== css) {
        return { success: true, code: replacement };
      }
    }

    return this.applyGenericFix(css, issue);
  }

  private fixAccessibilityIssue(css: string, issue: CSSIssue): FixAttemptResult {
    const selector = issue.location?.selector;
    const property = issue.location?.property;
    
    if (!selector || !property) {
      return { success: false, code: css, error: 'Insufficient location info for accessibility issue' };
    }

    // 修复移除的outline
    if (property === 'outline' && issue.message.includes('focus outline')) {
      const propertyRegex = new RegExp(`(${this.escapeRegExp(selector)}\\s*{[^}]*)outline\\s*:\\s*none\\s*;?([^}]*})`);
      const replacement = css.replace(propertyRegex, (match, p1, p2) => {
        return `${p1}outline: 2px solid #005fcc;\n  outline-offset: 2px;${p2}`;
      });
      
      if (replacement !== css) {
        return { success: true, code: replacement };
      }
    }

    return this.applyGenericFix(css, issue);
  }

  private fixCompatibilityIssue(css: string, issue: CSSIssue): FixAttemptResult {
    // 兼容性问题通常需要添加回退方案，这里做基础处理
    if (issue.fix?.code && !issue.fix.code.includes('建议')) {
      // 如果有具体的修复代码，尝试应用
      return this.applyGenericFix(css, issue);
    }

    return { success: false, code: css, error: 'Compatibility issues require manual fallback implementation' };
  }

  private applyGenericFix(css: string, issue: CSSIssue): FixAttemptResult {
    if (!issue.fix?.code || issue.fix.code.includes('建议') || issue.fix.code.includes('/*')) {
      return { success: false, code: css, error: 'No actionable fix code available' };
    }

    // 尝试简单的字符串替换（这是非常基础的实现）
    const fixedCSS = css + '\n\n/* Auto-generated fix */\n' + issue.fix.code;
    
    return { success: true, code: fixedCSS };
  }

  private extractRelevantCode(css: string, issue: CSSIssue): string {
    const selector = issue.location?.selector;
    if (!selector) return '';

    const selectorRegex = new RegExp(`${this.escapeRegExp(selector)}\\s*{[^}]*}`, 'g');
    const match = css.match(selectorRegex);
    
    return match ? match[0] : '';
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private formatFixResult(result: CSSFixResult, issues: CSSIssue[]): string {
    let output = `# 🔧 CSS Auto-Fix Report\n\n`;

    output += `## 📊 Summary\n`;
    output += `- **Total Issues Analyzed**: ${result.totalIssues}\n`;
    output += `- **Successfully Fixed**: ${result.fixedIssues} ✅\n`;
    output += `- **Skipped**: ${result.skippedIssues} ⏭️\n\n`;

    if (result.appliedFixes.length > 0) {
      output += `## ✅ Applied Fixes\n\n`;
      result.appliedFixes.forEach((fix, index) => {
        output += `### ${index + 1}. ${fix.description}\n`;
        output += `**Issue Type**: ${fix.issueType}\n`;
        output += `**Confidence**: ${fix.confidence}%\n\n`;
        
        if (fix.originalCode) {
          output += `**Before**:\n\`\`\`css\n${fix.originalCode}\n\`\`\`\n\n`;
        }
        
        if (fix.fixedCode) {
          output += `**After**:\n\`\`\`css\n${fix.fixedCode}\n\`\`\`\n\n`;
        }
      });
    }

    if (result.skippedFixes.length > 0) {
      output += `## ⏭️ Skipped Fixes\n\n`;
      result.skippedFixes.forEach((skip, index) => {
        output += `${index + 1}. **${skip.issueType}**: ${skip.reason}\n`;
      });
      output += '\n';
    }

    output += `## 📄 Complete Fixed CSS\n\n`;
    output += `\`\`\`css\n${result.fixedCSS}\n\`\`\`\n\n`;

    output += `---\n*Auto-fix completed with CSS-MCP v0.1.0*`;

    return output;
  }
}

// 类型定义
interface CSSFixResult {
  originalCSS: string;
  fixedCSS: string;
  appliedFixes: AppliedFix[];
  skippedFixes: SkippedFix[];
  totalIssues: number;
  fixedIssues: number;
  skippedIssues: number;
}

interface AppliedFix {
  issueId: string;
  issueType: string;
  description: string;
  confidence: number;
  originalCode?: string;
  fixedCode?: string;
}

interface SkippedFix {
  issueId: string;
  issueType: string;
  reason: string;
}

interface FixAttemptResult {
  success: boolean;
  code: string;
  error?: string;
}
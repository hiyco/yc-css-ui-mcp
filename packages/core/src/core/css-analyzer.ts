// 使用Node.js全局Buffer
import { CSSAnalysisOptions, CSSAnalysisResult, CSSIssue } from '../types/index.js';
import { CSSParser } from '../parser/css-parser.js';
import { LayoutAnalyzer } from '../analyzers/layout-analyzer.js';
import { SpecificityAnalyzer } from '../analyzers/specificity-analyzer.js';

/**
 * CSS分析器主类 - 协调各个分析模块
 */
export class CSSAnalyzer {
  private parser: CSSParser;
  private layoutAnalyzer: LayoutAnalyzer;
  private specificityAnalyzer: SpecificityAnalyzer;
  private options: CSSAnalysisOptions;

  constructor(options: CSSAnalysisOptions = {}) {
    this.options = {
      checks: {
        layout: true,
        performance: true,
        compatibility: true,
        accessibility: true,
        maintainability: true,
        ...options.checks
      },
      thresholds: {
        maxFileSize: 500000, // 500KB
        maxSelectors: 4000,
        maxNesting: 5,
        ...options.thresholds
      },
      ...options
    };

    this.parser = new CSSParser(this.options);
    this.layoutAnalyzer = new LayoutAnalyzer(this.options);
    this.specificityAnalyzer = new SpecificityAnalyzer(this.options);
  }

  /**
   * 分析CSS代码，返回完整的分析结果
   */
  async analyze(cssCode: string, filename?: string): Promise<CSSAnalysisResult> {
    if (!cssCode || cssCode.trim() === '') {
      throw new Error('CSS code is empty');
    }

    // 验证语法
    const syntaxValidation = this.parser.validateSyntax(cssCode);
    if (!syntaxValidation.isValid) {
      return {
        summary: {
          totalIssues: syntaxValidation.errors.length,
          errorCount: syntaxValidation.errors.length,
          warningCount: 0,
          infoCount: 0,
          hintCount: 0
        },
        issues: syntaxValidation.errors.map(error => ({
          id: `syntax-error-${Date.now()}`,
          type: 'layout-overflow' as const,
          severity: 'error' as const,
          message: error.message,
          location: {
            file: filename,
            line: error.line,
            column: error.column
          }
        })),
        metrics: this.calculateMetrics(cssCode),
        suggestions: {
          optimizations: [],
          refactoring: [],
          modernization: []
        }
      };
    }

    // 执行各种分析
    const issues: CSSIssue[] = [];

    try {
      // 布局分析
      if (this.options.checks?.layout) {
        const layoutIssues = await this.layoutAnalyzer.analyzeLayout(cssCode);
        issues.push(...layoutIssues);
      }

      // 特异性分析
      if (this.options.checks?.maintainability) {
        const specificityIssues = await this.specificityAnalyzer.analyzeSpecificity(cssCode);
        issues.push(...specificityIssues);
      }

      // 性能分析
      if (this.options.checks?.performance) {
        const performanceIssues = await this.analyzePerformance(cssCode);
        issues.push(...performanceIssues);
      }

      // 可访问性分析
      if (this.options.checks?.accessibility) {
        const accessibilityIssues = await this.analyzeAccessibility(cssCode);
        issues.push(...accessibilityIssues);
      }

      // 兼容性分析
      if (this.options.checks?.compatibility) {
        const compatibilityIssues = await this.analyzeCompatibility(cssCode);
        issues.push(...compatibilityIssues);
      }

    } catch (error) {
      console.error('Analysis error:', error);
      issues.push({
        id: `analysis-error-${Date.now()}`,
        type: 'layout-overflow',
        severity: 'error',
        message: `Analysis failed: ${error instanceof Error ? error.message : String(error)}`,
        location: { file: filename }
      });
    }

    // 计算统计信息
    const summary = this.calculateSummary(issues);
    const metrics = this.calculateMetrics(cssCode);
    const suggestions = await this.generateSuggestions(issues, metrics);

    return {
      summary,
      issues,
      metrics,
      suggestions
    };
  }

  /**
   * 性能分析
   */
  private async analyzePerformance(cssCode: string): Promise<CSSIssue[]> {
    const issues: CSSIssue[] = [];
    const ast = this.parser.parseWithCSSTree(cssCode);
    const rules = this.parser.extractRules(ast);

    // 检查文件大小
    const fileSize = new TextEncoder().encode(cssCode).length;
    if (fileSize > (this.options.thresholds?.maxFileSize || 500000)) {
      issues.push({
        id: `large-file-${Date.now()}`,
        type: 'performance-unused-css',
        severity: 'warning',
        message: `CSS文件过大 (${Math.round(fileSize / 1024)}KB)`,
        description: '大型CSS文件会影响页面加载性能',
        location: {},
        fix: {
          description: '考虑拆分CSS文件或移除未使用的样式',
          code: '/* 建议使用CSS分割和按需加载 */',
          confidence: 70
        }
      });
    }

    // 检查选择器数量
    const selectorCount = rules.length;
    if (selectorCount > (this.options.thresholds?.maxSelectors || 4000)) {
      issues.push({
        id: `too-many-selectors-${Date.now()}`,
        type: 'performance-unused-css',
        severity: 'warning',
        message: `选择器数量过多 (${selectorCount})`,
        description: '过多的选择器可能影响CSS解析性能',
        location: {},
        fix: {
          description: '合并相似的选择器，移除未使用的规则',
          code: '/* 使用工具检测和移除未使用的CSS */',
          confidence: 65
        }
      });
    }

    // 检查深层嵌套
    for (const rule of rules) {
      const nestingLevel = this.calculateNestingLevel(rule.selector);
      if (nestingLevel > (this.options.thresholds?.maxNesting || 5)) {
        issues.push({
          id: `deep-nesting-${Date.now()}`,
          type: 'performance-unused-css',
          severity: 'warning',
          message: `选择器嵌套过深 (${nestingLevel}层)`,
          description: '深层嵌套会影响CSS匹配性能',
          location: {
            selector: rule.selector,
            line: rule.location?.line,
            column: rule.location?.column
          },
          fix: {
            description: '减少选择器嵌套深度',
            code: this.generateFlatterSelector(rule.selector),
            confidence: 75
          }
        });
      }
    }

    return issues;
  }

  /**
   * 可访问性分析
   */
  private async analyzeAccessibility(cssCode: string): Promise<CSSIssue[]> {
    const issues: CSSIssue[] = [];
    const ast = this.parser.parseWithCSSTree(cssCode);
    const rules = this.parser.extractRules(ast);

    for (const rule of rules) {
      for (const declaration of rule.declarations) {
        // 检查颜色对比度相关问题
        if (declaration.property === 'color' || declaration.property === 'background-color') {
          if (this.isLowContrastColor(declaration.value)) {
            issues.push({
              id: `low-contrast-${Date.now()}`,
              type: 'accessibility-contrast',
              severity: 'warning',
              message: '可能存在颜色对比度不足的问题',
              description: '确保文本与背景色有足够的对比度以提高可读性',
              location: {
                selector: rule.selector,
                property: declaration.property,
                line: declaration.location?.line,
                column: declaration.location?.column
              },
              fix: {
                description: '使用颜色对比度检查工具验证并调整颜色',
                code: '/* 建议对比度至少为4.5:1 (AA级) */',
                confidence: 60
              },
              resources: {
                documentation: [
                  'https://webaim.org/resources/contrastchecker/'
                ]
              }
            });
          }
        }

        // 检查字体大小
        if (declaration.property === 'font-size') {
          const fontSize = this.parseFontSize(declaration.value);
          if (fontSize && fontSize < 12) {
            issues.push({
              id: `small-font-${Date.now()}`,
              type: 'accessibility-contrast',
              severity: 'warning',
              message: `字体过小 (${declaration.value})`,
              description: '过小的字体可能影响可读性',
              location: {
                selector: rule.selector,
                property: declaration.property,
                line: declaration.location?.line,
                column: declaration.location?.column
              },
              fix: {
                description: '建议最小字体大小为14px或0.875rem',
                code: `${rule.selector} {\n  font-size: 14px; /* 或 0.875rem */\n}`,
                confidence: 80
              }
            });
          }
        }

        // 检查focus样式
        if (rule.selector.includes(':focus') && declaration.property === 'outline' && declaration.value === 'none') {
          issues.push({
            id: `focus-outline-removed-${Date.now()}`,
            type: 'accessibility-contrast',
            severity: 'error',
            message: '移除focus outline会影响键盘导航',
            description: '确保为焦点状态提供可见的视觉指示器',
            location: {
              selector: rule.selector,
              property: declaration.property,
              line: declaration.location?.line,
              column: declaration.location?.column
            },
            fix: {
              description: '提供替代的焦点指示器',
              code: `${rule.selector} {\n  outline: 2px solid #005fcc;\n  outline-offset: 2px;\n}`,
              confidence: 90
            }
          });
        }
      }
    }

    return issues;
  }

  /**
   * 兼容性分析
   */
  private async analyzeCompatibility(cssCode: string): Promise<CSSIssue[]> {
    const issues: CSSIssue[] = [];
    const ast = this.parser.parseWithCSSTree(cssCode);
    const rules = this.parser.extractRules(ast);

    // 现代CSS特性兼容性检查
    const modernFeatures = [
      { property: 'grid', minSupport: 'IE 10+' },
      { property: 'flex', minSupport: 'IE 11+' },
      { property: 'gap', minSupport: 'Chrome 84+' },
      { property: 'aspect-ratio', minSupport: 'Chrome 88+' },
      { property: 'clamp', minSupport: 'Chrome 79+' },
    ];

    for (const rule of rules) {
      for (const declaration of rule.declarations) {
        // 检查现代CSS特性
        for (const feature of modernFeatures) {
          if (declaration.property.includes(feature.property) || 
              (declaration.property === 'display' && declaration.value.includes(feature.property))) {
            
            if (this.shouldWarnAboutCompatibility(feature.property)) {
              issues.push({
                id: `compatibility-${feature.property}-${Date.now()}`,
                type: 'compatibility-unsupported',
                severity: 'info',
                message: `${feature.property}特性的浏览器兼容性`,
                description: `${feature.property}特性需要${feature.minSupport}或更高版本`,
                location: {
                  selector: rule.selector,
                  property: declaration.property,
                  line: declaration.location?.line,
                  column: declaration.location?.column
                },
                fix: {
                  description: '考虑添加回退方案或使用autoprefixer',
                  code: this.generateCompatibilityFallback(declaration.property, declaration.value),
                  confidence: 70
                }
              });
            }
          }
        }

        // 检查供应商前缀
        if (this.needsVendorPrefix(declaration.property, declaration.value)) {
          issues.push({
            id: `vendor-prefix-${Date.now()}`,
            type: 'compatibility-unsupported',
            severity: 'hint',
            message: '可能需要供应商前缀',
            description: '某些CSS特性在旧版浏览器中需要供应商前缀',
            location: {
              selector: rule.selector,
              property: declaration.property,
              line: declaration.location?.line,
              column: declaration.location?.column
            },
            fix: {
              description: '使用autoprefixer自动添加前缀',
              code: '/* 建议使用autoprefixer处理供应商前缀 */',
              confidence: 85
            }
          });
        }
      }
    }

    return issues;
  }

  /**
   * 计算汇总信息
   */
  private calculateSummary(issues: CSSIssue[]) {
    const summary = {
      totalIssues: issues.length,
      errorCount: 0,
      warningCount: 0,
      infoCount: 0,
      hintCount: 0
    };

    for (const issue of issues) {
      switch (issue.severity) {
        case 'error':
          summary.errorCount++;
          break;
        case 'warning':
          summary.warningCount++;
          break;
        case 'info':
          summary.infoCount++;
          break;
        case 'hint':
          summary.hintCount++;
          break;
      }
    }

    return summary;
  }

  /**
   * 计算CSS度量指标
   */
  private calculateMetrics(cssCode: string) {
    const ast = this.parser.parseWithCSSTree(cssCode);
    const rules = this.parser.extractRules(ast);
    
    let totalSpecificity = 0;
    let maxSpecificity = 0;
    let propertiesCount = 0;

    for (const rule of rules) {
      const specificity = this.parser.calculateSpecificity(rule.selector);
      totalSpecificity += specificity.score;
      maxSpecificity = Math.max(maxSpecificity, specificity.score);
      propertiesCount += rule.declarations.length;
    }

    return {
      fileSize: new TextEncoder().encode(cssCode).length,
      selectorsCount: rules.length,
      propertiesCount,
      maxSpecificity,
      avgSpecificity: rules.length > 0 ? Math.round(totalSpecificity / rules.length) : 0
    };
  }

  /**
   * 生成优化建议
   */
  private async generateSuggestions(issues: CSSIssue[], metrics: any) {
    const suggestions = {
      optimizations: [] as string[],
      refactoring: [] as string[],
      modernization: [] as string[]
    };

    // 基于问题生成建议
    if (issues.some(i => i.type === 'performance-unused-css')) {
      suggestions.optimizations.push('使用工具移除未使用的CSS规则');
      suggestions.optimizations.push('考虑CSS代码分割和按需加载');
    }

    if (issues.some(i => i.type === 'specificity-conflict')) {
      suggestions.refactoring.push('重构高特异性选择器');
      suggestions.refactoring.push('使用BEM等CSS方法论统一命名');
    }

    if (issues.some(i => i.type === 'compatibility-unsupported')) {
      suggestions.modernization.push('添加CSS特性的渐进增强方案');
      suggestions.modernization.push('使用PostCSS和autoprefixer处理兼容性');
    }

    // 基于度量指标生成建议
    if (metrics.avgSpecificity > 50) {
      suggestions.refactoring.push('降低选择器平均特异性');
    }

    if (metrics.fileSize > 100000) {
      suggestions.optimizations.push('考虑CSS压缩和优化');
    }

    return suggestions;
  }

  // 辅助方法
  private calculateNestingLevel(selector: string): number {
    return (selector.match(/\s+/g) || []).length + 1;
  }

  private generateFlatterSelector(selector: string): string {
    const parts = selector.split(/\s+/);
    if (parts.length > 3) {
      return `/* 建议简化为: */\n.${parts[parts.length - 1].replace(/[#.]/, '')} {\n  /* ... */\n}`;
    }
    return selector;
  }

  private isLowContrastColor(colorValue: string): boolean {
    // 简化的颜色对比度检查 - 实际实现需要更复杂的颜色计算
    const lightColors = ['white', '#fff', '#ffffff', 'rgb(255,255,255)', 'hsl(0,0%,100%)'];
    const darkColors = ['black', '#000', '#000000', 'rgb(0,0,0)', 'hsl(0,0%,0%)'];
    
    return lightColors.includes(colorValue.toLowerCase()) || 
           darkColors.includes(colorValue.toLowerCase());
  }

  private parseFontSize(fontSize: string): number | null {
    const match = fontSize.match(/(\d+(?:\.\d+)?)px/);
    return match ? parseFloat(match[1]) : null;
  }

  private shouldWarnAboutCompatibility(feature: string): boolean {
    // 基于配置的浏览器支持判断
    if (this.options.browsers) {
      // 这里应该使用caniuse数据库进行真实的兼容性检查
      return true;
    }
    return false;
  }

  private generateCompatibilityFallback(property: string, value: string): string {
    const fallbacks: Record<string, string> = {
      'display: grid': `/* 提供flexbox回退 */\ndisplay: flex;\nflex-wrap: wrap;\n/* 然后使用grid */\ndisplay: grid;`,
      'gap': `/* 使用margin作为回退 */\nmargin: -0.5rem;\n/* 然后使用gap */\ngap: 1rem;`
    };

    return fallbacks[`${property}: ${value}`] || `/* 为${property}添加适当的回退方案 */`;
  }

  private needsVendorPrefix(property: string, value: string): boolean {
    const prefixNeeded = [
      'appearance',
      'user-select',
      'backdrop-filter',
      'clip-path'
    ];

    return prefixNeeded.some(prop => property.includes(prop) || value.includes(prop));
  }
}
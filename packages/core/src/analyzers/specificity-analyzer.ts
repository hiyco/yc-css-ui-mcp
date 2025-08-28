import { CSSIssue, CSSAnalysisOptions } from '../types/index.js';
import { CSSRule, CSSParser, SpecificityScore } from '../parser/css-parser.js';
const specificity = require('specificity');

/**
 * 样式优先级分析器 - 检测选择器特异性冲突
 */
export class SpecificityAnalyzer {
  private parser: CSSParser;

  constructor(options: CSSAnalysisOptions = {}) {
    this.parser = new CSSParser(options);
  }

  /**
   * 分析样式优先级冲突
   */
  async analyzeSpecificity(cssCode: string): Promise<CSSIssue[]> {
    const ast = this.parser.parseWithCSSTree(cssCode);
    const rules = this.parser.extractRules(ast);
    const issues: CSSIssue[] = [];

    // 按属性分组规则
    const rulesByProperty = this.groupRulesByProperty(rules);

    for (const [property, propertyRules] of rulesByProperty) {
      issues.push(...this.detectSpecificityConflicts(property, propertyRules));
    }

    issues.push(...this.detectHighSpecificitySelectors(rules));
    issues.push(...this.detectUnusedHighSpecificity(rules));

    return issues;
  }

  /**
   * 检测特异性冲突
   */
  private detectSpecificityConflicts(
    property: string,
    rules: Array<{ rule: CSSRule; declIndex: number }>
  ): CSSIssue[] {
    const issues: CSSIssue[] = [];

    if (rules.length < 2) return issues;

    // 按特异性排序
    const sortedRules = rules.map(({ rule, declIndex }) => {
      const specificity = this.calculateSpecificity(rule.selector);
      return {
        rule,
        declIndex,
        specificity: specificity.score,
        specificityBreakdown: specificity.breakdown
      };
    }).sort((a, b) => b.specificity - a.specificity);

    // 检测潜在冲突
    for (let i = 0; i < sortedRules.length - 1; i++) {
      const current = sortedRules[i];
      const next = sortedRules[i + 1];

      // 如果后面的规则特异性明显更低，可能存在覆盖问题
      const specificityDiff = current.specificity - next.specificity;
      
      if (specificityDiff > 50) { // 阈值可调整
        issues.push({
          id: `specificity-conflict-${Date.now()}-${i}`,
          type: 'specificity-conflict',
          severity: 'warning',
          message: `选择器特异性差异过大，可能导致样式覆盖问题`,
          description: `${current.rule.selector} (${current.specificity}) 的特异性远高于 ${next.rule.selector} (${next.specificity})`,
          location: {
            selector: current.rule.selector,
            property: property,
            line: current.rule.location?.line,
            column: current.rule.location?.column,
          },
          fix: {
            description: '降低高特异性选择器的复杂度，或提高低特异性选择器的特异性',
            code: `/* 建议简化选择器 */\n.${this.simplifySelector(current.rule.selector)} {\n  ${property}: value;\n}`,
            confidence: 70
          },
          resources: {
            documentation: [
              'https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity'
            ]
          }
        });
      }

      // 检测相同特异性但可能有冲突的规则
      if (current.specificity === next.specificity) {
        const declaration1 = current.rule.declarations[current.declIndex];
        const declaration2 = next.rule.declarations[next.declIndex];

        if (declaration1.value !== declaration2.value) {
          issues.push({
            id: `same-specificity-conflict-${Date.now()}-${i}`,
            type: 'specificity-conflict',
            severity: 'info',
            message: `相同特异性的选择器可能产生意外的样式覆盖`,
            description: `${current.rule.selector} 和 ${next.rule.selector} 具有相同特异性 (${current.specificity})，样式覆盖取决于源码顺序`,
            location: {
              selector: current.rule.selector,
              property: property,
              line: current.rule.location?.line,
              column: current.rule.location?.column,
            },
            fix: {
              description: '调整选择器特异性或重新组织CSS规则顺序',
              code: `/* 确保期望的规则在后面，或提高其特异性 */`,
              confidence: 60
            }
          });
        }
      }
    }

    return issues;
  }

  /**
   * 检测过高特异性的选择器
   */
  private detectHighSpecificitySelectors(rules: CSSRule[]): CSSIssue[] {
    const issues: CSSIssue[] = [];
    const HIGH_SPECIFICITY_THRESHOLD = 300; // 可调整阈值

    for (const rule of rules) {
      const specificity = this.calculateSpecificity(rule.selector);

      if (specificity.score > HIGH_SPECIFICITY_THRESHOLD) {
        issues.push({
          id: `high-specificity-${Date.now()}`,
          type: 'specificity-conflict',
          severity: 'warning',
          message: `选择器特异性过高 (${specificity.score})`,
          description: '高特异性选择器难以维护和覆盖，建议简化',
          location: {
            selector: rule.selector,
            line: rule.location?.line,
            column: rule.location?.column,
          },
          fix: {
            description: '简化选择器，使用更少的ID和嵌套',
            code: this.generateSimplifiedSelector(rule.selector, specificity),
            confidence: 75
          }
        });
      }

      // 检测过多ID选择器
      if (specificity.breakdown.ids > 1) {
        issues.push({
          id: `multiple-ids-${Date.now()}`,
          type: 'specificity-conflict',
          severity: 'error',
          message: '选择器包含多个ID，这通常是错误的',
          description: '一个元素只能有一个ID，多个ID选择器通常表示逻辑错误',
          location: {
            selector: rule.selector,
            line: rule.location?.line,
            column: rule.location?.column,
          },
          fix: {
            description: '移除重复的ID选择器或改用class',
            code: rule.selector.replace(/#[\w-]+/g, (match, index) => index === 0 ? match : `.${match.substring(1)}`),
            confidence: 85
          }
        });
      }
    }

    return issues;
  }

  /**
   * 检测未使用的高特异性规则
   */
  private detectUnusedHighSpecificity(rules: CSSRule[]): CSSIssue[] {
    const issues: CSSIssue[] = [];

    // 检测可能的无用高特异性规则
    // 这里是简化实现，实际需要结合HTML分析
    for (const rule of rules) {
      const specificity = this.calculateSpecificity(rule.selector);
      
      // 检测过于具体但可能无用的选择器模式
      if (this.isProbablyUnused(rule.selector) && specificity.score > 100) {
        issues.push({
          id: `unused-high-specificity-${Date.now()}`,
          type: 'specificity-conflict',
          severity: 'hint',
          message: '可能存在未使用的高特异性选择器',
          description: '该选择器看起来过于具体，可能在当前代码中未被使用',
          location: {
            selector: rule.selector,
            line: rule.location?.line,
            column: rule.location?.column,
          },
          fix: {
            description: '检查该选择器是否仍然需要，或考虑简化',
            code: `/* 考虑移除或简化此规则 */\n/* ${rule.selector} { ... } */`,
            confidence: 50
          }
        });
      }
    }

    return issues;
  }

  /**
   * 按属性分组规则
   */
  private groupRulesByProperty(rules: CSSRule[]): Map<string, Array<{ rule: CSSRule; declIndex: number }>> {
    const grouped = new Map<string, Array<{ rule: CSSRule; declIndex: number }>>();

    for (const rule of rules) {
      for (let i = 0; i < rule.declarations.length; i++) {
        const declaration = rule.declarations[i];
        if (!grouped.has(declaration.property)) {
          grouped.set(declaration.property, []);
        }
        grouped.get(declaration.property)!.push({ rule, declIndex: i });
      }
    }

    return grouped;
  }

  /**
   * 计算选择器特异性
   */
  private calculateSpecificity(selector: string): SpecificityScore {
    try {
      // 使用specificity库进行精确计算
      const result = specificity.calculate(selector);
      
      if (result && typeof result === 'object') {
        // 新版本API: { A: 1, B: 1, C: 0 }
        const spec = result as { A: number; B: number; C: number };
        return {
          score: spec.A * 100 + spec.B * 10 + spec.C,
          breakdown: {
            ids: spec.A,
            classes: spec.B,
            pseudoClasses: 0,
            elements: spec.C
          }
        };
      }
    } catch (error) {
      console.warn(`Failed to calculate specificity for "${selector}":`, error);
    }

    // 降级到简单计算
    return this.parser.calculateSpecificity(selector);
  }

  /**
   * 简化选择器
   */
  private simplifySelector(selector: string): string {
    // 移除不必要的元素选择器
    return selector
      .replace(/\s*>\s*/g, ' > ')
      .replace(/(\w+)\.(\w+)/g, '.$2') // div.class -> .class
      .replace(/(\w+)#(\w+)/g, '#$2') // div#id -> #id
      .trim();
  }

  /**
   * 生成简化的选择器建议
   */
  private generateSimplifiedSelector(selector: string, specificity: SpecificityScore): string {
    let simplified = selector;

    // 如果有多个ID，保留第一个
    const idMatches = selector.match(/#[\w-]+/g);
    if (idMatches && idMatches.length > 1) {
      simplified = selector.replace(/#[\w-]+/g, (match, index) => index === 0 ? match : '');
    }

    // 移除不必要的元素选择器
    simplified = this.simplifySelector(simplified);

    return `/* 建议简化为: */\n${simplified} {\n  /* ... */\n}`;
  }

  /**
   * 判断选择器是否可能未使用
   */
  private isProbablyUnused(selector: string): boolean {
    // 简单的启发式判断
    // 检测可能无用的模式
    const suspiciousPatterns = [
      /body\s+\w+\s+\w+\s+\w+/, // 过深嵌套
      /#[\w-]+\s+#[\w-]+/, // 多个ID
      /\.[\w-]+\s+\.[\w-]+\s+\.[\w-]+\s+\.[\w-]+/, // 过多class嵌套
    ];

    return suspiciousPatterns.some(pattern => pattern.test(selector));
  }
}
import postcss from 'postcss';
import { parse as parseCSS, CssNode, Rule, Declaration } from 'css-tree';
import { CSSAnalysisOptions } from '../types/index.js';

/**
 * CSS解析器 - 将CSS代码解析为AST
 */
export class CSSParser {
  private options: CSSAnalysisOptions;

  constructor(options: CSSAnalysisOptions = {}) {
    this.options = options;
  }

  /**
   * 使用PostCSS解析CSS代码
   */
  async parseWithPostCSS(cssCode: string): Promise<postcss.Root> {
    try {
      return postcss.parse(cssCode);
    } catch (error) {
      throw new Error(`PostCSS parsing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 使用css-tree解析CSS代码
   */
  parseWithCSSTree(cssCode: string): CssNode {
    try {
      return parseCSS(cssCode, {
        positions: true,
        filename: this.options.scope?.includeSelectors?.[0] || 'input.css'
      });
    } catch (error) {
      throw new Error(`CSS-Tree parsing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 提取CSS规则信息
   */
  extractRules(ast: CssNode): CSSRule[] {
    const rules: CSSRule[] = [];

    function walkRules(node: CssNode): void {
      if (node.type === 'Rule') {
        const rule = node as Rule;
        const cssRule: CSSRule = {
          type: 'rule',
          selector: rule.prelude && 'children' in rule.prelude ? rule.prelude.children.toArray().map((n: any) => n.toString()).join('') : '',
          declarations: [],
          location: {
            line: rule.loc?.start.line,
            column: rule.loc?.start.column,
          }
        };

        // 提取声明
        if (rule.block && rule.block.children) {
          rule.block.children.forEach((decl: any) => {
            if (decl.type === 'Declaration') {
              const declaration = decl as Declaration;
              cssRule.declarations.push({
                property: declaration.property,
                value: declaration.value && 'children' in declaration.value ? declaration.value.children.toArray().map((v: any) => v.toString()).join('') : '',
                important: Boolean(declaration.important),
                location: {
                  line: declaration.loc?.start.line,
                  column: declaration.loc?.start.column,
                }
              });
            }
          });
        }

        rules.push(cssRule);
      }

      // 递归处理子节点
      if ('children' in node && node.children) {
        node.children.forEach(walkRules);
      }
    }

    walkRules(ast);
    return rules;
  }

  /**
   * 分析选择器特异性
   */
  calculateSpecificity(selector: string): SpecificityScore {
    // 简化的特异性计算
    // ID选择器: 100
    // 类选择器、属性选择器、伪类: 10  
    // 元素选择器、伪元素: 1

    const idCount = (selector.match(/#/g) || []).length;
    const classCount = (selector.match(/\./g) || []).length;
    const attrCount = (selector.match(/\[/g) || []).length;
    const pseudoClassCount = (selector.match(/:/g) || []).length;
    const elementCount = selector.split(/[\s>+~]/).filter(s => 
      s && !s.startsWith('#') && !s.startsWith('.') && !s.startsWith('[')
    ).length;

    const score = idCount * 100 + (classCount + attrCount + pseudoClassCount) * 10 + elementCount;

    return {
      score,
      breakdown: {
        ids: idCount,
        classes: classCount + attrCount,
        pseudoClasses: pseudoClassCount,
        elements: elementCount
      }
    };
  }

  /**
   * 验证CSS语法
   */
  validateSyntax(cssCode: string): ValidationResult {
    const errors: SyntaxError[] = [];

    try {
      this.parseWithPostCSS(cssCode);
      this.parseWithCSSTree(cssCode);
      
      return {
        isValid: true,
        errors: []
      };
    } catch (error) {
      errors.push({
        message: error instanceof Error ? error.message : String(error),
        line: 0,
        column: 0
      });

      return {
        isValid: false,
        errors
      };
    }
  }
}

// 类型定义
export interface CSSRule {
  type: 'rule' | 'at-rule';
  selector: string;
  declarations: CSSDeclaration[];
  location?: {
    line?: number;
    column?: number;
  };
}

export interface CSSDeclaration {
  property: string;
  value: string;
  important: boolean;
  location?: {
    line?: number;
    column?: number;
  };
}

export interface SpecificityScore {
  score: number;
  breakdown: {
    ids: number;
    classes: number;
    pseudoClasses: number;
    elements: number;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: SyntaxError[];
}

export interface SyntaxError {
  message: string;
  line: number;
  column: number;
}
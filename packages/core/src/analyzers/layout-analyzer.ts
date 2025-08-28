import { CSSIssue, FlexboxIssue, GridIssue, CSSAnalysisOptions } from '../types/index.js';
import { CSSRule, CSSDeclaration, CSSParser } from '../parser/css-parser.js';

/**
 * 布局分析器 - 检测Flexbox和Grid布局问题
 */
export class LayoutAnalyzer {
  private parser: CSSParser;

  constructor(options: CSSAnalysisOptions = {}) {
    this.parser = new CSSParser(options);
  }

  /**
   * 分析CSS布局问题
   */
  async analyzeLayout(cssCode: string): Promise<CSSIssue[]> {
    const ast = this.parser.parseWithCSSTree(cssCode);
    const rules = this.parser.extractRules(ast);
    const issues: CSSIssue[] = [];

    for (const rule of rules) {
      issues.push(...this.analyzeFlexboxIssues(rule));
      issues.push(...this.analyzeGridIssues(rule));
      issues.push(...this.analyzePositionIssues(rule));
    }

    return issues;
  }

  /**
   * 检测Flexbox布局问题
   */
  private analyzeFlexboxIssues(rule: CSSRule): FlexboxIssue[] {
    const issues: FlexboxIssue[] = [];
    const declarations = this.getDeclarationsMap(rule.declarations);

    // 检查是否是flex容器
    if (declarations['display'] === 'flex' || declarations['display'] === 'inline-flex') {
      
      // 问题1: align-items无效，因为容器没有明确高度
      if (declarations['align-items'] && !this.hasExplicitHeight(declarations)) {
        issues.push({
          id: `flexbox-height-${Date.now()}`,
          type: 'flexbox-alignment-failed',
          severity: 'warning',
          message: 'align-items可能无效：flex容器缺少明确高度',
          description: '当flex容器没有明确的高度时，align-items属性可能不会产生预期效果',
          location: {
            selector: rule.selector,
            property: 'align-items',
            line: rule.location?.line,
            column: rule.location?.column,
          },
          fix: {
            description: '为flex容器添加明确的高度',
            code: `${rule.selector} {\n  min-height: 100vh; /* 或其他合适的高度值 */\n}`,
            confidence: 85
          },
          flexboxContext: {
            containerProperties: declarations,
            itemProperties: {},
            alignment: 'cross'
          },
          resources: {
            documentation: [
              'https://developer.mozilla.org/en-US/docs/Web/CSS/align-items'
            ]
          }
        });
      }

      // 问题2: flex-wrap为nowrap时使用了align-content
      if (declarations['align-content'] && (!declarations['flex-wrap'] || declarations['flex-wrap'] === 'nowrap')) {
        issues.push({
          id: `flexbox-wrap-${Date.now()}`,
          type: 'flexbox-alignment-failed',
          severity: 'info',
          message: 'align-content在单行flex容器中无效',
          description: 'align-content只对多行flex容器有效，需要设置flex-wrap: wrap',
          location: {
            selector: rule.selector,
            property: 'align-content',
            line: rule.location?.line,
            column: rule.location?.column,
          },
          fix: {
            description: '添加flex-wrap: wrap以启用多行布局',
            code: `${rule.selector} {\n  flex-wrap: wrap;\n}`,
            confidence: 90
          },
          flexboxContext: {
            containerProperties: declarations,
            itemProperties: {},
            alignment: 'cross'
          }
        });
      }

      // 问题3: 检测flex子项的常见问题
      if (declarations['flex-grow'] && !declarations['flex-basis']) {
        issues.push({
          id: `flexbox-basis-${Date.now()}`,
          type: 'flexbox-alignment-failed',
          severity: 'hint',
          message: '建议明确指定flex-basis值',
          description: '使用flex-grow时最好明确指定flex-basis，避免布局不确定性',
          location: {
            selector: rule.selector,
            property: 'flex-grow',
            line: rule.location?.line,
            column: rule.location?.column,
          },
          fix: {
            description: '添加flex-basis属性',
            code: `${rule.selector} {\n  flex-basis: 0; /* 或auto */\n}`,
            confidence: 75
          },
          flexboxContext: {
            containerProperties: {},
            itemProperties: declarations,
            alignment: 'main'
          }
        });
      }
    }

    return issues;
  }

  /**
   * 检测Grid布局问题
   */
  private analyzeGridIssues(rule: CSSRule): GridIssue[] {
    const issues: GridIssue[] = [];
    const declarations = this.getDeclarationsMap(rule.declarations);

    // 检查是否是grid容器
    if (declarations['display'] === 'grid' || declarations['display'] === 'inline-grid') {
      
      // 问题1: 缺少grid-template定义
      if (!declarations['grid-template-columns'] && 
          !declarations['grid-template-rows'] && 
          !declarations['grid-template-areas']) {
        issues.push({
          id: `grid-template-${Date.now()}`,
          type: 'grid-template-missing',
          severity: 'error',
          message: 'Grid容器缺少template定义',
          description: 'Grid容器需要定义grid-template-columns、grid-template-rows或grid-template-areas之一',
          location: {
            selector: rule.selector,
            line: rule.location?.line,
            column: rule.location?.column,
          },
          fix: {
            description: '添加grid模板定义',
            code: `${rule.selector} {\n  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n}`,
            confidence: 80
          },
          gridContext: {
            containerProperties: declarations,
            itemProperties: {},
            missingTemplate: 'columns'
          },
          resources: {
            documentation: [
              'https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template'
            ]
          }
        });
      }

      // 问题2: grid-gap已废弃，建议使用gap
      if (declarations['grid-gap'] || declarations['grid-row-gap'] || declarations['grid-column-gap']) {
        issues.push({
          id: `grid-gap-deprecated-${Date.now()}`,
          type: 'grid-template-missing',
          severity: 'warning',
          message: 'grid-gap属性已废弃，建议使用gap',
          description: 'grid-gap系列属性已被标准化为gap、row-gap、column-gap',
          location: {
            selector: rule.selector,
            property: 'grid-gap',
            line: rule.location?.line,
            column: rule.location?.column,
          },
          fix: {
            description: '使用现代gap属性',
            code: `${rule.selector} {\n  gap: 1rem; /* 替代grid-gap */\n}`,
            confidence: 95
          },
          gridContext: {
            containerProperties: declarations,
            itemProperties: {},
            missingTemplate: 'areas'
          }
        });
      }
    }

    // 检测grid子项问题
    if (declarations['grid-column'] || declarations['grid-row'] || declarations['grid-area']) {
      // 问题: 使用了不存在的grid线名称
      const gridColumn = declarations['grid-column'];
      if (gridColumn && gridColumn.includes('[') && gridColumn.includes(']')) {
        // 这里可以进一步检查线名称是否在容器中定义
        // 目前只做基础提示
        issues.push({
          id: `grid-line-name-${Date.now()}`,
          type: 'grid-template-missing',
          severity: 'hint',
          message: '确认grid线名称已在容器中定义',
          description: '使用命名的grid线时，确保在grid-template中已定义相应的线名称',
          location: {
            selector: rule.selector,
            property: 'grid-column',
            line: rule.location?.line,
            column: rule.location?.column,
          },
          gridContext: {
            containerProperties: {},
            itemProperties: declarations,
            missingTemplate: 'columns'
          }
        });
      }
    }

    return issues;
  }

  /**
   * 检测定位相关问题
   */
  private analyzePositionIssues(rule: CSSRule): CSSIssue[] {
    const issues: CSSIssue[] = [];
    const declarations = this.getDeclarationsMap(rule.declarations);

    // 问题: 使用了定位属性但没有设置position
    const positionProps = ['top', 'right', 'bottom', 'left'];
    const hasPositionProps = positionProps.some(prop => declarations[prop]);
    
    if (hasPositionProps && (!declarations['position'] || declarations['position'] === 'static')) {
      issues.push({
        id: `position-missing-${Date.now()}`,
        type: 'positioning-z-index',
        severity: 'error',
        message: '使用定位属性需要设置position值',
        description: 'top、right、bottom、left属性只对非static定位的元素有效',
        location: {
          selector: rule.selector,
          line: rule.location?.line,
          column: rule.location?.column,
        },
        fix: {
          description: '为元素设置合适的position值',
          code: `${rule.selector} {\n  position: relative; /* 或absolute、fixed */\n}`,
          confidence: 90
        }
      });
    }

    // 问题: z-index用于非定位元素
    if (declarations['z-index'] && (!declarations['position'] || declarations['position'] === 'static')) {
      issues.push({
        id: `z-index-ineffective-${Date.now()}`,
        type: 'positioning-z-index',
        severity: 'warning',
        message: 'z-index对static定位元素无效',
        description: 'z-index属性只对定位元素（relative、absolute、fixed、sticky）有效',
        location: {
          selector: rule.selector,
          property: 'z-index',
          line: rule.location?.line,
          column: rule.location?.column,
        },
        fix: {
          description: '为元素添加定位属性',
          code: `${rule.selector} {\n  position: relative;\n}`,
          confidence: 85
        }
      });
    }

    return issues;
  }

  /**
   * 将声明数组转换为键值对象
   */
  private getDeclarationsMap(declarations: CSSDeclaration[]): Record<string, string> {
    const map: Record<string, string> = {};
    for (const decl of declarations) {
      map[decl.property] = decl.value;
    }
    return map;
  }

  /**
   * 检查是否有明确的高度定义
   */
  private hasExplicitHeight(declarations: Record<string, string>): boolean {
    return !!(
      declarations['height'] ||
      declarations['min-height'] ||
      declarations['max-height'] ||
      (declarations['flex-basis'] && declarations['flex-direction'] === 'column')
    );
  }
}
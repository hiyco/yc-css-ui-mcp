/**
 * CSS MCP Core Package
 * 
 * 提供CSS分析、调试和优化的核心功能
 */

// 核心分析器
export { CSSAnalyzer } from './core/css-analyzer.js';

// 解析器
export { CSSParser } from './parser/css-parser.js';
export type { 
  CSSRule, 
  CSSDeclaration, 
  SpecificityScore, 
  ValidationResult 
} from './parser/css-parser.js';

// 专项分析器
export { LayoutAnalyzer } from './analyzers/layout-analyzer.js';
export { SpecificityAnalyzer } from './analyzers/specificity-analyzer.js';

// 类型定义
export type {
  CSSIssue,
  CSSIssueType,
  IssueSeverity,
  CSSAnalysisOptions,
  CSSAnalysisResult,
  FlexboxIssue,
  GridIssue,
  PerformanceIssue,
  CompatibilityIssue,
  CSSOptimization
} from './types/index.js';

// 导入类型用于内部使用
import type { CSSAnalysisOptions, CSSAnalysisResult } from './types/index.js';
import { CSSAnalyzer } from './core/css-analyzer.js';

// 版本信息
export const VERSION = '0.1.0';

// 默认分析选项
export const DEFAULT_ANALYSIS_OPTIONS: CSSAnalysisOptions = {
  checks: {
    layout: true,
    performance: true,
    compatibility: true,
    accessibility: true,
    maintainability: true
  },
  thresholds: {
    maxFileSize: 500000, // 500KB
    maxSelectors: 4000,
    maxNesting: 5
  }
};

/**
 * 创建CSS分析器实例的便捷函数
 */
export function createCSSAnalyzer(options?: CSSAnalysisOptions): CSSAnalyzer {
  return new CSSAnalyzer(options);
}

/**
 * 快速分析CSS代码的便捷函数
 */
export async function analyzeCSS(
  cssCode: string, 
  options?: CSSAnalysisOptions
): Promise<CSSAnalysisResult> {
  const analyzer = createCSSAnalyzer(options);
  return analyzer.analyze(cssCode);
}
/**
 * CSS MCP核心类型定义
 */

// 基础CSS问题类型
export type CSSIssueType = 
  | 'flexbox-alignment-failed'
  | 'grid-template-missing'
  | 'specificity-conflict'
  | 'inheritance-issue'
  | 'responsive-breakpoint-conflict'
  | 'performance-unused-css'
  | 'compatibility-unsupported'
  | 'accessibility-contrast'
  | 'layout-overflow'
  | 'positioning-z-index';

// 问题严重级别
export type IssueSeverity = 'error' | 'warning' | 'info' | 'hint';

// CSS问题接口
export interface CSSIssue {
  id: string;
  type: CSSIssueType;
  severity: IssueSeverity;
  message: string;
  description?: string;
  
  // 位置信息
  location: {
    file?: string;
    line?: number;
    column?: number;
    selector?: string;
    property?: string;
  };
  
  // 修复建议
  fix?: {
    description: string;
    code: string;
    confidence: number; // 0-100
  };
  
  // 相关资源
  resources?: {
    documentation?: string[];
    examples?: string[];
  };
}

// CSS分析选项
export interface CSSAnalysisOptions {
  // 分析范围
  scope?: {
    includeSelectors?: string[];
    excludeSelectors?: string[];
    includeProperties?: string[];
    excludeProperties?: string[];
  };
  
  // 分析类型
  checks?: {
    layout?: boolean;
    performance?: boolean;
    compatibility?: boolean;
    accessibility?: boolean;
    maintainability?: boolean;
  };
  
  // 浏览器支持
  browsers?: string[];
  
  // 性能阈值
  thresholds?: {
    maxFileSize?: number;
    maxSelectors?: number;
    maxNesting?: number;
  };
}

// CSS分析结果
export interface CSSAnalysisResult {
  summary: {
    totalIssues: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
    hintCount: number;
  };
  
  issues: CSSIssue[];
  
  metrics: {
    fileSize: number;
    selectorsCount: number;
    propertiesCount: number;
    maxSpecificity: number;
    avgSpecificity: number;
  };
  
  suggestions: {
    optimizations: string[];
    refactoring: string[];
    modernization: string[];
  };
}

// Flexbox特定问题
export interface FlexboxIssue extends CSSIssue {
  type: 'flexbox-alignment-failed';
  flexboxContext: {
    containerProperties: Record<string, string>;
    itemProperties: Record<string, string>;
    alignment: 'main' | 'cross' | 'both';
  };
}

// Grid特定问题
export interface GridIssue extends CSSIssue {
  type: 'grid-template-missing';
  gridContext: {
    containerProperties: Record<string, string>;
    itemProperties: Record<string, string>;
    missingTemplate: 'columns' | 'rows' | 'areas';
  };
}

// 性能相关问题
export interface PerformanceIssue extends CSSIssue {
  performanceContext: {
    impactScore: number; // 0-100
    affectedElements: number;
    optimizationPotential: string;
  };
}

// CSS优化建议
export interface CSSOptimization {
  type: 'remove-unused' | 'combine-selectors' | 'minify' | 'critical-css';
  description: string;
  impact: 'high' | 'medium' | 'low';
  
  before: string;
  after: string;
  
  savings: {
    size?: number; // bytes
    selectorsReduced?: number;
    propertiesReduced?: number;
  };
}

// CSS兼容性问题
export interface CompatibilityIssue extends CSSIssue {
  compatibilityContext: {
    unsupportedBrowsers: string[];
    supportedBrowsers: string[];
    alternatives: string[];
    polyfillAvailable: boolean;
  };
}
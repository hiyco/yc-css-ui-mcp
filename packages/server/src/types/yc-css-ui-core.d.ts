// 临时类型声明文件，解决@yc-css-ui/core模块导入问题
declare module '@yc-css-ui/core' {
  export interface CSSAnalysisOptions {
    checks?: {
      layout?: boolean;
      performance?: boolean;
      compatibility?: boolean;
      accessibility?: boolean;
      maintainability?: boolean;
    };
    thresholds?: {
      maxFileSize?: number;
      maxSelectors?: number;
      maxNesting?: number;
    };
    browsers?: string[];
    scope?: {
      includeSelectors?: string[];
      excludeSelectors?: string[];
    };
  }

  export interface CSSAnalysisResult {
    issues: any[];
    suggestions: {
      optimizations: any[];
      refactoring: any[];
      modernization: any[];
    };
    metrics: {
      totalLines: number;
      totalRules: number;
      totalSelectors: number;
      fileSize: number;
    };
  }

  export interface CSSIssue {
    id: string;
    type: string;
    severity: 'error' | 'warning' | 'info' | 'hint';
    message: string;
    description?: string;
    location?: {
      selector?: string;
      property?: string;
      line?: number;
      column?: number;
    };
    fix?: {
      description: string;
      code?: string;
      confidence?: number;
    };
    resources?: {
      documentation?: string[];
    };
  }

  export class CSSAnalyzer {
    constructor(options?: CSSAnalysisOptions);
    analyze(cssCode: string): Promise<CSSAnalysisResult>;
  }
}
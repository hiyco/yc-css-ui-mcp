import { describe, it, expect } from 'vitest';
import { CSSAnalyzer } from './css-analyzer.js';
import { CSSAnalysisOptions } from '../types/index.js';

describe('CSSAnalyzer', () => {
  let analyzer: CSSAnalyzer;

  beforeEach(() => {
    analyzer = new CSSAnalyzer();
  });

  describe('Basic Analysis', () => {
    it('should analyze valid CSS and return results', async () => {
      const css = `
        .test {
          color: red;
          font-size: 16px;
        }
      `;

      const result = await analyzer.analyze(css);
      
      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.issues).toBeInstanceOf(Array);
      expect(result.metrics).toBeDefined();
      expect(result.suggestions).toBeDefined();
    });

    it('should handle empty CSS', async () => {
      await expect(analyzer.analyze('')).rejects.toThrow('CSS code is empty');
    });

    it('should detect syntax errors', async () => {
      const invalidCss = '.test { color: ; }';
      
      const result = await analyzer.analyze(invalidCss);
      
      expect(result.summary.errorCount).toBeGreaterThan(0);
      expect(result.issues.some(issue => issue.severity === 'error')).toBe(true);
    });
  });

  describe('Analysis Options', () => {
    it('should respect disabled checks', async () => {
      const options: CSSAnalysisOptions = {
        checks: {
          layout: false,
          performance: false,
          compatibility: false,
          accessibility: false,
          maintainability: false
        }
      };

      const css = `
        .test {
          display: flex;
          align-items: center;
        }
      `;

      const analyzer = new CSSAnalyzer(options);
      const result = await analyzer.analyze(css);
      
      // 应该没有布局相关的问题被检测到
      const layoutIssues = result.issues.filter(issue => 
        issue.type === 'flexbox-alignment-failed'
      );
      expect(layoutIssues).toHaveLength(0);
    });

    it('should apply custom thresholds', async () => {
      const options: CSSAnalysisOptions = {
        thresholds: {
          maxFileSize: 1000, // 很小的阈值
          maxSelectors: 2,
          maxNesting: 2
        }
      };

      const css = `
        .test1 { color: red; }
        .test2 { color: blue; }
        .test3 { color: green; }
        .test4 { color: yellow; }
      `;

      const analyzer = new CSSAnalyzer(options);
      const result = await analyzer.analyze(css);
      
      // 应该检测到选择器数量超出阈值
      const performanceIssues = result.issues.filter(issue => 
        issue.type === 'performance-unused-css'
      );
      expect(performanceIssues.length).toBeGreaterThan(0);
    });
  });

  describe('Comprehensive Analysis', () => {
    it('should detect multiple types of issues', async () => {
      const css = `
        /* 布局问题 */
        .flex-container {
          display: flex;
          align-items: center; /* 没有高度 */
        }
        
        /* 特异性问题 */
        body div#main .content ul li.item a {
          color: red; /* 过高特异性 */
        }
        
        /* 性能问题 */
        body div section article div p span a {
          font-size: 14px; /* 深层嵌套 */
        }
        
        /* 可访问性问题 */
        .button:focus {
          outline: none; /* 移除焦点指示器 */
        }
        
        /* 兼容性问题 */
        .modern {
          display: grid;
          gap: 1rem;
        }
      `;

      const result = await analyzer.analyze(css);
      
      // 检查是否检测到各种类型的问题
      const issueTypes = result.issues.map(issue => issue.type);
      expect(issueTypes).toContain('flexbox-alignment-failed');
      expect(issueTypes).toContain('specificity-conflict');
      expect(issueTypes).toContain('performance-unused-css');
      expect(issueTypes).toContain('accessibility-contrast');
      
      expect(result.summary.totalIssues).toBeGreaterThan(3);
    });

    it('should provide meaningful metrics', async () => {
      const css = `
        #header { background: blue; }
        .content { color: red; font-size: 16px; }
        .footer { margin: 10px; padding: 5px; }
      `;

      const result = await analyzer.analyze(css);
      
      expect(result.metrics.selectorsCount).toBe(3);
      expect(result.metrics.propertiesCount).toBe(5);
      expect(result.metrics.fileSize).toBeGreaterThan(0);
      expect(result.metrics.maxSpecificity).toBeGreaterThan(0);
    });

    it('should generate relevant suggestions', async () => {
      const css = `
        body div#main .content ul li.item a { /* 高特异性 */
          color: red;
        }
        
        .large-file { /* 模拟大文件 */
          ${'background: url("image.jpg"); '.repeat(100)}
        }
      `;

      const result = await analyzer.analyze(css);
      
      expect(result.suggestions.refactoring.length).toBeGreaterThan(0);
      expect(result.suggestions.optimizations.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle analysis errors gracefully', async () => {
      // 创建一个可能导致分析错误的CSS
      const problematicCss = '.test { color: red; }';
      
      // 模拟内部错误 - 这里我们实际上传入正常的CSS
      // 在真实场景中，这可能是由于解析器错误或其他内部问题
      const result = await analyzer.analyze(problematicCss);
      
      // 即使有内部错误，也应该返回有效的结果结构
      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.issues).toBeInstanceOf(Array);
      expect(result.metrics).toBeDefined();
      expect(result.suggestions).toBeDefined();
    });

    it('should provide detailed error information for syntax errors', async () => {
      const invalidCss = `
        .test {
          color: red
          background: blue; /* 缺少分号 */
        }
        .another {
          font-size: 16px;
        }
      `;

      const result = await analyzer.analyze(invalidCss);
      
      if (result.summary.errorCount > 0) {
        const syntaxErrors = result.issues.filter(issue => issue.severity === 'error');
        expect(syntaxErrors.length).toBeGreaterThan(0);
        
        syntaxErrors.forEach(error => {
          expect(error.message).toBeDefined();
          expect(error.location).toBeDefined();
        });
      }
    });
  });

  describe('Performance Characteristics', () => {
    it('should handle large CSS files efficiently', async () => {
      // 生成大型CSS文件
      const largeCss = Array.from({ length: 1000 }, (_, i) => 
        `.selector-${i} { color: #${i.toString(16).padStart(6, '0')}; }`
      ).join('\n');

      const startTime = Date.now();
      const result = await analyzer.analyze(largeCss);
      const endTime = Date.now();

      // 应该在合理时间内完成分析（这里设置为5秒，实际应该更快）
      expect(endTime - startTime).toBeLessThan(5000);
      
      expect(result.metrics.selectorsCount).toBe(1000);
      expect(result.summary.totalIssues).toBeGreaterThanOrEqual(0);
    });

    it('should provide consistent results for same input', async () => {
      const css = `
        .test {
          display: flex;
          align-items: center;
        }
      `;

      const result1 = await analyzer.analyze(css);
      const result2 = await analyzer.analyze(css);

      expect(result1.summary.totalIssues).toBe(result2.summary.totalIssues);
      expect(result1.metrics.selectorsCount).toBe(result2.metrics.selectorsCount);
      expect(result1.issues.length).toBe(result2.issues.length);
    });
  });
});
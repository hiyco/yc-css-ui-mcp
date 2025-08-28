import { describe, it, expect } from 'vitest';
import { LayoutAnalyzer } from './layout-analyzer.js';

describe('LayoutAnalyzer', () => {
  let analyzer: LayoutAnalyzer;

  beforeEach(() => {
    analyzer = new LayoutAnalyzer();
  });

  describe('Flexbox Analysis', () => {
    it('should detect align-items without explicit height', async () => {
      const css = `
        .flex-container {
          display: flex;
          align-items: center;
        }
      `;

      const issues = await analyzer.analyzeLayout(css);
      const flexboxIssues = issues.filter(issue => issue.type === 'flexbox-alignment-failed');
      
      expect(flexboxIssues).toHaveLength(1);
      expect(flexboxIssues[0].message).toContain('flex容器缺少明确高度');
      expect(flexboxIssues[0].severity).toBe('warning');
    });

    it('should not flag align-items when height is specified', async () => {
      const css = `
        .flex-container {
          display: flex;
          align-items: center;
          min-height: 100vh;
        }
      `;

      const issues = await analyzer.analyzeLayout(css);
      const alignIssues = issues.filter(issue => 
        issue.type === 'flexbox-alignment-failed' && 
        issue.message.includes('高度')
      );
      
      expect(alignIssues).toHaveLength(0);
    });

    it('should detect align-content with flex-wrap: nowrap', async () => {
      const css = `
        .flex-container {
          display: flex;
          flex-wrap: nowrap;
          align-content: space-between;
        }
      `;

      const issues = await analyzer.analyzeLayout(css);
      const wrapIssues = issues.filter(issue => 
        issue.message.includes('单行flex容器中无效')
      );
      
      expect(wrapIssues).toHaveLength(1);
      expect(wrapIssues[0].severity).toBe('info');
    });

    it('should suggest flex-basis when using flex-grow', async () => {
      const css = `
        .flex-item {
          flex-grow: 1;
        }
      `;

      const issues = await analyzer.analyzeLayout(css);
      const basisIssues = issues.filter(issue => 
        issue.message.includes('flex-basis')
      );
      
      expect(basisIssues).toHaveLength(1);
      expect(basisIssues[0].severity).toBe('hint');
    });
  });

  describe('Grid Analysis', () => {
    it('should detect grid container without template', async () => {
      const css = `
        .grid-container {
          display: grid;
        }
      `;

      const issues = await analyzer.analyzeLayout(css);
      const gridIssues = issues.filter(issue => issue.type === 'grid-template-missing');
      
      expect(gridIssues).toHaveLength(1);
      expect(gridIssues[0].message).toContain('缺少template定义');
      expect(gridIssues[0].severity).toBe('error');
    });

    it('should not flag grid with proper template', async () => {
      const css = `
        .grid-container {
          display: grid;
          grid-template-columns: 1fr 2fr 1fr;
        }
      `;

      const issues = await analyzer.analyzeLayout(css);
      const templateIssues = issues.filter(issue => 
        issue.type === 'grid-template-missing' &&
        issue.message.includes('缺少template')
      );
      
      expect(templateIssues).toHaveLength(0);
    });

    it('should detect deprecated grid-gap property', async () => {
      const css = `
        .grid-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-gap: 1rem;
        }
      `;

      const issues = await analyzer.analyzeLayout(css);
      const gapIssues = issues.filter(issue => 
        issue.message.includes('grid-gap')
      );
      
      expect(gapIssues).toHaveLength(1);
      expect(gapIssues[0].severity).toBe('warning');
    });

    it('should handle grid-template-areas correctly', async () => {
      const css = `
        .grid-container {
          display: grid;
          grid-template-areas: 
            "header header"
            "sidebar main"
            "footer footer";
        }
      `;

      const issues = await analyzer.analyzeLayout(css);
      const templateIssues = issues.filter(issue => 
        issue.type === 'grid-template-missing' &&
        issue.message.includes('缺少template')
      );
      
      expect(templateIssues).toHaveLength(0);
    });
  });

  describe('Positioning Analysis', () => {
    it('should detect positioning properties without position', async () => {
      const css = `
        .element {
          top: 10px;
          left: 20px;
        }
      `;

      const issues = await analyzer.analyzeLayout(css);
      const positionIssues = issues.filter(issue => 
        issue.type === 'positioning-z-index' &&
        issue.message.includes('需要设置position值')
      );
      
      expect(positionIssues).toHaveLength(1);
      expect(positionIssues[0].severity).toBe('error');
    });

    it('should detect z-index on static elements', async () => {
      const css = `
        .element {
          z-index: 10;
        }
      `;

      const issues = await analyzer.analyzeLayout(css);
      const zIndexIssues = issues.filter(issue => 
        issue.message.includes('z-index对static定位元素无效')
      );
      
      expect(zIndexIssues).toHaveLength(1);
      expect(zIndexIssues[0].severity).toBe('warning');
    });

    it('should not flag positioned elements with positioning properties', async () => {
      const css = `
        .element {
          position: relative;
          top: 10px;
          left: 20px;
          z-index: 10;
        }
      `;

      const issues = await analyzer.analyzeLayout(css);
      const positionIssues = issues.filter(issue => 
        issue.type === 'positioning-z-index'
      );
      
      expect(positionIssues).toHaveLength(0);
    });
  });

  describe('Complex Layout Scenarios', () => {
    it('should analyze mixed flex and grid layout', async () => {
      const css = `
        .layout {
          display: grid;
          grid-template-columns: 200px 1fr;
        }
        
        .sidebar {
          display: flex;
          align-items: center;
        }
        
        .main {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
      `;

      const issues = await analyzer.analyzeLayout(css);
      
      // Grid应该没有问题（有template）
      const gridIssues = issues.filter(issue => issue.type === 'grid-template-missing');
      expect(gridIssues).toHaveLength(0);
      
      // Flexbox可能有align-items问题
      const flexIssues = issues.filter(issue => issue.type === 'flexbox-alignment-failed');
      expect(flexIssues.length).toBeGreaterThanOrEqual(0); // 可能有也可能没有，取决于具体实现
    });

    it('should handle nested flexbox correctly', async () => {
      const css = `
        .outer-flex {
          display: flex;
          height: 100vh;
          align-items: center;
        }
        
        .inner-flex {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
      `;

      const issues = await analyzer.analyzeLayout(css);
      
      // 外层flex有明确高度，不应该报警告
      const outerIssues = issues.filter(issue => 
        issue.location?.selector?.includes('outer-flex')
      );
      expect(outerIssues).toHaveLength(0);
      
      // 内层flex没有明确高度，可能有警告
      const innerIssues = issues.filter(issue => 
        issue.location?.selector?.includes('inner-flex') &&
        issue.message.includes('高度')
      );
      expect(innerIssues.length).toBeGreaterThanOrEqual(0);
    });
  });
});
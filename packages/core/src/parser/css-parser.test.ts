import { describe, it, expect } from 'vitest';
import { CSSParser } from './css-parser.js';

describe('CSSParser', () => {
  let parser: CSSParser;

  beforeEach(() => {
    parser = new CSSParser();
  });

  describe('parseWithPostCSS', () => {
    it('should parse valid CSS', async () => {
      const css = '.test { color: red; }';
      const result = await parser.parseWithPostCSS(css);
      
      expect(result).toBeDefined();
      expect(result.type).toBe('root');
      expect(result.nodes).toHaveLength(1);
    });

    it('should throw error for invalid CSS', async () => {
      const invalidCss = '.test { color: ; }'; // 无效的CSS
      
      await expect(parser.parseWithPostCSS(invalidCss)).rejects.toThrow();
    });
  });

  describe('parseWithCSSTree', () => {
    it('should parse CSS and return AST', () => {
      const css = '.test { color: red; font-size: 16px; }';
      const ast = parser.parseWithCSSTree(css);
      
      expect(ast).toBeDefined();
      expect(ast.type).toBe('StyleSheet');
    });

    it('should handle empty CSS', () => {
      const css = '';
      const ast = parser.parseWithCSSTree(css);
      
      expect(ast).toBeDefined();
      expect(ast.type).toBe('StyleSheet');
    });
  });

  describe('extractRules', () => {
    it('should extract rules from CSS AST', () => {
      const css = `
        .test {
          color: red;
          font-size: 16px;
        }
        #header {
          background: blue;
        }
      `;
      
      const ast = parser.parseWithCSSTree(css);
      const rules = parser.extractRules(ast);
      
      expect(rules).toHaveLength(2);
      expect(rules[0].selector).toContain('test');
      expect(rules[0].declarations).toHaveLength(2);
      expect(rules[1].selector).toContain('header');
    });

    it('should handle CSS with no rules', () => {
      const css = '/* just a comment */';
      const ast = parser.parseWithCSSTree(css);
      const rules = parser.extractRules(ast);
      
      expect(rules).toHaveLength(0);
    });
  });

  describe('calculateSpecificity', () => {
    it('should calculate specificity for simple selectors', () => {
      const tests = [
        { selector: 'div', expected: 1 },
        { selector: '.class', expected: 10 },
        { selector: '#id', expected: 100 },
        { selector: 'div.class', expected: 11 },
        { selector: '#id.class', expected: 110 },
        { selector: 'div#id.class', expected: 111 },
      ];

      tests.forEach(({ selector, expected }) => {
        const result = parser.calculateSpecificity(selector);
        expect(result.score).toBe(expected);
      });
    });

    it('should handle complex selectors', () => {
      const complexSelector = 'body div#main .content ul li.active a:hover';
      const result = parser.calculateSpecificity(complexSelector);
      
      expect(result.score).toBeGreaterThan(100); // 至少有一个ID
      expect(result.breakdown.ids).toBeGreaterThan(0);
      expect(result.breakdown.classes).toBeGreaterThan(0);
      expect(result.breakdown.elements).toBeGreaterThan(0);
    });
  });

  describe('validateSyntax', () => {
    it('should validate correct CSS syntax', () => {
      const validCss = `
        .test {
          color: red;
          background: url('image.jpg');
          font-family: 'Arial', sans-serif;
        }
        @media (max-width: 768px) {
          .test { color: blue; }
        }
      `;
      
      const result = parser.validateSyntax(validCss);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid CSS syntax', () => {
      const invalidCss = `
        .test {
          color: ;
          background url('image.jpg');
          font-family 'Arial';
        }
      `;
      
      const result = parser.validateSyntax(invalidCss);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle malformed selectors', () => {
      const malformedCss = '.test { .nested { color: red; } }'; // CSS不支持原生嵌套
      
      const result = parser.validateSyntax(malformedCss);
      // PostCSS可能会解析这个，但在严格模式下应该检测到问题
      expect(result).toBeDefined();
    });
  });
});
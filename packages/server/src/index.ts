/**
 * CSS MCP Server Package
 * 
 * 提供CSS分析和修复的MCP服务器实现
 */

// 主服务器类
export { YCCSSUIMCPServer } from './server.js';

// 工具实现
export { CSSAnalyzerTool } from './tools/css-analyzer-tool.js';
export { CSSFixTool } from './tools/css-fix-tool.js';

// 版本信息
export const SERVER_VERSION = '0.1.0';

/**
 * 服务器配置接口
 */
export interface ServerConfig {
  name?: string;
  version?: string;
  stdio?: boolean;
  port?: number;
  host?: string;
}

/**
 * 默认服务器配置
 */
export const DEFAULT_SERVER_CONFIG: ServerConfig = {
  name: 'css-mcp-server',
  version: SERVER_VERSION,
  stdio: true,
  port: 3000,
  host: 'localhost'
};
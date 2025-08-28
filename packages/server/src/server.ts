#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { CSSAnalyzerTool } from './tools/css-analyzer-tool.js';
import { CSSFixTool } from './tools/css-fix-tool.js';

/**
 * YC-CSS-UI MCP 服务器
 * 
 * 提供CSS分析、调试和修复的MCP工具集
 */
export class YCCSSUIMCPServer {
  private server: Server;
  private cssAnalyzer: CSSAnalyzerTool;
  private cssFixer: CSSFixTool;

  constructor() {
    this.server = new Server(
      {
        name: 'yc-css-ui-mcp-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.cssAnalyzer = new CSSAnalyzerTool();
    this.cssFixer = new CSSFixTool();
    
    this.setupErrorHandling();
    this.setupRequestHandlers();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupRequestHandlers(): void {
    // 列出可用的工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: this.cssAnalyzer.name,
            description: this.cssAnalyzer.description,
            inputSchema: this.cssAnalyzer.inputSchema,
          },
          {
            name: this.cssFixer.name,
            description: this.cssFixer.description,
            inputSchema: this.cssFixer.inputSchema,
          }
        ],
      };
    });

    // 处理工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name } = request.params;

      try {
        switch (name) {
          case this.cssAnalyzer.name:
            return await this.cssAnalyzer.call(request);

          case this.cssFixer.name:
            return await this.cssFixer.call(request);

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }

        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    console.error('YC-CSS-UI MCP Server started successfully');
    console.error('YC-CSS-UI服务 - 已成功启动并准备就绪');
    console.error('Available tools: analyze_css, fix_css_issues');
    console.error('Server ready to accept requests...');
  }
}

// 启动服务器
async function main() {
  const server = new YCCSSUIMCPServer();
  await server.start();
}

// 仅在直接运行此脚本时启动服务器
if (require.main === module) {
  main().catch((error) => {
    console.error('Failed to start YC-CSS-UI MCP Server:', error);
    process.exit(1);
  });
}
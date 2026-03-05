/**
 * Gemini CLI Integration
 * Direct integration with Gemini CLI via MCP server
 */

import { MCPServer } from './infrastructure/mcp-server.js';
import { ConfigManager } from './core/config.js';

/**
 * Gemini CLI integration class
 * Manages MCP server and configuration for Gemini CLI
 */
export class GeminiCLIIntegration {
  private mcpServer: MCPServer;
  private config: ConfigManager;
  private started: boolean = false;

  constructor() {
    this.mcpServer = new MCPServer();
    this.config = new ConfigManager();
  }

  /**
   * Initialize the integration
   */
  async init(): Promise<void> {
    await this.config.init();
    await this.mcpServer.init();
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    if (this.started) {
      return;
    }

    await this.mcpServer.start();
    this.started = true;
  }

  /**
   * Stop the MCP server
   */
  async stop(): Promise<void> {
    if (!this.started) {
      return;
    }

    await this.mcpServer.stop();
    this.started = false;
  }

  /**
   * Check if TTS is enabled
   */
  isEnabled(): boolean {
    return this.config.get('enabled');
  }
}

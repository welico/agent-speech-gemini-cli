/**
 * Antigravity CLI Integration
 * Direct integration with Antigravity CLI via MCP server
 */

import { MCPServer } from './infrastructure/mcp-server.js';
import { ConfigManager } from './core/config.js';

/**
 * Antigravity CLI integration class
 * Manages MCP server and configuration for Antigravity CLI
 */
export class AntigravityIntegration {
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

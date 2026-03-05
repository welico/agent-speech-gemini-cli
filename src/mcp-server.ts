/**
 * MCP Server entry point
 * This file is executed by Gemini CLI when the extension is loaded
 */

import { GeminiCLIIntegration } from './gemini-cli.js';

/**
 * Main entry point for MCP server
 * Called via: node dist/mcp-server.js
 */
async function main(): Promise<void> {
  const integration = new GeminiCLIIntegration();
  await integration.init();

  // Handle shutdown gracefully
  const shutdown = async () => {
    await integration.stop();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Start the server (blocks until killed)
  await integration.start();
}

// Start the server
main().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});

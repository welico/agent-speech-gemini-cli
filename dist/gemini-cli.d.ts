/**
 * Gemini CLI Integration
 * Direct integration with Gemini CLI via MCP server
 */
/**
 * Gemini CLI integration class
 * Manages MCP server and configuration for Gemini CLI
 */
export declare class GeminiCLIIntegration {
    private mcpServer;
    private config;
    private started;
    constructor();
    /**
     * Initialize the integration
     */
    init(): Promise<void>;
    /**
     * Start the MCP server
     */
    start(): Promise<void>;
    /**
     * Stop the MCP server
     */
    stop(): Promise<void>;
    /**
     * Check if TTS is enabled
     */
    isEnabled(): boolean;
}
//# sourceMappingURL=gemini-cli.d.ts.map
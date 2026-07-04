/**
 * Antigravity CLI Integration
 * Direct integration with Antigravity CLI via MCP server
 */
/**
 * Antigravity CLI integration class
 * Manages MCP server and configuration for Antigravity CLI
 */
export declare class AntigravityIntegration {
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
//# sourceMappingURL=antigravity.d.ts.map
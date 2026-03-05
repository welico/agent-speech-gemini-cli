export declare class MCPServer {
    private server;
    private tts;
    private config;
    private logger;
    constructor();
    init(): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
    private setupHandlers;
    private setupToolListing;
    private getToolInputSchema;
    private handleSpeak;
}
export declare function createMCPServer(): Promise<MCPServer>;
//# sourceMappingURL=mcp-server.d.ts.map
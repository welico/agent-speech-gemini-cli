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
    private getSpeakToolInputSchema;
    private getControlToolInputSchema;
    private handleSpeak;
    private ensureVoiceExists;
    private handleStatus;
    private formatStatusText;
    private handleControl;
}
export declare function createMCPServer(): Promise<MCPServer>;
//# sourceMappingURL=mcp-server.d.ts.map
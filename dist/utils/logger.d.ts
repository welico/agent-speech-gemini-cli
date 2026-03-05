/**
 * Logger Utility for MCP Server Debugging
 *
 * IMPORTANT: All output goes to console.error() because stdout is reserved
 * for MCP protocol messages. Using console.log() will break the MCP server.
 *
 * Usage:
 *   const logger = createLogger({ prefix: '[MCP]' });
 *   logger.debug('Tool called', { input: data });
 *   logger.error('Operation failed', error);
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export interface LoggerConfig {
    enabled: boolean;
    level: LogLevel;
    output: 'stderr' | 'file' | 'both';
    filePath: string;
    prefix: string;
    maxSize: number;
    maxFiles: number;
}
export interface Logger {
    debug(message: string, data?: unknown): void;
    info(message: string, data?: unknown): void;
    warn(message: string, data?: unknown): void;
    error(message: string, data?: unknown): void;
    enable(enabled: boolean): void;
    setLevel(level: LogLevel): void;
}
/**
 * Create a logger instance with custom configuration
 */
export declare function createLogger(config?: Partial<LoggerConfig>): Logger;
/**
 * Default logger instance
 */
export declare const logger: Logger;
//# sourceMappingURL=logger.d.ts.map
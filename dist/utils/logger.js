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
import fs from 'node:fs';
import path from 'node:path';
const DEFAULT_CONFIG = {
    enabled: process.env.DEBUG === 'true',
    level: process.env.LOG_LEVEL || 'debug',
    output: 'both',
    filePath: process.env.LOG_FILE || '/tmp/agent-speech-debug.log',
    prefix: '[DEBUG]',
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 3,
};
/**
 * Create a logger instance with custom configuration
 */
export function createLogger(config) {
    const cfg = { ...DEFAULT_CONFIG, ...config };
    const logLevels = { debug: 0, info: 1, warn: 2, error: 3 };
    /**
     * Write log entry to file with rotation
     */
    function writeToFile(entry) {
        try {
            const logDir = path.dirname(cfg.filePath);
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }
            // Check file size and rotate if needed
            if (fs.existsSync(cfg.filePath)) {
                const stats = fs.statSync(cfg.filePath);
                if (stats.size >= cfg.maxSize) {
                    rotateLogs();
                }
            }
            fs.appendFileSync(cfg.filePath, entry + '\n');
        }
        catch (error) {
            // Silent fallback - logging should not crash
            console.error('[LOGGER] Failed to write to file:', error);
        }
    }
    /**
     * Rotate log files: log -> log.1 -> log.2 -> log.3 (deleted)
     */
    function rotateLogs() {
        for (let i = cfg.maxFiles - 1; i >= 1; i--) {
            const oldFile = `${cfg.filePath}.${i}`;
            const newFile = `${cfg.filePath}.${i + 1}`;
            if (fs.existsSync(oldFile)) {
                fs.renameSync(oldFile, newFile);
            }
        }
        if (fs.existsSync(cfg.filePath)) {
            fs.renameSync(cfg.filePath, `${cfg.filePath}.1`);
        }
    }
    /**
     * Core logging function
     */
    function log(level, message, data) {
        if (!cfg.enabled || logLevels[level] < logLevels[cfg.level]) {
            return;
        }
        const timestamp = new Date().toISOString();
        const prefix = `${cfg.prefix} [${level.toUpperCase()}]`;
        const logMessage = `${prefix} ${message}`;
        // Console output (stderr only - stdout reserved for MCP)
        if (cfg.output === 'stderr' || cfg.output === 'both') {
            if (data) {
                console.error(logMessage, data);
            }
            else {
                console.error(logMessage);
            }
        }
        // File output
        if (cfg.output === 'file' || cfg.output === 'both') {
            const logEntry = JSON.stringify({ timestamp, level, message, data });
            writeToFile(logEntry);
        }
    }
    return {
        debug: (message, data) => log('debug', message, data),
        info: (message, data) => log('info', message, data),
        warn: (message, data) => log('warn', message, data),
        error: (message, data) => log('error', message, data),
        enable: (enabled) => { cfg.enabled = enabled; },
        setLevel: (level) => { cfg.level = level; },
    };
}
/**
 * Default logger instance
 */
export const logger = createLogger();
//# sourceMappingURL=logger.js.map
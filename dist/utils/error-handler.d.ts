/**
 * Error Handling Utilities for Debug Environment
 *
 * Provides error wrapper functions that automatically log errors
 * and wrap them in a structured DebugError class.
 */
import type { Logger } from './logger.js';
/**
 * Structured error class for debug purposes
 */
export declare class DebugError extends Error {
    code: string;
    details: Record<string, unknown>;
    constructor(code: string, message: string, details?: Record<string, unknown>);
    toJSON(): {
        name: string;
        code: string;
        message: string;
        details: Record<string, unknown>;
    };
}
/**
 * Wrap an async operation with error handling and logging
 *
 * @param operation - Name of the operation for logging
 * @param fn - Async function to execute
 * @param logger - Optional logger instance
 * @returns Promise<T> - Result of the function
 * @throws DebugError - If the function throws
 */
export declare function withErrorHandling<T>(operation: string, fn: () => Promise<T>, logger?: Logger): Promise<T>;
/**
 * Wrap a synchronous operation with error handling and logging
 *
 * @param operation - Name of the operation for logging
 * @param fn - Function to execute
 * @param logger - Optional logger instance
 * @returns T - Result of the function
 * @throws DebugError - If the function throws
 */
export declare function withSyncErrorHandling<T>(operation: string, fn: () => T, logger?: Logger): T;
/**
 * Safely execute a function without throwing
 *
 * @param fn - Function to execute
 * @param fallback - Fallback value if function throws
 * @param logger - Optional logger instance
 * @returns T - Result or fallback value
 */
export declare function safeExecute<T>(fn: () => Promise<T>, fallback: T, logger?: Logger): Promise<T>;
/**
 * Safely execute a synchronous function without throwing
 *
 * @param fn - Function to execute
 * @param fallback - Fallback value if function throws
 * @param logger - Optional logger instance
 * @returns T - Result or fallback value
 */
export declare function safeSyncExecute<T>(fn: () => T, fallback: T, logger?: Logger): T;
//# sourceMappingURL=error-handler.d.ts.map
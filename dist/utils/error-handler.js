/**
 * Error Handling Utilities for Debug Environment
 *
 * Provides error wrapper functions that automatically log errors
 * and wrap them in a structured DebugError class.
 */
/**
 * Structured error class for debug purposes
 */
export class DebugError extends Error {
    code;
    details;
    constructor(code, message, details = {}) {
        super(message);
        this.name = 'DebugError';
        this.code = code;
        this.details = details;
    }
    toJSON() {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            details: this.details,
        };
    }
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
export async function withErrorHandling(operation, fn, logger) {
    try {
        logger?.debug(`Starting: ${operation}`);
        const result = await fn();
        logger?.debug(`Completed: ${operation}`);
        return result;
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const stack = error instanceof Error ? error.stack : undefined;
        logger?.error(`Failed: ${operation}`, { message, stack });
        throw new DebugError('OPERATION_FAILED', `${operation} failed: ${message}`, { originalError: message, stack });
    }
}
/**
 * Wrap a synchronous operation with error handling and logging
 *
 * @param operation - Name of the operation for logging
 * @param fn - Function to execute
 * @param logger - Optional logger instance
 * @returns T - Result of the function
 * @throws DebugError - If the function throws
 */
export function withSyncErrorHandling(operation, fn, logger) {
    try {
        logger?.debug(`Starting: ${operation}`);
        const result = fn();
        logger?.debug(`Completed: ${operation}`);
        return result;
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const stack = error instanceof Error ? error.stack : undefined;
        logger?.error(`Failed: ${operation}`, { message, stack });
        throw new DebugError('OPERATION_FAILED', `${operation} failed: ${message}`, { originalError: message, stack });
    }
}
/**
 * Safely execute a function without throwing
 *
 * @param fn - Function to execute
 * @param fallback - Fallback value if function throws
 * @param logger - Optional logger instance
 * @returns T - Result or fallback value
 */
export async function safeExecute(fn, fallback, logger) {
    try {
        return await fn();
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger?.error('Safe execution failed, using fallback', { message });
        return fallback;
    }
}
/**
 * Safely execute a synchronous function without throwing
 *
 * @param fn - Function to execute
 * @param fallback - Fallback value if function throws
 * @param logger - Optional logger instance
 * @returns T - Result or fallback value
 */
export function safeSyncExecute(fn, fallback, logger) {
    try {
        return fn();
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger?.error('Safe sync execution failed, using fallback', { message });
        return fallback;
    }
}
//# sourceMappingURL=error-handler.js.map
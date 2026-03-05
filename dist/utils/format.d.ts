/**
 * Output formatting utilities for CLI
 */
/**
 * Format regular output message
 * @param args - Arguments to format
 */
export declare function format(...args: unknown[]): void;
/**
 * Format error message
 * @param args - Arguments to format
 */
export declare function formatError(...args: unknown[]): void;
/**
 * Format success message
 * @param args - Arguments to format
 */
export declare function formatSuccess(...args: unknown[]): void;
/**
 * Format warning message
 * @param args - Arguments to format
 */
export declare function formatWarning(...args: unknown[]): void;
/**
 * Format info message
 * @param args - Arguments to format
 */
export declare function formatInfo(...args: unknown[]): void;
/**
 * Format header/section title
 * @param title - Section title
 */
export declare function formatHeader(title: string): void;
/**
 * Format table row
 * @param columns - Column values
 * @param widths - Column widths
 */
export declare function formatRow(columns: string[], widths: number[]): void;
/**
 * Format list item
 * @param item - List item text
 * @param enabled - Whether item is enabled (adds checkmark)
 */
export declare function formatListItem(item: string, enabled?: boolean): void;
//# sourceMappingURL=format.d.ts.map
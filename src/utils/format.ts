/**
 * Output formatting utilities for CLI
 */

/**
 * Prefix for all console output
 */
const PREFIX = '[agent-speech]';

/**
 * Format regular output message
 * @param args - Arguments to format
 */
export function format(...args: unknown[]): void {
  console.log(PREFIX, ...args);
}

/**
 * Format error message
 * @param args - Arguments to format
 */
export function formatError(...args: unknown[]): void {
  console.error(`${PREFIX} ERROR`, ...args);
}

/**
 * Format success message
 * @param args - Arguments to format
 */
export function formatSuccess(...args: unknown[]): void {
  console.log(`${PREFIX} SUCCESS`, ...args);
}

/**
 * Format warning message
 * @param args - Arguments to format
 */
export function formatWarning(...args: unknown[]): void {
  console.warn(`${PREFIX} WARNING`, ...args);
}

/**
 * Format info message
 * @param args - Arguments to format
 */
export function formatInfo(...args: unknown[]): void {
  console.log(`${PREFIX} INFO`, ...args);
}

/**
 * Format header/section title
 * @param title - Section title
 */
export function formatHeader(title: string): void {
  console.log('');
  format(title);
  console.log('-'.repeat(60));
}

/**
 * Format table row
 * @param columns - Column values
 * @param widths - Column widths
 */
export function formatRow(
  columns: string[],
  widths: number[]
): void {
  const padded = columns.map((col, i) => col.padEnd(widths[i]));
  console.log('  ' + padded.join('  '));
}

/**
 * Format list item
 * @param item - List item text
 * @param enabled - Whether item is enabled (adds checkmark)
 */
export function formatListItem(item: string, enabled?: boolean): void {
  const status = enabled === undefined ? '' : (enabled ? '+ ' : '- ');
  console.log(`  ${status}${item}`);
}

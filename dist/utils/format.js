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
export function format(...args) {
    console.log(PREFIX, ...args);
}
/**
 * Format error message
 * @param args - Arguments to format
 */
export function formatError(...args) {
    console.error(`${PREFIX} ERROR`, ...args);
}
/**
 * Format success message
 * @param args - Arguments to format
 */
export function formatSuccess(...args) {
    console.log(`${PREFIX} SUCCESS`, ...args);
}
/**
 * Format warning message
 * @param args - Arguments to format
 */
export function formatWarning(...args) {
    console.warn(`${PREFIX} WARNING`, ...args);
}
/**
 * Format info message
 * @param args - Arguments to format
 */
export function formatInfo(...args) {
    console.log(`${PREFIX} INFO`, ...args);
}
/**
 * Format header/section title
 * @param title - Section title
 */
export function formatHeader(title) {
    console.log('');
    format(title);
    console.log('-'.repeat(60));
}
/**
 * Format table row
 * @param columns - Column values
 * @param widths - Column widths
 */
export function formatRow(columns, widths) {
    const padded = columns.map((col, i) => col.padEnd(widths[i]));
    console.log('  ' + padded.join('  '));
}
/**
 * Format list item
 * @param item - List item text
 * @param enabled - Whether item is enabled (adds checkmark)
 */
export function formatListItem(item, enabled) {
    const status = enabled === undefined ? '' : (enabled ? '+ ' : '- ');
    console.log(`  ${status}${item}`);
}
//# sourceMappingURL=format.js.map
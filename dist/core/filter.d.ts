import { TTSConfig, FilterResult } from '../types/index.js';
export declare class ContentFilter {
    filter(text: string, config: TTSConfig): FilterResult;
    detectSensitive(text: string): boolean;
    removeCodeBlocks(text: string): string;
    removeCommandOutputs(text: string): string;
    private filterSensitive;
    private cleanupWhitespace;
}
//# sourceMappingURL=filter.d.ts.map
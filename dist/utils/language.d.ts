export declare const SUPPORTED_LANGUAGES: readonly [{
    readonly code: "en";
    readonly name: "English";
}, {
    readonly code: "ko";
    readonly name: "Korean";
}, {
    readonly code: "ja";
    readonly name: "Japanese";
}, {
    readonly code: "zh-CN";
    readonly name: "Chinese (Simplified)";
}, {
    readonly code: "es";
    readonly name: "Spanish";
}, {
    readonly code: "fr";
    readonly name: "French";
}, {
    readonly code: "de";
    readonly name: "German";
}, {
    readonly code: "it";
    readonly name: "Italian";
}];
export type SupportedLanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];
export declare function normalizeLanguageCode(input: string): string;
export declare function isSupportedLanguage(code: string): boolean;
export declare function getLanguageName(code: string): string;
//# sourceMappingURL=language.d.ts.map
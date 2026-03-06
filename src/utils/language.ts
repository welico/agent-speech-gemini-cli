export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ko', name: 'Korean' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
] as const;

export type SupportedLanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];

export function normalizeLanguageCode(input: string): string {
  const code = input.trim();
  if (code.toLowerCase() === 'zh') {
    return 'zh-CN';
  }
  return code;
}

export function isSupportedLanguage(code: string): boolean {
  return SUPPORTED_LANGUAGES.some((lang) => lang.code.toLowerCase() === code.toLowerCase());
}

export function getLanguageName(code: string): string {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code.toLowerCase() === code.toLowerCase())?.name || code;
}

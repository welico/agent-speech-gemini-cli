import { ConfigManager } from '../core/config.js';
import { SUPPORTED_LANGUAGES, getLanguageName, isSupportedLanguage, normalizeLanguageCode } from '../utils/language.js';

export async function cmdLanguage(code?: string): Promise<number> {
  const config = new ConfigManager();
  await config.init();

  if (!code) {
    const current = config.get('language') || 'en';
    console.log(`Current language: ${getLanguageName(current)} (${current})`);
    console.log('Supported languages:');
    for (const lang of SUPPORTED_LANGUAGES) {
      console.log(`- ${lang.code}: ${lang.name}`);
    }
    console.log('Set language with: agent-speech set-language <code>');
    return 0;
  }

  const normalized = normalizeLanguageCode(code);
  if (!isSupportedLanguage(normalized)) {
    console.error(`Unsupported language code: ${code}`);
    console.error('Supported codes:', SUPPORTED_LANGUAGES.map((lang) => lang.code).join(', '));
    return 1;
  }

  config.set('language', normalized);
  await config.save();
  console.log(`Language updated to: ${getLanguageName(normalized)} (${normalized})`);
  return 0;
}

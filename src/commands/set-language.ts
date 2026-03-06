import { cmdLanguage } from './language.js';

export async function cmdSetLanguage(code?: string): Promise<number> {
  return cmdLanguage(code);
}

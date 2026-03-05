import { ConfigManager } from '../core/config.js';
import { formatSuccess } from '../utils/format.js';

export async function cmdDisable(): Promise<number> {
  const config = new ConfigManager();
  await config.init();

  config.set('enabled', false);
  await config.save();

  formatSuccess('TTS disabled');
  return 0;
}

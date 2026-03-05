import { ConfigManager } from '../core/config.js';
import { formatError, formatSuccess } from '../utils/format.js';

export async function cmdSetVolume(volume?: string): Promise<number> {
  if (!volume) {
    formatError('Volume is required (0-100)');
    return 1;
  }

  const volumeNum = parseInt(volume, 10);
  if (isNaN(volumeNum) || volumeNum < 0 || volumeNum > 100) {
    formatError('Volume must be between 0 and 100');
    return 1;
  }

  const config = new ConfigManager();
  await config.init();

  config.set('volume', volumeNum);
  await config.save();

  formatSuccess(`Volume set to ${volumeNum}`);
  return 0;
}

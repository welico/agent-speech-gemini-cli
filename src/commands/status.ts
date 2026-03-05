import { readJSON, getConfigDir } from '../infrastructure/fs.js';
import { ConfigManager } from '../core/config.js';
import { format, formatListItem } from '../utils/format.js';
import { existsSync } from 'fs';
import { promises } from 'fs';

export async function cmdStatus(): Promise<number> {
  const config = new ConfigManager();
  await config.init();

  format('Configuration status:');
  format('  version:', config.getVersion());
  format('');

  format('Settings:');
  const settings = config.getAll();
  format('  enabled:', settings.enabled);
  format('  voice:', settings.voice);
  format('  rate:', settings.rate, 'WPM');
  format('  volume:', settings.volume);
  format('  min length:', settings.minLength);
  format('  max length:', settings.maxLength || 'unlimited');
  format('  filters:');
  format('    sensitive:', settings.filters.sensitive);
  format('    skipCodeBlocks:', settings.filters.skipCodeBlocks);
  format('    skipCommands:', settings.filters.skipCommands);
  format('');

  const MUTE_PATH = `${getConfigDir()}/mute.json`;

  format('Mute status:');
  if (existsSync(MUTE_PATH)) {
    try {
      const muteData = await readJSON(MUTE_PATH) as { until: string | null; duration: string };
      if (muteData.until === null) {
        formatListItem('muted: permanent', false);
      } else {
        const now = new Date();
        const expiry = new Date(muteData.until);
        const remaining = expiry.getTime() - now.getTime();

        if (remaining > 0) {
          const minutes = Math.floor(remaining / 60000);
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;

          let timeStr;
          if (hours > 0) {
            timeStr = `${hours} hour${hours > 1 ? 's' : ''} and ${mins} minute${mins > 1 ? 's' : ''}`;
          } else {
            timeStr = `${minutes} minute${minutes > 1 ? 's' : ''}`;
          }

          formatListItem(`muted: ${timeStr} remaining`, false);
        } else {
          promises.unlink(MUTE_PATH);
          formatListItem('muted: expired (auto-removed)', true);
        }
      }
    } catch {
      promises.unlink(MUTE_PATH);
      formatListItem('muted: file removed (corrupt)', true);
    }
  } else {
    formatListItem('muted: off', true);
  }

  return 0;
}

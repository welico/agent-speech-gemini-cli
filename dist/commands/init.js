import { ConfigManager } from '../core/config.js';
import { getUserHome } from '../infrastructure/fs.js';
import { formatSuccess, format } from '../utils/format.js';
export async function cmdInit() {
    const config = new ConfigManager();
    await config.init();
    await config.save();
    formatSuccess('Configuration initialized at', getUserHome() + '/.agent-speech/config.json');
    format('Settings:');
    const settings = config.getAll();
    format('  enabled:', settings.enabled);
    format('  voice:', settings.voice);
    format('  rate:', settings.rate);
    format('  volume:', settings.volume);
    return 0;
}
//# sourceMappingURL=init.js.map
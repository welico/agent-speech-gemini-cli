import { ConfigManager } from '../core/config.js';
import { formatSuccess } from '../utils/format.js';
export async function cmdEnable() {
    const config = new ConfigManager();
    await config.init();
    config.set('enabled', true);
    await config.save();
    formatSuccess('TTS enabled');
    return 0;
}
//# sourceMappingURL=enable.js.map
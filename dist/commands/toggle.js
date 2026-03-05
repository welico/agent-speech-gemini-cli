import { ConfigManager } from '../core/config.js';
import { formatSuccess, formatInfo } from '../utils/format.js';
export async function cmdToggle() {
    const config = new ConfigManager();
    await config.init();
    const current = config.get('enabled');
    const newState = !current;
    config.set('enabled', newState);
    await config.save();
    if (newState) {
        formatSuccess('TTS enabled');
    }
    else {
        formatInfo('TTS disabled');
    }
    return 0;
}
//# sourceMappingURL=toggle.js.map
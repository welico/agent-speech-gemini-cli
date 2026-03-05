import { ConfigManager } from '../core/config.js';
import { formatSuccess } from '../utils/format.js';
export async function cmdReset() {
    const config = new ConfigManager();
    await config.init();
    await config.init();
    await config.save();
    formatSuccess('Configuration reset to defaults');
    return 0;
}
//# sourceMappingURL=reset.js.map
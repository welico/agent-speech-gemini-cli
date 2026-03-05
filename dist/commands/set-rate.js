import { ConfigManager } from '../core/config.js';
import { formatError, formatSuccess } from '../utils/format.js';
export async function cmdSetRate(rate) {
    if (!rate) {
        formatError('Rate is required (50-400 words per minute)');
        return 1;
    }
    const rateNum = parseInt(rate, 10);
    if (isNaN(rateNum) || rateNum < 50 || rateNum > 400) {
        formatError('Rate must be between 50 and 400');
        return 1;
    }
    const config = new ConfigManager();
    await config.init();
    config.set('rate', rateNum);
    await config.save();
    formatSuccess(`Speech rate set to ${rateNum} WPM`);
    return 0;
}
//# sourceMappingURL=set-rate.js.map
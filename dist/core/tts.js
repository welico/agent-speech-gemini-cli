import { SayCommand } from '../infrastructure/say.js';
import { ContentFilter } from './filter.js';
import { createLogger } from '../utils/logger.js';
import { withErrorHandling } from '../utils/error-handler.js';
export class TextToSpeech {
    say;
    filter;
    enabled = true;
    logger = createLogger({ prefix: '[TTS]' });
    constructor() {
        this.say = new SayCommand();
        this.filter = new ContentFilter();
    }
    async speak(text, config) {
        return withErrorHandling('speak', async () => {
            this.logger.debug('Starting speech', { textLength: text.length, config });
            if (!config.enabled || !this.enabled) {
                this.logger.debug('Speech disabled', { configEnabled: config.enabled, globalEnabled: this.enabled });
                return;
            }
            const { shouldSpeak, text: filteredText, reason } = this.filter.filter(text, config);
            if (!shouldSpeak) {
                this.logger.debug('Skipping speech', { reason });
                return;
            }
            this.logger.debug('Filtered text', { originalLength: text.length, filteredLength: filteredText.length });
            await this.say.speak(filteredText, config, {
                onClose: (code) => {
                    if (code !== 0) {
                        this.logger.error('Speech process exited with non-zero code', { code });
                    }
                },
                onError: (error) => {
                    this.logger.error('Speech error', error);
                },
            });
            this.logger.debug('Speech started');
        }, this.logger);
    }
    stop() {
        this.say.stop();
    }
    async getAvailableVoices() {
        return this.say.getAvailableVoices();
    }
    isSpeaking() {
        return this.say.isSpeaking();
    }
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    isEnabled() {
        return this.enabled;
    }
    filterText(text, config) {
        const { text: filtered } = this.filter.filter(text, config);
        return filtered;
    }
    detectSensitive(text) {
        return this.filter.detectSensitive(text);
    }
    removeCodeBlocks(text) {
        return this.filter.removeCodeBlocks(text);
    }
}
//# sourceMappingURL=tts.js.map
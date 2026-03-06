import { TTSConfig, VoiceInfo } from '../types/index.js';
import { SayCommand } from '../infrastructure/say.js';
import { translateText } from '../infrastructure/translate.js';
import { ContentFilter } from './filter.js';
import { createLogger } from '../utils/logger.js';
import { withErrorHandling } from '../utils/error-handler.js';

export class TextToSpeech {
  private say: SayCommand;
  private filter: ContentFilter;
  private enabled: boolean = true;
  private logger = createLogger({ prefix: '[TTS]' });

  constructor() {
    this.say = new SayCommand();
    this.filter = new ContentFilter();
  }

  async speak(text: string, config: TTSConfig): Promise<{ spoken: boolean; reason?: string }> {
    return withErrorHandling('speak', async () => {
      this.logger.debug('Starting speech', { textLength: text.length, config });

      if (!config.enabled || !this.enabled) {
        this.logger.debug('Speech disabled', { configEnabled: config.enabled, globalEnabled: this.enabled });
        return { spoken: false, reason: 'disabled' };
      }

      const { shouldSpeak, text: filteredText, reason } = this.filter.filter(text, config);

      if (!shouldSpeak) {
        this.logger.debug('Skipping speech', { reason });
        return { spoken: false, reason: reason || 'filtered' };
      }

      let speechText = filteredText;
      if (config.language && config.language.toLowerCase() !== 'en') {
        speechText = await translateText(filteredText, config.language);
        this.logger.debug('Translated text', {
          targetLanguage: config.language,
          originalLength: filteredText.length,
          translatedLength: speechText.length,
        });
      }

      this.logger.debug('Filtered text', { originalLength: text.length, filteredLength: speechText.length });

      await this.say.speak(speechText, config, {
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
      return { spoken: true };
    }, this.logger);
  }

  stop(): void {
    this.say.stop();
  }

  async getAvailableVoices(): Promise<VoiceInfo[]> {
    return this.say.getAvailableVoices();
  }

  isSpeaking(): boolean {
    return this.say.isSpeaking();
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  filterText(text: string, config: TTSConfig): string {
    const { text: filtered } = this.filter.filter(text, config);
    return filtered;
  }

  detectSensitive(text: string): boolean {
    return this.filter.detectSensitive(text);
  }

  removeCodeBlocks(text: string): string {
    return this.filter.removeCodeBlocks(text);
  }
}

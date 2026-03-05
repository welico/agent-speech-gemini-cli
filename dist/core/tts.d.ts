import { TTSConfig, VoiceInfo } from '../types/index.js';
export declare class TextToSpeech {
    private say;
    private filter;
    private enabled;
    private logger;
    constructor();
    speak(text: string, config: TTSConfig): Promise<void>;
    stop(): void;
    getAvailableVoices(): Promise<VoiceInfo[]>;
    isSpeaking(): boolean;
    setEnabled(enabled: boolean): void;
    isEnabled(): boolean;
    filterText(text: string, config: TTSConfig): string;
    detectSensitive(text: string): boolean;
    removeCodeBlocks(text: string): string;
}
//# sourceMappingURL=tts.d.ts.map
import { TTSConfig, VoiceInfo } from '../types/index.js';
interface ProcessCallbacks {
    onClose?: (code: number | null) => void;
    onError?: (error: Error) => void;
}
export declare class SayCommand {
    private currentProcess;
    speak(text: string, config: TTSConfig, callbacks?: ProcessCallbacks): Promise<void>;
    stop(): void;
    isSpeaking(): boolean;
    getAvailableVoices(): Promise<VoiceInfo[]>;
    private speakChunks;
    private buildArgs;
    private splitText;
    private execSay;
    private parseVoices;
    private getDefaultVoices;
}
export {};
//# sourceMappingURL=say.d.ts.map
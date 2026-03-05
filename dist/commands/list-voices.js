import { TextToSpeech } from '../core/tts.js';
import { format, formatRow } from '../utils/format.js';
export async function cmdListVoices() {
    const tts = new TextToSpeech();
    const voices = await tts.getAvailableVoices();
    format('Available voices:');
    format('');
    formatRow(['Name', 'Display Name', 'Language'], [16, 20, 15]);
    formatRow(['-'.repeat(16), '-'.repeat(20), '-'.repeat(15)], [16, 20, 15]);
    for (const voice of voices) {
        formatRow([voice.name, voice.displayName, voice.language], [16, 20, 15]);
    }
    return 0;
}
//# sourceMappingURL=list-voices.js.map
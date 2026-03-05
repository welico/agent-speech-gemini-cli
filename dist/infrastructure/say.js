import { spawn } from 'child_process';
const MAX_TEXT_LENGTH = 1000;
export class SayCommand {
    currentProcess = null;
    speak(text, config, callbacks) {
        this.stop();
        const chunks = this.splitText(text, config.maxLength);
        if (chunks.length === 0) {
            return Promise.resolve();
        }
        return this.speakChunks(chunks, config, callbacks);
    }
    stop() {
        if (this.currentProcess) {
            this.currentProcess.kill('SIGTERM');
            this.currentProcess = null;
        }
    }
    isSpeaking() {
        return this.currentProcess !== null;
    }
    async getAvailableVoices() {
        try {
            const result = await this.execSay(['-v', '?']);
            return this.parseVoices(result);
        }
        catch {
            return this.getDefaultVoices();
        }
    }
    speakChunks(chunks, config, callbacks) {
        let index = 0;
        const speakNext = () => {
            if (index >= chunks.length) {
                return Promise.resolve();
            }
            const chunk = chunks[index++];
            return new Promise((resolve, reject) => {
                const args = this.buildArgs(chunk, config);
                this.currentProcess = spawn('say', args, {
                    stdio: 'ignore',
                });
                if (!this.currentProcess) {
                    reject(new Error('Failed to spawn say process'));
                    return;
                }
                this.currentProcess.on('close', (code) => {
                    this.currentProcess = null;
                    callbacks?.onClose?.(code);
                    if (code === 0) {
                        speakNext().then(resolve).catch(reject);
                    }
                    else {
                        reject(new Error(`say exited with code ${code}`));
                    }
                });
                this.currentProcess.on('error', (error) => {
                    this.currentProcess = null;
                    callbacks?.onError?.(error);
                    reject(error);
                });
            });
        };
        return speakNext();
    }
    buildArgs(text, config) {
        const args = [];
        if (config.voice) {
            args.push('-v', config.voice);
        }
        // Speech rate (words per minute) - only add if non-default
        if (config.rate && config.rate !== 200) {
            args.push('-r', config.rate.toString());
        }
        // Volume (0-100, mapped to 0.0-1.0 for say command)
        if (config.volume !== undefined && config.volume !== 50) {
            args.push('-a', (config.volume / 100).toString());
        }
        args.push(text);
        return args;
    }
    // Split text into chunks respecting sentence boundaries
    splitText(text, maxLength) {
        const effectiveMax = maxLength > 0 ? Math.min(maxLength, MAX_TEXT_LENGTH) : MAX_TEXT_LENGTH;
        if (text.length <= effectiveMax) {
            return [text];
        }
        const chunks = [];
        let remaining = text;
        while (remaining.length > 0) {
            let splitIndex = effectiveMax;
            const searchRange = Math.min(effectiveMax, remaining.length);
            const searchStart = Math.max(0, effectiveMax - 100);
            for (let i = searchRange - 1; i >= searchStart; i--) {
                const char = remaining[i];
                if (char === '.' || char === '!' || char === '?') {
                    if (i + 1 >= remaining.length || remaining[i + 1] === ' ' || remaining[i + 1] === '\n') {
                        splitIndex = i + 1;
                        break;
                    }
                }
            }
            if (splitIndex === effectiveMax) {
                for (let i = effectiveMax - 1; i >= effectiveMax - 50; i--) {
                    const char = remaining[i];
                    if (char === ' ' || char === '\n') {
                        splitIndex = i + 1;
                        break;
                    }
                }
            }
            chunks.push(remaining.slice(0, splitIndex).trim());
            remaining = remaining.slice(splitIndex).trim();
        }
        return chunks.filter(chunk => chunk.length > 0);
    }
    async execSay(args) {
        return new Promise((resolve, reject) => {
            const proc = spawn('say', args);
            const chunks = [];
            proc.stdout?.on('data', (chunk) => chunks.push(chunk));
            proc.stderr?.on('data', (chunk) => chunks.push(chunk));
            proc.on('close', (code) => {
                if (code === 0) {
                    resolve(Buffer.concat(chunks).toString('utf-8'));
                }
                else {
                    reject(new Error(`say command failed with code ${code}`));
                }
            });
            proc.on('error', reject);
        });
    }
    parseVoices(output) {
        const lines = output.split('\n');
        const voices = [];
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) {
                continue;
            }
            const match = trimmed.match(/^(\S+)\s+(.+?)\s+([a-z]{2}-[A-Z]{2})/);
            if (match) {
                voices.push({
                    name: match[1],
                    displayName: match[2].trim(),
                    language: match[3],
                });
            }
        }
        return voices;
    }
    getDefaultVoices() {
        return [
            { name: 'Samantha', displayName: 'Samantha', language: 'en-US' },
            { name: 'Alex', displayName: 'Alex', language: 'en-US' },
            { name: 'Victoria', displayName: 'Victoria', language: 'en-US' },
            { name: 'Fred', displayName: 'Fred', language: 'en-US' },
            { name: 'Junior', displayName: 'Junior', language: 'en-US' },
            { name: 'Rishi', displayName: 'Rishi', language: 'en-IN' },
            { name: 'Tessa', displayName: 'Tessa', language: 'en-GB' },
            { name: 'Daniel', displayName: 'Daniel', language: 'en-GB' },
            { name: 'Karen', displayName: 'Karen', language: 'en-AU' },
            { name: 'Moira', displayName: 'Moira', language: 'en-IE' },
        ];
    }
}
//# sourceMappingURL=say.js.map
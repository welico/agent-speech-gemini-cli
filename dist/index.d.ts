/**
 * Agent Speech Extension - Main package exports
 *
 * A Gemini CLI extension that provides text-to-speech for AI responses
 * Platform: macOS
 */
export { TextToSpeech } from './core/tts.js';
export { ConfigManager } from './core/config.js';
export { ContentFilter } from './core/filter.js';
export { SayCommand } from './infrastructure/say.js';
export { MCPServer, createMCPServer } from './infrastructure/mcp-server.js';
export { GeminiCLIIntegration } from './gemini-cli.js';
export type { AppConfig, TTSConfig, FilterConfig, FilterResult, SpeakTextInput, SpeakTextResult, VoiceInfo, } from './types/index.js';
export { getUserHome, getConfigPath, readConfig, writeConfig, configExists, } from './infrastructure/fs.js';
//# sourceMappingURL=index.d.ts.map
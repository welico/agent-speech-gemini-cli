/**
 * Agent Speech Extension - Main package exports
 *
 * A Gemini CLI extension that provides text-to-speech for AI responses
 * Platform: macOS
 */

// Core exports
export { TextToSpeech } from './core/tts.js';
export { ConfigManager } from './core/config.js';
export { ContentFilter } from './core/filter.js';

// Infrastructure exports
export { SayCommand } from './infrastructure/say.js';
export { MCPServer, createMCPServer } from './infrastructure/mcp-server.js';

// Gemini CLI integration
export { GeminiCLIIntegration } from './gemini-cli.js';

// Type exports
export type {
  AppConfig,
  TTSConfig,
  FilterConfig,
  FilterResult,
  SpeakTextInput,
  SpeakTextResult,
  VoiceInfo,
} from './types/index.js';

// File system utilities
export {
  getUserHome,
  getConfigPath,
  readConfig,
  writeConfig,
  configExists,
} from './infrastructure/fs.js';

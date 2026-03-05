#!/usr/bin/env node
/**
 * CLI entry point for Agent Speech Extension
 *
 * Usage:
 *   agent-speech init              Initialize configuration
 *   agent-speech enable            Enable TTS
 *   agent-speech disable           Disable TTS
 *   agent-speech toggle            Toggle TTS on/off
 *   agent-speech status            Show configuration status
 *   agent-speech set-voice <name>  Set voice
 *   agent-speech set-rate <wpm>    Set speech rate
 *   agent-speech set-volume <0-100> Set volume
 *   agent-speech list-voices       List available voices
 *   agent-speech reset             Reset to defaults
 *   agent-speech language          Show/set language
 *   agent-speech mute [on|off]     Mute/unmute
 *   agent-speech help              Show help
 */

import {
  cmdInit,
  cmdEnable,
  cmdDisable,
  cmdToggle,
  cmdStatus,
  cmdSetVoice,
  cmdSetRate,
  cmdSetVolume,
  cmdListVoices,
  cmdReset,
  cmdLanguage,
  cmdMute,
  cmdHelp,
} from './commands/index.js';
import { formatError } from './utils/format.js';

/**
 * Available commands
 */
const COMMANDS = [
  'init',
  'enable',
  'disable',
  'toggle',
  'status',
  'set-voice',
  'set-rate',
  'set-volume',
  'list-voices',
  'reset',
  'language',
  'mute',
  'help',
  '--help',
  '-h',
] as const;

type Command = (typeof COMMANDS)[number];

/**
 * Main CLI entry point
 */
async function main(): Promise<number> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    return cmdHelp();
  }

  const [command, ...commandArgs] = args;

  switch (command as Command) {
    case 'init':
      return await cmdInit();
    case 'enable':
      return await cmdEnable();
    case 'disable':
      return await cmdDisable();
    case 'toggle':
      return await cmdToggle();
    case 'status':
      return await cmdStatus();
    case 'set-voice':
      return await cmdSetVoice(commandArgs[0]);
    case 'set-rate':
      return await cmdSetRate(commandArgs[0]);
    case 'set-volume':
      return await cmdSetVolume(commandArgs[0]);
    case 'list-voices':
      return await cmdListVoices();
    case 'reset':
      return await cmdReset();
    case 'language':
      return await cmdLanguage();
    case 'mute':
      return await cmdMute(commandArgs[0]);
    case 'help':
    case '--help':
    case '-h':
      return cmdHelp();
    default:
      formatError(`Unknown command: ${command}`);
      formatError('Run "agent-speech help" for usage');
      return 1;
  }
}

// Run CLI
main()
  .then((code) => process.exit(code))
  .catch((error) => {
    formatError('Unexpected error:', error);
    process.exit(1);
  });

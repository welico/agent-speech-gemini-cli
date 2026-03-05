import { getUserHome } from '../infrastructure/fs.js';
import { format } from '../utils/format.js';

const TOOLS = ['gemini-cli', 'claude-code', 'opencode', 'codex-cli'] as const;

export function cmdHelp(): number {
  format('Agent Speech Plugin CLI');
  format('');
  format('Usage: agent-speech <command> [options]');
  format('');
  format('Commands:');
  format('  init                    Initialize configuration');
  format('  enable [tool]           Enable TTS for tool (default: gemini-cli)');
  format('  disable [tool]          Disable TTS for tool (default: gemini-cli)');
  format('  toggle [tool]           Toggle TTS on/off (default: gemini-cli)');
  format('  status                  Show configuration status');
  format('  set-voice <name>        Set voice (e.g., Samantha, Alex)');
  format('  set-rate <wpm>          Set speech rate (50-400)');
  format('  set-volume <0-100>      Set volume (0-100)');
  format('  list-voices             List available voices');
  format('  reset                   Reset to defaults');
  format('  language                Select language interactively');
  format('  mute [off]              Set mute duration or cancel mute');
  format('  help                    Show this help');
  format('');
  format('Tools:', TOOLS.join(', '));
  format('');
  format('Config location:', getUserHome() + '/.agent-speech/config.json');

  return 0;
}

import { ConfigManager } from '../core/config.js';
import { TextToSpeech } from '../core/tts.js';
import { getConfigDir, readJSON } from '../infrastructure/fs.js';
import { summarizeForSpeech } from '../utils/summary.js';

type HookInput = {
  prompt_response?: string;
  response?: string;
  text?: string;
};

type HookOutput = {
  suppressOutput?: boolean;
};

type MuteState = {
  until: string | null;
  duration?: string;
};

async function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

async function isMuted(): Promise<boolean> {
  const mutePath = `${getConfigDir()}/mute.json`;
  const mute = await readJSON<MuteState>(mutePath);
  if (!mute) {
    return false;
  }

  if (mute.until === null) {
    return true;
  }

  const expiry = new Date(mute.until).getTime();
  if (Number.isNaN(expiry)) {
    return false;
  }

  return expiry > Date.now();
}

async function main(): Promise<void> {
  const output: HookOutput = { suppressOutput: true };

  try {
    const raw = await readStdin();
    if (!raw.trim()) {
      process.stdout.write(JSON.stringify(output));
      return;
    }

    const input = JSON.parse(raw) as HookInput;
    const responseText = (input.prompt_response || input.response || input.text || '').trim();
    if (!responseText) {
      process.stdout.write(JSON.stringify(output));
      return;
    }

    const text = summarizeForSpeech(responseText);
    if (!text) {
      process.stdout.write(JSON.stringify(output));
      return;
    }

    if (await isMuted()) {
      process.stdout.write(JSON.stringify(output));
      return;
    }

    const configManager = new ConfigManager();
    await configManager.init();
    const settings = configManager.getAll();

    const tts = new TextToSpeech();
    await tts.speak(text, {
      ...settings,
      minLength: 0,
    });
  } catch (error) {
    if (process.env.DEBUG === 'true') {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`[agent-speech after-agent hook] ${message}\n`);
    }
  }

  process.stdout.write(JSON.stringify(output));
}

main().catch(() => {
  process.stdout.write(JSON.stringify({ suppressOutput: true }));
});

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { TextToSpeech } from '../core/tts.js';
import { ConfigManager } from '../core/config.js';
import { createLogger } from '../utils/logger.js';
import { withErrorHandling } from '../utils/error-handler.js';
import { safeValidateSpeakTextInput, safeValidateAgentSpeechCommandInput } from '../utils/schemas.js';

const SPEAK_TOOL_NAME = 'speak_text';
const STATUS_TOOL_NAME = 'agent_speech_status';
const CONTROL_TOOL_NAME = 'agent_speech_command';

export class MCPServer {
  private server: Server;
  private tts: TextToSpeech;
  private config: ConfigManager;
  private logger = createLogger({ prefix: '[MCP]' });

  constructor() {
    this.server = new Server(
      {
        name: 'agent-speech',
        version: '0.1.5',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.tts = new TextToSpeech();
    this.config = new ConfigManager();

    this.setupHandlers();
  }

  async init(): Promise<void> {
    this.logger.debug('Initializing MCP server');
    await this.config.init();
    await this.setupToolListing();
    this.logger.info('MCP server initialized');
  }

  async start(): Promise<void> {
    this.logger.debug('Starting MCP server with stdio transport');
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    this.logger.info('Agent Speech Plugin server started');
  }

  async stop(): Promise<void> {
    this.logger.debug('Stopping MCP server');
    await this.server.close();
    this.logger.info('Agent Speech Plugin server stopped');
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(
      CallToolRequestSchema,
      async (request) => {
        const { name, arguments: args } = request.params;

        if (name === SPEAK_TOOL_NAME) {
          return this.handleSpeak(args);
        }

        if (name === STATUS_TOOL_NAME) {
          return this.handleStatus();
        }

        if (name === CONTROL_TOOL_NAME) {
          return this.handleControl(args);
        }

        return {
          content: [
            {
              type: 'text',
              text: `Unknown tool: ${name}`,
            },
          ],
        };
      }
    );
  }

  private async setupToolListing(): Promise<void> {
    this.server.setRequestHandler(
      ListToolsRequestSchema,
      async () => {
        return {
          tools: [
            {
              name: SPEAK_TOOL_NAME,
              description: 'Convert text to speech using macOS TTS',
              inputSchema: this.getSpeakToolInputSchema(),
            },
            {
              name: STATUS_TOOL_NAME,
              description: 'Read-only status of current agent-speech settings',
              annotations: {
                readOnlyHint: true,
              },
              inputSchema: {
                type: 'object',
                properties: {},
                required: [],
              },
            },
            {
              name: CONTROL_TOOL_NAME,
              description: 'Manage agent-speech settings without shell command execution',
              inputSchema: this.getControlToolInputSchema(),
            },
          ],
        };
      }
    );
  }

  private getSpeakToolInputSchema() {
    return {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Text to speak',
        },
        voice: {
          type: 'string',
          description: 'Voice name (e.g., Samantha, Alex, Victoria)',
        },
        rate: {
          type: 'number',
          description: 'Speech rate in words per minute (50-400)',
        },
        volume: {
          type: 'number',
          description: 'Volume level (0-100)',
        },
      },
      required: ['text'],
    };
  }

  private getControlToolInputSchema() {
    return {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: [
            'enable',
            'disable',
            'toggle',
            'reset',
            'set_voice',
            'set_rate',
            'set_volume',
            'list_voices',
          ],
          description: 'Control action for agent-speech settings',
        },
        value: {
          oneOf: [
            { type: 'string' },
            { type: 'number' },
          ],
          description: 'Optional action value (voice name, rate, or volume)',
        },
      },
      required: ['action'],
    };
  }

  private async handleSpeak(args: unknown): Promise<{
    content: Array<{ type: string; text: string }>;
  }> {
    return withErrorHandling('handleSpeak', async () => {
      this.logger.debug('speak_text called', { args });

      const validation = safeValidateSpeakTextInput(args);
      if (!validation.success) {
        this.logger.error('Validation failed', { error: validation.error });
        throw new Error(validation.error);
      }

      const input = validation.data;
      this.logger.debug('Parsed input', { text: input.text, length: input.text.length });

      const currentConfig = this.config.getAll();
      this.logger.debug('Current config', currentConfig);

      const config = {
        enabled: currentConfig.enabled,
        voice: currentConfig.voice,
        rate: currentConfig.rate,
        volume: currentConfig.volume,
        minLength: currentConfig.minLength,
        maxLength: currentConfig.maxLength,
        filters: currentConfig.filters,
        ...(input.voice && { voice: input.voice }),
        ...(input.rate && { rate: input.rate }),
        ...(input.volume !== undefined && { volume: input.volume }),
      };

      this.logger.debug('Final config', { voice: config.voice, rate: config.rate, volume: config.volume });

      this.tts.speak(input.text, config);

      return {
        content: [
          {
            type: 'text',
            text: `Speaking text with voice "${config.voice}"`,
          },
        ],
      };
    }, this.logger);
  }

  private async handleStatus(): Promise<{
    content: Array<{ type: string; text: string }>;
  }> {
    return withErrorHandling('handleStatus', async () => {
      return {
        content: [
          {
            type: 'text',
            text: this.formatStatusText(),
          },
        ],
      };
    }, this.logger);
  }

  private formatStatusText(): string {
    const settings = this.config.getAll();
    return [
      'Agent Speech status',
      `enabled: ${settings.enabled}`,
      `voice: ${settings.voice}`,
      `rate: ${settings.rate}`,
      `volume: ${settings.volume}`,
      `minLength: ${settings.minLength}`,
      `maxLength: ${settings.maxLength || 'unlimited'}`,
      `filterSensitive: ${settings.filters.sensitive}`,
      `skipCodeBlocks: ${settings.filters.skipCodeBlocks}`,
      `skipCommands: ${settings.filters.skipCommands}`,
    ].join('\n');
  }

  private async handleControl(args: unknown): Promise<{
    content: Array<{ type: string; text: string }>;
  }> {
    return withErrorHandling('handleControl', async () => {
      const validation = safeValidateAgentSpeechCommandInput(args);
      if (!validation.success) {
        throw new Error(validation.error);
      }

      const { action, value } = validation.data;

      switch (action) {
        case 'enable': {
          this.config.set('enabled', true);
          await this.config.save();
          return { content: [{ type: 'text', text: 'Agent Speech enabled.' }] };
        }
        case 'disable': {
          this.config.set('enabled', false);
          await this.config.save();
          return { content: [{ type: 'text', text: 'Agent Speech disabled.' }] };
        }
        case 'toggle': {
          const next = !this.config.get('enabled');
          this.config.set('enabled', next);
          await this.config.save();
          return { content: [{ type: 'text', text: `Agent Speech ${next ? 'enabled' : 'disabled'}.` }] };
        }
        case 'reset': {
          this.config.reset();
          await this.config.save();
          return { content: [{ type: 'text', text: 'Agent Speech settings reset to defaults.' }] };
        }
        case 'set_voice': {
          if (typeof value !== 'string' || !value.trim()) {
            throw new Error('set_voice requires a non-empty string value');
          }
          this.config.set('voice', value.trim());
          await this.config.save();
          return { content: [{ type: 'text', text: `Voice set to ${value.trim()}.` }] };
        }
        case 'set_rate': {
          if (typeof value !== 'number' || value < 50 || value > 400) {
            throw new Error('set_rate requires a number between 50 and 400');
          }
          this.config.set('rate', value);
          await this.config.save();
          return { content: [{ type: 'text', text: `Rate set to ${value}.` }] };
        }
        case 'set_volume': {
          if (typeof value !== 'number' || value < 0 || value > 100) {
            throw new Error('set_volume requires a number between 0 and 100');
          }
          this.config.set('volume', value);
          await this.config.save();
          return { content: [{ type: 'text', text: `Volume set to ${value}.` }] };
        }
        case 'list_voices': {
          const voices = await this.tts.getAvailableVoices();
          const text = voices.length === 0
            ? 'No voices available.'
            : voices.map((voice) => `${voice.name} (${voice.language})`).join('\n');
          return { content: [{ type: 'text', text }] };
        }
        default:
          throw new Error(`Unsupported action: ${action}`);
      }
    }, this.logger);
  }
}

export async function createMCPServer(): Promise<MCPServer> {
  const server = new MCPServer();
  await server.init();
  return server;
}

import { AppConfig } from '../types/index.js';
import {
  readConfig,
  writeConfig,
} from '../infrastructure/fs.js';
import { createLogger } from '../utils/logger.js';

const DEFAULT_CONFIG: AppConfig = {
  version: '2.0.0',
  enabled: true,
  voice: 'Samantha',
  rate: 200,
  volume: 50,
  minLength: 10,
  maxLength: 0,
  filters: {
    sensitive: false,
    skipCodeBlocks: false,
    skipCommands: false,
  },
};

export class ConfigManager {
  private config: AppConfig;
  private dirty: boolean = false;
  private logger = createLogger({ prefix: '[CONFIG]' });

  constructor() {
    this.config = { ...DEFAULT_CONFIG };
  }

  async init(): Promise<void> {
    this.logger.debug('Initializing config manager');

    const loaded = await readConfig();

    if (loaded) {
      this.logger.info('Loaded existing config', { version: loaded.version });
      this.config = this.migrateConfig(loaded);
    } else {
      this.logger.info('Creating new config with defaults');
      this.config = { ...DEFAULT_CONFIG };
    }

    this.dirty = false;
    this.logger.debug('Config initialized', { version: this.config.version });
  }

  private migrateConfig(oldConfig: Record<string, unknown>): AppConfig {
    if (!oldConfig.global && !oldConfig.tools) {
      return {
        ...DEFAULT_CONFIG,
        ...oldConfig,
      } as AppConfig;
    }

    this.logger.info('Migrating config from v1.x to v2.0');

    const global = (oldConfig.global || {}) as Record<string, unknown>;
    const tools = oldConfig.tools as Record<string, Record<string, unknown>> | undefined;
    const claudeTool = tools?.['claude-code'] || {};

    return {
      version: '2.0.0',
      enabled: (claudeTool.enabled ?? global.enabled ?? DEFAULT_CONFIG.enabled) as boolean,
      voice: (claudeTool.voice ?? global.voice ?? DEFAULT_CONFIG.voice) as string,
      rate: (claudeTool.rate ?? global.rate ?? DEFAULT_CONFIG.rate) as number,
      volume: (claudeTool.volume ?? global.volume ?? DEFAULT_CONFIG.volume) as number,
      minLength: (global.minLength ?? DEFAULT_CONFIG.minLength) as number,
      maxLength: (global.maxLength ?? DEFAULT_CONFIG.maxLength) as number,
      filters: (global.filters ?? DEFAULT_CONFIG.filters) as AppConfig['filters'],
      language: oldConfig.language as string | undefined,
    };
  }

  async save(): Promise<void> {
    if (!this.dirty) {
      this.logger.debug('Save skipped: no changes');
      return;
    }

    this.logger.debug('Saving config');
    await writeConfig(this.config);
    this.dirty = false;
    this.logger.info('Config saved');
  }

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }

  getAll(): AppConfig {
    return { ...this.config };
  }

  set<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void {
    (this.config[key] as AppConfig[K]) = value;
    this.dirty = true;
  }

  setMultiple(values: Partial<AppConfig>): void {
    Object.assign(this.config, values);
    this.dirty = true;
  }

  reset(): void {
    this.logger.info('Resetting config to defaults');
    this.config = { ...DEFAULT_CONFIG };
    this.dirty = true;
  }

  validate(): boolean {
    if (
      typeof this.config.enabled !== 'boolean' ||
      typeof this.config.voice !== 'string' ||
      typeof this.config.rate !== 'number' ||
      typeof this.config.volume !== 'number' ||
      typeof this.config.minLength !== 'number' ||
      typeof this.config.maxLength !== 'number'
    ) {
      return false;
    }

    if (this.config.rate < 50 || this.config.rate > 400) {
      return false;
    }

    if (this.config.volume < 0 || this.config.volume > 100) {
      return false;
    }

    if (this.config.minLength < 0 || this.config.maxLength < 0) {
      return false;
    }

    return true;
  }

  getVersion(): string {
    return this.config.version;
  }
}

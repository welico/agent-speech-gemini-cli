import { readConfig, writeConfig, } from '../infrastructure/fs.js';
import { createLogger } from '../utils/logger.js';
const DEFAULT_CONFIG = {
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
    config;
    dirty = false;
    logger = createLogger({ prefix: '[CONFIG]' });
    constructor() {
        this.config = { ...DEFAULT_CONFIG };
    }
    async init() {
        this.logger.debug('Initializing config manager');
        const loaded = await readConfig();
        if (loaded) {
            this.logger.info('Loaded existing config', { version: loaded.version });
            this.config = this.migrateConfig(loaded);
        }
        else {
            this.logger.info('Creating new config with defaults');
            this.config = { ...DEFAULT_CONFIG };
        }
        this.dirty = false;
        this.logger.debug('Config initialized', { version: this.config.version });
    }
    migrateConfig(oldConfig) {
        if (!oldConfig.global && !oldConfig.tools) {
            return {
                ...DEFAULT_CONFIG,
                ...oldConfig,
            };
        }
        this.logger.info('Migrating config from v1.x to v2.0');
        const global = (oldConfig.global || {});
        const tools = oldConfig.tools;
        const claudeTool = tools?.['claude-code'] || {};
        return {
            version: '2.0.0',
            enabled: (claudeTool.enabled ?? global.enabled ?? DEFAULT_CONFIG.enabled),
            voice: (claudeTool.voice ?? global.voice ?? DEFAULT_CONFIG.voice),
            rate: (claudeTool.rate ?? global.rate ?? DEFAULT_CONFIG.rate),
            volume: (claudeTool.volume ?? global.volume ?? DEFAULT_CONFIG.volume),
            minLength: (global.minLength ?? DEFAULT_CONFIG.minLength),
            maxLength: (global.maxLength ?? DEFAULT_CONFIG.maxLength),
            filters: (global.filters ?? DEFAULT_CONFIG.filters),
            language: oldConfig.language,
        };
    }
    async save() {
        if (!this.dirty) {
            this.logger.debug('Save skipped: no changes');
            return;
        }
        this.logger.debug('Saving config');
        await writeConfig(this.config);
        this.dirty = false;
        this.logger.info('Config saved');
    }
    get(key) {
        return this.config[key];
    }
    getAll() {
        return { ...this.config };
    }
    set(key, value) {
        this.config[key] = value;
        this.dirty = true;
    }
    setMultiple(values) {
        Object.assign(this.config, values);
        this.dirty = true;
    }
    reset() {
        this.logger.info('Resetting config to defaults');
        this.config = { ...DEFAULT_CONFIG };
        this.dirty = true;
    }
    validate() {
        if (typeof this.config.enabled !== 'boolean' ||
            typeof this.config.voice !== 'string' ||
            typeof this.config.rate !== 'number' ||
            typeof this.config.volume !== 'number' ||
            typeof this.config.minLength !== 'number' ||
            typeof this.config.maxLength !== 'number') {
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
    getVersion() {
        return this.config.version;
    }
}
//# sourceMappingURL=config.js.map
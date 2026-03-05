import { AppConfig } from '../types/index.js';
export declare class ConfigManager {
    private config;
    private dirty;
    private logger;
    constructor();
    init(): Promise<void>;
    private migrateConfig;
    save(): Promise<void>;
    get<K extends keyof AppConfig>(key: K): AppConfig[K];
    getAll(): AppConfig;
    set<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void;
    setMultiple(values: Partial<AppConfig>): void;
    reset(): void;
    validate(): boolean;
    getVersion(): string;
}
//# sourceMappingURL=config.d.ts.map
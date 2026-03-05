import { AppConfig } from '../types/index.js';
export declare function getUserHome(): string;
export declare function getConfigPath(): string;
export declare function getConfigDir(): string;
export declare function ensureConfigDir(): Promise<void>;
export declare function readJSON<T = unknown>(path: string): Promise<T | null>;
export declare function writeJSON<T>(path: string, data: T): Promise<void>;
export declare function readConfig(): Promise<Record<string, unknown> | null>;
export declare function writeConfig(config: AppConfig): Promise<void>;
export declare function configExists(): boolean;
//# sourceMappingURL=fs.d.ts.map
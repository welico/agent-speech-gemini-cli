import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { AppConfig } from '../types/index.js';

const DEFAULT_CONFIG_DIR = '.agent-speech';
const CONFIG_FILE_NAME = 'config.json';

export function getUserHome(): string {
  return process.env.HOME || process.env.USERPROFILE || '.';
}

export function getConfigPath(): string {
  return join(getUserHome(), DEFAULT_CONFIG_DIR, CONFIG_FILE_NAME);
}

export function getConfigDir(): string {
  return join(getUserHome(), DEFAULT_CONFIG_DIR);
}

export async function ensureConfigDir(): Promise<void> {
  const dir = getConfigDir();
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

export async function readJSON<T = unknown>(path: string): Promise<T | null> {
  try {
    const content = await readFile(path, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

export async function writeJSON<T>(path: string, data: T): Promise<void> {
  await ensureConfigDir();
  const dir = dirname(path);

  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }

  await writeFile(path, JSON.stringify(data, null, 2), 'utf-8');
}

export async function readConfig(): Promise<Record<string, unknown> | null> {
  return readJSON<Record<string, unknown>>(getConfigPath());
}

export async function writeConfig(config: AppConfig): Promise<void> {
  await writeJSON(getConfigPath(), config);
}

export function configExists(): boolean {
  return existsSync(getConfigPath());
}

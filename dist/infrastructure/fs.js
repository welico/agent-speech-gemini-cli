import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
const DEFAULT_CONFIG_DIR = '.agent-speech';
const CONFIG_FILE_NAME = 'config.json';
export function getUserHome() {
    return process.env.HOME || process.env.USERPROFILE || '.';
}
export function getConfigPath() {
    return join(getUserHome(), DEFAULT_CONFIG_DIR, CONFIG_FILE_NAME);
}
export function getConfigDir() {
    return join(getUserHome(), DEFAULT_CONFIG_DIR);
}
export async function ensureConfigDir() {
    const dir = getConfigDir();
    if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
    }
}
export async function readJSON(path) {
    try {
        const content = await readFile(path, 'utf-8');
        return JSON.parse(content);
    }
    catch {
        return null;
    }
}
export async function writeJSON(path, data) {
    await ensureConfigDir();
    const dir = dirname(path);
    if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
    }
    await writeFile(path, JSON.stringify(data, null, 2), 'utf-8');
}
export async function readConfig() {
    return readJSON(getConfigPath());
}
export async function writeConfig(config) {
    await writeJSON(getConfigPath(), config);
}
export function configExists() {
    return existsSync(getConfigPath());
}
//# sourceMappingURL=fs.js.map
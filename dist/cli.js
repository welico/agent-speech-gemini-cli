#!/usr/bin/env node
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/infrastructure/fs.ts
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join, dirname } from "path";
var DEFAULT_CONFIG_DIR = ".agent-speech";
var CONFIG_FILE_NAME = "config.json";
function getUserHome() {
  return process.env.HOME || process.env.USERPROFILE || ".";
}
__name(getUserHome, "getUserHome");
function getConfigPath() {
  return join(getUserHome(), DEFAULT_CONFIG_DIR, CONFIG_FILE_NAME);
}
__name(getConfigPath, "getConfigPath");
function getConfigDir() {
  return join(getUserHome(), DEFAULT_CONFIG_DIR);
}
__name(getConfigDir, "getConfigDir");
async function ensureConfigDir() {
  const dir = getConfigDir();
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}
__name(ensureConfigDir, "ensureConfigDir");
async function readJSON(path2) {
  try {
    const content = await readFile(path2, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}
__name(readJSON, "readJSON");
async function writeJSON(path2, data) {
  await ensureConfigDir();
  const dir = dirname(path2);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  await writeFile(path2, JSON.stringify(data, null, 2), "utf-8");
}
__name(writeJSON, "writeJSON");
async function readConfig() {
  return readJSON(getConfigPath());
}
__name(readConfig, "readConfig");
async function writeConfig(config) {
  await writeJSON(getConfigPath(), config);
}
__name(writeConfig, "writeConfig");

// src/utils/logger.ts
import fs from "node:fs";
import path from "node:path";
var DEFAULT_CONFIG = {
  enabled: process.env.DEBUG === "true",
  level: process.env.LOG_LEVEL || "debug",
  output: "both",
  filePath: process.env.LOG_FILE || "/tmp/agent-speech-debug.log",
  prefix: "[DEBUG]",
  maxSize: 10 * 1024 * 1024,
  // 10MB
  maxFiles: 3
};
function createLogger(config) {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const logLevels = { debug: 0, info: 1, warn: 2, error: 3 };
  function writeToFile(entry) {
    try {
      const logDir = path.dirname(cfg.filePath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      if (fs.existsSync(cfg.filePath)) {
        const stats = fs.statSync(cfg.filePath);
        if (stats.size >= cfg.maxSize) {
          rotateLogs();
        }
      }
      fs.appendFileSync(cfg.filePath, entry + "\n");
    } catch (error) {
      console.error("[LOGGER] Failed to write to file:", error);
    }
  }
  __name(writeToFile, "writeToFile");
  function rotateLogs() {
    for (let i = cfg.maxFiles - 1; i >= 1; i--) {
      const oldFile = `${cfg.filePath}.${i}`;
      const newFile = `${cfg.filePath}.${i + 1}`;
      if (fs.existsSync(oldFile)) {
        fs.renameSync(oldFile, newFile);
      }
    }
    if (fs.existsSync(cfg.filePath)) {
      fs.renameSync(cfg.filePath, `${cfg.filePath}.1`);
    }
  }
  __name(rotateLogs, "rotateLogs");
  function log(level, message, data) {
    if (!cfg.enabled || logLevels[level] < logLevels[cfg.level]) {
      return;
    }
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const prefix = `${cfg.prefix} [${level.toUpperCase()}]`;
    const logMessage = `${prefix} ${message}`;
    if (cfg.output === "stderr" || cfg.output === "both") {
      if (data) {
        console.error(logMessage, data);
      } else {
        console.error(logMessage);
      }
    }
    if (cfg.output === "file" || cfg.output === "both") {
      const logEntry = JSON.stringify({ timestamp, level, message, data });
      writeToFile(logEntry);
    }
  }
  __name(log, "log");
  return {
    debug: /* @__PURE__ */ __name((message, data) => log("debug", message, data), "debug"),
    info: /* @__PURE__ */ __name((message, data) => log("info", message, data), "info"),
    warn: /* @__PURE__ */ __name((message, data) => log("warn", message, data), "warn"),
    error: /* @__PURE__ */ __name((message, data) => log("error", message, data), "error"),
    enable: /* @__PURE__ */ __name((enabled) => {
      cfg.enabled = enabled;
    }, "enable"),
    setLevel: /* @__PURE__ */ __name((level) => {
      cfg.level = level;
    }, "setLevel")
  };
}
__name(createLogger, "createLogger");
var logger = createLogger();

// src/core/config.ts
var DEFAULT_CONFIG2 = {
  version: "2.0.0",
  enabled: true,
  voice: "Samantha",
  rate: 200,
  volume: 50,
  minLength: 10,
  maxLength: 0,
  filters: {
    sensitive: false,
    skipCodeBlocks: false,
    skipCommands: false
  },
  language: "en"
};
var ConfigManager = class {
  static {
    __name(this, "ConfigManager");
  }
  config;
  dirty = false;
  logger = createLogger({ prefix: "[CONFIG]" });
  constructor() {
    this.config = { ...DEFAULT_CONFIG2 };
  }
  async init() {
    this.logger.debug("Initializing config manager");
    const loaded = await readConfig();
    if (loaded) {
      this.logger.info("Loaded existing config", { version: loaded.version });
      this.config = this.migrateConfig(loaded);
    } else {
      this.logger.info("Creating new config with defaults");
      this.config = { ...DEFAULT_CONFIG2 };
    }
    this.dirty = false;
    this.logger.debug("Config initialized", { version: this.config.version });
  }
  migrateConfig(oldConfig) {
    if (!oldConfig.global && !oldConfig.tools) {
      return {
        ...DEFAULT_CONFIG2,
        ...oldConfig
      };
    }
    this.logger.info("Migrating config from v1.x to v2.0");
    const global = oldConfig.global || {};
    const tools = oldConfig.tools;
    const claudeTool = tools?.["claude-code"] || {};
    return {
      version: "2.0.0",
      enabled: claudeTool.enabled ?? global.enabled ?? DEFAULT_CONFIG2.enabled,
      voice: claudeTool.voice ?? global.voice ?? DEFAULT_CONFIG2.voice,
      rate: claudeTool.rate ?? global.rate ?? DEFAULT_CONFIG2.rate,
      volume: claudeTool.volume ?? global.volume ?? DEFAULT_CONFIG2.volume,
      minLength: global.minLength ?? DEFAULT_CONFIG2.minLength,
      maxLength: global.maxLength ?? DEFAULT_CONFIG2.maxLength,
      filters: global.filters ?? DEFAULT_CONFIG2.filters,
      language: oldConfig.language || "en"
    };
  }
  async save() {
    if (!this.dirty) {
      this.logger.debug("Save skipped: no changes");
      return;
    }
    this.logger.debug("Saving config");
    await writeConfig(this.config);
    this.dirty = false;
    this.logger.info("Config saved");
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
    this.logger.info("Resetting config to defaults");
    this.config = { ...DEFAULT_CONFIG2 };
    this.dirty = true;
  }
  validate() {
    if (typeof this.config.enabled !== "boolean" || typeof this.config.voice !== "string" || typeof this.config.rate !== "number" || typeof this.config.volume !== "number" || typeof this.config.minLength !== "number" || typeof this.config.maxLength !== "number") {
      return false;
    }
    if (this.config.language !== void 0 && typeof this.config.language !== "string") {
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
};

// src/utils/format.ts
var PREFIX = "[agent-speech]";
function format(...args) {
  console.log(PREFIX, ...args);
}
__name(format, "format");
function formatError(...args) {
  console.error(`${PREFIX} ERROR`, ...args);
}
__name(formatError, "formatError");
function formatSuccess(...args) {
  console.log(`${PREFIX} SUCCESS`, ...args);
}
__name(formatSuccess, "formatSuccess");
function formatInfo(...args) {
  console.log(`${PREFIX} INFO`, ...args);
}
__name(formatInfo, "formatInfo");
function formatRow(columns, widths) {
  const padded = columns.map((col, i) => col.padEnd(widths[i]));
  console.log("  " + padded.join("  "));
}
__name(formatRow, "formatRow");
function formatListItem(item, enabled) {
  const status = enabled === void 0 ? "" : enabled ? "+ " : "- ";
  console.log(`  ${status}${item}`);
}
__name(formatListItem, "formatListItem");

// src/commands/init.ts
async function cmdInit() {
  const config = new ConfigManager();
  await config.init();
  await config.save();
  formatSuccess("Configuration initialized at", getUserHome() + "/.agent-speech/config.json");
  format("Settings:");
  const settings = config.getAll();
  format("  enabled:", settings.enabled);
  format("  voice:", settings.voice);
  format("  rate:", settings.rate);
  format("  volume:", settings.volume);
  return 0;
}
__name(cmdInit, "cmdInit");

// src/commands/enable.ts
async function cmdEnable() {
  const config = new ConfigManager();
  await config.init();
  config.set("enabled", true);
  await config.save();
  formatSuccess("TTS enabled");
  return 0;
}
__name(cmdEnable, "cmdEnable");

// src/commands/disable.ts
async function cmdDisable() {
  const config = new ConfigManager();
  await config.init();
  config.set("enabled", false);
  await config.save();
  formatSuccess("TTS disabled");
  return 0;
}
__name(cmdDisable, "cmdDisable");

// src/commands/toggle.ts
async function cmdToggle() {
  const config = new ConfigManager();
  await config.init();
  const current = config.get("enabled");
  const newState = !current;
  config.set("enabled", newState);
  await config.save();
  if (newState) {
    formatSuccess("TTS enabled");
  } else {
    formatInfo("TTS disabled");
  }
  return 0;
}
__name(cmdToggle, "cmdToggle");

// src/commands/status.ts
import { existsSync as existsSync2 } from "fs";
import { promises } from "fs";
async function cmdStatus() {
  const config = new ConfigManager();
  await config.init();
  format("Configuration status:");
  format("  version:", config.getVersion());
  format("");
  format("Settings:");
  const settings = config.getAll();
  format("  enabled:", settings.enabled);
  format("  voice:", settings.voice);
  format("  language:", settings.language || "en");
  format("  rate:", settings.rate, "WPM");
  format("  volume:", settings.volume);
  format("  min length:", settings.minLength);
  format("  max length:", settings.maxLength || "unlimited");
  format("  filters:");
  format("    sensitive:", settings.filters.sensitive);
  format("    skipCodeBlocks:", settings.filters.skipCodeBlocks);
  format("    skipCommands:", settings.filters.skipCommands);
  format("");
  const MUTE_PATH2 = `${getConfigDir()}/mute.json`;
  format("Mute status:");
  if (existsSync2(MUTE_PATH2)) {
    try {
      const muteData = await readJSON(MUTE_PATH2);
      if (muteData.until === null) {
        formatListItem("muted: permanent", false);
      } else {
        const now = /* @__PURE__ */ new Date();
        const expiry = new Date(muteData.until);
        const remaining = expiry.getTime() - now.getTime();
        if (remaining > 0) {
          const minutes = Math.floor(remaining / 6e4);
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          let timeStr;
          if (hours > 0) {
            timeStr = `${hours} hour${hours > 1 ? "s" : ""} and ${mins} minute${mins > 1 ? "s" : ""}`;
          } else {
            timeStr = `${minutes} minute${minutes > 1 ? "s" : ""}`;
          }
          formatListItem(`muted: ${timeStr} remaining`, false);
        } else {
          promises.unlink(MUTE_PATH2);
          formatListItem("muted: expired (auto-removed)", true);
        }
      }
    } catch {
      promises.unlink(MUTE_PATH2);
      formatListItem("muted: file removed (corrupt)", true);
    }
  } else {
    formatListItem("muted: off", true);
  }
  return 0;
}
__name(cmdStatus, "cmdStatus");

// src/commands/set-voice.ts
async function cmdSetVoice(voice) {
  if (!voice) {
    formatError("Voice name is required");
    return 1;
  }
  const config = new ConfigManager();
  await config.init();
  config.set("voice", voice);
  await config.save();
  formatSuccess(`Voice set to ${voice}`);
  return 0;
}
__name(cmdSetVoice, "cmdSetVoice");

// src/commands/set-rate.ts
async function cmdSetRate(rate) {
  if (!rate) {
    formatError("Rate is required (50-400 words per minute)");
    return 1;
  }
  const rateNum = parseInt(rate, 10);
  if (isNaN(rateNum) || rateNum < 50 || rateNum > 400) {
    formatError("Rate must be between 50 and 400");
    return 1;
  }
  const config = new ConfigManager();
  await config.init();
  config.set("rate", rateNum);
  await config.save();
  formatSuccess(`Speech rate set to ${rateNum} WPM`);
  return 0;
}
__name(cmdSetRate, "cmdSetRate");

// src/commands/set-volume.ts
async function cmdSetVolume(volume) {
  if (!volume) {
    formatError("Volume is required (0-100)");
    return 1;
  }
  const volumeNum = parseInt(volume, 10);
  if (isNaN(volumeNum) || volumeNum < 0 || volumeNum > 100) {
    formatError("Volume must be between 0 and 100");
    return 1;
  }
  const config = new ConfigManager();
  await config.init();
  config.set("volume", volumeNum);
  await config.save();
  formatSuccess(`Volume set to ${volumeNum}`);
  return 0;
}
__name(cmdSetVolume, "cmdSetVolume");

// src/infrastructure/say.ts
import { spawn } from "child_process";
var MAX_TEXT_LENGTH = 1e3;
var SayCommand = class {
  static {
    __name(this, "SayCommand");
  }
  currentProcess = null;
  speak(text, config, callbacks) {
    this.stop();
    const chunks = this.splitText(text, config.maxLength);
    if (chunks.length === 0) {
      return Promise.resolve();
    }
    return this.speakChunks(chunks, config, callbacks);
  }
  stop() {
    if (this.currentProcess) {
      this.currentProcess.kill("SIGTERM");
      this.currentProcess = null;
    }
  }
  isSpeaking() {
    return this.currentProcess !== null;
  }
  async getAvailableVoices() {
    try {
      const result = await this.execSay(["-v", "?"]);
      return this.parseVoices(result);
    } catch {
      return this.getDefaultVoices();
    }
  }
  speakChunks(chunks, config, callbacks) {
    let index = 0;
    const speakNext = /* @__PURE__ */ __name(() => {
      if (index >= chunks.length) {
        return Promise.resolve();
      }
      const chunk = chunks[index++];
      return new Promise((resolve, reject) => {
        const args = this.buildArgs(chunk, config);
        this.currentProcess = spawn("say", args, {
          stdio: "ignore"
        });
        if (!this.currentProcess) {
          reject(new Error("Failed to spawn say process"));
          return;
        }
        this.currentProcess.on("close", (code) => {
          this.currentProcess = null;
          callbacks?.onClose?.(code);
          if (code === 0) {
            speakNext().then(resolve).catch(reject);
          } else {
            reject(new Error(`say exited with code ${code}`));
          }
        });
        this.currentProcess.on("error", (error) => {
          this.currentProcess = null;
          callbacks?.onError?.(error);
          reject(error);
        });
      });
    }, "speakNext");
    return speakNext();
  }
  buildArgs(text, config) {
    const args = [];
    if (config.voice) {
      args.push("-v", config.voice);
    }
    if (config.rate && config.rate !== 200) {
      args.push("-r", config.rate.toString());
    }
    if (config.volume !== void 0 && config.volume !== 50) {
      args.push("-a", (config.volume / 100).toString());
    }
    args.push(text);
    return args;
  }
  // Split text into chunks respecting sentence boundaries
  splitText(text, maxLength) {
    const effectiveMax = maxLength > 0 ? Math.min(maxLength, MAX_TEXT_LENGTH) : MAX_TEXT_LENGTH;
    if (text.length <= effectiveMax) {
      return [text];
    }
    const chunks = [];
    let remaining = text;
    while (remaining.length > 0) {
      let splitIndex = effectiveMax;
      const searchRange = Math.min(effectiveMax, remaining.length);
      const searchStart = Math.max(0, effectiveMax - 100);
      for (let i = searchRange - 1; i >= searchStart; i--) {
        const char = remaining[i];
        if (char === "." || char === "!" || char === "?") {
          if (i + 1 >= remaining.length || remaining[i + 1] === " " || remaining[i + 1] === "\n") {
            splitIndex = i + 1;
            break;
          }
        }
      }
      if (splitIndex === effectiveMax) {
        for (let i = effectiveMax - 1; i >= effectiveMax - 50; i--) {
          const char = remaining[i];
          if (char === " " || char === "\n") {
            splitIndex = i + 1;
            break;
          }
        }
      }
      chunks.push(remaining.slice(0, splitIndex).trim());
      remaining = remaining.slice(splitIndex).trim();
    }
    return chunks.filter((chunk) => chunk.length > 0);
  }
  async execSay(args) {
    return new Promise((resolve, reject) => {
      const proc = spawn("say", args);
      const chunks = [];
      proc.stdout?.on("data", (chunk) => chunks.push(chunk));
      proc.stderr?.on("data", (chunk) => chunks.push(chunk));
      proc.on("close", (code) => {
        if (code === 0) {
          resolve(Buffer.concat(chunks).toString("utf-8"));
        } else {
          reject(new Error(`say command failed with code ${code}`));
        }
      });
      proc.on("error", reject);
    });
  }
  parseVoices(output) {
    const lines = output.split("\n");
    const voices = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }
      const match = trimmed.match(/^(\S+)\s+(.+?)\s+([a-z]{2}[-_][A-Z]{2})/);
      if (match) {
        voices.push({
          name: match[1],
          displayName: match[2].trim(),
          language: match[3].replace("_", "-")
        });
      }
    }
    return voices;
  }
  getDefaultVoices() {
    return [
      { name: "Samantha", displayName: "Samantha", language: "en-US" },
      { name: "Alex", displayName: "Alex", language: "en-US" },
      { name: "Victoria", displayName: "Victoria", language: "en-US" },
      { name: "Fred", displayName: "Fred", language: "en-US" },
      { name: "Junior", displayName: "Junior", language: "en-US" },
      { name: "Rishi", displayName: "Rishi", language: "en-IN" },
      { name: "Tessa", displayName: "Tessa", language: "en-GB" },
      { name: "Daniel", displayName: "Daniel", language: "en-GB" },
      { name: "Karen", displayName: "Karen", language: "en-AU" },
      { name: "Moira", displayName: "Moira", language: "en-IE" }
    ];
  }
};

// src/infrastructure/translate.ts
import https from "https";
var TRANSLATE_CHUNK_SIZE = 1500;
function safeTranslateChunks(data) {
  const parts = Array.isArray(data[0]) ? data[0] : [];
  return parts.map((item) => Array.isArray(item) && typeof item[0] === "string" ? item[0] : "").join("").trim();
}
__name(safeTranslateChunks, "safeTranslateChunks");
async function translateText(text, targetLanguage) {
  const trimmed = text.trim();
  if (!trimmed) {
    return text;
  }
  const tl = targetLanguage.trim();
  if (!tl || tl.toLowerCase() === "en") {
    return text;
  }
  const chunks = [];
  for (let i = 0; i < trimmed.length; i += TRANSLATE_CHUNK_SIZE) {
    chunks.push(trimmed.slice(i, i + TRANSLATE_CHUNK_SIZE));
  }
  const translatedParts = [];
  for (const chunk of chunks) {
    const q = encodeURIComponent(chunk);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(tl)}&dt=t&q=${q}`;
    const body = await new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = "";
        res.setEncoding("utf8");
        res.on("data", (part) => {
          data += part;
        });
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`Translation API failed with status ${res.statusCode}`));
            return;
          }
          resolve(data);
        });
      }).on("error", reject);
    });
    const parsed = JSON.parse(body);
    translatedParts.push(safeTranslateChunks(parsed) || chunk);
  }
  const translated = translatedParts.join("").trim();
  return translated || text;
}
__name(translateText, "translateText");

// src/core/filter.ts
var SENSITIVE_PATTERNS = [
  /(?:api[_-]?key|apikey|api-key)['":\s]*([a-zA-Z0-9_\-]{20,})/gi,
  /(?:password|passwd|pwd)['":\s]*([^\s,;]{6,})/gi,
  /(?:token|bearer|auth)['":\s]*([a-zA-Z0-9._\-]{20,})/gi,
  /(?:secret|private[_-]?key|privatekey)['":\s]*([a-zA-Z0-9_\-]{20,})/gi,
  /AKIA[0-9A-Z]{16}/g,
  /(?:["']?)([A-Za-z0-9+/]{40,}={0,2})(?:["']?\s*(?:,|\)|}))/g
];
var CODE_BLOCK_PATTERNS = [
  /```[\s\S]*?```/g,
  /`[^`]+`/g,
  /\$[^$]+$/g,
  /^[\s]*[>\$].+$/gm
];
var COMMAND_OUTPUT_PATTERNS = [
  /^[+\-]{3,}$/gm,
  /^\s*(BUILD|FAILED|SUCCESS|INFO|DEBUG|WARN|ERROR)\b/gm
];
var ContentFilter = class {
  static {
    __name(this, "ContentFilter");
  }
  filter(text, config) {
    let filteredText = text;
    if (config.minLength > 0 && text.length < config.minLength) {
      return {
        shouldSpeak: false,
        text: "",
        reason: `Text length (${text.length}) is below minimum (${config.minLength})`
      };
    }
    if (config.maxLength > 0 && text.length > config.maxLength) {
      return {
        shouldSpeak: false,
        text: "",
        reason: `Text length (${text.length}) exceeds maximum (${config.maxLength})`
      };
    }
    if (config.filters.sensitive) {
      filteredText = this.filterSensitive(filteredText);
    }
    if (config.filters.skipCodeBlocks) {
      filteredText = this.removeCodeBlocks(filteredText);
    }
    if (config.filters.skipCommands) {
      filteredText = this.removeCommandOutputs(filteredText);
    }
    filteredText = this.cleanupWhitespace(filteredText);
    return {
      shouldSpeak: filteredText.trim().length > 0,
      text: filteredText
    };
  }
  detectSensitive(text) {
    const lowerText = text.toLowerCase();
    for (const pattern of SENSITIVE_PATTERNS) {
      if (pattern.test(text)) {
        return true;
      }
    }
    const sensitiveKeywords = [
      "password",
      "passwd",
      "pwd",
      "secret",
      "private key",
      "api key",
      "apikey",
      "access token",
      "auth token",
      "bearer token"
    ];
    for (const keyword of sensitiveKeywords) {
      if (lowerText.includes(keyword)) {
        return true;
      }
    }
    return false;
  }
  removeCodeBlocks(text) {
    let result = text;
    for (const pattern of CODE_BLOCK_PATTERNS) {
      result = result.replace(pattern, "");
    }
    return result;
  }
  removeCommandOutputs(text) {
    let result = text;
    for (const pattern of COMMAND_OUTPUT_PATTERNS) {
      result = result.replace(pattern, "");
    }
    return result;
  }
  filterSensitive(text) {
    let result = text;
    for (const pattern of SENSITIVE_PATTERNS) {
      result = result.replace(pattern, (_match, _group1) => {
        return "[REDACTED]";
      });
    }
    result = result.replace(/^export\s+\w+\s*=\s*['"][\w\-]+['"]/gm, 'export $1 = "[REDACTED]"');
    return result;
  }
  cleanupWhitespace(text) {
    return text.replace(/\n{3,}/g, "\n\n").replace(/[ \t]+/g, " ").replace(/^\s+|\s+$/gm, "");
  }
};

// src/utils/error-handler.ts
var DebugError = class extends Error {
  static {
    __name(this, "DebugError");
  }
  code;
  details;
  constructor(code, message, details = {}) {
    super(message);
    this.name = "DebugError";
    this.code = code;
    this.details = details;
  }
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details
    };
  }
};
async function withErrorHandling(operation, fn, logger2) {
  try {
    logger2?.debug(`Starting: ${operation}`);
    const result = await fn();
    logger2?.debug(`Completed: ${operation}`);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : void 0;
    logger2?.error(`Failed: ${operation}`, { message, stack });
    throw new DebugError(
      "OPERATION_FAILED",
      `${operation} failed: ${message}`,
      { originalError: message, stack }
    );
  }
}
__name(withErrorHandling, "withErrorHandling");

// src/core/tts.ts
var TextToSpeech = class {
  static {
    __name(this, "TextToSpeech");
  }
  say;
  filter;
  enabled = true;
  logger = createLogger({ prefix: "[TTS]" });
  constructor() {
    this.say = new SayCommand();
    this.filter = new ContentFilter();
  }
  async speak(text, config) {
    return withErrorHandling("speak", async () => {
      this.logger.debug("Starting speech", { textLength: text.length, config });
      if (!config.enabled || !this.enabled) {
        this.logger.debug("Speech disabled", { configEnabled: config.enabled, globalEnabled: this.enabled });
        return { spoken: false, reason: "disabled" };
      }
      const { shouldSpeak, text: filteredText, reason } = this.filter.filter(text, config);
      if (!shouldSpeak) {
        this.logger.debug("Skipping speech", { reason });
        return { spoken: false, reason: reason || "filtered" };
      }
      let speechText = filteredText;
      if (config.language && config.language.toLowerCase() !== "en") {
        speechText = await translateText(filteredText, config.language);
        this.logger.debug("Translated text", {
          targetLanguage: config.language,
          originalLength: filteredText.length,
          translatedLength: speechText.length
        });
      }
      this.logger.debug("Filtered text", { originalLength: text.length, filteredLength: speechText.length });
      await this.say.speak(speechText, config, {
        onClose: /* @__PURE__ */ __name((code) => {
          if (code !== 0) {
            this.logger.error("Speech process exited with non-zero code", { code });
          }
        }, "onClose"),
        onError: /* @__PURE__ */ __name((error) => {
          this.logger.error("Speech error", error);
        }, "onError")
      });
      this.logger.debug("Speech started");
      return { spoken: true };
    }, this.logger);
  }
  stop() {
    this.say.stop();
  }
  async getAvailableVoices() {
    return this.say.getAvailableVoices();
  }
  isSpeaking() {
    return this.say.isSpeaking();
  }
  setEnabled(enabled) {
    this.enabled = enabled;
  }
  isEnabled() {
    return this.enabled;
  }
  filterText(text, config) {
    const { text: filtered } = this.filter.filter(text, config);
    return filtered;
  }
  detectSensitive(text) {
    return this.filter.detectSensitive(text);
  }
  removeCodeBlocks(text) {
    return this.filter.removeCodeBlocks(text);
  }
};

// src/commands/list-voices.ts
async function cmdListVoices() {
  const tts = new TextToSpeech();
  const voices = await tts.getAvailableVoices();
  format("Available voices:");
  format("");
  formatRow(
    ["Name", "Display Name", "Language"],
    [16, 20, 15]
  );
  formatRow(
    ["-".repeat(16), "-".repeat(20), "-".repeat(15)],
    [16, 20, 15]
  );
  for (const voice of voices) {
    formatRow(
      [voice.name, voice.displayName, voice.language],
      [16, 20, 15]
    );
  }
  return 0;
}
__name(cmdListVoices, "cmdListVoices");

// src/commands/reset.ts
async function cmdReset() {
  const config = new ConfigManager();
  await config.init();
  await config.init();
  await config.save();
  formatSuccess("Configuration reset to defaults");
  return 0;
}
__name(cmdReset, "cmdReset");

// src/utils/language.ts
var SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "ko", name: "Korean" },
  { code: "ja", name: "Japanese" },
  { code: "zh-CN", name: "Chinese (Simplified)" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" }
];
function normalizeLanguageCode(input) {
  const code = input.trim();
  if (code.toLowerCase() === "zh") {
    return "zh-CN";
  }
  return code;
}
__name(normalizeLanguageCode, "normalizeLanguageCode");
function isSupportedLanguage(code) {
  return SUPPORTED_LANGUAGES.some((lang) => lang.code.toLowerCase() === code.toLowerCase());
}
__name(isSupportedLanguage, "isSupportedLanguage");
function getLanguageName(code) {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code.toLowerCase() === code.toLowerCase())?.name || code;
}
__name(getLanguageName, "getLanguageName");

// src/commands/language.ts
async function cmdLanguage(code) {
  const config = new ConfigManager();
  await config.init();
  if (!code) {
    const current = config.get("language") || "en";
    console.log(`Current language: ${getLanguageName(current)} (${current})`);
    console.log("Supported languages:");
    for (const lang of SUPPORTED_LANGUAGES) {
      console.log(`- ${lang.code}: ${lang.name}`);
    }
    console.log("Set language with: agent-speech set-language <code>");
    return 0;
  }
  const normalized = normalizeLanguageCode(code);
  if (!isSupportedLanguage(normalized)) {
    console.error(`Unsupported language code: ${code}`);
    console.error("Supported codes:", SUPPORTED_LANGUAGES.map((lang) => lang.code).join(", "));
    return 1;
  }
  config.set("language", normalized);
  await config.save();
  console.log(`Language updated to: ${getLanguageName(normalized)} (${normalized})`);
  return 0;
}
__name(cmdLanguage, "cmdLanguage");

// src/commands/set-language.ts
async function cmdSetLanguage(code) {
  return cmdLanguage(code);
}
__name(cmdSetLanguage, "cmdSetLanguage");

// src/commands/mute.ts
import readline from "readline";
import { existsSync as existsSync3 } from "fs";
import { promises as promises2 } from "fs";
var DURATION_OPTIONS = [
  { value: 1, label: "5 minutes", ms: 3e5 },
  { value: 2, label: "10 minutes", ms: 6e5 },
  { value: 3, label: "15 minutes", ms: 9e5 },
  { value: 4, label: "30 minutes", ms: 18e5 },
  { value: 5, label: "1 hour", ms: 36e5 },
  { value: 6, label: "2 hours", ms: 72e5 },
  { value: 7, label: "Permanent", ms: null }
];
var MUTE_PATH = `${getConfigDir()}/mute.json`;
async function cmdMute(arg) {
  if (arg === "off") {
    if (existsSync3(MUTE_PATH)) {
      promises2.unlink(MUTE_PATH);
      console.log("TTS un-muted");
    } else {
      console.log("TTS is not currently muted");
    }
    return 0;
  }
  if (existsSync3(MUTE_PATH)) {
    try {
      const muteData = await readJSON(MUTE_PATH);
      if (muteData.until === null) {
        console.log("TTS is currently muted permanently");
      } else {
        const now = /* @__PURE__ */ new Date();
        const expiry = new Date(muteData.until);
        const remaining = expiry.getTime() - now.getTime();
        if (remaining > 0) {
          const minutes = Math.floor(remaining / 6e4);
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          if (hours > 0) {
            console.log(`TTS is muted for ${hours} hour${hours > 1 ? "s" : ""} and ${mins} minute${mins > 1 ? "s" : ""}`);
          } else {
            console.log(`TTS is muted for ${minutes} minute${minutes > 1 ? "s" : ""}`);
          }
        } else {
          promises2.unlink(MUTE_PATH);
          console.log("Previous mute expired");
        }
      }
    } catch {
      promises2.unlink(MUTE_PATH);
      console.log("Removed corrupt mute file");
    }
  }
  console.log("\nSelect mute duration:");
  DURATION_OPTIONS.forEach((option, index) => {
    console.log(`  ${index + 1}. ${option.label}`);
  });
  console.log("Enter number [1-7]:");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  try {
    const answer = await new Promise((resolve) => {
      rl.question("> ", (input) => {
        resolve(input.trim());
      });
    });
    const selection = parseInt(answer);
    if (isNaN(selection) || selection < 1 || selection > 7) {
      console.error("Error: Please enter a number between 1 and 7");
      rl.close();
      return 1;
    }
    const selectedDuration = DURATION_OPTIONS[selection - 1];
    const now = /* @__PURE__ */ new Date();
    let until = null;
    let duration;
    if (selectedDuration.ms === null) {
      until = null;
      duration = "permanent";
    } else {
      const expiry = new Date(now.getTime() + selectedDuration.ms);
      until = expiry.toISOString();
      duration = selectedDuration.label.toLowerCase();
    }
    await writeJSON(MUTE_PATH, {
      until,
      duration
    });
    console.log(`
TTS muted ${duration === "permanent" ? "permanently" : `for ${selectedDuration.label}`}`);
    rl.close();
    return 0;
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : String(error));
    rl.close();
    return 1;
  }
}
__name(cmdMute, "cmdMute");

// src/commands/help.ts
var TOOLS = ["gemini-cli", "claude-code", "opencode", "codex-cli"];
function cmdHelp() {
  format("Agent Speech Plugin CLI");
  format("");
  format("Usage: agent-speech <command> [options]");
  format("");
  format("Commands:");
  format("  init                    Initialize configuration");
  format("  enable [tool]           Enable TTS for tool (default: gemini-cli)");
  format("  disable [tool]          Disable TTS for tool (default: gemini-cli)");
  format("  toggle [tool]           Toggle TTS on/off (default: gemini-cli)");
  format("  status                  Show configuration status");
  format("  set-voice <name>        Set voice (e.g., Samantha, Alex)");
  format("  set-rate <wpm>          Set speech rate (50-400)");
  format("  set-volume <0-100>      Set volume (0-100)");
  format("  list-voices             List available voices");
  format("  reset                   Reset to defaults");
  format("  language [code]         Show/set target language");
  format("  set-language <code>     Set target language (e.g., ko, en, ja)");
  format("  mute [off]              Set mute duration or cancel mute");
  format("  help                    Show this help");
  format("");
  format("Tools:", TOOLS.join(", "));
  format("");
  format("Config location:", getUserHome() + "/.agent-speech/config.json");
  return 0;
}
__name(cmdHelp, "cmdHelp");

// src/cli.ts
async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    return cmdHelp();
  }
  const [command, ...commandArgs] = args;
  switch (command) {
    case "init":
      return await cmdInit();
    case "enable":
      return await cmdEnable();
    case "disable":
      return await cmdDisable();
    case "toggle":
      return await cmdToggle();
    case "status":
      return await cmdStatus();
    case "set-voice":
      return await cmdSetVoice(commandArgs[0]);
    case "set-rate":
      return await cmdSetRate(commandArgs[0]);
    case "set-volume":
      return await cmdSetVolume(commandArgs[0]);
    case "list-voices":
      return await cmdListVoices();
    case "reset":
      return await cmdReset();
    case "language":
      return await cmdLanguage(commandArgs[0]);
    case "set-language":
      return await cmdSetLanguage(commandArgs[0]);
    case "mute":
      return await cmdMute(commandArgs[0]);
    case "help":
    case "--help":
    case "-h":
      return cmdHelp();
    default:
      formatError(`Unknown command: ${command}`);
      formatError('Run "agent-speech help" for usage');
      return 1;
  }
}
__name(main, "main");
main().then((code) => process.exit(code)).catch((error) => {
  formatError("Unexpected error:", error);
  process.exit(1);
});
//# sourceMappingURL=cli.js.map

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
  }
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
      language: oldConfig.language
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
      this.logger.debug("Filtered text", { originalLength: text.length, filteredLength: filteredText.length });
      await this.say.speak(filteredText, config, {
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

// src/hooks/after-agent.ts
async function readStdin() {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });
}
__name(readStdin, "readStdin");
async function isMuted() {
  const mutePath = `${getConfigDir()}/mute.json`;
  const mute = await readJSON(mutePath);
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
__name(isMuted, "isMuted");
async function main() {
  const output = { suppressOutput: true };
  try {
    const raw = await readStdin();
    if (!raw.trim()) {
      process.stdout.write(JSON.stringify(output));
      return;
    }
    const input = JSON.parse(raw);
    const text = (input.prompt_response || input.response || input.text || "").trim();
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
      minLength: 0
    });
  } catch (error) {
    if (process.env.DEBUG === "true") {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`[agent-speech after-agent hook] ${message}
`);
    }
  }
  process.stdout.write(JSON.stringify(output));
}
__name(main, "main");
main().catch(() => {
  process.stdout.write(JSON.stringify({ suppressOutput: true }));
});
//# sourceMappingURL=after-agent-hook.js.map

# agent-speech-gemini-cli

[![Version](https://img.shields.io/github/v/release/welico/agent-speech-gemini-cli?label=version)](https://github.com/welico/agent-speech-gemini-cli/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)
[![Platform](https://img.shields.io/badge/platform-macOS-lightgrey.svg)](#prerequisites)
[![Gemini CLI](https://img.shields.io/badge/Gemini%20CLI-Extension-4285F4.svg)](https://github.com/google-gemini/gemini-cli)
[![MCP](https://img.shields.io/badge/MCP-Server-orange.svg)](https://modelcontextprotocol.io/)

> Text-to-speech extension for Gemini CLI using macOS native `say` command.

---

## Installation

```bash
gemini extensions install https://github.com/welico/agent-speech-gemini-cli.git
```

That's it. The extension is self-contained — no `npm install` or build step needed.

### Verify

In Gemini CLI, ask:

```
Say "Hello World"
```

Gemini will use the `speak_text` tool to read the response aloud.

### Slash Command

After install/update, you can run Agent Speech with a slash command:

```text
/agent-speech status
/agent-speech speak 안녕하세요, 음성 테스트입니다.
/agent-speech enable
/agent-speech set-language ko
/agent-speech set-voice Samantha
```

These slash commands call MCP tools directly and do not require shell-execution approval prompts.

Gemini assistant responses are also spoken automatically after each completed turn.
Automatic playback uses a concise summary. Use `/agent-speech speak <text>` when you want full text read verbatim.

### Uninstall

```bash
gemini extensions uninstall agent-speech
```

---

## Features

- **macOS Native TTS** — Uses built-in `say` command, zero external dependencies
- **Non-Blocking** — Async speech, never blocks CLI interaction
- **Configurable** — Voice, rate (50–400 WPM), volume (0–100)
- **Auto Translation** — Translates responses to configured language before speech (Google free translate endpoint)
- **Privacy-Conscious** — Optional sensitive content filtering
- **Self-Contained** — All dependencies bundled, installs from git in one command
- **Auto Read Responses** — AfterAgent hook reads completed Gemini responses aloud
- **Summary Playback** — Automatic response speech reads a concise summary instead of full raw output

---

## Prerequisites

| Requirement | Version |
|---|---|
| macOS | 10.15+ (Catalina or later) |
| Node.js | 18+ |
| [Gemini CLI](https://github.com/google-gemini/gemini-cli) | Latest |

---

## Configuration

Config file: `~/.agent-speech/config.json`

```json
{
  "enabled": true,
  "language": "en",
  "voice": "Samantha",
  "rate": 200,
  "volume": 50,
  "minLength": 10,
  "filterSensitive": false
}
```

### Environment Variables

| Variable | Purpose | Default |
|---|---|---|
| `DEBUG` | Enable debug logging to stderr | `false` |
| `LOG_FILE` | Path to debug log file | `/tmp/agent-speech-debug.log` |
| `LOG_LEVEL` | Minimum log level (`debug` / `info` / `warn` / `error`) | `debug` |

---

## CLI Commands

```bash
agent-speech init              # Initialize configuration
agent-speech enable            # Enable TTS
agent-speech disable           # Disable TTS
agent-speech toggle            # Quick toggle on/off
agent-speech status            # Show current settings
agent-speech reset             # Reset to defaults
agent-speech set-voice <name>  # Set voice (e.g., Samantha, Alex, Victoria)
agent-speech set-language <code> # Set target translation language (ko, en, ja, zh-CN, es, fr, de, it)
agent-speech set-rate <wpm>    # Set speech rate (50-400)
agent-speech set-volume <0-100> # Set volume
agent-speech list-voices       # List available macOS voices
agent-speech language          # Show/set language
agent-speech mute [on|off]     # Mute/unmute speech
agent-speech help              # Show help
```

---

## MCP Tool Reference

### `speak_text`

Convert text to speech using macOS TTS.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `text` | string | Yes | Text to speak |
| `voice` | string | No | Voice name (e.g., Samantha, Alex, Victoria) |
| `rate` | number | No | Speech rate in words per minute (50–400) |
| `volume` | number | No | Volume level (0–100) |

**Example:**

```json
{
  "text": "Hello, this is a test",
  "voice": "Samantha",
  "rate": 200,
  "volume": 50
}
```

---

## Alternative Installation

### Manual (MCP server config)

```bash
git clone https://github.com/welico/agent-speech-gemini-cli.git
cd agent-speech-gemini-cli
npm install
npm run build
```

Add to your Gemini CLI settings (`~/.gemini/settings.json`):

```json
{
  "mcpServers": {
    "agent-speech": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/agent-speech-gemini-cli/dist/mcp-server.js"]
    }
  }
}
```

---

## Development

```bash
npm install          # Install dependencies
npm run build        # Bundle with esbuild (self-contained dist/)
npm run build:types  # Generate .d.ts declarations
npm run typecheck    # Type check without emitting
npm run dev          # Watch mode (tsc)
```

### Project Structure

```
agent-speech-gemini-cli/
├── src/
│   ├── core/              # Core TTS logic
│   │   ├── tts.ts         # Text-to-speech engine
│   │   ├── config.ts      # Configuration management
│   │   └── filter.ts      # Content filtering
│   ├── infrastructure/    # External integrations
│   │   ├── mcp-server.ts  # MCP server implementation
│   │   ├── say.ts         # macOS say command wrapper
│   │   └── fs.ts          # File system operations
│   ├── commands/          # CLI commands
│   ├── utils/             # Utilities (logger, schemas, formatting)
│   ├── types/             # TypeScript type definitions
│   ├── gemini-cli.ts      # Gemini CLI integration class
│   ├── mcp-server.ts      # MCP server entry point
│   ├── cli.ts             # CLI entry point
│   └── index.ts           # Package exports
├── commands/
│   └── agent-speech.toml  # Slash command: /agent-speech <args>
├── esbuild.config.mjs     # Build config (bundles all deps)
├── gemini-extension.json   # Gemini CLI extension manifest
├── GEMINI.md               # Extension context file
└── dist/                   # Bundled output (committed)
```

---

## Troubleshooting

### Extension not loading

1. Verify the extension is installed: `gemini extensions list`
2. Reinstall: `gemini extensions uninstall agent-speech && gemini extensions install https://github.com/welico/agent-speech-gemini-cli.git`
3. Restart Gemini CLI after installation

### MCP approval prompt appears

Gemini CLI does not allow extensions to auto-set `trust: true` in extension-managed MCP server config.

For user-level always-allow behavior, configure Gemini policy/settings locally:

```json
{
  "security": {
    "enablePermanentToolApproval": true
  }
}
```

Then add a policy file in `~/.gemini/policies/agent-speech.toml`:

```toml
[[rule]]
mcpName = "agent-speech"
toolName = "*"
decision = "allow"
priority = 900
```

### No speech output

1. Check macOS volume is not muted
2. Verify the voice exists: `say -v Samantha "test"`
3. Check if TTS is enabled: `agent-speech status`

### Voice not found

```bash
agent-speech list-voices          # List available voices
agent-speech set-voice Samantha   # Use exact name from list
```

---

## License

MIT

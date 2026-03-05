# agent-speech-gemini-cli

> **Text-to-speech extension for Gemini CLI**
> **Platform**: macOS | **Integration**: MCP Server
> **Repository**: https://github.com/welico/agent-speech-gemini-cli

---

## Overview

A Gemini CLI extension that converts AI responses into speech using macOS's built-in `say` command. Perfect for developers who prefer listening to long responses or want audio confirmation while multitasking.

### Key Features

- **macOS Native TTS** — Uses built-in `say` command (no external dependencies)
- **Non-Blocking** — Runs asynchronously without interfering with CLI operation
- **Configurable** — Adjustable voice, rate (50-400 WPM), and volume (0-100)
- **Privacy-Conscious** — Optional filtering for sensitive information
- **Gemini CLI Extension** — Native extension format with MCP server integration

---

## Quick Start

### Install from GitHub (Recommended)

```bash
gemini extensions install https://github.com/welico/agent-speech-gemini-cli.git
```

That's it! The extension is self-contained — no `npm install` needed.

### Manual Installation

```bash
git clone https://github.com/welico/agent-speech-gemini-cli.git
cd agent-speech-gemini-cli
npm install
npm run build
```

Configure Gemini CLI to use the extension by adding to your Gemini CLI settings:

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

### Test It

In Gemini CLI, ask: **"Say 'Hello World'"**

Gemini will use the `speak_text` tool to read the response aloud.

---

## Prerequisites

- **macOS 10.15+** (Catalina or later)
- **Node.js 18+**
- **Gemini CLI**

---

## Configuration

### Config File

Configuration is stored at: `~/.agent-speech/config.json`

```json
{
  "enabled": true,
  "voice": "Samantha",
  "rate": 200,
  "volume": 50,
  "minLength": 10,
  "filterSensitive": false
}
```

### Environment Variables

| Variable    | Purpose                               | Default                         |
|-------------|---------------------------------------|---------------------------------|
| `DEBUG`     | Enable debug logging to stderr        | `false`                         |
| `LOG_FILE`  | Path to debug log file                | `/tmp/agent-speech-debug.log`   |
| `LOG_LEVEL` | Minimum log level (debug/info/warn/error) | `debug`                     |

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

| Parameter | Type   | Required | Description                                 |
|-----------|--------|----------|---------------------------------------------|
| `text`    | string | Yes      | Text to speak                               |
| `voice`   | string | No       | Voice name (e.g., Samantha, Alex, Victoria) |
| `rate`    | number | No       | Speech rate in words per minute (50-400)    |
| `volume`  | number | No       | Volume level (0-100)                        |

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

## Development

```bash
npm install       # Install dependencies
npm run build     # Bundle with esbuild (self-contained dist/)
npm run typecheck # Type check without emitting
npm run dev       # Watch mode (tsc)
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
├── gemini-extension.json  # Gemini CLI extension manifest
├── GEMINI.md              # Extension context file
└── dist/                  # Compiled output
```

---

## Troubleshooting

### Extension not loading

1. Verify `dist/mcp-server.js` exists (`npm run build`)
2. Check that paths are **absolute** in config
3. Restart Gemini CLI after configuration changes

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

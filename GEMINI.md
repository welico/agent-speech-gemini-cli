# Agent Speech Extension - Gemini CLI Instructions

This extension provides text-to-speech (TTS) functionality for Gemini CLI using the macOS `say` command.

## Available Tool

### `speak_text`

Converts text to speech using macOS native TTS.

**When to use**: Call this tool to read text aloud to the user. Useful for summarizing long responses, reading code explanations, or providing audio feedback.

**Parameters:**

| Parameter | Type     | Required | Description                                      |
|-----------|----------|----------|--------------------------------------------------|
| `text`    | string   | Yes      | The text to speak aloud                          |
| `voice`   | string   | No       | Voice name (e.g., Samantha, Alex, Victoria)      |
| `rate`    | number   | No       | Speech rate in words per minute (50-400)         |
| `volume`  | number   | No       | Volume level (0-100)                             |

**Example usage:**

```json
{
  "text": "The build completed successfully with no errors.",
  "voice": "Samantha",
  "rate": 200,
  "volume": 50
}
```

## Guidelines

- Use `speak_text` when the user asks you to "say", "read aloud", "speak", or "announce" something.
- Keep spoken text concise and natural-sounding.
- Avoid reading raw code blocks aloud — summarize them instead.
- The default voice is Samantha at 200 WPM. Override only if the user requests a different voice or speed.
- This tool is macOS-only. If the user is on a different platform, inform them that TTS is not available.

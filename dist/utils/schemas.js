/**
 * Zod Schemas for Tool Input Validation
 *
 * Provides runtime type validation for MCP tool inputs.
 * Uses Zod for type-safe schema validation.
 */
import { z } from 'zod';
/**
 * Schema for speak_text tool input
 */
export const SpeakTextInputSchema = z.object({
    text: z.string().min(1).describe('Text to speak'),
    voice: z.string().optional().describe('Voice name (e.g., Samantha, Alex, Victoria)'),
    rate: z.number().min(50).max(400).optional().describe('Speech rate in words per minute (50-400)'),
    volume: z.number().min(0).max(100).optional().describe('Volume level (0-100)'),
});
/**
 * Validate speak_text input
 * @throws {ZodError} If validation fails
 */
export function validateSpeakTextInput(data) {
    return SpeakTextInputSchema.parse(data);
}
/**
 * Safe parse - returns validation error instead of throwing
 */
export function safeValidateSpeakTextInput(data) {
    const result = SpeakTextInputSchema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return {
        success: false,
        error: result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
    };
}
/**
 * Schema for TTS configuration
 */
export const TTSConfigSchema = z.object({
    voice: z.string().default('Samantha'),
    rate: z.number().min(50).max(400).default(200),
    volume: z.number().min(0).max(100).default(50),
    enabled: z.boolean().default(true),
    minLength: z.number().min(0).default(10),
});
/**
 * Validate TTS configuration
 */
export function validateTTSConfig(data) {
    return TTSConfigSchema.parse(data);
}
/**
 * Schema for tool configuration (from config file)
 */
export const ToolConfigSchema = z.object({
    enabled: z.boolean().default(true),
    voice: z.string().optional(),
    rate: z.number().min(50).max(400).optional(),
    volume: z.number().min(0).max(100).optional(),
    minLength: z.number().min(0).optional(),
});
/**
 * Validate tool configuration
 */
export function validateToolConfig(data) {
    return ToolConfigSchema.parse(data);
}
//# sourceMappingURL=schemas.js.map
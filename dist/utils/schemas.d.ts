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
export declare const SpeakTextInputSchema: z.ZodObject<{
    text: z.ZodString;
    voice: z.ZodOptional<z.ZodString>;
    rate: z.ZodOptional<z.ZodNumber>;
    volume: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    text: string;
    voice?: string | undefined;
    rate?: number | undefined;
    volume?: number | undefined;
}, {
    text: string;
    voice?: string | undefined;
    rate?: number | undefined;
    volume?: number | undefined;
}>;
export type SpeakTextInput = z.infer<typeof SpeakTextInputSchema>;
/**
 * Validate speak_text input
 * @throws {ZodError} If validation fails
 */
export declare function validateSpeakTextInput(data: unknown): SpeakTextInput;
/**
 * Safe parse - returns validation error instead of throwing
 */
export declare function safeValidateSpeakTextInput(data: unknown): {
    success: true;
    data: SpeakTextInput;
} | {
    success: false;
    error: string;
};
/**
 * Schema for TTS configuration
 */
export declare const TTSConfigSchema: z.ZodObject<{
    voice: z.ZodDefault<z.ZodString>;
    rate: z.ZodDefault<z.ZodNumber>;
    volume: z.ZodDefault<z.ZodNumber>;
    enabled: z.ZodDefault<z.ZodBoolean>;
    minLength: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    enabled: boolean;
    voice: string;
    rate: number;
    volume: number;
    minLength: number;
}, {
    enabled?: boolean | undefined;
    voice?: string | undefined;
    rate?: number | undefined;
    volume?: number | undefined;
    minLength?: number | undefined;
}>;
export type TTSConfig = z.infer<typeof TTSConfigSchema>;
/**
 * Validate TTS configuration
 */
export declare function validateTTSConfig(data: unknown): TTSConfig;
/**
 * Schema for tool configuration (from config file)
 */
export declare const ToolConfigSchema: z.ZodObject<{
    enabled: z.ZodDefault<z.ZodBoolean>;
    voice: z.ZodOptional<z.ZodString>;
    rate: z.ZodOptional<z.ZodNumber>;
    volume: z.ZodOptional<z.ZodNumber>;
    minLength: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    enabled: boolean;
    voice?: string | undefined;
    rate?: number | undefined;
    volume?: number | undefined;
    minLength?: number | undefined;
}, {
    enabled?: boolean | undefined;
    voice?: string | undefined;
    rate?: number | undefined;
    volume?: number | undefined;
    minLength?: number | undefined;
}>;
export type ToolConfig = z.infer<typeof ToolConfigSchema>;
/**
 * Validate tool configuration
 */
export declare function validateToolConfig(data: unknown): ToolConfig;
//# sourceMappingURL=schemas.d.ts.map
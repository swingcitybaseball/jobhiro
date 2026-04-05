import Anthropic from "@anthropic-ai/sdk";

// Singleton Anthropic client — reused across all server-side AI calls
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const SONNET_MODEL = "claude-3-5-sonnet-20241022";
export const HAIKU_MODEL  = "claude-haiku-4-5-20251001";

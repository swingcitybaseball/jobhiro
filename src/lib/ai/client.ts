import Anthropic from "@anthropic-ai/sdk";

// Singleton Anthropic client — reused across all server-side AI calls
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const SONNET_MODEL = "claude-sonnet-4-6";

import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export const GEMINI_CHAT_MODEL = "gemini-2.5-flash";

export function createGeminiProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "gemini",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
    apiKey,
  });
}

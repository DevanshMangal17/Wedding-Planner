import Anthropic from "@anthropic-ai/sdk";

/**
 * Every AI service in this app (weddingPlanner, vendorMatcher, taskGenerator,
 * followUpAgent, sosAgent) talks to this single interface, never to an SDK
 * directly. Swapping providers, adding retries, or mocking in tests only
 * ever touches this file.
 */
export interface AIProvider {
  readonly isLive: boolean;
  generateText(system: string, prompt: string): Promise<string>;
}

class AnthropicProvider implements AIProvider {
  readonly isLive = true;
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async generateText(system: string, prompt: string): Promise<string> {
    const message = await this.client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      system,
      messages: [{ role: "user", content: prompt }],
    });
    const block = message.content[0];
    return block?.type === "text" ? block.text : "";
  }
}

/**
 * Deterministic fallback so the whole product works with zero external
 * dependencies out of the box. Domain services never rely on this for
 * structured/critical output (task rules, match scoring, overdue detection
 * are always plain TypeScript) — they only reach for `generateText` to turn
 * already-computed facts into warm, readable copy. When no key is set, that
 * copy still has to be right, so services pass a `fallback` string here.
 */
class MockProvider implements AIProvider {
  readonly isLive = false;

  async generateText(_system: string, prompt: string): Promise<string> {
    return prompt;
  }
}

let cached: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (cached) return cached;
  const key = process.env.ANTHROPIC_API_KEY;
  cached = key ? new AnthropicProvider(key) : new MockProvider();
  return cached;
}

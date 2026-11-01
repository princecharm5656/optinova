import Groq from "groq-sdk";

function getClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing. Add it to .env.local / Vercel and restart.");
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

/**
 * Groq models change often (llama3-*, llama-3.3-70b and qwen3-32b are all retired).
 * Override without redeploying code via env:  GROQ_MODELS="openai/gpt-oss-120b,openai/gpt-oss-20b"
 * Check https://console.groq.com/docs/models for the current list.
 */
export const DEFAULT_MODELS = (process.env.GROQ_MODELS || "openai/gpt-oss-120b,openai/gpt-oss-20b")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

type Options<T> = {
  system: string;
  user: string;
  /** Throw inside validate() if the JSON is unusable -> next model is tried. */
  validate: (raw: any) => T;
  models?: string[];
  maxTokens?: number;
  temperature?: number;
};

export async function groqJSON<T>({
  system,
  user,
  validate,
  models = DEFAULT_MODELS,
  maxTokens = 6000,
  temperature = 0.6,
}: Options<T>): Promise<T> {
  const errors: string[] = [];

  for (const model of models) {
   for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const completion = await getClient().chat.completions.create({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
        temperature,
        max_tokens: maxTokens,
      });

      const text = completion.choices[0]?.message?.content;
      if (!text) throw new Error("empty response");
      return validate(JSON.parse(text));
    } catch (e: any) {
      // Never swallow silently: this is how dead model names went unnoticed.
      console.error(`[groq] ${model} attempt ${attempt} failed:`, e?.message || e);
      errors.push(`${model}#${attempt}: ${e?.message || "unknown error"}`);
    }
   }
  }

  throw new Error(`All AI models failed. ${errors.join(" | ")}`);
}

type ToolMessage = { role: "system" | "user"; content: string };

/**
 * For the simple text tools (bio, blog, caption...). Same call shape as before, but:
 *  - uses the maintained model list, with fallback to the next model on failure;
 *  - gives reasoning models (gpt-oss) extra token room: their "thinking" tokens count against
 *    max_tokens and would otherwise cut the visible answer short.
 */
export async function toolChat(p: { messages: ToolMessage[]; temperature: number; max_tokens: number }) {
  let lastError: unknown;
  for (const model of DEFAULT_MODELS) {
    try {
      const reasoning = model.startsWith("openai/gpt-oss");
      return await getClient().chat.completions.create({
        model,
        messages: p.messages,
        temperature: p.temperature,
        max_tokens: reasoning ? p.max_tokens + 2000 : p.max_tokens,
        ...(reasoning ? { reasoning_effort: "low" as const } : {}),
      });
    } catch (e: any) {
      console.error(`[groq] tool call failed on ${model}:`, e?.message || e);
      lastError = e;
    }
  }
  throw lastError ?? new Error("All AI models failed.");
}

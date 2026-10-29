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

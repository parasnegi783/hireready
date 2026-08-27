import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HF_TOKEN,
});

const DEFAULT_MODEL = "moonshotai/Kimi-K2-Instruct-0905";

export async function askAI(
  prompt: string,
  options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
  }
) {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

  if (options?.systemPrompt) {
    messages.push({ role: "system", content: options.systemPrompt });
  }

  messages.push({ role: "user", content: prompt });

  const completion = await client.chat.completions.create({
    model: options?.model || DEFAULT_MODEL,
    messages,
    max_tokens: options?.maxTokens || 2000,
    temperature: options?.temperature || 0.7,
  });

  return completion.choices[0].message.content || "";
}

export async function askAIWithHistory(
  messages: { role: "user" | "assistant" | "system"; content: string }[],
  options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }
) {
  const completion = await client.chat.completions.create({
    model: options?.model || DEFAULT_MODEL,
    messages,
    max_tokens: options?.maxTokens || 2000,
    temperature: options?.temperature || 0.7,
  });

  return completion.choices[0].message.content || "";
}

export { client, DEFAULT_MODEL };

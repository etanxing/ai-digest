import OpenAI from "openai";

const MODEL = "minimaxai/minimax-m2.7";

export function makeClient(apiKey: string): OpenAI {
  return new OpenAI({
    apiKey,
    baseURL: "https://integrate.api.nvidia.com/v1",
  });
}

export async function chat(
  client: OpenAI,
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 8192
): Promise<string> {
  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    top_p: 0.95,
    max_tokens: maxTokens,
  });

  const msg = completion.choices[0]?.message as unknown as Record<string, unknown> | undefined;
  // minimax-m2 is a reasoning model: content may be null while reasoning_content has the answer
  return (
    (msg?.["content"] as string | null | undefined) ||
    (msg?.["reasoning_content"] as string | null | undefined) ||
    ""
  );
}

import type { DigestPost } from "../../shared/types";

export async function translateToZh(enPost: DigestPost, ai: Ai): Promise<DigestPost> {
  const prompt = `Translate the following AI news digest from English to Simplified Chinese.
Preserve all markdown formatting, headings, and links exactly.
Keep proper nouns (company names, model names) in their original form.
Translate naturally — not word-for-word.

Title: ${enPost.title}

Content:
${enPost.content}

Return ONLY the translated title on the first line, then the translated content. No preamble.`;

  const response = await ai.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
    prompt,
    max_tokens: 3000,
  }) as { response?: string };

  const text = (response?.response ?? "").trim();
  const lines = text.split("\n");
  const zhTitle = lines[0]?.trim() || enPost.title;
  const zhContent = lines.slice(1).join("\n").trim();

  return {
    ...enPost,
    locale: "zh",
    title: zhTitle,
    content: zhContent || text,
  };
}

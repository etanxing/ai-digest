import type OpenAI from "openai";
import { chat, MODELS } from "./ai";
import type { DigestPost } from "../../shared/types";

const SYSTEM = `You are a professional translator specialising in technology journalism.
Translate the following English AI news digest to Simplified Chinese.

Rules:
- CRITICAL: Every markdown hyperlink MUST appear in the output. Format is [Chinese text](url) — translate the link text but keep the URL exactly unchanged. NEVER drop a link. Example: "[Anthropic's advanced models](https://example.com)" → "[Anthropic的先进模型](https://example.com)"
- Preserve ALL other markdown formatting exactly: ## headings, ### headings, --- dividers, - bullets, **bold**
- Keep proper nouns in English: company names, model names, product names (OpenAI, Claude, GPT-5, Meta, Anthropic, Google, NVIDIA, etc.)
- Return ONLY the translated content — title on line 1, blank line, then body. No preamble or explanation.`;

export async function translateToZh(enPost: DigestPost, client: OpenAI): Promise<DigestPost> {
  const input = `Title: ${enPost.title}\n\n${enPost.content}`;
  const text = (await chat(client, SYSTEM, input, 8192, MODELS.editorial)).trim();

  const lines = text.split("\n");
  const titleLine = lines[0]?.replace(/^(title:\s*|#+\s*)/i, "").trim() || enPost.title;
  const zhContent = lines.slice(1).join("\n").trim();

  return {
    ...enPost,
    locale: "zh",
    title: titleLine,
    content: zhContent || text,
  };
}

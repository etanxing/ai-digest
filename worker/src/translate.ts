import type OpenAI from "openai";
import { chat } from "./ai";
import type { DigestPost } from "../../shared/types";

export async function translateToZh(enPost: DigestPost, client: OpenAI): Promise<DigestPost> {
  const system = `You are a professional translator specialising in technology journalism. Translate English to Simplified Chinese naturally and accurately. Preserve all markdown formatting and hyperlinks exactly. Keep proper nouns (company names, model names, product names) in their original English form.`;

  const user = `Translate this AI news digest to Simplified Chinese.

Return ONLY the translated content — the title on the first line, then the body. No preamble or explanation.

Title: ${enPost.title}

${enPost.content}`;

  const text = (await chat(client, system, user, 4000)).trim();
  const lines = text.split("\n");
  const zhTitle = lines[0]?.replace(/^#+\s*/, "").trim() || enPost.title;
  const zhContent = lines.slice(1).join("\n").trim();

  return {
    ...enPost,
    locale: "zh",
    title: zhTitle,
    content: zhContent || text,
  };
}

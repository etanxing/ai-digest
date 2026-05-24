import type OpenAI from "openai";
import { chat } from "./ai";
import type { SourceItem, CuratedDigest, DigestPost } from "../../shared/types";

export async function writeDigest(
  curated: CuratedDigest,
  items: SourceItem[],
  date: string,
  client: OpenAI
): Promise<DigestPost> {
  const featureContext = curated.features
    .map((f, i) => {
      const sources = f.sourceIds
        .map((id) => items[id])
        .filter(Boolean)
        .map((s) => `- ${s.title}\n  URL: ${s.url}\n  Summary: ${s.summary}`)
        .join("\n");
      return `STORY ${i + 1}: ${f.title}\nAngle: ${f.angle}\nSources:\n${sources}`;
    })
    .join("\n\n---\n\n");

  const briefContext = curated.briefs
    .map((b) => `- ${b.title} | ${b.url} | ${b.summary}`)
    .join("\n");

  const system = `You are a wire-service journalist covering AI. Write clearly and directly. No hype, no filler. Every factual claim must link to its source URL using markdown inline links.`;

  const storyTitles = curated.features.map((f, i) => `Story ${i + 1}: ${f.title}`).join("\n");

  const user = `Write a daily AI news digest for ${date}.

For each of the 3 feature stories write 2-3 focused paragraphs. Link key facts and company names to the original source URLs provided.

Then list brief items as markdown bullet points.

Output this EXACT markdown structure — the first line MUST be "Title: ..." (a short punchy digest headline, 8 words max, covering the biggest 1-2 themes across all 3 stories — NOT just story 1):

Title: [short digest headline — 8 words max, covers 1-2 themes from across all stories]

## 1. [Headline]

[paragraphs with [linked text](url)]

## 2. [Headline]

[paragraphs]

## 3. [Headline]

[paragraphs]

---

### Also today

- [Brief title](url) — one sentence

---

TODAY'S STORIES:
${storyTitles}

FEATURE STORIES (with sources):
${featureContext}

BRIEF ITEMS:
${briefContext}`;

  const raw = await chat(client, system, user, 3000);

  // Extract "Title: ..." from first line, rest is body
  const lines = raw.split("\n");
  let title = curated.features[0]?.title ?? "Today in AI";
  let content = raw;
  if (lines[0]?.toLowerCase().startsWith("title:")) {
    title = lines[0].replace(/^title:\s*/i, "").trim() || title;
    content = lines.slice(1).join("\n").trimStart();
  }

  return {
    date,
    locale: "en",
    title,
    storyCount: curated.features.length,
    briefCount: curated.briefs.length,
    sourceCount: items.length,
    content,
  };
}

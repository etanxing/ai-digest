import type { SourceItem, CuratedDigest, DigestPost } from "../../shared/types";

export async function writeDigest(
  curated: CuratedDigest,
  items: SourceItem[],
  date: string,
  ai: Ai
): Promise<DigestPost> {
  const featureContext = curated.features
    .map((f, i) => {
      const sources = f.sourceIds
        .map((id) => items[id])
        .filter(Boolean)
        .map((s) => `${s.title} (${s.url}) — ${s.summary}`)
        .join("\n");
      return `STORY ${i + 1}: ${f.title}\nAngle: ${f.angle}\nSource material:\n${sources}`;
    })
    .join("\n\n");

  const briefContext = curated.briefs
    .map((b) => `- ${b.title}: ${b.url} — ${b.summary}`)
    .join("\n");

  const prompt = `Write a daily AI news digest in the style of a high-quality wire service. Clear, direct, no hype.

Date: ${date}

For each of the 3 feature stories, write 2-3 paragraphs. Include inline markdown links to original sources.
Then list the brief items as bullet points.

Use this exact markdown structure:
---
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

FEATURE STORIES:
${featureContext}

BRIEF ITEMS:
${briefContext}

Write the digest now:`;

  const response = await ai.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
    prompt,
    max_tokens: 2500,
  }) as { response?: string };

  const content = response?.response ?? "";
  const title = curated.features[0]?.title ?? "Today's AI digest";

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

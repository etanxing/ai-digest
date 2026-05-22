import type OpenAI from "openai";
import { chat } from "./ai";
import type { SourceItem, CuratedDigest } from "../../shared/types";

export async function curateDigest(
  items: SourceItem[],
  client: OpenAI
): Promise<CuratedDigest> {
  const top30 = items.slice(0, 30);
  const itemList = top30
    .map((item, i) => `[${i}] ${item.title} (${item.source})\n${item.summary}`)
    .join("\n\n");

  const system = `You are a senior AI news editor. You select the most significant stories from a candidate list and return structured JSON only. No prose, no markdown fences — just the raw JSON object.`;

  const user = `Select the 3 most significant AI stories and 6-8 brief items from the list below.

Return ONLY valid JSON matching this exact schema:
{
  "features": [
    {"title": "headline", "angle": "1-sentence editorial angle", "sourceIds": [0, 1]}
  ],
  "briefs": [
    {"title": "headline", "url": "original url", "summary": "one sentence"}
  ]
}

Rules:
- Features must be genuinely significant (product launches, research breakthroughs, policy changes)
- Avoid repetition between features
- Cover different companies/domains when possible
- sourceIds are the numeric indexes from the list below

Items:
${itemList}`;

  const text = await chat(client, system, user, 2000);

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`Curation returned no JSON. Response: ${text.slice(0, 200)}`);

  const parsed = JSON.parse(jsonMatch[0]) as CuratedDigest;
  if (!parsed.features || !parsed.briefs) throw new Error("Invalid curation JSON shape");

  return {
    features: parsed.features.slice(0, 3),
    briefs: parsed.briefs.slice(0, 8),
  };
}

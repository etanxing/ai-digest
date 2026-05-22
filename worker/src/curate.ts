import type { SourceItem, CuratedDigest } from "../../shared/types";

export async function curateDigest(
  items: SourceItem[],
  ai: Ai
): Promise<CuratedDigest> {
  const top30 = items.slice(0, 30);
  const itemList = top30
    .map((item, i) => `[${i}] ${item.title} (${item.source})\n${item.summary}`)
    .join("\n\n");

  const prompt = `You are an AI news editor. Select the 3 most significant AI stories and 6-8 brief items from the list below.

Return ONLY valid JSON matching this schema:
{
  "features": [
    {"title": "headline", "angle": "1-sentence editorial angle", "sourceIds": [0,1]}
  ],
  "briefs": [
    {"title": "headline", "url": "original url", "summary": "one sentence"}
  ]
}

Rules:
- Features must be genuinely significant (product launches, research breakthroughs, policy changes)
- Avoid repetition between features
- Cover different companies/domains when possible

Items:
${itemList}`;

  const response = await ai.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
    prompt,
    max_tokens: 1500,
  }) as { response?: string };

  const text = response?.response ?? "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Curation returned no JSON");

  const parsed = JSON.parse(jsonMatch[0]) as CuratedDigest;
  if (!parsed.features || !parsed.briefs) throw new Error("Invalid curation JSON shape");

  return {
    features: parsed.features.slice(0, 3),
    briefs: parsed.briefs.slice(0, 8),
  };
}

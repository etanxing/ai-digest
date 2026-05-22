import { XMLParser } from "fast-xml-parser";
import type { SourceItem } from "../../shared/types";

interface SourceDef {
  name: string;
  url: string;
  weight: number;
  type: "rss" | "atom";
}

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

function extractText(val: unknown): string {
  if (typeof val === "string") return val;
  if (val && typeof val === "object" && "#text" in (val as object)) return (val as { "#text": string })["#text"];
  return "";
}

function itemId(source: string, url: string, title: string): string {
  const str = source + url + title;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

async function fetchFeed(source: SourceDef, cutoffMs: number): Promise<SourceItem[]> {
  const res = await fetch(source.url, {
    signal: AbortSignal.timeout(10000),
    headers: { "User-Agent": "ai-digest-bot/1.0" },
  });
  if (!res.ok) return [];
  const xml = await res.text();
  const parsed = parser.parse(xml);

  const items: SourceItem[] = [];

  const channel = parsed?.rss?.channel ?? parsed?.feed;
  if (!channel) return items;

  const rawItems: unknown[] = channel.item ?? channel.entry ?? [];
  const list = Array.isArray(rawItems) ? rawItems : [rawItems];

  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const title = extractText(rec.title);
    const url = extractText(rec.link) ||
      (rec.link && typeof rec.link === "object" && "@_href" in (rec.link as object)
        ? (rec.link as { "@_href": string })["@_href"]
        : "");
    const pubDate = extractText(rec.pubDate) || extractText(rec.published) || extractText(rec.updated);
    const summary = extractText(rec.description) || extractText(rec.summary) || extractText(rec.content) || "";

    if (!title || !url) continue;

    const publishedAt = pubDate ? new Date(pubDate).toISOString() : new Date().toISOString();
    if (new Date(publishedAt).getTime() < cutoffMs) continue;

    items.push({
      id: itemId(source.name, url, title),
      title: title.slice(0, 200),
      url,
      source: source.name,
      publishedAt,
      summary: summary.replace(/<[^>]+>/g, "").slice(0, 500),
    });
  }

  return items;
}

export async function fetchAllSources(sources: SourceDef[], seenKV: KVNamespace): Promise<SourceItem[]> {
  const cutoffMs = Date.now() - 48 * 60 * 60 * 1000;

  const results = await Promise.allSettled(sources.map((s) => fetchFeed(s, cutoffMs)));

  const all: SourceItem[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") all.push(...r.value);
  }

  const fresh: SourceItem[] = [];
  await Promise.all(
    all.map(async (item) => {
      const seen = await seenKV.get(item.id);
      if (!seen) fresh.push(item);
    })
  );

  return fresh;
}

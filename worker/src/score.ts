import type { SourceItem } from "../../shared/types";

interface SourceDef {
  name: string;
  weight: number;
}

export function scoreItems(items: SourceItem[], sources: SourceDef[]): SourceItem[] {
  const weightMap = new Map(sources.map((s) => [s.name, s.weight]));

  const titleGroups = new Map<string, SourceItem[]>();
  for (const item of items) {
    const key = normalizeTitle(item.title);
    const group = titleGroups.get(key) ?? [];
    group.push(item);
    titleGroups.set(key, group);
  }

  const corroboration = new Map<string, number>();
  for (const [, group] of titleGroups) {
    const count = group.length;
    for (const item of group) {
      corroboration.set(item.id, count);
    }
  }

  const now = Date.now();
  return items.map((item) => {
    const age = (now - new Date(item.publishedAt).getTime()) / (1000 * 60 * 60);
    const recency = Math.max(0, 1 - age / 48);
    const authority = weightMap.get(item.source) ?? 0.5;
    const corr = Math.min(1, (corroboration.get(item.id) ?? 1) / 3);

    const score = authority * 0.4 + recency * 0.35 + corr * 0.25;
    return { ...item, score };
  }).sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .slice(0, 6)
    .join(" ");
}

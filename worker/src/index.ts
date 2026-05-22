import { fetchAllSources } from "./sources";
import { scoreItems } from "./score";
import { curateDigest } from "./curate";
import { writeDigest } from "./write";
import { translateToZh } from "./translate";
import { publishDigests } from "./publish";
import { reportError } from "./alert";
import sourcesJson from "../../shared/sources.json";

export interface Env {
  AI: Ai;
  SEEN_ITEMS: KVNamespace;
  SOURCE_STATE: KVNamespace;
  GITHUB_TOKEN: string;
  GITHUB_REPO: string;
  DRY_RUN: string;
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    await run(env);
  },

  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === "/__scheduled") {
      await run(env);
      return new Response("done");
    }
    return new Response("ai-digest pipeline worker", { status: 200 });
  },
};

async function run(env: Env): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  console.log(`[ai-digest] Starting pipeline for ${today}`);
  try {
    await runPipeline(env, today);
  } catch (err) {
    console.error("[ai-digest] Pipeline failed:", err);
    if (env.DRY_RUN !== "true") {
      await reportError(err, today, env.GITHUB_TOKEN, env.GITHUB_REPO);
    }
  }
}

async function runPipeline(env: Env, today: string): Promise<void> {

  const items = await fetchAllSources(sourcesJson as Parameters<typeof fetchAllSources>[0], env.SEEN_ITEMS);
  console.log(`[ai-digest] Fetched ${items.length} new items`);

  if (items.length < 5) {
    console.warn("[ai-digest] Too few items, aborting");
    return;
  }

  const scored = scoreItems(items, sourcesJson);
  console.log(`[ai-digest] Scored ${scored.length} items`);

  const curated = await curateDigest(scored, env.AI);
  console.log(`[ai-digest] Curated: ${curated.features.length} features, ${curated.briefs.length} briefs`);

  const enPost = await writeDigest(curated, scored, today, env.AI);
  console.log(`[ai-digest] Wrote EN digest: "${enPost.title}"`);

  const zhPost = await translateToZh(enPost, env.AI);
  console.log(`[ai-digest] Translated ZH digest`);

  if (env.DRY_RUN === "true") {
    console.log("[ai-digest] DRY RUN — skipping publish");
    console.log("--- EN ---\n" + enPost.content.slice(0, 500));
    console.log("--- ZH ---\n" + zhPost.content.slice(0, 500));
    return;
  }

  await publishDigests(enPost, zhPost, env.GITHUB_TOKEN, env.GITHUB_REPO);
  console.log(`[ai-digest] Published digests to GitHub`);

  const thirtyDaysMs = 30 * 24 * 60 * 60;
  await Promise.all(
    scored.map((item) =>
      env.SEEN_ITEMS.put(item.id, "1", { expirationTtl: thirtyDaysMs })
    )
  );
  console.log(`[ai-digest] Marked ${scored.length} items as seen`);
}

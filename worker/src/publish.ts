import type { DigestPost } from "../../shared/types";

function toFrontmatter(post: DigestPost): string {
  return `---
date: "${post.date}"
locale: ${post.locale}
title: "${post.title.replace(/"/g, '\\"')}"
storyCount: ${post.storyCount}
briefCount: ${post.briefCount}
sourceCount: ${post.sourceCount}
---

${post.content.trim()}
`;
}

async function githubRequest(
  method: string,
  path: string,
  token: string,
  body?: unknown
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": "ai-digest-pipeline/1.0",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: body != null ? JSON.stringify(body) : undefined,
  });
  const data = res.status !== 204 ? await res.json() : null;
  return { ok: res.ok, status: res.status, data };
}

export async function publishDigests(
  enPost: DigestPost,
  zhPost: DigestPost,
  githubToken: string,
  githubRepo: string
): Promise<void> {
  // Use Git Data API to publish both files in a single commit,
  // avoiding two separate commits that trigger two CF Pages builds
  // and cause a race condition where the EN-only build can overwrite ZH.

  // 1. Get current HEAD
  const refRes = await githubRequest("GET", `/repos/${githubRepo}/git/ref/heads/main`, githubToken);
  if (!refRes.ok) throw new Error(`Failed to get ref: ${JSON.stringify(refRes.data)}`);
  const headSha = (refRes.data as { object: { sha: string } }).object.sha;

  // 2. Get the base tree SHA from the current commit
  const commitRes = await githubRequest("GET", `/repos/${githubRepo}/git/commits/${headSha}`, githubToken);
  if (!commitRes.ok) throw new Error(`Failed to get commit: ${JSON.stringify(commitRes.data)}`);
  const baseTreeSha = (commitRes.data as { tree: { sha: string } }).tree.sha;

  // 3. Create blobs for both files
  const files = [
    { path: `content/posts/${enPost.date}.en.md`, post: enPost },
    { path: `content/posts/${zhPost.date}.zh.md`, post: zhPost },
  ];

  const treeItems = [];
  for (const { path, post } of files) {
    const blobRes = await githubRequest("POST", `/repos/${githubRepo}/git/blobs`, githubToken, {
      content: toFrontmatter(post),
      encoding: "utf-8",
    });
    if (!blobRes.ok) throw new Error(`Failed to create blob for ${path}: ${JSON.stringify(blobRes.data)}`);
    const blobSha = (blobRes.data as { sha: string }).sha;
    treeItems.push({ path, mode: "100644", type: "blob", sha: blobSha });
  }

  // 4. Create new tree with both files
  const treeRes = await githubRequest("POST", `/repos/${githubRepo}/git/trees`, githubToken, {
    base_tree: baseTreeSha,
    tree: treeItems,
  });
  if (!treeRes.ok) throw new Error(`Failed to create tree: ${JSON.stringify(treeRes.data)}`);
  const newTreeSha = (treeRes.data as { sha: string }).sha;

  // 5. Create commit
  const newCommitRes = await githubRequest("POST", `/repos/${githubRepo}/git/commits`, githubToken, {
    message: `digest: ${enPost.date}`,
    tree: newTreeSha,
    parents: [headSha],
    committer: { name: "AI Digest Bot", email: "bot@ai-digest.isawesome.work" },
  });
  if (!newCommitRes.ok) throw new Error(`Failed to create commit: ${JSON.stringify(newCommitRes.data)}`);
  const newCommitSha = (newCommitRes.data as { sha: string }).sha;

  // 6. Update ref
  const updateRes = await githubRequest("PATCH", `/repos/${githubRepo}/git/refs/heads/main`, githubToken, {
    sha: newCommitSha,
  });
  if (!updateRes.ok) throw new Error(`Failed to update ref: ${JSON.stringify(updateRes.data)}`);
}

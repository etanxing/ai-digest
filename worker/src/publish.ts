import { Octokit } from "@octokit/rest";
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

export async function publishDigests(
  enPost: DigestPost,
  zhPost: DigestPost,
  githubToken: string,
  githubRepo: string
): Promise<void> {
  const [owner, repo] = githubRepo.split("/");
  const octokit = new Octokit({ auth: githubToken });

  const files = [
    { path: `content/posts/${enPost.date}.en.md`, post: enPost },
    { path: `content/posts/${zhPost.date}.zh.md`, post: zhPost },
  ];

  for (const { path, post } of files) {
    const content = btoa(unescape(encodeURIComponent(toFrontmatter(post))));

    let sha: string | undefined;
    try {
      const existing = await octokit.repos.getContent({ owner, repo, path });
      if (!Array.isArray(existing.data) && "sha" in existing.data) {
        sha = existing.data.sha;
      }
    } catch {
      // file doesn't exist yet
    }

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: `digest: ${post.date}`,
      content,
      sha,
      committer: { name: "AI Digest Bot", email: "bot@ai-digest.isawesome.work" },
    });
  }
}

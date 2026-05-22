import { Octokit } from "@octokit/rest";

export async function reportError(
  error: unknown,
  date: string,
  githubToken: string,
  githubRepo: string
): Promise<void> {
  try {
    const [owner, repo] = githubRepo.split("/");
    const octokit = new Octokit({ auth: githubToken });
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? (error.stack ?? "") : "";

    await octokit.issues.create({
      owner,
      repo,
      title: `[pipeline] digest failed for ${date}`,
      body: `## Pipeline error — ${date}\n\n\`\`\`\n${message}\n\n${stack}\n\`\`\`\n\n_Auto-reported by ai-digest pipeline worker._`,
      labels: ["pipeline-error"],
    });
  } catch {
    // If we can't even create the issue, just log — don't throw
    console.error("[ai-digest] Failed to report error to GitHub Issues");
  }
}

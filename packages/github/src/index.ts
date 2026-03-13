import { Octokit } from "@octokit/rest";

export interface GitHubFile {
  path: string;
  content: string;
}

export interface PullRequestFile {
  filename: string;
  status: "added" | "modified" | "removed" | "renamed" | "copied" | "changed" | "unchanged";
  patch: string;
  sha: string;
  additions: number;
  deletions: number;
  changes: number;
}

export interface PullRequestDiff {
  title: string;
  description: string | null;
  diff: string;
  files: PullRequestFile[];
  headSha: string;
}

/** Decode a base64 string to UTF-8 without depending on Node's Buffer */
function decodeBase64(base64: string): string {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8").decode(bytes);
}


export function createOctokit(token: string): Octokit {
  return new Octokit({ auth: token });
}

export async function getRepoFileContents(
  token: string,
  owner: string,
  repo: string,
  path: string = ""
): Promise<GitHubFile[]> {
  const octokit = createOctokit(token);

  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: path || "",
    });

    if (!Array.isArray(data)) {
      // It's a file
      if (data.type === "file" && data.content) {
        return [
          {
            path: data.path,
            content: decodeBase64(data.content),
          },
        ];
      }
      return [];
    }

    // Directory case
    let files: GitHubFile[] = [];

    for (const item of data) {
      // Skip non-code files
      if (
        item.path.match(
          /\.(png|jpg|jpeg|gif|svg|ico|pdf|zip|tar|gz|woff|woff2|ttf|eot|mp4|mp3|mov|avi)$/i
        )
      ) {
        continue;
      }

      // Skip common directories
      if (
        item.path.match(
          /^(node_modules|\.git|\.next|dist|build|coverage|__pycache__|\.cache|vendor)$/i
        )
      ) {
        continue;
      }

      if (item.type === "file") {
        try {
          const { data: fileData } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: item.path,
          });

          if (
            !Array.isArray(fileData) &&
            fileData.type === "file" &&
            fileData.content
          ) {
            files.push({
              path: item.path,
              content: decodeBase64(fileData.content),
            });
          }
        } catch (error) {
          console.warn(`Skipping file ${item.path}:`, error);
          continue;
        }
      } else if (item.type === "dir") {
        try {
          const subFiles = await getRepoFileContents(token, owner, repo, item.path);
          files = files.concat(subFiles);
        } catch (error) {
          console.warn(`Skipping directory ${item.path}:`, error);
          continue;
        }
      }
    }

    return files;
  } catch (error: any) {
    console.error(`Error fetching content for ${owner}/${repo}/${path}:`, error.message);
    if (error.status === 404) {
      return [];
    }
    throw error;
  }
}

export async function getPullRequestDiff(
  token: string,
  owner: string,
  repo: string,
  prNumber: number
): Promise<PullRequestDiff> {
  const octokit = createOctokit(token);

  const { data: pr } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
  });

  const { data: files } = await octokit.rest.pulls.listFiles({
    owner,
    repo,
    pull_number: prNumber,
  });

  return {
    title: pr.title,
    description: pr.body ?? null,
    diff: files.map((f) => `--- a/${f.filename}\n+++ b/${f.filename}\n${f.patch || ""}`).join("\n"),
    files: files.map((f): PullRequestFile => ({
      filename: f.filename,
      status: f.status as PullRequestFile["status"],
      patch: f.patch || "",
      sha: f.sha,
      additions: f.additions,
      deletions: f.deletions,
      changes: f.changes,
    })),
    headSha: pr.head.sha,
  };
}

export async function fetchUserContribution(token: string, username: string) {
  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  const octokit = createOctokit(token);

  try {
    const response: any = await octokit.graphql(query, { username });
    return response.user.contributionsCollection.contributionCalendar;
  } catch (error) {
    console.error("Error fetching contribution data:", error);
    return null;
  }
}

export async function createWebhook(
  token: string,
  owner: string,
  repo: string,
  webhookUrl: string,
  secret: string
) {
  const octokit = createOctokit(token);

  try {
    // Check if webhook already exists
    const { data: hooks } = await octokit.rest.repos.listWebhooks({
      owner,
      repo,
    });

    const existingHook = hooks.find((hook) => hook.config.url === webhookUrl);

    if (existingHook) {
      console.log("Webhook already exists");
      return existingHook;
    }

    // Create new webhook
    const { data } = await octokit.rest.repos.createWebhook({
      owner,
      repo,
      config: {
        url: webhookUrl,
        content_type: "json",
        secret: secret,
      },
      events: ["pull_request", "push"],
      active: true,
    });

    return data;
  } catch (error) {
    console.error("Error creating webhook:", error);
    throw error;
  }
}

export async function postReviewComment(
  token: string,
  owner: string,
  repo: string,
  prNumber: number,
  review: string
) {
  const octokit = createOctokit(token);
  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: prNumber,
    body: `## 🦄 CodeUnicorn AI Review\n\n${review}\n\n---\n*Powered by CodeUnicorn*`,
  });
}

// ─── Feature 1: Line-Level PR Comments ──────────────────────────────────────

/**
 * Parse unified diff hunk headers to map diff positions to file line numbers.
 * Returns a map: diffPosition (1-based within patch) → { oldLine, newLine }
 */
export function parseDiffPositions(patch: string): Map<number, { side: "LEFT" | "RIGHT"; line: number }> {
  const positionMap = new Map<number, { side: "LEFT" | "RIGHT"; line: number }>();
  if (!patch) return positionMap;

  const lines = patch.split("\n");
  let diffPosition = 0;
  let newLine = 0;
  let oldLine = 0;

  for (const line of lines) {
    const hunkMatch = line.match(/^@@\s+-(\d+)(?:,\d+)?\s+\+(\d+)(?:,\d+)?\s+@@/);
    if (hunkMatch && hunkMatch[1] !== undefined && hunkMatch[2] !== undefined) {
      oldLine = parseInt(hunkMatch[1], 10);
      newLine = parseInt(hunkMatch[2], 10);
      diffPosition++;
      continue;
    }

    if (diffPosition === 0) continue; // skip lines before first hunk

    diffPosition++;

    if (line.startsWith("+")) {
      positionMap.set(diffPosition, { side: "RIGHT", line: newLine });
      newLine++;
    } else if (line.startsWith("-")) {
      positionMap.set(diffPosition, { side: "LEFT", line: oldLine });
      oldLine++;
    } else {
      // Context line
      positionMap.set(diffPosition, { side: "RIGHT", line: newLine });
      newLine++;
      oldLine++;
    }
  }

  return positionMap;
}

/**
 * Find the diff position for a given file line number in a patch.
 * GitHub's createReview API needs the diff position (1-based position within the patch).
 */
export function findDiffPosition(patch: string, targetLine: number): number | null {
  const positions = parseDiffPositions(patch);
  for (const [pos, info] of positions) {
    if (info.side === "RIGHT" && info.line === targetLine) {
      return pos;
    }
  }
  // If exact line not found, try to find closest
  return null;
}

/**
 * Post line-level review comments on a PR using GitHub's pull request review API.
 * This creates inline annotations on specific lines of the diff.
 */
export async function postLineReviewComments(
  token: string,
  owner: string,
  repo: string,
  prNumber: number,
  headSha: string,
  comments: Array<{
    path: string;
    line: number;
    body: string;
    suggestion?: string;
  }>,
  patchMap: Map<string, string> // filename → patch
) {
  const octokit = createOctokit(token);

  // Build review comments with diff positions
  const reviewComments: Array<{
    path: string;
    position?: number;
    line?: number;
    side?: string;
    body: string;
  }> = [];

  for (const comment of comments) {
    const patch = patchMap.get(comment.path);
    if (!patch) continue;

    const position = findDiffPosition(patch, comment.line);
    if (!position) continue;

    let body = comment.body;
    if (comment.suggestion) {
      body += `\n\n\`\`\`suggestion\n${comment.suggestion}\n\`\`\``;
    }

    reviewComments.push({
      path: comment.path,
      position,
      body,
    });
  }

  if (reviewComments.length === 0) return;

  try {
    await octokit.rest.pulls.createReview({
      owner,
      repo,
      pull_number: prNumber,
      commit_id: headSha,
      event: "COMMENT",
      comments: reviewComments,
    });
  } catch (error) {
    console.error("Error posting line-level review comments:", error);
    // Fallback: try posting comments individually if batch fails
    for (const comment of reviewComments) {
      try {
        await octokit.rest.pulls.createReviewComment({
          owner,
          repo,
          pull_number: prNumber,
          commit_id: headSha,
          path: comment.path,
          position: comment.position,
          body: comment.body,
        });
      } catch (innerError) {
        console.error(`Failed to post comment on ${comment.path}:`, innerError);
      }
    }
  }
}

// ─── Feature 3: Fetch changed files from a push for delta re-indexing ───────

export async function getChangedFilesFromCommits(
  token: string,
  owner: string,
  repo: string,
  commits: Array<{ added: string[]; modified: string[]; removed: string[] }>
): Promise<{ changedPaths: string[]; removedPaths: string[] }> {
  const changedSet = new Set<string>();
  const removedSet = new Set<string>();

  for (const commit of commits) {
    for (const path of commit.added || []) changedSet.add(path);
    for (const path of commit.modified || []) changedSet.add(path);
    for (const path of commit.removed || []) removedSet.add(path);
  }

  // If a file was removed then re-added in later commits, don't treat it as removed
  for (const path of changedSet) {
    removedSet.delete(path);
  }

  return {
    changedPaths: Array.from(changedSet),
    removedPaths: Array.from(removedSet),
  };
}

export async function getFileContent(
  token: string,
  owner: string,
  repo: string,
  path: string,
  ref?: string
): Promise<string | null> {
  const octokit = createOctokit(token);
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ...(ref ? { ref } : {}),
    });
    if (!Array.isArray(data) && data.type === "file" && data.content) {
      return decodeBase64(data.content);
    }
    return null;
  } catch {
    return null;
  }
}

export async function getHeadSha(
  token: string,
  owner: string,
  repo: string,
  branch: string = "main"
): Promise<string> {
  const octokit = createOctokit(token);
  const { data } = await octokit.rest.repos.getBranch({ owner, repo, branch });
  return data.commit.sha;
}

// ─── Feature B: Issue Intelligence ─────────────────────────────────────────

export async function getIssueDetails(
  token: string,
  owner: string,
  repo: string,
  issueNumber: number
) {
  const octokit = createOctokit(token);
  const { data } = await octokit.rest.issues.get({ owner, repo, issue_number: issueNumber });
  return {
    number: data.number,
    title: data.title,
    body: data.body || "",
    url: data.html_url,
    labels: (data.labels as any[]).map((l) => (typeof l === "string" ? l : l.name as string)).filter(Boolean),
  };
}

export async function postIssueComment(
  token: string,
  owner: string,
  repo: string,
  issueNumber: number,
  body: string
) {
  const octokit = createOctokit(token);
  const { data } = await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: issueNumber,
    body,
  });
  return data.id;
}

// ─── Feature A: Open PRs list (for manual trigger) ──────────────────────────

export async function getOpenPullRequests(
  token: string,
  owner: string,
  repo: string
): Promise<{ number: number; title: string; url: string }[]> {
  const octokit = createOctokit(token);
  const { data } = await octokit.rest.pulls.list({
    owner,
    repo,
    state: "open",
    per_page: 20,
  });
  return data.map((pr) => ({ number: pr.number, title: pr.title, url: pr.html_url }));
}

export async function deleteWebhook(
  token: string,
  owner: string,
  repo: string,
  webhookUrl: string
) {
  const octokit = createOctokit(token);

  try {
    const { data: hooks } = await octokit.rest.repos.listWebhooks({
      owner,
      repo,
    });

    const hookToDelete = hooks.find((hook) => hook.config.url === webhookUrl);

    if (hookToDelete) {
      await octokit.rest.repos.deleteWebhook({
        owner,
        repo,
        hook_id: hookToDelete.id,
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error deleting webhook:", error);
    return false;
  }
}
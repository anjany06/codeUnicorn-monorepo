import { Octokit } from "@octokit/rest";
import { GitHubFile, PullRequestDiff } from "../../types/src";


export function createOctokit(token: string) {
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
            content: Buffer.from(data.content, "base64").toString("utf-8"),
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
              content: Buffer.from(fileData.content, "base64").toString("utf-8"),
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
    diff: files.map((f) => f.patch || "").join("\n"),
    files: files.map((f) => ({
      path: f.filename,
      content: f.patch || "",
    })),
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
    body: `## PR Review through AI \n\n${review}\n\n---\n*Powered by CodeUnicorn*`,
  });
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
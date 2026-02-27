import { prisma } from "@codeunicorn/database";
import { Octokit } from "@octokit/rest";
import { inngest } from "../lib/inngest";

export async function getGithubToken(userId: string): Promise<string | null> {
  const account = await prisma.account.findFirst({
    where: { userId, providerId: "github" },
  });
  return account?.accessToken || null;
}

export async function fetchRepositories(userId: string, page: number = 1, perPage: number = 10) {
  const token = await getGithubToken(userId);

  if (!token) {
    throw new Error("GitHub token not found");
  }

  const octokit = new Octokit({ auth: token });

  // Fetch repos from GitHub
  const { data: githubRepos } = await octokit.rest.repos.listForAuthenticatedUser({
    per_page: perPage,
    page: page,
    sort: "updated",
  });

  // Get connected repos from DB
  const dbRepos = await prisma.repository.findMany({
    where: { userId },
  });

  const connectedRepoIds = new Set(dbRepos.map((repo) => repo.githubId));

  return githubRepos.map((repo: any) => ({
    id: repo.id,
    name: repo.name,
    owner: repo.owner.login,
    full_name: repo.full_name,
    html_url: repo.html_url,
    description: repo.description,
    language: repo.language,
    stargazers_count: repo.stargazers_count,
    forks_count: repo.forks_count,
    updated_at: repo.updated_at,
    isConnected: connectedRepoIds.has(BigInt(repo.id)),
  }));
}

export async function connectRepository(
  userId: string,
  owner: string,
  repo: string,
  githubId: number
) {
  // Check if already connected
  const existing = await prisma.repository.findFirst({
    where: { githubId: BigInt(githubId) },
  });

  if (existing) {
    throw new Error("Repository already connected");
  }

  const token = await getGithubToken(userId);

  if (!token) {
    throw new Error("GitHub token not found");
  }

  const octokit = new Octokit({ auth: token });

  // Create webhook
  const webhookUrl = `${process.env.API_NROK_URL}/api/webhooks/github`;

  try {
    // Check if webhook already exists
    const { data: hooks } = await octokit.rest.repos.listWebhooks({
      owner,
      repo,
    });

    const existingHook = hooks.find((hook) => hook.config.url === webhookUrl);

    if (!existingHook) {
      await octokit.rest.repos.createWebhook({
        owner,
        repo,
        config: {
          url: webhookUrl,
          content_type: "json",
          secret: process.env.GITHUB_WEBHOOK_SECRET!,
        },
        events: ["pull_request"],
      });
    }
  } catch (error) {
    console.error("Error creating webhook:", error);
    // Continue even if webhook creation fails
  }

  // Save to database
  const repository = await prisma.repository.create({
    data: {
      githubId: BigInt(githubId),
      name: repo,
      owner: owner,
      fullName: `${owner}/${repo}`,
      url: `https://github.com/${owner}/${repo}`,
      userId: userId,
    },
  });

  // Trigger indexing via Inngest

  try{
  await inngest.send({
    name: "repository.connected",
    data: {
      owner,
      repo,
      userId,
      repositoryId: repository.id,
    },
  });
  }
  catch (error) {
    console.error("Failed to send inngest event:", error);
  }
  
  // Convert BigInt to string for JSON serialization
  return {
    ...repository,
    githubId: repository.githubId.toString(),
    createdAt: repository.createdAt.toISOString(),
    updatedAt: repository.updatedAt.toISOString(),
  };
}

export async function getConnectedRepositories(userId: string) {
  const repositories = await prisma.repository.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return repositories.map((repo) => ({
    ...repo,
    githubId: repo.githubId.toString(),
    createdAt: repo.createdAt.toISOString(),
    updatedAt: repo.updatedAt.toISOString(),
  }));
}

export async function deleteWebhook(
  userId: string,
  owner: string,
  repo: string
): Promise<boolean> {
  const token = await getGithubToken(userId);

  if (!token) {
    console.error("GitHub token not found for webhook deletion");
    return false;
  }

  const octokit = new Octokit({ auth: token });
  const webhookUrl = `${process.env.API_NROK_URL}/api/webhooks/github`;

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

export async function disconnectRepository(userId: string, repositoryId: string) {
  const repository = await prisma.repository.findFirst({
    where: { id: repositoryId, userId },
  });

  if (!repository) {
    throw new Error("Repository not found");
  }

  // Delete webhook from GitHub
  await deleteWebhook(userId, repository.owner, repository.name);

  // Delete from database (this will cascade delete reviews)
  await prisma.repository.delete({
    where: { id: repositoryId },
  });

  return { success: true };
}

export async function disconnectAllRepositories(userId: string) {
  const repositories = await prisma.repository.findMany({
    where: { userId },
  });

  // Delete all webhooks in parallel
  await Promise.all(
    repositories.map((repo) => deleteWebhook(userId, repo.owner, repo.name))
  );

  // Delete all repositories from database
  const result = await prisma.repository.deleteMany({
    where: { userId },
  });

  return { success: true, count: result.count };
}
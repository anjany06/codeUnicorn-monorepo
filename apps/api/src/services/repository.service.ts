import { prisma } from "@codeunicorn/database";
import { Octokit } from "@octokit/rest";
import { inngest } from "../lib/inngest";
import {
  canConnectRepository,
  incrementRepositoryCount,
  decrementRepositoryCount,
} from "./subscription.service";

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

  const connectedRepoIds = new Set(dbRepos.map((repo: any) => repo.githubId));

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
  // Check subscription limits
  const canConnect = await canConnectRepository(userId);
  if (!canConnect) {
    throw new Error("Repository limit reached. Upgrade to Pro for unlimited repositories.");
  }

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

    const requiredEvents = ["pull_request", "push", "issues"];
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
        events: requiredEvents,
      });
    } else {
      // Patch the webhook if it's missing any required events (e.g. "issues" added later)
      const missingEvents = requiredEvents.filter(
        (e) => !existingHook.events?.includes(e)
      );
      if (missingEvents.length > 0) {
        await octokit.rest.repos.updateWebhook({
          owner,
          repo,
          hook_id: existingHook.id,
          events: [...(existingHook.events ?? []), ...missingEvents],
          active: true,
        });
      }
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

  // Track usage
  await incrementRepositoryCount(userId);

  // Trigger indexing via Inngest
  try {
    await inngest.send({
      name: "repository.connected",
      data: {
        owner,
        repo,
        userId,
        repositoryId: repository.id,
      },
    });
  } catch (error) {
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

  return repositories.map((repo: any) => ({
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

  // Track usage
  await decrementRepositoryCount(userId);

  return { success: true };
}

export async function disconnectAllRepositories(userId: string) {
  const repositories = await prisma.repository.findMany({
    where: { userId },
  });

  // Delete all webhooks in parallel
  await Promise.all(
    repositories.map((repo: any) => deleteWebhook(userId, repo.owner, repo.name))
  );

  // Delete all repositories from database
  const result = await prisma.repository.deleteMany({
    where: { userId },
  });

  // Reset repository count to 0
  await prisma.userUsage.upsert({
    where: { userId },
    create: { userId, repositoryCount: 0, reviewCounts: {} },
    update: { repositoryCount: 0 },
  });

  return { success: true, count: result.count };
}
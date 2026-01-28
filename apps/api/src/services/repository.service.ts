import { prisma } from "@codeunicorn/database";
import { Octokit } from "octokit";
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
    fullName: repo.full_name,
    url: repo.html_url,
    description: repo.description,
    language: repo.language,
    stargazersCount: repo.stargazers_count,
    forksCount: repo.forks_count,
    updatedAt: repo.updated_at,
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
  const webhookUrl = `${process.env.API_URL}/api/webhooks/github`;

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
        events: ["pull_request", "push"],
        active: true,
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
  await inngest.send({
    name: "repository.connected",
    data: {
      owner,
      repo,
      userId,
      repositoryId: repository.id,
    },
  });

  return repository;
}

export async function disconnectRepository(userId: string, repositoryId: string) {
  const repository = await prisma.repository.findFirst({
    where: { id: repositoryId, userId },
  });

  if (!repository) {
    throw new Error("Repository not found");
  }

  // Delete from database (this will cascade delete reviews)
  await prisma.repository.delete({
    where: { id: repositoryId },
  });

  return { success: true };
}
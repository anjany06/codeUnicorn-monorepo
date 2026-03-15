import { prisma } from "@codeunicorn/database";
import { Octokit } from "@octokit/rest";
import { getGithubToken } from "./repository.service";

// ─── Feature 4: Review Config per Repository ───────────────────────────────

const DEFAULT_CONFIG = {
  focusAreas: ["bugs", "security", "performance", "style", "best-practices"],
  severityThreshold: "low" as const,
  ignorePaths: [] as string[],
  customRules: null as string | null,
  autoFix: false,
  enabled: true,
  language: null as string | null,
  issueAnalysis: false,
};

export async function getReviewConfig(repositoryId: string, userId: string) {
  // Verify user owns the repository
  const repository = await prisma.repository.findFirst({
    where: { id: repositoryId, userId },
    include: { reviewConfig: true },
  });

  if (!repository) {
    throw new Error("Repository not found");
  }

  if (!repository.reviewConfig) {
    // Return defaults if no config exists yet
    return {
      repositoryId,
      ...DEFAULT_CONFIG,
    };
  }

  return repository.reviewConfig;
}

export async function upsertReviewConfig(
  repositoryId: string,
  userId: string,
  data: {
    language?: string | null;
    focusAreas?: string[];
    severityThreshold?: string;
    ignorePaths?: string[];
    customRules?: string | null;
    autoFix?: boolean;
    enabled?: boolean;
  }
) {
  // Verify user owns the repository
  const repository = await prisma.repository.findFirst({
    where: { id: repositoryId, userId },
  });

  if (!repository) {
    throw new Error("Repository not found");
  }

  // Validate focusAreas
  const validFocusAreas = ["bugs", "security", "performance", "style", "best-practices"];
  if (data.focusAreas) {
    const invalid = data.focusAreas.filter((a) => !validFocusAreas.includes(a));
    if (invalid.length > 0) {
      throw new Error(`Invalid focus areas: ${invalid.join(", ")}`);
    }
  }

  // Validate severityThreshold
  const validThresholds = ["low", "medium", "high"];
  if (data.severityThreshold && !validThresholds.includes(data.severityThreshold)) {
    throw new Error(`Invalid severity threshold: ${data.severityThreshold}`);
  }

  const config = await prisma.reviewConfig.upsert({
    where: { repositoryId },
    create: {
      repositoryId,
      language: data.language ?? DEFAULT_CONFIG.language,
      focusAreas: data.focusAreas ?? DEFAULT_CONFIG.focusAreas,
      severityThreshold: data.severityThreshold ?? DEFAULT_CONFIG.severityThreshold,
      ignorePaths: data.ignorePaths ?? DEFAULT_CONFIG.ignorePaths,
      customRules: data.customRules ?? DEFAULT_CONFIG.customRules,
      autoFix: data.autoFix ?? DEFAULT_CONFIG.autoFix,
      enabled: data.enabled ?? DEFAULT_CONFIG.enabled,
      issueAnalysis: (data as any).issueAnalysis ?? DEFAULT_CONFIG.issueAnalysis,
    },
    update: {
      ...(data.language !== undefined && { language: data.language }),
      ...(data.focusAreas !== undefined && { focusAreas: data.focusAreas }),
      ...(data.severityThreshold !== undefined && { severityThreshold: data.severityThreshold }),
      ...(data.ignorePaths !== undefined && { ignorePaths: data.ignorePaths }),
      ...(data.customRules !== undefined && { customRules: data.customRules }),
      ...(data.autoFix !== undefined && { autoFix: data.autoFix }),
      ...(data.enabled !== undefined && { enabled: data.enabled }),
      ...((data as any).issueAnalysis !== undefined && { issueAnalysis: (data as any).issueAnalysis }),
    },
  });

  // If issueAnalysis just got enabled, ensure the GitHub webhook subscribes to "issues"
  if ((data as any).issueAnalysis === true) {
    try {
      const token = await getGithubToken(userId);
      if (token) {
        const octokit = new Octokit({ auth: token });
        const webhookUrl = `${process.env.API_URL}/api/webhooks/github`;
        const { data: hooks } = await octokit.rest.repos.listWebhooks({
          owner: repository.owner,
          repo: repository.name,
        });
        const hook = hooks.find((h) => h.config.url === webhookUrl);
        if (hook && !hook.events?.includes("issues")) {
          await octokit.rest.repos.updateWebhook({
            owner: repository.owner,
            repo: repository.name,
            hook_id: hook.id,
            events: [...(hook.events ?? []), "issues"],
            active: true,
          });
          console.log(`Webhook updated to include 'issues' for ${repository.fullName}`);
        }
      }
    } catch (err) {
      console.error("Failed to update webhook for issues event:", err);
    }
  }

  return config;
}

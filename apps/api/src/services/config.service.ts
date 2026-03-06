import { prisma } from "@codeunicorn/database";

// ─── Feature 4: Review Config per Repository ───────────────────────────────

const DEFAULT_CONFIG = {
  focusAreas: ["bugs", "security", "performance", "style", "best-practices"],
  severityThreshold: "low" as const,
  ignorePaths: [] as string[],
  customRules: null as string | null,
  autoFix: false,
  enabled: true,
  language: null as string | null,
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
    },
    update: {
      ...(data.language !== undefined && { language: data.language }),
      ...(data.focusAreas !== undefined && { focusAreas: data.focusAreas }),
      ...(data.severityThreshold !== undefined && { severityThreshold: data.severityThreshold }),
      ...(data.ignorePaths !== undefined && { ignorePaths: data.ignorePaths }),
      ...(data.customRules !== undefined && { customRules: data.customRules }),
      ...(data.autoFix !== undefined && { autoFix: data.autoFix }),
      ...(data.enabled !== undefined && { enabled: data.enabled }),
    },
  });

  return config;
}

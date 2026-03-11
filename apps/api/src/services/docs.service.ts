import { prisma } from "@codeunicorn/database";
import { inngest } from "../lib/inngest";
import { getUserTier } from "./subscription.service";

const VALID_DOC_TYPES = ["readme", "architecture", "onboarding"] as const;
type DocType = (typeof VALID_DOC_TYPES)[number];

class DocsServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function isValidDocType(type: string): type is DocType {
  return VALID_DOC_TYPES.includes(type as DocType);
}

export async function getGeneratedDocs(repositoryId: string, userId: string) {
  // Verify user owns this repository
  const repository = await prisma.repository.findFirst({
    where: { id: repositoryId, userId },
  });
  if (!repository) throw new Error("Repository not found");

  return prisma.generatedDoc.findMany({
    where: {
      repositoryId,
      type: { in: [...VALID_DOC_TYPES] },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getGeneratedDoc(
  repositoryId: string,
  docType: string,
  userId: string
) {
  if (!isValidDocType(docType)) {
    throw new DocsServiceError(
      `Invalid doc type: ${docType}. Valid: ${VALID_DOC_TYPES.join(", ")}`,
      400
    );
  }

  const repository = await prisma.repository.findFirst({
    where: { id: repositoryId, userId },
  });
  if (!repository) throw new Error("Repository not found");

  return prisma.generatedDoc.findUnique({
    where: { repositoryId_type: { repositoryId, type: docType } },
  });
}

export async function triggerDocGeneration(
  repositoryId: string,
  docType: string,
  userId: string
) {
  if (!isValidDocType(docType)) {
    throw new DocsServiceError(
      `Invalid doc type: ${docType}. Valid: ${VALID_DOC_TYPES.join(", ")}`,
      400
    );
  }

  const repository = await prisma.repository.findFirst({
    where: { id: repositoryId, userId },
  });
  if (!repository) throw new Error("Repository not found");

  const existingDoc = await prisma.generatedDoc.findUnique({
    where: { repositoryId_type: { repositoryId, type: docType } },
    select: { status: true },
  });

  if (existingDoc?.status === "pending") {
    throw new DocsServiceError("Document generation is already in progress", 429);
  }

  const isRegenerate = existingDoc?.status === "completed";
  if (isRegenerate) {
    const tier = await getUserTier(userId);
    if (tier !== "PRO") {
      throw new DocsServiceError(
        "Regeneration is available for Pro users only",
        403
      );
    }
  }

  // Upsert a pending record immediately so UI can show loading state
  const doc = await prisma.generatedDoc.upsert({
    where: { repositoryId_type: { repositoryId, type: docType } },
    create: {
      repositoryId,
      type: docType,
      title: docType,
      content: "",
      status: "pending",
    },
    update: { status: "pending", content: "" },
  });

  // Fire Inngest job
  await inngest.send({
    name: "docs.generate.requested",
    data: { repositoryId, docType, userId },
  });

  return doc;
}

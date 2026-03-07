import { prisma } from "@codeunicorn/database";
import { inngest } from "../lib/inngest";

const VALID_DOC_TYPES = ["readme", "api-docs", "architecture", "onboarding"] as const;
type DocType = (typeof VALID_DOC_TYPES)[number];

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
    where: { repositoryId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getGeneratedDoc(
  repositoryId: string,
  docType: string,
  userId: string
) {
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
    throw new Error(`Invalid doc type: ${docType}. Valid: ${VALID_DOC_TYPES.join(", ")}`);
  }

  const repository = await prisma.repository.findFirst({
    where: { id: repositoryId, userId },
  });
  if (!repository) throw new Error("Repository not found");

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

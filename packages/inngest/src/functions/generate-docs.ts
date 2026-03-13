import { inngest } from "../client.js";
import { prisma } from "@codeunicorn/database";
import { generateDocMarkdown } from "@codeunicorn/ai";

const DOC_TITLES: Record<string, string> = {
  readme: "README.md",
  architecture: "Architecture Overview",
  onboarding: "Onboarding Guide",
};

export const generateDocs = inngest.createFunction(
  { id: "generate-docs", concurrency: 3 },
  { event: "docs.generate.requested" },

  async ({ event, step }) => {
    const { repositoryId, docType, userId } = event.data;

    // Step 1: Verify repository belongs to user and get details
    const repository = await step.run("fetch-repository", async () => {
      const repo = await prisma.repository.findFirst({
        where: { id: repositoryId, userId },
      });
      if (!repo) throw new Error("Repository not found");
      return repo;
    });

    // Step 2: Mark doc as in-progress (upsert)
    await step.run("init-doc-record", async () => {
      await prisma.generatedDoc.upsert({
        where: { repositoryId_type: { repositoryId, type: docType } },
        create: {
          repositoryId,
          type: docType,
          title: DOC_TITLES[docType] || docType,
          content: "",
          status: "pending",
        },
        update: {
          status: "pending",
          content: "",
        },
      });
    });

    // Step 3: Generate document using RAG + Gemini
    const content = await step.run("generate-content", async () => {
      try {
        const markdown = await generateDocMarkdown(
          repository.id,
          docType,
          repository.fullName
        );
        return markdown;
      } catch (error: any) {
        console.error(`Doc generation failed for ${docType}:`, error);
        throw error;
      }
    });

    // Step 4: Save completed document
    await step.run("save-doc", async () => {
      await prisma.generatedDoc.update({
        where: { repositoryId_type: { repositoryId, type: docType } },
        data: {
          content,
          status: "completed",
          title: DOC_TITLES[docType] || docType,
        },
      });
    });

    return { success: true, repositoryId, docType, contentLength: content.length };
  }
);

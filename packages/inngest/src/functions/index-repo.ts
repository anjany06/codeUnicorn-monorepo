import { prisma } from "@codeunicorn/database";
import { inngest } from "../client.js";
import { getRepoFileContents, getHeadSha } from "@codeunicorn/github";
import { indexCodebase } from "@codeunicorn/ai";

export const indexRepo = inngest.createFunction(
  { id: "index-the-repository" },
  { event: "repository.connected" },

  async ({ event, step }) => {
    const { owner, repo, userId, repositoryId } = event.data;

    // STEP 1: Fetch all files and index them
    const fileCount = await step.run("fetch-and-index-codebase", async () => {
      const account = await prisma.account.findFirst({
        where: {
          userId: userId,
          providerId: "github",
        },
      });

      if (!account?.accessToken) {
        throw new Error("No Github access token found");
      }

      // Fetch files
      const files = await getRepoFileContents(account.accessToken, owner, repo);

      // Index immediately
      const indexedCount = await indexCodebase(`${owner}/${repo}`, files);

      if (indexedCount === 0) {
        throw new Error(`Indexing failed: 0 out of ${files.length} files were indexed`);
      }

      return indexedCount;
    });

    // STEP 2: Track last indexed commit for delta re-indexing
    await step.run("update-repo-index-tracking", async () => {
      const account = await prisma.account.findFirst({
        where: { userId, providerId: "github" },
      });

      if (account?.accessToken && repositoryId) {
        try {
          const headSha = await getHeadSha(account.accessToken, owner, repo);
          await prisma.repository.update({
            where: { id: repositoryId },
            data: {
              lastIndexedCommit: headSha,
              indexedAt: new Date(),
            },
          });
        } catch (error) {
          console.error("Failed to update index tracking:", error);
        }
      }
    });

    return { success: true, indexedFiles: fileCount };
  }
);
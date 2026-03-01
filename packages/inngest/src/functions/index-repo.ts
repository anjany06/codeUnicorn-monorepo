import { prisma } from "@codeunicorn/database";
import { inngest } from "../client";
import { getRepoFileContents } from "../../../github/src";
import { indexCodebase } from "../../../ai/src";

export const indexRepo = inngest.createFunction(
  { id: "index-the-repository" },
  { event: "repository.connected" },

  async ({ event, step }) => {
    const { owner, repo, userId } = event.data;

    // STEP 1: Get file paths only (not content) to check count
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

      // Index immediately — don't return large file contents as step output
      const indexedCount = await indexCodebase(`${owner}/${repo}`, files);

      if (indexedCount === 0) {
        throw new Error(`Indexing failed: 0 out of ${files.length} files were indexed`);
      }

      // Only return a small summary, NOT the file contents
      return indexedCount;
    });

    return { success: true, indexedFiles: fileCount };
  }
);
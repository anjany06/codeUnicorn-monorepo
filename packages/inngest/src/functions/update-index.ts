import { inngest } from "../client.js";
import { getFileContent } from "@codeunicorn/github";
import { updateCodebaseIndex } from "@codeunicorn/ai";
import { prisma } from "@codeunicorn/database";

/**
 * Feature 3: Re-index on Push
 *
 * Triggered when a push event is received on a connected repository's default branch.
 * Only re-indexes changed/added files and removes deleted file vectors (delta indexing).
 * Much more efficient than full re-index.
 */
export const updateIndex = inngest.createFunction(
  { id: "update-index-on-push", concurrency: 3 },
  { event: "repository.push" },

  async ({ event, step }) => {
    const { owner, repo, userId, repositoryId, headCommit, changedPaths, removedPaths } = event.data;

    // Step 1: Fetch content of changed files from GitHub
    const changedFiles = await step.run("fetch-changed-files", async () => {
      const account = await prisma.account.findFirst({
        where: { userId, providerId: "github" },
      });

      if (!account?.accessToken) {
        throw new Error("No Github access token found");
      }

      const files: { path: string; content: string }[] = [];

      for (const filePath of changedPaths) {
        // Skip non-code files
        if (filePath.match(/\.(png|jpg|jpeg|gif|svg|ico|pdf|zip|tar|gz|woff|woff2|ttf|eot|mp4|mp3|mov|avi)$/i)) {
          continue;
        }
        if (filePath.match(/^(node_modules|\.git|\.next|dist|build|coverage|__pycache__|\.cache|vendor)\//i)) {
          continue;
        }

        const content = await getFileContent(account.accessToken, owner, repo, filePath, headCommit);
        if (content) {
          files.push({ path: filePath, content });
        }
      }

      return files;
    });

    // Step 2: Update Pinecone vectors (delta indexing)
    const updatedCount = await step.run("update-vectors", async () => {
      const repoId = `${owner}/${repo}`;
      return await updateCodebaseIndex(repoId, changedFiles, removedPaths || []);
    });

    // Step 3: Update repository record with latest indexed commit
    await step.run("update-repo-record", async () => {
      await prisma.repository.update({
        where: { id: repositoryId },
        data: {
          lastIndexedCommit: headCommit,
          indexedAt: new Date(),
        },
      });
    });

    return {
      success: true,
      updatedFiles: updatedCount,
      removedFiles: (removedPaths || []).length,
      headCommit,
    };
  }
);

import { inngest } from "../client";
import { prisma } from "@coderabbit/database";
import { getRepoFileContents } from "@coderabbit/github";
import { indexCodebase } from "@coderabbit/ai";

export const indexRepo = inngest.createFunction(
  { id: "index-repo" },
  { event: "repository.connected" },

  async ({ event, step }) => {
    const { owner, repo, userId } = event.data;

    // STEP 1: Get the user's GitHub token
    const token = await step.run("get-token", async () => {
      const account = await prisma.account.findFirst({
        where: {
          userId: userId,
          providerId: "github",
        },
      });

      if (!account?.accessToken) {
        throw new Error("GitHub access token not found");
      }

      return account.accessToken;
    });

    // STEP 2: Fetch all files from repository
    const files = await step.run("fetch-files", async () => {
      const repoFiles = await getRepoFileContents(token, owner, repo, "");
      console.log(`Fetched ${repoFiles.length} files from ${owner}/${repo}`);
      return repoFiles;
    });

    // STEP 3: Index the codebase
    if (files.length > 0) {
      await step.run("index-codebase", async () => {
        const repository = await prisma.repository.findFirst({
          where: { owner, name: repo },
        });

        if (repository) {
          await indexCodebase(repository.id, files);
        }
      });
    }

    return {
      success: true,
      filesIndexed: files.length,
    };
  }
);
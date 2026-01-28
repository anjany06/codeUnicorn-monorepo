import { inngest } from "../client";
import { prisma } from "@coderabbit/database";
import { getPullRequestDiff } from "@coderabbit/github";
import { retrieveContext, generateCodeReview } from "@coderabbit/ai";

export const prReview = inngest.createFunction(
  { id: "pr-review" },
  { event: "pr.review.requested" },

  async ({ event, step }) => {
    const { owner, repo, prNumber, userId } = event.data;

    // Get repository and token
    const { repository, token } = await step.run("get-context", async () => {
      const repo = await prisma.repository.findFirst({
        where: { owner, name: repo },
        include: {
          user: {
            include: {
              accounts: {
                where: { providerId: "github" },
              },
            },
          },
        },
      });

      if (!repo) throw new Error("Repository not found");

      const account = repo.user.accounts[0];
      if (!account?.accessToken) throw new Error("Token not found");

      return { repository: repo, token: account.accessToken };
    });

    // Get PR diff
    const diff = await step.run("get-diff", async () => {
      return await getPullRequestDiff(token, owner, repo, prNumber);
    });

    // Retrieve context from indexed codebase
    const context = await step.run("get-context", async () => {
      return await retrieveContext(diff.title, repository.id);
    });

    // Generate AI review
    const review = await step.run("generate-review", async () => {
      return await generateCodeReview(diff.diff, context);
    });

    // Save review to database
    await step.run("save-review", async () => {
      await prisma.review.create({
        data: {
          repositoryId: repository.id,
          prNumber,
          prTitle: diff.title,
          prUrl: `https://github.com/${owner}/${repo}/pull/${prNumber}`,
          review: review,
          status: "completed",
        },
      });
    });

    return { success: true };
  }
);
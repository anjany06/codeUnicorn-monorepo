import { Router , type Router as RouterType } from "express";
import crypto from "crypto";
import { prisma } from "@codeunicorn/database";
import { inngest } from "@codeunicorn/inngest";
import { canCreateReview } from "../services/subscription.service";
import { getChangedFilesFromCommits } from "@codeunicorn/github";


export const webhookRouter: RouterType = Router();

function verifySignature(rawBody: Buffer, signature: string): boolean {
  const secret = process.env.GITHUB_WEBHOOK_SECRET!;
  const hmac = crypto.createHmac("sha256", secret);
  const digest = "sha256=" + hmac.update(rawBody).digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}


// GitHub webhook endpoint
webhookRouter.post("/github", async (req, res) => {
  try {
    const event = req.headers["x-github-event"] as string;
    const signature = req.headers["x-hub-signature-256"] as string;

    console.log("Received GitHub event:", event);

    // Verify signature first (before any other processing)
    if (!signature || !verifySignature(req.body, signature)) {
      console.error("Invalid signature");
      return res.status(401).json({ error: "Invalid signature" });
    }

    // Handle ping after signature verification
    if (event === "ping") {
      return res.json({ msg: "pong" });
    }

    // req.body is a raw Buffer (from express.raw middleware), so parse it
    const body = JSON.parse(req.body.toString());
    

    // Handle pull_request event
    if (event === "pull_request") {
      const action = body.action;
      const repoFullName = body.repository?.full_name;
      const prNumber = body.pull_request?.number;

      if (!repoFullName || !prNumber) {
        return res.status(400).json({ error: "Missing data" });
      }

      const [owner, repoName] = repoFullName.split("/");

      console.log(`PR Event: ${action} - ${repoFullName}#${prNumber}`);

      if (action === "opened" || action === "synchronize") {
        // Find repository with review config
        const repository = await prisma.repository.findFirst({
          where: { owner, name: repoName },
          include: { reviewConfig: true },
        });

        if (repository) {
          // Check if reviews are enabled via config (Feature 4)
          if (repository.reviewConfig && !repository.reviewConfig.enabled) {
            console.log(`Reviews disabled for repo ${repository.id} via config`);
            return res.json({ success: true, skipped: true, reason: "Reviews disabled via config" });
          }

          // Check if user can create a review (subscription limits)
          const allowed = await canCreateReview(repository.userId, repository.id);
          if (!allowed) {
            console.log(`Review limit reached for user ${repository.userId} on repo ${repository.id}`);
            return res.json({ success: true, skipped: true, reason: "Review limit reached" });
          }

          await inngest.send({
            name: "pr.review.requested",
            data: {
              owner,
              repo: repoName,
              prNumber,
              userId: repository.userId,
              repositoryId: repository.id,
            },
          });
        }
      }
    }

    // ─── Feature 3: Handle push event for delta re-indexing ────────────────
    if (event === "push") {
      const repoFullName = body.repository?.full_name;
      const ref = body.ref; // e.g. "refs/heads/main"
      const defaultBranch = body.repository?.default_branch; // e.g. "main"
      const headCommit = body.after;
      const commits = body.commits || [];

      if (!repoFullName || !ref || !headCommit) {
        return res.status(400).json({ error: "Missing push data" });
      }

      // Only process pushes to the default branch
      const branchName = ref.replace("refs/heads/", "");
      if (branchName !== defaultBranch) {
        console.log(`Push to non-default branch ${branchName}, skipping re-index`);
        return res.json({ success: true, skipped: true, reason: "Non-default branch" });
      }

      const [owner, repoName] = repoFullName.split("/");

      const repository = await prisma.repository.findFirst({
        where: { owner, name: repoName },
      });

      if (repository) {
        // Extract changed and removed file paths from commits
        const { changedPaths, removedPaths } = await getChangedFilesFromCommits(
          "", // token not needed for parsing commit data
          owner,
          repoName,
          commits
        );

        if (changedPaths.length > 0 || removedPaths.length > 0) {
          console.log(`Push to ${repoFullName}: ${changedPaths.length} changed, ${removedPaths.length} removed files`);

          await inngest.send({
            name: "repository.push",
            data: {
              owner,
              repo: repoName,
              userId: repository.userId,
              repositoryId: repository.id,
              headCommit,
              changedPaths,
              removedPaths,
            },
          });
        } else {
          console.log(`Push to ${repoFullName}: no file changes detected`);
        }
      }
    }

    res.json({ success: true, event });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
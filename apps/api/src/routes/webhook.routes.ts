import { Router , type Router as RouterType } from "express";
import crypto from "crypto";
import { prisma } from "@codeunicorn/database";
import { inngest } from "@codeunicorn/inngest";


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
      const repo = body.repository?.full_name;
      const prNumber = body.pull_request?.number;

      if (!repo || !prNumber) {
        return res.status(400).json({ error: "Missing data" });
      }

      const [owner, repoName] = repo.split("/");

      console.log(`PR Event: ${action} - ${repo}#${prNumber}`);

      if (action === "opened" || action === "synchronize") {
        // Find repository
        const repository = await prisma.repository.findFirst({
          where: { owner, name: repoName },
        });

        if (repository) {
          await inngest.send({
            name: "pr.review.requested",
            data: {
              owner,
              repo: repoName,
              prNumber,
              userId: repository.userId,
            },
          });
        }
      }
    }

    res.json({ success: true, event });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../lib/auth";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "@codeunicorn/database";

export const authRouter: Router = Router();

/**
 * Custom endpoint: Get current user with GitHub token
 * GET /api/auth/me
 * Place custom routes BEFORE the catch-all
 */
authRouter.get("/me", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: {
          where: { providerId: "github" },
          select: {
            providerId: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Better Auth handles these routes automatically:
 * - POST /api/auth/sign-in/social (GitHub OAuth)
 * - GET  /api/auth/callback/github (OAuth callback)
 * - POST /api/auth/sign-out
 * - GET  /api/auth/get-session
 * 
 * MUST be last - catches all other auth routes
 */
authRouter.all("/*", toNodeHandler(auth));
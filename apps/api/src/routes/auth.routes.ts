import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../lib/auth";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";

export const authRouter = Router();

// Better Auth handles all auth routes automatically
// This catches all /api/auth/* routes
authRouter.all("/*", toNodeHandler(auth));

// Additional custom auth endpoints
authRouter.get("/me", authMiddleware, async (req: AuthRequest, res) => {
  res.json({
    success: true,
    data: {
      user: req.user,
    },
  });
});
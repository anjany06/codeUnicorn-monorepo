import { Request, Response, NextFunction } from "express";
import { auth, Session, User } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";

// Extend Express Request type
export interface AuthRequest extends Request {
  session?: Session;
  user?: User;
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Convert Express headers to Web API Headers format
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    req.session = session;
    req.user = session.user;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      success: false,
      error: "Authentication failed",
    });
  }
}

// Optional auth - doesn't fail if not authenticated
export async function optionalAuthMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (session) {
      req.session = session;
      req.user = session.user;
    }

    next();
  } catch (error) {
    next();
  }
}
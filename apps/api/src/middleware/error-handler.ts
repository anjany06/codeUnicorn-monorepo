import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Error:", err);

  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === "production" 
      ? "Internal server error" 
      : err.message,
  });
}
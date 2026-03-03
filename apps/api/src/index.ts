import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import "dotenv/config";
import cookieParser from "cookie-parser";
import { serve } from "inngest/express";

import { inngest } from "./lib/inngest";
import { authRouter } from "./routes/auth.routes";
import { userRouter } from "./routes/user.routes";
import { dashboardRouter } from "./routes/dashboard.routes";
import { repositoryRouter } from "./routes/repository.routes";
import { reviewRouter } from "./routes/review.routes";
import { subscriptionRouter } from "./routes/subscription.routes";
import { webhookRouter } from "./routes/webhook.routes"; 

// Import Inngest functions
import { indexRepo, generateReview } from "@codeunicorn/inngest";


const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true, // Important for cookies
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(morgan("dev"));

app.use(
  "/api/webhooks",
  express.raw({ type: "application/json" }),
  webhookRouter
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Inngest endpoint
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [indexRepo, generateReview],
  })
);

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/repositories", repositoryRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/subscription", subscriptionRouter);


// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
});

app.listen(PORT, () => {
  console.log(`API Server running on http://localhost:${PORT}`);
});
export { inngest } from "./client";
export { indexRepo } from "./functions/index-repo";
export { prReview } from "./functions/pr-review";

// Export all functions for the serve handler
export const functions = [indexRepo, prReview];
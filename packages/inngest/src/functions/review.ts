import { inngest } from "../client";
import {
  getPullRequestDiff,
  postReviewComment,
  postLineReviewComments,
  postBotStatusComment,
  updateComment,
} from "@codeunicorn/github";
import { retrieveContext } from "@codeunicorn/ai";
import { generateText, generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { prisma } from "@codeunicorn/database";
import { z } from "zod";
import type { PullRequestFile } from "@codeunicorn/types";
import { minimatch } from "minimatch";

// ─── Zod schema for structured AI review output ────────────────────────────

const lineCommentSchema = z.object({
  path: z.string().describe("The file path this comment applies to"),
  startLine: z.number().describe("The starting line number in the new file"),
  endLine: z.number().describe("The ending line number in the new file (same as startLine for single-line comments)"),
  // Concise, actionable comment: what the problem is and why it matters
  body: z.string().describe("Concise, actionable comment: state what the problem is, why it matters, and how to fix it"),
  suggestion: z.string().optional().describe("Optional replacement code for a fix suggestion. Only include when confident in the fix."),
  severity: z.enum(["low", "medium", "high", "critical"]).describe("Severity level of the finding"),
  // Category helps group inline comments in the summary table
  category: z.enum(["bug", "security", "performance", "style", "best-practice", "other"])
    .describe("Category of the inline finding"),
});

// Schema for a standalone issue (bug / security / code-smell)
const issueSchema = z.object({
  type: z.enum(["bug", "security", "code-smell"])
    .describe("Category of the issue"),
  title: z.string().describe("Short one-line title of the issue"),
  description: z.string().describe("Detailed explanation of the issue, its impact, and how to resolve it"),
  severity: z.enum(["low", "medium", "high", "critical"])
    .describe("Severity level of the issue"),
  // File/location reference is optional but highly valued
  location: z.string().optional().describe("File path and approximate line reference, e.g. src/auth.ts:42"),
});

const structuredReviewSchema = z.object({
  summary: z.string().describe("A brief 2-3 sentence summary of the PR changes"),
  walkthrough: z.string().describe("A file-by-file markdown explanation of the changes"),
  strengths: z.array(z.string()).describe("List of things done well in this PR"),
  lineComments: z.array(lineCommentSchema).describe("Inline code review comments targeting specific lines in changed files"),
  overallComments: z.array(z.string()).describe("General observations not tied to specific lines"),
  // Distinct issues list: bugs, security vulnerabilities, notable code smells
  issues: z.array(issueSchema).describe("Distinct bugs, security vulnerabilities, or significant code smells found in the PR"),
  // Concrete improvement suggestions not tied to a specific issue
  suggestions: z.array(z.string()).describe("Specific, actionable code improvements or refactor ideas for this PR"),
  // Mermaid sequence diagram showing the flow introduced or changed by this PR
  sequenceDiagram: z.string()
    .describe("A valid Mermaid JS sequence diagram (sequenceDiagram block) showing the flow introduced or changed by this PR. Always generate a diagram. Use only simple alphanumeric labels — no quotes, braces, or parentheses inside Note text."),
});

// ─── Helper: filter files by ignore patterns ────────────────────────────────

function filterFilesByIgnorePaths(
  files: PullRequestFile[],
  ignorePaths: string[]
): PullRequestFile[] {
  if (!ignorePaths || ignorePaths.length === 0) return files;
  return files.filter(
    (f) => !ignorePaths.some((pattern) => minimatch(f.filename, pattern))
  );
}

// ─── Helper: build severity filter ─────────────────────────────────────────

const severityOrder: Record<string, number> = { low: 0, medium: 1, high: 2, critical: 3 };

function filterBySeverity(
  comments: z.infer<typeof lineCommentSchema>[],
  threshold: string
): z.infer<typeof lineCommentSchema>[] {
  const minLevel = severityOrder[threshold] ?? 0;
  return comments.filter((c) => (severityOrder[c.severity] ?? 0) >= minLevel);
}

// ─── Helper: format summary markdown ────────────────────────────────────────

// Emoji badges for severity and issue type used across sections
const severityBadge: Record<string, string> = {
  low: "🟢 LOW",
  medium: "🟡 MEDIUM",
  high: "🟠 HIGH",
  critical: "🔴 CRITICAL",
};

const issueTypeBadge: Record<string, string> = {
  bug: "🐛 Bug",
  security: "🔒 Security",
  "code-smell": "🧹 Code Smell",
};

function formatSummaryMarkdown(review: z.infer<typeof structuredReviewSchema>): string {
  let md = `## Summary\n\n${review.summary}\n\n`;

  // ── Sequence diagram ──────────────────────────────────────────────────────
  md += `## Sequence Diagram\n\n`;
  md += `> Flow introduced or modified by this PR.\n\n`;
  md += `\`\`\`mermaid\n${review.sequenceDiagram}\n\`\`\`\n\n`;

  md += `## Walkthrough\n\n${review.walkthrough}\n\n`;

  if (review.strengths.length > 0) {
    md += `## Strengths\n\n${review.strengths.map((s) => `- ✅ ${s}`).join("\n")}\n\n`;
  }

  // ── Issues: bugs, security, code smells ──────────────────────────────────
  if (review.issues && review.issues.length > 0) {
    md += `## Issues\n\n`;
    md += `| Type | Severity | Title | Location |\n`;
    md += `|------|----------|-------|----------|\n`;
    for (const issue of review.issues) {
      const typeLabel = issueTypeBadge[issue.type] ?? issue.type;
      const sevLabel = severityBadge[issue.severity] ?? issue.severity;
      const loc = issue.location ? `\`${issue.location}\`` : "—";
      md += `| ${typeLabel} | ${sevLabel} | **${issue.title}** | ${loc} |\n`;
    }
    md += `\n`;
    // Detailed descriptions folded under the table
    for (const issue of review.issues) {
      md += `<details>\n<summary><b>${issue.title}</b></summary>\n\n${issue.description}\n\n</details>\n\n`;
    }
  }

  // ── Suggestions ──────────────────────────────────────────────────────────
  if (review.suggestions && review.suggestions.length > 0) {
    md += `## Suggestions\n\n`;
    md += review.suggestions.map((s) => `- 💡 ${s}`).join("\n");
    md += `\n\n`;
  }

  if (review.overallComments.length > 0) {
    md += `## General Observations\n\n${review.overallComments.map((c) => `- ${c}`).join("\n")}\n\n`;
  }

  // ── Inline comments summary table ────────────────────────────────────────
  if (review.lineComments.length > 0) {
    md += `## Inline Comments\n\n`;
    md += `> ${review.lineComments.length} inline comment(s) have been posted directly on the changed files.\n\n`;
    md += `| File | Lines | Category | Severity |\n`;
    md += `|------|-------|----------|----------|\n`;
    for (const c of review.lineComments) {
      const lines = c.startLine === c.endLine ? `L${c.startLine}` : `L${c.startLine}-L${c.endLine}`;
      const cat = c.category ?? "other";
      md += `| \`${c.path}\` | ${lines} | ${cat} | ${severityBadge[c.severity] ?? c.severity} |\n`;
    }
    md += `\n`;
  }

  return md;
}

// ─── Main Review Function ───────────────────────────────────────────────────

export const generateReview = inngest.createFunction(
  { id: "generate-review", concurrency: 5 },
  { event: "pr.review.requested" },

  async ({ event, step }) => {
    const { owner, repo, prNumber, userId } = event.data;

    // Step 1: Fetch review config for this repository
    const config = await step.run("fetch-config", async () => {
      const repository = await prisma.repository.findFirst({
        where: { owner, name: repo },
        include: { reviewConfig: true },
      });

      if (!repository) return null;

      // If reviews are disabled via config, return a flag
      if (repository.reviewConfig && !repository.reviewConfig.enabled) {
        return { enabled: false } as any;
      }

      return repository.reviewConfig || {
        enabled: true,
        focusAreas: ["bugs", "security", "performance", "style", "best-practices"],
        severityThreshold: "low",
        ignorePaths: [],
        customRules: null,
        autoFix: false,
        language: null,
      };
    });

    // Early exit if reviews are disabled
    if (config && !config.enabled) {
      return { success: true, skipped: true, reason: "Reviews disabled for this repository" };
    }

    // Step 1.5: Post initial "review in progress" bot comment on the PR
    const statusCommentId = await step.run("post-status-comment", async () => {
      const account = await prisma.account.findFirst({
        where: { userId, providerId: "github" },
      });

      if (!account?.accessToken) {
        throw new Error("No Github access token found");
      }

      return await postBotStatusComment(account.accessToken, owner, repo, prNumber);
    });

    // Step 2: Fetch PR data (diff with richer file info)
    const prData = await step.run("fetch-pr-data", async () => {
      const account = await prisma.account.findFirst({
        where: { userId, providerId: "github" },
      });

      if (!account?.accessToken) {
        throw new Error("No Github access token found");
      }

      const data = await getPullRequestDiff(account.accessToken, owner, repo, prNumber);

      // Filter out ignored files
      const filteredFiles = filterFilesByIgnorePaths(data.files, config?.ignorePaths || []);
      const filteredDiff = filteredFiles
        .map((f) => `--- a/${f.filename}\n+++ b/${f.filename}\n${f.patch}`)
        .join("\n");

      return {
        ...data,
        files: filteredFiles,
        diff: filteredDiff,
        token: account.accessToken,
      };
    });

    // Step 3: Retrieve RAG context
    const context = await step.run("retrieve-context", async () => {
      const query = `${prData.title}\n${prData.description || ""}`;
      return await retrieveContext(query, `${owner}/${repo}`, 8);
    });

    // Step 4: Generate structured review with line-level comments
    const structuredReview = await step.run("generate-structured-review", async () => {
      const focusAreasText = config?.focusAreas?.length
        ? `Focus your review primarily on: ${config.focusAreas.join(", ")}.`
        : "";

      const severityText = config?.severityThreshold && config.severityThreshold !== "low"
        ? `Only report issues of ${config.severityThreshold} severity or higher.`
        : "";

      const customRulesText = config?.customRules
        ? `\nAdditional review rules from the repository maintainer:\n${config.customRules}`
        : "";

      const autoFixText = config?.autoFix
        ? `When you identify an issue that has a clear, confident fix, include a "suggestion" field with the corrected replacement code. The suggestion should be the exact replacement text for the lines in question.`
        : `Do not include code fix suggestions in the "suggestion" field.`;

      const languageText = config?.language
        ? `The primary language of this project is ${config.language}.`
        : "";

      const changedFilePaths = (prData.files as any[]).map((f: any) => f.filename).join(", ");

      const prompt = `You are an expert code reviewer. Analyze the following pull request and return a detailed, constructive review.

${languageText}
${focusAreasText}
${severityText}

PR Title: ${prData.title}
PR Description: ${prData.description || "No description provided"}

Changed Files: ${changedFilePaths}

Context from Codebase (relevant existing code for understanding):
${context.join("\n\n---\n\n")}

Code Changes (unified diff format):
\`\`\`diff
${prData.diff}
\`\`\`

IMPORTANT INSTRUCTIONS:

### lineComments (inline comments)
- Each comment MUST reference a valid file path from the changed files list and a valid line number from the diff (use new-file line numbers from the + side).
- Set "category" to one of: bug, security, performance, style, best-practice, other.
- Each "body" must be concise and actionable (2-4 sentences max): state what the problem is, why it matters, and how to fix it. Reference actual variable or function names.
- ${autoFixText}
- Do NOT comment on trivially obvious style nits. Focus on real bugs, risks, and meaningful improvements.

### issues (standalone issues)
- Report distinct bugs, security vulnerabilities (e.g. injection, missing auth checks, exposed secrets), and significant code smells.
- Each issue needs a short title, a detailed description with impact and remediation, a severity, and an optional location reference.

### suggestions (improvement ideas)
- Provide specific, actionable refactor or improvement ideas that are not tied to a single line.
- Examples: extract a helper function, use a more efficient data structure, add input validation, improve error handling.

### sequenceDiagram (required Mermaid)
- ALWAYS generate a sequenceDiagram block showing the flow introduced or changed by this PR.
- For any PR — whether it adds an API endpoint, modifies business logic, updates a UI flow, or changes data processing — produce a meaningful sequence diagram illustrating the key interactions.
- Use ONLY simple alphanumeric participant names and message labels. Do NOT use quotes, braces, parentheses, or special characters inside Note text or arrow labels — they break Mermaid rendering.
${customRulesText}`;

      const { object } = await generateObject({
        model: google("gemini-2.5-flash"),
        output: "object" as const,
        schema: structuredReviewSchema,
        prompt,
      }) as { object: z.infer<typeof structuredReviewSchema> };

      return object;
    });

    // Step 5: Filter comments by severity threshold
    const filteredComments = config?.severityThreshold
      ? filterBySeverity(structuredReview.lineComments, config.severityThreshold)
      : structuredReview.lineComments;

    // Step 6: Post inline line-level comments on the PR
    await step.run("post-inline-comments", async () => {
      if (filteredComments.length === 0) return;

      // Build patch map for diff position calculation
      const patchMap = new Map<string, string>();
      for (const file of (prData.files as any[])) {
        patchMap.set(file.filename, file.patch);
      }

      const comments = filteredComments.map((c) => {
        // Build a rich inline comment body with severity badge, category tag,
        // and an optional suggestion block formatted for GitHub's suggestion feature
        const badge = severityBadge[c.severity] ?? c.severity.toUpperCase();
        const categoryTag = c.category ? ` · \`${c.category}\`` : "";
        const header = `**${badge}**${categoryTag}`;
        const bodyText = `${header}\n\n${c.body}`;
        return {
          path: c.path,
          line: c.endLine, // GitHub API uses the end line for single/multi-line comments
          body: bodyText,
          suggestion: c.suggestion,
        };
      });

      await postLineReviewComments(
        (prData as any).token as string,
        owner,
        repo,
        prNumber,
        (prData as any).headSha as string,
        comments,
        patchMap
      );
    });

    // Step 7: Update the status comment with the full review
    await step.run("post-summary-comment", async () => {
      const summaryMarkdown = formatSummaryMarkdown({
        ...structuredReview,
        lineComments: filteredComments,
      });

      const finalBody = `## 🦄 CodeUnicorn AI Review\n\n${summaryMarkdown}\n\n---\n*Powered by [CodeUnicorn](https://codeunicorn.vercel.app) \u00b7 AI-powered code reviews*`;

      await updateComment((prData as any).token as string, owner, repo, statusCommentId, finalBody);
    });

    // Step 8: Save review to database
    await step.run("save-review", async () => {
      const repository = await prisma.repository.findFirst({
        where: { owner, name: repo },
      });

      if (repository) {
        // Save the full structured review as JSON string
        await prisma.review.create({
          data: {
            repositoryId: repository.id,
            prNumber,
            prTitle: prData.title,
            prUrl: `https://github.com/${owner}/${repo}/pull/${prNumber}`,
            review: JSON.stringify(structuredReview),
            status: "completed",
          },
        });

        // Increment review count for subscription tracking
        const usage = await prisma.userUsage.findUnique({
          where: { userId },
        });

        if (usage) {
          const reviewCounts = (usage.reviewCounts as Record<string, number>) || {};
          reviewCounts[repository.id] = (reviewCounts[repository.id] || 0) + 1;
          await prisma.userUsage.update({
            where: { userId },
            data: { reviewCounts },
          });
        } else {
          await prisma.userUsage.create({
            data: {
              userId,
              repositoryCount: 0,
              reviewCounts: { [repository.id]: 1 },
            },
          });
        }
      }
    });

    return {
      success: true,
      inlineComments: filteredComments.length,
      totalFindings: structuredReview.lineComments.length,
    };
  }
);
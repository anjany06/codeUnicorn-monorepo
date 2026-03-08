import { prisma } from "@codeunicorn/database";
import { Octokit } from "@octokit/rest";

// Helper to get GitHub token
export async function getGithubToken(userId: string): Promise<string | null> {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      providerId: "github",
    },
  });

  if(!account?.accessToken){
    console.error("No GitHub access token found for user:", userId);
    throw new Error("No GitHub access token found");
  }

  return account?.accessToken || null;
}

// Fetch user contribution from GitHub GraphQL API
export async function fetchUserContribution(token: string, username: string) {
  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  const octokit = new Octokit({ auth: token });

  try {
    const response: any = await octokit.graphql(query, { username });
    return response.user.contributionsCollection.contributionCalendar;
  } catch (error) {
    console.error("Error fetching contribution data:", error);
    return null;
  }
}

// Get dashboard stats - same logic as your server action
export async function getDashboardStats(userId: string) {
  const token = await getGithubToken(userId);

  try{

  if (!token) {
    throw new Error("GitHub token not found");
  }

  const octokit = new Octokit({ auth: token });

  // Get user's GitHub username
  const { data: user } = await octokit.rest.users.getAuthenticated();

  // Fetch total connected repo from DB
  const totalRepos = await prisma.repository.count({
    where: { userId },
  });

  // Fetch commits from GitHub
  const calendar = await fetchUserContribution(token, user.login);
  const totalCommits = calendar?.totalContributions || 0;

  // Count PRs from GitHub
  const { data: prs } = await octokit.rest.search.issuesAndPullRequests({
    q: `author:${user.login} type:pr`,
    per_page: 1,
  });
  const totalPRs = prs.total_count;

  // Count AI reviews from DATABASE
  const totalReviews = await prisma.review.count({
    where: {
      repository: {
        userId,
      },
    },
  });

  return {
    totalCommits,
    totalPRs,
    totalReviews,
    totalRepos,
  };
} catch (error) {
  console.log("Error fetching dashboard Stats: ", error);
  return{
    totalCommits:0,
    totalPRs:0,
    totalReviews:0,
    totalRepos:0
  };
}
}

// Get monthly activity - same logic as your server action
export async function getMonthlyActivity(userId: string) {

  try{
  const token = await getGithubToken(userId);

  if (!token) {
    throw new Error("GitHub token not found");
  }

  const octokit = new Octokit({ auth: token });
  const { data: user } = await octokit.rest.users.getAuthenticated();

  // Fetch user's commits
  const calendar = await fetchUserContribution(token, user.login);
  if (!calendar) {
    return [];
  }

  const monthsNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyData: Record<string, { commits: number; prs: number; reviews: number; year: number }> = {};
  const monthKeys: string[] = [];

  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${monthsNames[date.getMonth()]}-${date.getFullYear()}`;
    monthKeys.push(monthKey);
    monthlyData[monthKey] = {
      commits: 0,
      prs: 0,
      reviews: 0,
      year: date.getFullYear(),
    };
  }

  // Aggregate commits
  calendar.weeks.forEach((week: any) => {
    week.contributionDays.forEach((day: any) => {
      const date = new Date(day.date);
      if (date < sixMonthsAgo) return;

      const monthKey = `${monthsNames[date.getMonth()]}-${date.getFullYear()}`;
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].commits += day.contributionCount;
      }
    });
  });

  // Fetch PRs
  const { data: prs } = await octokit.rest.search.issuesAndPullRequests({
    q: `author:${user.login} type:pr created:>=${sixMonthsAgo.toISOString().split("T")[0]}`,
    per_page: 100,
  });

  prs.items.forEach((pr: any) => {
    const date = new Date(pr.created_at);
    const monthKey = `${monthsNames[date.getMonth()]}-${date.getFullYear()}`;
    if (monthlyData[monthKey]) {
      monthlyData[monthKey].prs += 1;
    }
  });

  // Fetch reviews from database
  const reviews = await prisma.review.findMany({
    where: {
      repository: { userId },
      createdAt: { gte: sixMonthsAgo },
    },
    select: { createdAt: true },
  });

  reviews.forEach((review) => {
    const date = new Date(review.createdAt);
    if (date < sixMonthsAgo) return;

    const monthKey = `${monthsNames[date.getMonth()]}-${date.getFullYear()}`;
    if (monthlyData[monthKey]) {
      monthlyData[monthKey].reviews += 1;
    }
  });

  // Return in correct order
  return monthKeys.map((key) => {
    const [month] = key.split("-");
    return {
      month,
      commits: monthlyData[key].commits,
      prs: monthlyData[key].prs,
      reviews: monthlyData[key].reviews,
    };
  });
} 
catch (error) {
  console.error("Error fetching monthly activity:", error);
  return [];
}
}

// ─── Analytics helpers ───────────────────────────────────────────────────────

/**
 * Parse an AI review markdown text into structured finding counts.
 * First tries section-based counting (## Security, ## Performance, …),
 * then falls back to keyword-density if no bullets were found.
 */
export function parseReviewFindings(text: string): {
  security: number;
  performance: number;
  style: number;
  correctness: number;
  total: number;
} {
  const lines = text.split("\n");
  const counts = { security: 0, performance: 0, style: 0, correctness: 0 };

  const sectionKeywords: Record<keyof typeof counts, string[]> = {
    security: ["security", "vulnerability", "injection", "auth"],
    performance: ["performance", "optimization", "efficiency", "speed"],
    style: ["style", "naming", "formatting", "readability", "convention", "lint"],
    correctness: ["bug", "error", "logic", "correctness", "fix", "issue", "defect"],
  };

  let currentSection: keyof typeof counts | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("#")) {
      const heading = trimmed.replace(/^#+\s*/, "").toLowerCase();
      currentSection = null;
      for (const [cat, kws] of Object.entries(sectionKeywords)) {
        if (kws.some((kw) => heading.includes(kw))) {
          currentSection = cat as keyof typeof counts;
          break;
        }
      }
    } else if (currentSection && /^[-*\d]/.test(trimmed) && trimmed.length > 3) {
      counts[currentSection]++;
    }
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  // Fallback: keyword density
  if (total === 0) {
    const lower = text.toLowerCase();
    const density: Record<keyof typeof counts, string[]> = {
      security: ["sql injection", "xss", "csrf", "token", "password", "encrypt", "vulnerability", "sanitize"],
      performance: ["slow", "n+1", "cache", "index", "optimize", "memory", "latency"],
      style: ["naming", "indent", "format", "convention", "comment", "docstring"],
      correctness: ["bug", "undefined", "null", "exception", "wrong", "incorrect", "fix"],
    };
    for (const [cat, kws] of Object.entries(density)) {
      counts[cat as keyof typeof counts] = kws.filter((kw) => lower.includes(kw)).length;
    }
  }

  return { ...counts, total: Object.values(counts).reduce((a, b) => a + b, 0) };
}

// ─── Code Quality Trends ─────────────────────────────────────────────────────



// ─── Developer Metrics ────────────────────────────────────────────────────────

export async function getDeveloperMetrics(userId: string) {
  try {
    const token = await getGithubToken(userId);
    const octokit = new Octokit({ auth: token });
    const { data: ghUser } = await octokit.rest.users.getAuthenticated();

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // PRs this month vs last month + contribution calendar (all in parallel)
    const [thisPRs, lastPRs, calendar] = await Promise.all([
      octokit.rest.search.issuesAndPullRequests({
        q: `author:${ghUser.login} type:pr created:>=${thisMonthStart.toISOString().split("T")[0]}`,
        per_page: 1,
      }),
      octokit.rest.search.issuesAndPullRequests({
        q: `author:${ghUser.login} type:pr created:${lastMonthStart.toISOString().split("T")[0]}..${new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split("T")[0]}`,
        per_page: 1,
      }),
      fetchUserContribution(token, ghUser.login),
    ]);

    const prsThisMonth = thisPRs.data.total_count;
    const prsLastMonth = lastPRs.data.total_count;

    // ── Monthly commits (last 12 months) + streaks from contribution calendar ──
    const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    // Build 12-month bucket keys in order
    const monthBucketKeys: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthBucketKeys.push(`${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`);
    }
    const monthlyCommitsMap: Record<string, number> = {};
    monthBucketKeys.forEach((k) => { monthlyCommitsMap[k] = 0; });

    // Weekday buckets (Sun=0 … Sat=6)
    const WEEKDAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const weekdayMap: Record<string, number> = {};
    WEEKDAY_NAMES.forEach((d) => { weekdayMap[d] = 0; });

    // Current-month and last-month commit counts
    const currentMonthKey = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
    const lastMonthKey = `${MONTH_NAMES[lastMonthStart.getMonth()]} ${lastMonthStart.getFullYear()}`;

    // Flatten all contribution days and compute streaks
    type CalDay = { date: string; contributionCount: number };
    const allDays: CalDay[] = calendar
      ? calendar.weeks.flatMap((w: any) => w.contributionDays as CalDay[])
      : [];
    allDays.sort((a, b) => a.date.localeCompare(b.date));

    // Aggregate monthly + weekday
    const todayStr = now.toISOString().split("T")[0];
    for (const day of allDays) {
      if (day.date > todayStr) continue;
      const d = new Date(day.date);
      if (d >= twelveMonthsAgo) {
        const key = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
        if (monthlyCommitsMap[key] !== undefined) {
          monthlyCommitsMap[key] += day.contributionCount;
        }
        weekdayMap[WEEKDAY_NAMES[d.getDay()]] += day.contributionCount;
      }
    }

    // Current streak (consecutive days with contributions ending today/yesterday)
    let currentStreak = 0;
    for (let i = allDays.length - 1; i >= 0; i--) {
      const day = allDays[i];
      if (day.date > todayStr) continue;
      if (day.contributionCount > 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    for (const day of allDays) {
      if (day.date > todayStr) continue;
      if (day.contributionCount > 0) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    // Monthly commits array (short month label for chart)
    const monthlyCommits = monthBucketKeys.map((key) => ({
      month: key.split(" ")[0],
      year: key.split(" ")[1],
      commits: monthlyCommitsMap[key] || 0,
    }));

    // Most active month
    const mostActiveMonthEntry = monthlyCommits.reduce(
      (best, cur) => (cur.commits > best.commits ? cur : best),
      monthlyCommits[0] ?? { month: null, year: null, commits: 0 },
    );
    const mostActiveMonth = mostActiveMonthEntry.commits > 0
      ? `${mostActiveMonthEntry.month} ${mostActiveMonthEntry.year}`
      : null;
    const mostActiveMonthCount = mostActiveMonthEntry.commits;

    // Weekday activity array
    const weekdayActivity = WEEKDAY_NAMES.map((day) => ({
      day,
      commits: weekdayMap[day],
    }));
    const mostActiveDayEntry = weekdayActivity.reduce(
      (best, cur) => (cur.commits > best.commits ? cur : best),
      weekdayActivity[0],
    );

    const commitsThisMonth = monthlyCommitsMap[currentMonthKey] || 0;
    const commitsLastMonth = monthlyCommitsMap[lastMonthKey] || 0;

    // Reviews triggered in last 30 days
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentReviews = await prisma.review.findMany({
      where: { repository: { userId }, createdAt: { gte: thirtyDaysAgo } },
      select: { review: true, repositoryId: true },
    });

    // Avg issues per review
    let avgIssuesPerReview = 0;
    const categoryTotals: Record<string, number> = { security: 0, performance: 0, style: 0, correctness: 0 };
    if (recentReviews.length > 0) {
      let totalFindings = 0;
      for (const r of recentReviews) {
        const f = parseReviewFindings(r.review);
        totalFindings += f.total;
        categoryTotals.security += f.security;
        categoryTotals.performance += f.performance;
        categoryTotals.style += f.style;
        categoryTotals.correctness += f.correctness;
      }
      avgIssuesPerReview = Math.round((totalFindings / recentReviews.length) * 10) / 10;
    }

    // Top issue categories
    const topIssueCategories = Object.entries(categoryTotals)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    // Most active repo (most reviews)
    const repoReviewCounts: Record<string, number> = {};
    for (const r of recentReviews) {
      repoReviewCounts[r.repositoryId] = (repoReviewCounts[r.repositoryId] || 0) + 1;
    }
    const mostActiveRepoId = Object.entries(repoReviewCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const mostActiveRepo = mostActiveRepoId
      ? await prisma.repository.findUnique({ where: { id: mostActiveRepoId }, select: { name: true } })
      : null;

    // All-time reviews count
    const totalReviewsAllTime = await prisma.review.count({ where: { repository: { userId } } });

    return {
      prsThisMonth,
      prsLastMonth,
      commitsThisMonth,
      commitsLastMonth,
      reviewsTriggered: recentReviews.length,
      avgIssuesPerReview,
      topIssueCategories,
      mostActiveRepo: mostActiveRepo?.name ?? null,
      totalReviewsAllTime,
      githubLogin: ghUser.login,
      avatarUrl: ghUser.avatar_url,
      // Commit analytics
      monthlyCommits,
      mostActiveMonth,
      mostActiveMonthCount,
      currentStreak,
      longestStreak,
      weekdayActivity,
      mostActiveDay: mostActiveDayEntry?.day ?? null,
    };
  } catch (error) {
    console.error("Error fetching developer metrics:", error);
    return null;
  }
}

// ─── Contribution Graph ──────────────────────────────────────────────────────

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionData {
  totalContributions: number;
  weeks: ContributionDay[][];
  githubLogin: string;
  avatarUrl: string;
}

/**
 * Get the last-year contribution calendar for a user (authenticated).
 */
export async function getContributionGraph(userId: string): Promise<ContributionData | null> {
  try {
    const token = await getGithubToken(userId);
    if (!token) throw new Error("No GitHub token");

    const octokit = new Octokit({ auth: token });
    const { data: ghUser } = await octokit.rest.users.getAuthenticated();

    const calendar = await fetchUserContribution(token, ghUser.login);
    if (!calendar) return null;

    const weeks: ContributionDay[][] = calendar.weeks.map((w: any) =>
      w.contributionDays.map((d: any) => ({
        date: d.date,
        count: d.contributionCount,
        level: d.contributionCount === 0
          ? 0
          : d.contributionCount <= 3
            ? 1
            : d.contributionCount <= 6
              ? 2
              : d.contributionCount <= 9
                ? 3
                : 4,
      } as ContributionDay)),
    );

    return {
      totalContributions: calendar.totalContributions,
      weeks,
      githubLogin: ghUser.login,
      avatarUrl: ghUser.avatar_url,
    };
  } catch (error) {
    console.error("Error fetching contribution graph:", error);
    return null;
  }
}

/**
 * Public version — looks up the user's GitHub token by userId for embed.
 */
export async function getContributionGraphPublic(userId: string): Promise<ContributionData | null> {
  return getContributionGraph(userId);
}
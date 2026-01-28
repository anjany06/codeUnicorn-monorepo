import { prisma } from "@codeunicorn/database";
import { Octokit } from "octokit";

// Helper to get GitHub token
export async function getGithubToken(userId: string): Promise<string | null> {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      providerId: "github",
    },
  });

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
}

// Get monthly activity - same logic as your server action
export async function getMonthlyActivity(userId: string) {
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
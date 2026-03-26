import { prisma } from "@codeunicorn/database";

export async function getReviews(userId: string) {
  const reviews = await prisma.review.findMany({
    where: {
      repository: {
        userId,
      },
    },
    include: {
      repository: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });

  return reviews.map((review: any) => ({
    ...review,
    repository: {
      ...review.repository,
      githubId: review.repository.githubId.toString(),
    },
  }));
}

export async function getReviewById(reviewId: string, userId: string) {
  const review = await prisma.review.findFirst({
    where: {
      id: reviewId,
      repository: {
        userId,
      },
    },
    include: {
      repository: true,
    },
  });

  if (!review) return null;

  return {
    ...review,
    repository: {
      ...(review as any).repository,
      githubId: (review as any).repository.githubId.toString(),
    },
  };
}

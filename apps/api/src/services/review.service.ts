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

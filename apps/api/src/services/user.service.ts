import { prisma } from "@codeunicorn/database";

// Same logic as your server action, just extracted
export async function getUserProfileById(userId: string) {

  try {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
    },
  });

  return user;
} catch (error) {
  console.error("Error fetching user profile:", error);
  return null;
}
}

export async function updateUserProfileById(
  userId: string,
  data: { name?: string; email?: string }
) {

  try {
    
 
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      email: data.email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });

  return updatedUser;
} catch (error) {
  console.error("Error updating user profile:", error);
  return {
    success:false,
    error: "Failed to update profile"
  }
}
}
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * Get the current authenticated user ID from Clerk
 * Throws if user is not authenticated
 */
export async function requireAuth() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized - Please sign in');
  }

  return userId;
}

/**
 * Get the current authenticated user and ensure they exist in database
 * Creates user record if it doesn't exist (first-time login)
 */
export async function requireUserWithSync() {
  const userId = await requireAuth();
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error('User not found in Clerk');
  }

  // Ensure user exists in our database
  let user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    // Create user on first login
    user = await prisma.user.create({
      data: {
        id: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        fullName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
        phone: clerkUser.phoneNumbers[0]?.phoneNumber || null,
      }
    });
  }

  return user;
}

/**
 * Verify that a resource belongs to the authenticated user
 */
export async function verifyOwnership(resourceUserId: string) {
  const userId = await requireAuth();

  if (resourceUserId !== userId) {
    throw new Error('Forbidden - You do not have access to this resource');
  }

  return true;
}

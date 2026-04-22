import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { SettingsForm } from '@/components/settings-form';

// Cache settings page for 5 minutes (profile data changes rarely)
export const revalidate = 300;

async function getUserProfile(userId: string) {
  let profile = await prisma.userProfile.findFirst({
    where: { userId },
  });

  // Create a default profile if it doesn't exist
  if (!profile) {
    profile = await prisma.userProfile.create({
      data: {
        userId,
        skills: [],
        jobTitles: [],
        industries: [],
        preferredLocations: [],
      },
    });
  }

  return profile;
}

export default async function SettingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const profile = await getUserProfile(userId);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your profile and job search preferences
          </p>
        </div>

        <SettingsForm profile={profile} userId={userId} />
      </div>
    </div>
  );
}

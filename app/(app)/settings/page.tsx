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

  const [profile, user] = await Promise.all([
    getUserProfile(userId),
    prisma.user.findUnique({ where: { id: userId }, select: { fullName: true } }),
  ]);

  return (
    <div className="shell">
      <div className="page-head">
        <div>
          <h1><em>Profile</em> &amp; settings</h1>
          <p>Manage your preferences and job search criteria</p>
        </div>
      </div>

      <SettingsForm profile={profile} fullName={user?.fullName ?? null} userId={userId} />
    </div>
  );
}

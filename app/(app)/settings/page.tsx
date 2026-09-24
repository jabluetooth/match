import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { SettingsForm } from '@/components/settings-form';
import { PageHead } from '@/components/system/page-head';

export const metadata = { title: 'Settings' };

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
    <>
      <PageHead
        kicker="06 · settings"
        title={<><em>Profile</em> &amp; preferences</>}
        lead="What the matcher knows about you. Every score, tailored resume and prep guide starts here."
      />
      <SettingsForm profile={profile} fullName={user?.fullName ?? null} userId={userId} />
    </>
  );
}

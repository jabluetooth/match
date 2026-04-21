import { prisma } from '@/lib/prisma';
import { JobMatchCard } from '@/components/job-match-card';
import { JobMatchFilters } from '@/components/job-match-filters';

async function getJobMatches(userId: number = 1) {
  // Get all applications with their jobs
  const applications = await prisma.application.findMany({
    where: {
      userId,
    },
    include: {
      job: true
    },
    orderBy: {
      createdAt: 'desc'
    },
  });

  // Map to match component interface with synthetic match scores
  return applications.map(app => ({
    ...app,
    matchScore: app.status === 'offer' ? 100 :
                app.status === 'interview' ? 90 :
                app.status === 'phone_screen' ? 85 :
                app.status === 'applied' ? 80 : 75,
    aiReasoning: null,
    skillsMatched: [],
    skillsMissing: [],
  }));
}

export default async function JobMatchesPage() {
  const matches = await getJobMatches();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Job Matches</h1>
        <p className="text-gray-600 mt-2">
          AI-curated opportunities that match your profile
        </p>
      </div>

      <JobMatchFilters />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {matches.length === 0 ? (
          <div className="col-span-2 bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No job matches found. Check back soon!</p>
          </div>
        ) : (
          matches.map((match) => (
            <JobMatchCard key={match.id} match={match} />
          ))
        )}
      </div>
    </div>
  );
}

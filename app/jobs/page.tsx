import { prisma } from '@/lib/prisma';
import { JobMatchCard } from '@/components/job-match-card';
import { JobMatchFilters } from '@/components/job-match-filters';

async function getJobMatches(userId: number = 1) {
  const matchesRaw = await prisma.jobMatch.findMany({
    where: {
      userId,
      matchScore: { gte: 70 }
    },
    include: {
      job: true
    },
    orderBy: {
      matchScore: 'desc'
    },
  });

  // Serialize Decimal to number for Client Components
  return matchesRaw.map(match => ({
    ...match,
    matchScore: Number(match.matchScore),
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

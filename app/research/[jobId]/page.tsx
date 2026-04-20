import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building2, Calendar, AlertTriangle } from 'lucide-react';

interface PageProps {
  params: Promise<{ jobId: string }>;
  searchParams: Promise<{ user_id?: string }>;
}

export default async function CompanyResearchPage({ params, searchParams }: PageProps) {
  const { jobId } = await params;
  const { user_id } = await searchParams;

  const userId = user_id ? parseInt(user_id) : 1;
  const jobIdNum = parseInt(jobId);

  const research = await prisma.companyResearch.findUnique({
    where: {
      jobId_userId: {
        jobId: jobIdNum,
        userId,
      },
    },
  });

  const job = await prisma.job.findUnique({
    where: { id: jobIdNum },
  });

  if (!research || !job) {
    notFound();
  }

  const talkingPoints = research.talkingPoints as any[] || [];
  const questionsToAsk = research.questionsToAsk as string[] || [];
  const redFlags = research.redFlags as string[] || [];
  const recentDevelopments = research.recentDevelopments as string[] || [];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/applications"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Applications
          </Link>

          <div className="flex items-start gap-4">
            <Building2 className="h-12 w-12 text-blue-600 mt-1" />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{research.companyName}</h1>
              <p className="text-gray-600 mt-1">{job.title}</p>
              {research.companyUrl && (
                <a
                  href={research.companyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm mt-1 inline-block"
                >
                  {research.companyUrl}
                </a>
              )}
            </div>
            {research.confidenceScore && (
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{research.confidenceScore}%</div>
                <div className="text-xs text-gray-600">Confidence</div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Company Overview */}
          {research.companyOverview && (
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Company Overview</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{research.companyOverview}</p>
            </section>
          )}

          {/* Mission & Values */}
          {research.missionAndValues && (
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Mission & Values</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{research.missionAndValues}</p>
            </section>
          )}

          {/* Recent Developments */}
          {recentDevelopments.length > 0 && (
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Developments
              </h2>
              <ul className="space-y-2">
                {recentDevelopments.map((dev, idx) => (
                  <li key={idx} className="text-gray-700 flex gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{dev}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Why They're Hiring */}
          {research.whyTheyAreHiring && (
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Why They're Hiring</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{research.whyTheyAreHiring}</p>
            </section>
          )}

          {/* Talking Points */}
          {talkingPoints.length > 0 && (
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Talking Points for Interview</h2>
              <div className="space-y-4">
                {talkingPoints.map((point, idx) => (
                  <div key={idx} className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold text-gray-900">{point.topic || `Point ${idx + 1}`}</h3>
                    <p className="text-gray-700 mt-1">{point.point}</p>
                    {point.source && (
                      <p className="text-xs text-gray-500 mt-1">Source: {point.source}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Questions to Ask */}
          {questionsToAsk.length > 0 && (
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Questions to Ask</h2>
              <ul className="space-y-2">
                {questionsToAsk.map((question, idx) => (
                  <li key={idx} className="text-gray-700 flex gap-2">
                    <span className="text-green-600 font-bold">{idx + 1}.</span>
                    <span>{question}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Red Flags */}
          {redFlags.length > 0 && (
            <section className="bg-red-50 rounded-lg shadow-sm p-6 border border-red-200">
              <h2 className="text-xl font-semibold text-red-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Red Flags / Considerations
              </h2>
              <ul className="space-y-2">
                {redFlags.map((flag, idx) => (
                  <li key={idx} className="text-red-800 flex gap-2">
                    <span className="text-red-600 font-bold">⚠</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Research Notes */}
          {research.researchNotes && (
            <section className="bg-yellow-50 rounded-lg shadow-sm p-6 border border-yellow-200">
              <h2 className="text-xl font-semibold text-yellow-900 mb-3">Additional Notes</h2>
              <p className="text-yellow-800 leading-relaxed whitespace-pre-wrap">{research.researchNotes}</p>
            </section>
          )}

          {/* Metadata */}
          <section className="bg-gray-100 rounded-lg p-4 text-xs text-gray-600">
            <div className="flex gap-6">
              <div>
                <span className="font-semibold">Created:</span>{' '}
                {new Date(research.createdAt).toLocaleString()}
              </div>
              <div>
                <span className="font-semibold">Updated:</span>{' '}
                {new Date(research.updatedAt).toLocaleString()}
              </div>
              {research.websiteScraped && (
                <div>
                  <span className="font-semibold">Website Scraped:</span> Yes
                </div>
              )}
              {research.newsCount > 0 && (
                <div>
                  <span className="font-semibold">News Articles:</span> {research.newsCount}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

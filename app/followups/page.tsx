import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import { FollowUpCard } from '@/components/followup-card';

export const dynamic = 'force-dynamic';

export default async function FollowUpsPage() {
  const userId = 1; // Default user

  // Fetch pending follow-ups
  const followUps = await prisma.followUpLog.findMany({
    where: {
      userId,
      responseStatus: 'pending',
      sentAt: { not: null }, // Only show sent follow-ups
    },
    include: {
      application: {
        include: {
          job: true
        }
      }
    },
    orderBy: {
      sentAt: 'desc'
    }
  });

  // Calculate response rate
  const totalSent = await prisma.followUpLog.count({
    where: {
      userId,
      sentAt: { not: null },
    }
  });

  const totalReplied = await prisma.followUpLog.count({
    where: {
      userId,
      responseStatus: 'replied',
    }
  });

  const responseRate = totalSent > 0
    ? Math.round((totalReplied / totalSent) * 1000) / 10
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/applications"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Applications
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Follow-ups</h1>
              <p className="text-gray-600 mt-2">
                Track responses to your follow-up emails
              </p>
            </div>

            {/* Response Rate Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 min-w-[200px]">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{responseRate}%</div>
                <div className="text-sm text-gray-600 mt-1">Response Rate</div>
                <div className="text-xs text-gray-500 mt-2">
                  {totalReplied} of {totalSent} replied
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Follow-ups List */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Pending Responses ({followUps.length})
          </h2>

          {followUps.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Mail className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Pending Follow-ups
              </h3>
              <p className="text-gray-600">
                All your follow-up emails have been responded to or processed.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {followUps.map(followUp => (
                <FollowUpCard
                  key={followUp.id}
                  followUp={followUp}
                  onResponse={() => {
                    // Refresh the page to update the list
                    window.location.reload();
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">How to use</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Click <strong>"They Replied"</strong> if you received a response from the company</li>
            <li>• Click <strong>"No Response"</strong> if they haven't replied yet</li>
            <li>• Click <strong>"Email Bounced"</strong> if the email was undeliverable</li>
            <li>• When you mark a follow-up as "replied", the application status will automatically advance to Phone Screen</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

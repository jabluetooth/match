import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Calendar, Clock, MapPin, User, ArrowLeft, ExternalLink } from 'lucide-react';

export default async function InterviewsPage() {
  const userId = 1; // Default user

  const interviews = await prisma.interview.findMany({
    where: {
      application: {
        userId
      }
    },
    include: {
      application: {
        include: {
          jobMatch: {
            include: {
              job: true
            }
          }
        }
      }
    },
    orderBy: {
      scheduledDate: 'asc'
    }
  });

  const upcoming = interviews.filter(i =>
    i.scheduledDate && new Date(i.scheduledDate) > new Date() && i.status === 'scheduled'
  );

  const past = interviews.filter(i =>
    i.scheduledDate && new Date(i.scheduledDate) <= new Date() || i.status === 'completed'
  );

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
          <h1 className="text-3xl font-bold text-gray-900">Interviews</h1>
          <p className="text-gray-600 mt-2">Manage your upcoming and past interviews</p>
        </div>

        {/* Upcoming Interviews */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Upcoming ({upcoming.length})
          </h2>
          {upcoming.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
              No upcoming interviews scheduled
            </div>
          ) : (
            <div className="space-y-4">
              {upcoming.map(interview => (
                <div key={interview.id} className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {interview.application.jobMatch.job.title}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {interview.application.jobMatch.job.companyName}
                      </p>

                      <div className="mt-4 space-y-2">
                        {interview.scheduledDate && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(interview.scheduledDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                              {' at '}
                              {new Date(interview.scheduledDate).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        )}

                        {interview.interviewType && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Clock className="h-4 w-4" />
                            <span className="capitalize">{interview.interviewType}</span>
                            {interview.durationMinutes && (
                              <span className="text-gray-500">({interview.durationMinutes} min)</span>
                            )}
                          </div>
                        )}

                        {interview.location && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <MapPin className="h-4 w-4" />
                            <span>{interview.location}</span>
                          </div>
                        )}

                        {interview.interviewerName && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <User className="h-4 w-4" />
                            <span>{interview.interviewerName}</span>
                            {interview.interviewerTitle && (
                              <span className="text-gray-500">- {interview.interviewerTitle}</span>
                            )}
                          </div>
                        )}
                      </div>

                      {interview.prepNotesUrl && (
                        <a
                          href={interview.prepNotesUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-4 text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Prep Notes
                        </a>
                      )}
                    </div>

                    <a
                      href={interview.application.jobMatch.job.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 ml-4"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Past Interviews */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Past ({past.length})
          </h2>
          {past.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
              No past interviews
            </div>
          ) : (
            <div className="space-y-4">
              {past.map(interview => (
                <div key={interview.id} className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-gray-300 opacity-75">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {interview.application.jobMatch.job.title}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {interview.application.jobMatch.job.companyName}
                      </p>

                      <div className="mt-4 space-y-2">
                        {interview.scheduledDate && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(interview.scheduledDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        )}

                        {interview.feedback && (
                          <div className="mt-3 p-3 bg-gray-50 rounded">
                            <p className="text-sm font-semibold text-gray-700 mb-1">Feedback:</p>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{interview.feedback}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      interview.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {interview.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

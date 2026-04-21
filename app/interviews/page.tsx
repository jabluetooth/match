import { prisma } from '@/lib/prisma';
import { requireUserWithSync } from '@/lib/auth';
import Link from 'next/link';
import { Calendar, Clock, MapPin, User, ArrowLeft, ExternalLink } from 'lucide-react';
import { InterviewPrepButton } from '@/components/interview-prep-button';

export default async function InterviewsPage() {
  // Authenticate and get user
  const user = await requireUserWithSync();
  const userId = user.id;

  // Get applications with interview dates
  const applications = await prisma.application.findMany({
    where: {
      userId,
      interviewDate: { not: null }
    },
    include: {
      job: true
    },
    orderBy: {
      interviewDate: 'asc'
    }
  });

  const upcoming = applications.filter(app =>
    app.interviewDate && new Date(app.interviewDate) > new Date()
  );

  const past = applications.filter(app =>
    app.interviewDate && new Date(app.interviewDate) <= new Date()
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
              {upcoming.map(app => (
                <div key={app.id} className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {app.job.title}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {app.job.companyName}
                      </p>

                      <div className="mt-4 space-y-2">
                        {app.interviewDate && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(app.interviewDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                              {' at '}
                              {new Date(app.interviewDate).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        )}

                        {app.interviewType && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Clock className="h-4 w-4" />
                            <span className="capitalize">{app.interviewType}</span>
                          </div>
                        )}

                        {app.interviewLocation && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <MapPin className="h-4 w-4" />
                            <span>{app.interviewLocation}</span>
                          </div>
                        )}

                        {app.interviewerName && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <User className="h-4 w-4" />
                            <span>{app.interviewerName}</span>
                            {app.interviewerRole && (
                              <span className="text-gray-500">- {app.interviewerRole}</span>
                            )}
                          </div>
                        )}
                      </div>

                      {app.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <p className="text-sm font-semibold text-gray-700 mb-1">Notes:</p>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">{app.notes}</p>
                        </div>
                      )}
                    </div>

                    <a
                      href={app.job.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 ml-4"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  </div>

                  {/* Interview Prep Button */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <InterviewPrepButton
                      applicationId={app.id}
                      jobTitle={app.job.title}
                      companyName={app.job.companyName}
                      interviewerName={app.interviewerName}
                      interviewerRole={app.interviewerRole}
                    />
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
              {past.map(app => (
                <div key={app.id} className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-gray-300 opacity-75">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {app.job.title}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {app.job.companyName}
                      </p>

                      <div className="mt-4 space-y-2">
                        {app.interviewDate && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(app.interviewDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        )}

                        {app.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded">
                            <p className="text-sm font-semibold text-gray-700 mb-1">Notes:</p>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{app.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      app.status === 'interview' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {app.status}
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

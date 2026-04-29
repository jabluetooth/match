"use client";

import { useState } from "react";
import { useInterviewPrep } from "@/hooks/useInterviewPrep";
import { FileText, Sparkles } from "lucide-react";
import { WorkflowLoader } from "@/components/workflow-loader";

interface InterviewPrepButtonProps {
  applicationId: number;
  jobTitle: string;
  companyName: string;
  interviewerName?: string | null;
  interviewerRole?: string | null;
}

export function InterviewPrepButton({
  applicationId,
  jobTitle,
  companyName,
  interviewerName,
  interviewerRole,
}: InterviewPrepButtonProps) {
  const { generate, loading, error, result } = useInterviewPrep();
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleGenerate = async () => {
    await generate({
      application_id: applicationId,
      interviewer_name: interviewerName || undefined,
      interviewer_role: interviewerRole || undefined,
      interviewer_linkedin_url: linkedinUrl || undefined,
    });
  };

  return (
    <>
      <WorkflowLoader
        show={loading}
        label="Generating prep doc…"
        messages={[
          `Reading the job description for ${jobTitle}…`,
          `Researching ${companyName}'s culture and values…`,
          "Generating behavioural questions…",
          "Crafting technical interview questions…",
          "Writing your STAR answer frameworks…",
          "Preparing smart questions to ask…",
          "Compiling your interview playbook…",
        ]}
      />
      {result ? (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="flex items-start gap-2">
          <FileText className="h-5 w-5 text-green-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-green-800">
              Interview prep ready for {result.company}
            </p>
            <p className="mt-1 text-sm text-green-700">
              PDF {result.pdf_generated ? "generated and " : ""}sent to your email.
            </p>
            {result.linkedin_scraped && (
              <p className="mt-1 text-sm text-green-700">
                LinkedIn profile included in prep.
              </p>
            )}
            <button
              onClick={() => {
                setShowForm(false);
                window.location.reload();
              }}
              className="mt-3 text-sm text-green-600 hover:text-green-700 underline"
            >
              Generate again
            </button>
          </div>
        </div>
      </div>
      ) : (
      <div className="space-y-3">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50 transition-colors"
          disabled={loading}
        >
          <Sparkles className="h-4 w-4" />
          {loading ? "Generating..." : "Generate Interview Prep"}
        </button>

        {showForm && !loading && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
          <p className="text-sm font-medium text-gray-700">
            Preparing for: <span className="text-purple-700">{jobTitle}</span> at{" "}
            <span className="text-purple-700">{companyName}</span>
          </p>

          {interviewerName && (
            <p className="text-sm text-gray-600">
              Interviewer: {interviewerName}
              {interviewerRole && ` — ${interviewerRole}`}
            </p>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Interviewer LinkedIn URL{" "}
              <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/username"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Generating — this takes ~20 seconds..." : "Generate Now"}
          </button>
        </div>
      )}

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
      )}
    </>
  );
}

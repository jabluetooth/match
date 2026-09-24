"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useInterviewPrep } from "@/hooks/useInterviewPrep";
import { AlertCircle, CheckCircle2, Loader2, Sparkles } from "lucide-react";
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
  const router = useRouter();
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
        <div className="flex gap-3 rounded border border-success/25 bg-success/[0.06] px-4 py-3">
          <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-success" aria-hidden="true" />
          <div className="min-w-0 flex-1 text-[13px]">
            <p className="font-medium text-ink">Prep guide ready for {result.company}</p>
            <p className="mt-0.5 text-xs text-ink-2">
              {[
                result.pdf_generated ? 'PDF generated' : null,
                result.email_sent ? 'emailed to you' : null,
                result.linkedin_scraped ? 'interviewer LinkedIn included' : null,
              ]
                .filter(Boolean)
                .join(' · ') || 'Saved to this interview.'}
            </p>
            {/* Refreshing swaps this panel for the "Open prep guide" link. */}
            <button
              type="button"
              onClick={() => { setShowForm(false); router.refresh(); }}
              className="mt-2 text-xs text-accent-ink underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
            >
              Show the guide
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            disabled={loading}
            aria-expanded={showForm}
            className="btn btn-ghost btn-sm"
          >
            {loading ? <Loader2 size={13} className="animate-spin" aria-hidden="true" /> : <Sparkles size={13} aria-hidden="true" />}
            {loading ? 'Generating…' : 'Generate prep guide'}
          </button>

          {showForm && !loading && (
            <div className="space-y-3 rounded border border-line bg-raised p-4">
              <p className="text-[13px] text-ink-2">
                For <span className="text-ink">{jobTitle}</span> at <span className="text-ink">{companyName}</span>
                {interviewerName && (
                  <>, with {interviewerName}{interviewerRole && ` (${interviewerRole})`}</>
                )}
                .
              </p>
              <label className="block">
                <span className="field-label">
                  Interviewer LinkedIn <span className="normal-case tracking-normal">(optional)</span>
                </span>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="field bg-surface"
                />
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={handleGenerate} disabled={loading} className="btn btn-primary btn-sm">
                  <Sparkles size={13} aria-hidden="true" />
                  Generate now
                </button>
                <span className="font-mono text-[11px] text-ink-3">takes about 20 seconds</span>
              </div>
            </div>
          )}

          {error && (
            <p role="alert" className="flex items-start gap-2 rounded border border-danger/25 bg-danger/10 px-3 py-2 text-[13px] text-danger">
              <AlertCircle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}
        </div>
      )}
    </>
  );
}

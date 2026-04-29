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
      <div style={{ background: 'var(--accent-a)', border: '1px solid var(--accent-b)', borderRadius: 'var(--radius-md)', padding: '14px 16px', display: 'flex', gap: 10 }}>
        <FileText size={16} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)', margin: '0 0 4px' }}>
            Interview prep ready for {result.company}
          </p>
          <p style={{ fontSize: 12.5, color: 'var(--ink-2)', margin: 0 }}>
            PDF {result.pdf_generated ? 'generated and ' : ''}sent to your email.
          </p>
          {result.linkedin_scraped && (
            <p style={{ fontSize: 12.5, color: 'var(--ink-2)', margin: '4px 0 0' }}>LinkedIn profile included.</p>
          )}
          <button onClick={() => { setShowForm(false); window.location.reload(); }}
            style={{ marginTop: 8, fontSize: 12, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', textDecoration: 'underline' }}>
            Generate again
          </button>
        </div>
      </div>
      ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button onClick={() => setShowForm(!showForm)} disabled={loading} className="btn btn-ghost btn-sm">
          <Sparkles size={13} />
          {loading ? 'Generating…' : 'Generate Interview Prep'}
        </button>

        {showForm && !loading && (
        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: 0 }}>
            Preparing for: <strong style={{ color: 'var(--ink)' }}>{jobTitle}</strong> at <strong style={{ color: 'var(--ink)' }}>{companyName}</strong>
          </p>

          {interviewerName && (
            <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: 0 }}>
              Interviewer: {interviewerName}{interviewerRole && ` — ${interviewerRole}`}
            </p>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-3)', marginBottom: 6 }}>
              Interviewer LinkedIn URL <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
            </label>
            <input type="url" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/username"
              className="form-input" style={{ fontSize: 13 }} />
          </div>

          <button onClick={handleGenerate} disabled={loading} className="btn btn-primary btn-sm">
            {loading ? 'Generating — this takes ~20 seconds…' : 'Generate Now'}
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

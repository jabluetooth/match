# Workflow 7: Interview Prep — Next.js Integration Guide

## Overview

Workflow 7 generates a full interview prep document for a candidate. The frontend triggers it via a single POST request. The backend handles everything — fetching the application data, optionally scraping LinkedIn, calling Gemini AI, generating a PDF, and emailing it to the candidate.

---

## Endpoint

```
POST https://n8n.filheinzrelatorre.com/webhook/interview-prep
Content-Type: application/json
```

---

## Request Body

```ts
{
  user_id: number;              // required
  application_id: number;       // required
  interviewer_name?: string;    // optional
  interviewer_role?: string;    // optional
  interviewer_linkedin_url?: string; // optional
}
```

---

## Success Response

```ts
{
  status: "success";
  prep_id: number;
  application_id: number;
  job_title: string;
  company: string;
  interviewer: string | null;
  linkedin_scraped: boolean;
  pdf_generated: boolean;
  email_sent: boolean;
}
```

---

## 1. API Route

Create `app/api/interview-prep/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";

const N8N_URL = process.env.N8N_WEBHOOK_URL + "/interview-prep";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { user_id, application_id, interviewer_name, interviewer_role, interviewer_linkedin_url } = body;

  if (!user_id || !application_id) {
    return NextResponse.json(
      { error: "user_id and application_id are required" },
      { status: 400 }
    );
  }

  const res = await fetch(N8N_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id,
      application_id,
      interviewer_name: interviewer_name || null,
      interviewer_role: interviewer_role || null,
      interviewer_linkedin_url: interviewer_linkedin_url || null,
    }),
  });

  const data = await res.json();

  if (!res.ok || data.status !== "success") {
    return NextResponse.json(
      { error: "Failed to generate interview prep", detail: data },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
```

Add to `.env.local`:

```env
N8N_WEBHOOK_URL=https://n8n.filheinzrelatorre.com/webhook
```

---

## 2. Hook

Create `hooks/useInterviewPrep.ts`:

```ts
import { useState } from "react";

interface InterviewPrepInput {
  user_id: number;
  application_id: number;
  interviewer_name?: string;
  interviewer_role?: string;
  interviewer_linkedin_url?: string;
}

interface InterviewPrepResult {
  status: string;
  prep_id: number;
  application_id: number;
  job_title: string;
  company: string;
  interviewer: string | null;
  linkedin_scraped: boolean;
  pdf_generated: boolean;
  email_sent: boolean;
}

export function useInterviewPrep() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InterviewPrepResult | null>(null);

  const generate = async (input: InterviewPrepInput) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/interview-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return null;
      }

      setResult(data);
      return data;
    } catch (err) {
      setError("Network error. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { generate, loading, error, result };
}
```

---

## 3. Component

Create `components/InterviewPrepButton.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useInterviewPrep } from "@/hooks/useInterviewPrep";

interface Props {
  userId: number;
  applicationId: number;
  jobTitle: string;
  companyName: string;
  interviewerName?: string;
  interviewerRole?: string;
}

export default function InterviewPrepButton({
  userId,
  applicationId,
  jobTitle,
  companyName,
  interviewerName,
  interviewerRole,
}: Props) {
  const { generate, loading, error, result } = useInterviewPrep();
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleGenerate = async () => {
    await generate({
      user_id: userId,
      application_id: applicationId,
      interviewer_name: interviewerName,
      interviewer_role: interviewerRole,
      interviewer_linkedin_url: linkedinUrl || undefined,
    });
  };

  if (result) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="font-semibold text-green-800">
          ✅ Interview prep ready for {result.company}
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
          onClick={() => setShowForm(false)}
          className="mt-3 text-sm text-green-600 underline"
        >
          Generate again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => setShowForm(!showForm)}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Interview Prep"}
      </button>

      {showForm && !loading && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
          <p className="text-sm font-medium text-gray-700">
            Preparing for: <span className="text-blue-700">{jobTitle}</span> at{" "}
            <span className="text-blue-700">{companyName}</span>
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
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Generating — this takes ~20 seconds..." : "Generate Now"}
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
```

---

## 4. Usage

In any page or component where you show application details:

```tsx
import InterviewPrepButton from "@/components/InterviewPrepButton";

export default function ApplicationPage({ application }) {
  return (
    <div>
      <h1>{application.job_title}</h1>
      <p>{application.company_name}</p>

      <InterviewPrepButton
        userId={application.user_id}
        applicationId={application.id}
        jobTitle={application.job_title}
        companyName={application.company_name}
        interviewerName={application.interviewer_name}
        interviewerRole={application.interviewer_role}
      />
    </div>
  );
}
```

---

## Notes

- The webhook takes **20–40 seconds** to respond (Gemini + PDF generation). Show a loading state.
- The PDF is emailed automatically — you don't need to handle file download on the frontend.
- If LinkedIn scraping is blocked by LinkedIn, the prep doc is still generated without it — `linkedin_scraped: false` in the response.
- `ON CONFLICT (application_id)` means regenerating prep for the same application overwrites the previous one in the DB.
- Use `/webhook-test/` URL only when testing manually in n8n. Use `/webhook/` in production.

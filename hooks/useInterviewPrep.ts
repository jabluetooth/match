import { useState } from 'react';

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
      const res = await fetch('/api/interview-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return null;
      }

      setResult(data);
      return data;
    } catch (err) {
      setError('Network error. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { generate, loading, error, result };
}

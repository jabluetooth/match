const N8N_BASE_URL = process.env.N8N_BASE_URL || 'http://localhost:5678';
const IS_PROD = process.env.NODE_ENV === 'production';
const TIMEOUT_MS = 30_000;

// Public app URL that n8n calls back to (e.g. to fetch the original resume
// via /api/internal/resume/[userId]). Defaults to localhost for dev.
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export class N8NClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = N8N_BASE_URL.replace(/\/$/, '');
  }

  private webhookUrl(path: string): string {
    const force = process.env.N8N_FORCE_TEST_WEBHOOKS;
    const useTest = force === 'true' || (force !== 'false' && !IS_PROD);
    return `${this.baseUrl}${useTest ? '/webhook-test/' : '/webhook/'}${path.replace(/^\//, '')}`;
  }

  private async call<T = unknown>(
    path: string,
    body: Record<string, unknown>,
    timeoutMs?: number,
  ): Promise<T> {
    const url = this.webhookUrl(path);
    const controller = timeoutMs ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

    // Shared secret so the n8n workflow can verify the request really came
    // from this app. Set N8N_WEBHOOK_SECRET on Vercel and on the n8n webhook
    // node ("Header Auth" or an IF node checking the header).
    const secret = process.env.N8N_WEBHOOK_SECRET;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (secret) headers['x-webhook-secret'] = secret;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        ...(controller ? { signal: controller.signal } : {}),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`n8n error (${response.status}): ${errorText || response.statusText}`);
      }

      const text = await response.text();
      return (text ? JSON.parse(text) : { success: true, message: 'Workflow triggered successfully' }) as T;
    } catch (error: unknown) {
      console.error(`[n8n] ${path}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  tailorResume(params: { user_id: string; job_id: number }) {
    // Pass a callback URL + format-preservation flag so the n8n workflow can
    // pull the user's original resume bytes (via /api/internal/resume/:userId,
    // auth'd by N8N_WEBHOOK_SECRET) and produce a tailored copy that keeps the
    // original layout/structure with only the content rewritten for the job.
    return this.call(
      'tailor-resume',
      {
        ...params,
        preserve_format: true,
        resume_fetch_url: `${APP_URL.replace(/\/$/, '')}/api/internal/resume/${encodeURIComponent(params.user_id)}`,
      },
      TIMEOUT_MS,
    );
  }

  researchCompany(params: { user_id: string; application_id?: number; job_id?: number }) {
    return this.call('company-research', params, TIMEOUT_MS);
  }

  matchJobs(user_id: string) {
    return this.call('match-job', { user_id, trigger: 'manual' });
  }

  trackApplication(params: {
    action: 'create' | 'update_status' | 'schedule_interview';
    user_id: string;
    job_id?: number;
    application_id?: number;
    status?: string;
    interview_date?: string;
    interview_type?: string;
    interview_location?: string;
    interviewer_name?: string;
    interviewer_role?: string;
    notes?: string;
  }) {
    return this.call('application-tracker', params);
  }

  trackFollowUpResponse(params: {
    followup_id: number;
    application_id: number;
    user_id: string;
    response_status: 'replied' | 'no_response' | 'bounced';
  }) {
    return this.call('followup-response', params);
  }

  generateInterviewPrep(params: {
    user_id: string;
    application_id: number;
    interviewer_name?: string | null;
    interviewer_role?: string | null;
    interviewer_linkedin_url?: string | null;
  }) {
    return this.call('interview-prep', params);
  }

  async getExecutionStatus(executionId: string) {
    const apiKey = process.env.N8N_API_KEY;
    if (!apiKey) throw new Error('N8N_API_KEY not configured');

    const url = `${this.baseUrl}/api/v1/executions/${executionId}`;
    const response = await fetch(url, { headers: { 'X-N8N-API-KEY': apiKey } });
    if (!response.ok) throw new Error(`n8n API error: ${response.statusText}`);
    return response.json();
  }
}

export const n8nClient = new N8NClient();

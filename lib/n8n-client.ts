const N8N_BASE_URL = process.env.N8N_BASE_URL || 'http://localhost:5678';
const IS_PROD = process.env.NODE_ENV === 'production';
const TIMEOUT_MS = 30_000;

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

  private async call<T = unknown>(path: string, body: Record<string, unknown>, timeoutMs?: number): Promise<T> {
    const url = this.webhookUrl(path);
    console.log(`[n8n] POST ${url}`);

    const controller = timeoutMs ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        ...(controller ? { signal: controller.signal } : {}),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`n8n error (${response.status}): ${errorText || response.statusText}`);
      }

      const text = await response.text();
      return (text ? JSON.parse(text) : { success: true, message: 'Workflow triggered successfully' }) as T;
    } catch (error: any) {
      console.error(`[n8n] ${path}: ${error.message}`);
      throw error;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  tailorResume(params: { user_id: string; job_id: number }) {
    return this.call('tailor-resume', params as Record<string, unknown>);
  }

  researchCompany(params: { user_id: number; application_id?: number; job_id?: number }) {
    return this.call('company-research', params);
  }

  matchJobs(user_id: string) {
    return this.call('match-job', { user_id, trigger: 'manual' });
  }

  scrapeJobs() {
    return this.call('scrape-jobs', { trigger: 'manual' });
  }

  trackApplication(params: {
    action: 'create' | 'update_status' | 'schedule_interview';
    user_id: number;
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
    return this.call('application-tracker', params as Record<string, unknown>);
  }

  trackFollowUpResponse(params: {
    followup_id: number;
    application_id: number;
    user_id: number;
    response_status: 'replied' | 'no_response' | 'bounced';
  }) {
    return this.call('followup-response', params);
  }

  generateInterviewPrep(params: {
    user_id: number;
    application_id: number;
    interviewer_name?: string | null;
    interviewer_role?: string | null;
    interviewer_linkedin_url?: string | null;
  }) {
    return this.call('interview-prep', params as Record<string, unknown>);
  }

  async getExecutionStatus(executionId: string) {
    const apiKey = process.env.N8N_API_KEY;
    if (!apiKey) throw new Error('N8N_API_KEY not configured');

    const url = `${this.baseUrl}/api/v1/executions/${executionId}`;
    console.log(`[n8n] GET ${url}`);

    const response = await fetch(url, { headers: { 'X-N8N-API-KEY': apiKey } });
    if (!response.ok) throw new Error(`n8n API error: ${response.statusText}`);
    return response.json();
  }
}

export const n8nClient = new N8NClient();

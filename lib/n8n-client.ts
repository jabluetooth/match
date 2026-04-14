/**
 * n8n API Client
 * Wrapper for calling n8n workflows via webhooks
 */

const N8N_BASE_URL = process.env.N8N_BASE_URL || 'http://localhost:5678';
const IS_PROD = process.env.NODE_ENV === 'production';

export class N8NClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = N8N_BASE_URL.replace(/\/$/, ''); // Remove trailing slash
  }

  /**
   * Helper to get the correct webhook path based on environment
   */
  private getWebhookPath(path: string): string {
    // If we are in production, use /webhook/, otherwise use /webhook-test/
    // This can be overridden with N8N_FORCE_TEST_WEBHOOKS=true
    const useTest = process.env.N8N_FORCE_TEST_WEBHOOKS === 'true' || !IS_PROD;
    const prefix = useTest ? '/webhook-test/' : '/webhook/';
    return `${this.baseUrl}${prefix}${path.replace(/^\//, '')}`;
  }

  /**
   * Trigger resume tailoring workflow
   */
  async tailorResume(params: {
    user_id: number;
    job_id: number;
  }) {
    const url = this.getWebhookPath('tailor-resume');
    console.log(`[n8n] Calling tailorResume: ${url}`);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`n8n error (${response.status}): ${errorText || response.statusText}`);
      }

      return response.json();
    } catch (error: any) {
      console.error(`[n8n] Fetch error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Trigger company research workflow
   */
  async researchCompany(params: {
    user_id: number;
    application_id?: number;
    job_id?: number;
  }) {
    const url = this.getWebhookPath('company-research');
    console.log(`[n8n] Calling researchCompany: ${url}`);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`n8n error (${response.status}): ${errorText || response.statusText}`);
      }

      return response.json();
    } catch (error: any) {
      console.error(`[n8n] Fetch error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Trigger job matching workflow
   */
  async matchJobs(userId?: number) {
    const url = this.getWebhookPath('match-jobs');
    console.log(`[n8n] Calling matchJobs: ${url}`);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, trigger: 'manual' }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`n8n error (${response.status}): ${errorText || response.statusText}`);
      }

      return response.json();
    } catch (error: any) {
      console.error(`[n8n] Fetch error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Manually trigger job scraper
   */
  async scrapeJobs() {
    // Scraper often uses a fixed production webhook in many setups, 
    // but let's use the helper for consistency.
    const url = this.getWebhookPath('scrape-jobs');
    console.log(`[n8n] Calling scrapeJobs: ${url}`);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trigger: 'manual' }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`n8n error (${response.status}): ${errorText || response.statusText}`);
      }

      return response.json();
    } catch (error: any) {
      console.error(`[n8n] Fetch error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get workflow execution status
   */
  async getExecutionStatus(executionId: string) {
    const apiKey = process.env.N8N_API_KEY;
    if (!apiKey) {
      throw new Error('N8N_API_KEY not configured');
    }

    const url = `${this.baseUrl}/api/v1/executions/${executionId}`;
    console.log(`[n8n] Calling getExecutionStatus: ${url}`);

    try {
      const response = await fetch(url, {
        headers: {
          'X-N8N-API-KEY': apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`n8n API error: ${response.statusText}`);
      }

      return response.json();
    } catch (error: any) {
       console.error(`[n8n] Fetch error: ${error.message}`);
       throw error;
    }
  }
}

// Singleton instance
export const n8nClient = new N8NClient();

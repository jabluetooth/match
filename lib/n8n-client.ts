/**
 * n8n API Client
 * Wrapper for calling n8n workflows via webhooks
 */

const N8N_BASE_URL = process.env.N8N_BASE_URL || 'http://localhost:5678';

export class N8NClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = N8N_BASE_URL;
  }

  /**
   * Trigger resume tailoring workflow
   * @param userId - User ID
   * @param jobId - Job ID
   */
  async tailorResume(params: {
    user_id: number;
    job_id: number;
  }) {
    const response = await fetch(`${this.baseUrl}/webhook-test/tailor-resume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Failed to trigger resume tailor: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Trigger company research workflow
   * @param userId - User ID
   * @param applicationId - Application ID (optional if jobId provided)
   * @param jobId - Job ID (optional if applicationId provided)
   */
  async researchCompany(params: {
    user_id: number;
    application_id?: number;
    job_id?: number;
  }) {
    const response = await fetch(`${this.baseUrl}/webhook-test/company-research`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Failed to trigger company research: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Trigger job matching workflow
   */
  async matchJobs(userId?: number) {
    const response = await fetch(`${this.baseUrl}/webhook/match-jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, trigger: 'manual' }),
    });

    if (!response.ok) {
      throw new Error(`Failed to trigger job matching: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Manually trigger job scraper
   */
  async scrapeJobs() {
    const response = await fetch(`${this.baseUrl}/webhook/scrape-jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ trigger: 'manual' }),
    });

    if (!response.ok) {
      throw new Error(`Failed to trigger job scraper: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get workflow execution status (if n8n API is enabled)
   */
  async getExecutionStatus(executionId: string) {
    const apiKey = process.env.N8N_API_KEY;
    if (!apiKey) {
      throw new Error('N8N_API_KEY not configured');
    }

    const response = await fetch(`${this.baseUrl}/api/v1/executions/${executionId}`, {
      headers: {
        'X-N8N-API-KEY': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get execution status: ${response.statusText}`);
    }

    return response.json();
  }
}

// Singleton instance
export const n8nClient = new N8NClient();

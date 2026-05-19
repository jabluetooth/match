import { z } from 'zod';

/**
 * Common validation schemas
 */

export const InterviewPrepSchema = z.object({
  user_id: z.string().min(1),
  application_id: z.number().int().positive(),
  interviewer_name: z.string().optional(),
  interviewer_role: z.string().optional(),
  interviewer_linkedin_url: z.string().url().optional().or(z.literal('')),
});

export const FollowUpResponseSchema = z.object({
  followup_id: z.number().int().positive(),
  application_id: z.number().int().positive(),
  user_id: z.string().min(1),
  response_status: z.enum(['replied', 'no_response', 'bounced']),
  trigger_n8n: z.boolean().optional().default(true),
});

export const ApplicationTrackerSchema = z.object({
  action: z.enum(['create', 'update_status', 'schedule_interview']),
  user_id: z.string().min(1),
  job_id: z.number().int().positive().optional(),
  application_id: z.number().int().positive().optional(),
  status: z.string().optional(),
  interview_date: z.string().optional(),
  interview_type: z.string().optional(),
  interview_location: z.string().optional(),
  interviewer_name: z.string().optional(),
  interviewer_role: z.string().optional(),
  notes: z.string().optional(),
});

export const CompanyResearchSchema = z.object({
  user_id: z.string().min(1),
  application_id: z.number().int().positive().optional(),
  job_id: z.number().int().positive().optional(),
});

export const TailorResumeSchema = z.object({
  user_id: z.string().min(1),
  job_id: z.number().int().positive(),
});

export const MatchJobsSchema = z.object({
  user_id: z.string().min(1),
});

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize object: string fields are HTML-escaped to prevent
 * downstream reflection XSS. Non-string fields pass through unchanged.
 */
export function validateAndSanitize<T extends z.ZodType>(
  schema: T,
  data: unknown,
): z.infer<T> {
  const validated = schema.parse(data) as Record<string, unknown>;

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(validated)) {
    sanitized[key] = typeof value === 'string' ? sanitizeString(value) : value;
  }

  return sanitized as z.infer<T>;
}

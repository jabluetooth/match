# n8n Application Tracker Integration

## Overview

The Application Tracker workflow integration allows your frontend to trigger n8n workflows for automated email notifications and processing while managing application data in your database.

## Architecture

```
Frontend Component
    ↓ (calls)
Next.js API (/api/track/application)
    ↓ (updates database + optionally triggers)
n8n Webhook (application-tracker)
    ↓ (sends emails, additional processing)
Complete
```

## Environment Setup

Make sure these environment variables are set:

```env
# .env.local
N8N_BASE_URL=https://n8n.filheinzrelatorre.com
N8N_FORCE_TEST_WEBHOOKS=true  # Use 'true' for dev, remove for production
```

## Frontend Usage

### Method 1: Using the ApplicationActions Component

```tsx
import { ApplicationActions } from '@/components/application-actions';

function MyComponent() {
  return (
    <ApplicationActions
      userId={1}
      jobId={6}
      applicationId={4}
      onSuccess={() => {
        // Refresh data or show success message
        console.log('Action completed!');
      }}
    />
  );
}
```

### Method 2: Direct API Calls

#### Create Application

```typescript
const response = await fetch('/api/track/application', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'create',
    user_id: 1,
    job_id: 6,
    status: 'draft',
    notes: 'Applying for this position',
    trigger_n8n: true, // Set to true to send emails via n8n
  }),
});

const result = await response.json();
console.log('Application ID:', result.application_id);
```

#### Update Application Status

```typescript
await fetch('/api/track/application', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'update_status',
    user_id: 1,
    application_id: 4,
    status: 'applied', // 'draft' | 'applied' | 'interview' | 'rejected' | 'offer'
    notes: 'Application applied!',
    trigger_n8n: true,
  }),
});
```

#### Schedule Interview

```typescript
await fetch('/api/track/application', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'schedule_interview',
    user_id: 1,
    application_id: 4,
    interview_date: '2026-04-25T14:00:00Z',
    interview_type: 'video', // 'video' | 'phone' | 'onsite'
    interview_location: 'Zoom',
    interviewer_name: 'John Smith',
    interviewer_role: 'Engineering Manager',
    trigger_n8n: true,
  }),
});
```

## n8n Workflow Configuration

### Webhook Setup in n8n

1. Open your n8n workflow: **Match - Application Tracker**
2. Configure the Webhook trigger node:
   - **Path**: `application-tracker`
   - **Method**: POST
   - **Response Mode**: Last Node

3. The workflow will receive this payload:
   ```json
   {
     "action": "create|update_status|schedule_interview",
     "user_id": 1,
     "job_id": 6,
     "application_id": 4,
     "status": "submitted",
     "interview_date": "2026-04-25T14:00:00Z",
     "interview_type": "video",
     "interview_location": "Zoom",
     "interviewer_name": "John Smith",
     "interviewer_role": "Engineering Manager",
     "notes": "Optional notes"
   }
   ```

4. **Activate** the workflow in n8n

### Webhook URLs

- **Development**: `https://n8n.filheinzrelatorre.com/webhook-test/application-tracker`
- **Production**: `https://n8n.filheinzrelatorre.com/webhook/application-tracker`

The system automatically uses test webhooks in development mode.

## API Response Format

All endpoints return a consistent response:

```json
{
  "status": "success",
  "action": "create",
  "application_id": 4,
  "application_status": "draft",
  "job_title": "Senior Software Engineer",
  "company": "Amex",
  "interview_date": null,
  "email_sent": true
}
```

## Important Parameters

### `trigger_n8n` (optional, default: false)

Controls whether the n8n workflow is triggered:

- `true`: Triggers n8n workflow → sends emails and additional processing
- `false`: Only updates database, no emails sent

**Example:**
```typescript
{
  action: 'update_status',
  user_id: 1,
  application_id: 4,
  status: 'submitted',
  trigger_n8n: true, // ← Sends confirmation email via n8n
}
```

## Error Handling

The API is designed to be resilient:

- If database update succeeds but n8n fails, the request still succeeds
- n8n errors are logged but don't fail the entire operation
- This ensures data consistency even if email notifications fail

```typescript
try {
  const response = await fetch('/api/track/application', {...});

  if (!response.ok) {
    const error = await response.json();
    console.error('API Error:', error.details);
  }

  const result = await response.json();
  console.log('Success:', result);
} catch (error) {
  console.error('Network error:', error);
}
```

## Testing

Test the integration with curl:

```bash
# Create application
curl -X POST http://localhost:3000/api/track/application \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create",
    "user_id": 1,
    "job_id": 6,
    "status": "draft",
    "trigger_n8n": false
  }'

# Update status
curl -X POST http://localhost:3000/api/track/application \
  -H "Content-Type: application/json" \
  -d '{
    "action": "update_status",
    "user_id": 1,
    "application_id": 4,
    "status": "submitted",
    "trigger_n8n": true
  }'
```

## Related Endpoints

- **View Interviews**: `/interviews` - Page showing all scheduled interviews
- **Interviews API**: `/api/interviews?user_id=1` - Get interview data
- **Applications**: `/applications` - Main applications dashboard

## Troubleshooting

### n8n webhook not responding

1. Check n8n workflow is **active** in the n8n dashboard
2. Verify `N8N_BASE_URL` in your environment variables
3. Check n8n logs for errors
4. Test webhook directly: `curl https://n8n.filheinzrelatorre.com/webhook-test/application-tracker`

### Database updates succeed but no emails

- Check `trigger_n8n` is set to `true`
- Verify n8n workflow has email nodes configured
- Check n8n execution logs for the workflow

### Application not appearing in frontend

- Refresh the page
- Check browser console for errors
- Verify the user_id matches your logged-in user

# Match — Frontend Integration Guide
## Workflow 6: Follow-up Response Tracking (Path B)

---

## Overview

When a candidate receives a reply (or marks a follow-up as unanswered), the frontend calls a single webhook endpoint. The backend updates the follow-up log, advances the application status if replied, and returns the updated response rate stats.

---

## Endpoint

```
POST https://n8n.filheinzrelatorre.com/webhook/followup-response
Content-Type: application/json
```

> Use `/webhook/` in production. Use `/webhook-test/` only when testing in n8n manually.

---

## Request Body

```json
{
  "followup_id": 1,
  "application_id": 3,
  "user_id": 1,
  "response_status": "replied"
}
```

### Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `followup_id` | integer | ✅ | ID from `follow_up_log.id` |
| `application_id` | integer | ✅ | ID from `applications.id` |
| `user_id` | integer | ✅ | ID of the logged-in user |
| `response_status` | string | ✅ | One of: `replied`, `no_response`, `bounced` |

### `response_status` values

| Value | When to use |
|---|---|
| `replied` | The company responded to the follow-up email |
| `no_response` | Candidate marks it as ignored after waiting |
| `bounced` | The email came back undelivered |

---

## Success Response

**HTTP 200**

```json
{
  "status": "success",
  "followup_id": 1,
  "application_id": 3,
  "response_status": "replied",
  "response_rate_pct": 66.7,
  "total_sent": 3,
  "total_replied": 2
}
```

### Response fields

| Field | Type | Description |
|---|---|---|
| `status` | string | Always `"success"` on 200 |
| `followup_id` | integer | The follow-up record that was updated |
| `application_id` | integer | The linked application |
| `response_status` | string | The status that was saved |
| `response_rate_pct` | float | User's overall follow-up response rate (%) |
| `total_sent` | integer | Total follow-ups sent by this user |
| `total_replied` | integer | Total that received a reply |

---

## What happens in the backend

### If `response_status = "replied"`
1. `follow_up_log` row updated: `response_status = 'replied'`, `responded_at = NOW()`
2. Application status advanced from `applied` → `phone_screen` (only if still at `applied` — won't overwrite further stages)
3. Response rate recalculated
4. Stats returned in response

### If `response_status = "no_response"` or `"bounced"`
1. `follow_up_log` row updated with the new status
2. Application status **not** changed
3. Response rate recalculated
4. Stats returned in response

---

## Where to get `followup_id`

The `followup_id` comes from the `follow_up_log` table. Your frontend should query this table to display the list of pending follow-ups for a user.

**Suggested query to show pending follow-ups on the frontend:**

```sql
SELECT
  fl.id AS followup_id,
  fl.application_id,
  fl.followup_type,
  fl.followup_number,
  fl.draft_subject,
  fl.draft_body,
  fl.sent_at,
  fl.response_status,
  j.title AS job_title,
  j.company_name
FROM follow_up_log fl
JOIN applications a ON fl.application_id = a.id
JOIN jobs j ON a.job_id = j.id
WHERE fl.user_id = :user_id
  AND fl.response_status = 'pending'
ORDER BY fl.sent_at DESC;
```

---

## UI Flow (recommended)

```
Follow-ups list page
  └── Card per follow-up showing:
        - Job title + company
        - Follow-up # (1, 2, or 3)
        - Draft subject + body (copyable)
        - Days since sent
        - Three action buttons:
            [They Replied]   → POST response_status: "replied"
            [No Response]    → POST response_status: "no_response"
            [Email Bounced]  → POST response_status: "bounced"
```

After the user taps a button:
1. Call the webhook
2. On success: remove the card from the pending list
3. Show updated response rate (use `response_rate_pct` from the response)
4. If `replied`: update the application status badge to `Phone Screen`

---

## Error Responses

**HTTP 500 — validation error**

```json
{
  "errorMessage": "Missing followup_id"
}
```

Common causes:
- Missing a required field in the request body
- `response_status` is not one of the three valid values
- `followup_id` does not exist in the database

---

## JavaScript fetch example

```javascript
async function markFollowUpResponse(followupId, applicationId, userId, responseStatus) {
  const res = await fetch('https://n8n.filheinzrelatorre.com/webhook/followup-response', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      followup_id: followupId,
      application_id: applicationId,
      user_id: userId,
      response_status: responseStatus  // 'replied' | 'no_response' | 'bounced'
    })
  });

  const data = await res.json();

  if (data.status === 'success') {
    console.log('Response rate:', data.response_rate_pct + '%');
    // update UI
  }
}
```

---

## Summary

The frontend only needs to do **one thing** for this workflow: call the webhook with the right `followup_id` and `response_status` when the user interacts with a follow-up card. The backend handles everything else — updating the log, advancing the application, and tracking stats.

# Security Implementation Guide

This document outlines the security measures implemented in the Match application.

## 🔐 Authentication (Clerk)

### Setup
1. **Get Clerk API Keys**: Visit https://dashboard.clerk.com/
2. **Update `.env` file**:
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   CLERK_SECRET_KEY=sk_test_your_secret_here
   ```

### Implementation
- ✅ **ClerkProvider** wraps the entire application (app/layout.tsx)
- ✅ **Middleware** protects all routes except public ones (middleware.ts)
- ✅ **Sidebar** shows sign-in/sign-out buttons with user profile
- ✅ **Database Schema** uses Clerk user IDs (VARCHAR instead of INT)
- ✅ **Auto User Sync** - Users are automatically created in the database on first visit via `requireUserWithSync()`

## 🛡️ Authorization

### API Route Protection
All API routes use the `requireAuth()` helper:

```typescript
import { requireAuth, verifyOwnership } from '@/lib/auth';

export async function POST(request: NextRequest) {
  // 1. Authenticate user
  const userId = await requireAuth();

  // 2. Verify ownership of resource
  const resource = await prisma.application.findUnique({
    where: { id: applicationId }
  });
  await verifyOwnership(resource.userId);

  // 3. Proceed with authorized action
}
```

### Ownership Verification
- ✅ Users can only access their own applications
- ✅ Users can only access their own interviews
- ✅ Users can only access their own follow-ups
- ✅ Database queries filtered by authenticated user ID

## ✅ Input Validation & Sanitization

### Zod Schemas
All API inputs are validated using Zod schemas (lib/validation.ts):

```typescript
import { validateAndSanitize, InterviewPrepSchema } from '@/lib/validation';

const validated = validateAndSanitize(InterviewPrepSchema, body);
```

### XSS Protection
- ✅ String inputs are sanitized to prevent XSS attacks
- ✅ HTML entities are escaped (<, >, ", ', /)
- ✅ React automatically escapes JSX content

## 🗄️ Database Security

### Migration to Clerk IDs
User IDs changed from `INT` to `VARCHAR(255)` to support Clerk authentication:

```sql
-- Migration applied: prisma/migrations/clerk_auth_migration.sql
ALTER TABLE users ALTER COLUMN id TYPE VARCHAR(255);
ALTER TABLE applications ALTER COLUMN user_id TYPE VARCHAR(255);
-- ... all user_id columns updated
```

### Row Level Security (RLS) - Optional
RLS policies are prepared but not yet active (prisma/rls-policies.sql).

**To enable RLS:**
```bash
psql $DATABASE_URL < prisma/rls-policies.sql
```

**Note**: RLS requires setting `app.current_user_id` before each query, which needs Prisma middleware implementation.

## 🚦 Rate Limiting - TODO

Rate limiting is not yet implemented. Recommended approaches:

1. **Upstash Redis** - Serverless rate limiting
2. **Vercel Edge Config** - For Vercel deployments
3. **Custom middleware** - Track requests per IP/user

## 🔒 Security Checklist

### ✅ Implemented
- [x] Authentication with Clerk
- [x] Route protection middleware
- [x] API authentication guards
- [x] Ownership verification
- [x] Input validation (Zod)
- [x] XSS sanitization
- [x] SQL injection protection (Prisma ORM)
- [x] Secure session management (Clerk)
- [x] HTTPS enforcement (middleware)

### ⏳ Pending
- [ ] Rate limiting on API endpoints
- [ ] CSRF tokens for form submissions
- [ ] Content Security Policy headers
- [ ] Audit logging for sensitive actions
- [ ] Two-factor authentication (Clerk supports this)
- [ ] Database-level RLS policies

### ❌ Not Applicable
- File upload validation (not implemented yet)
- API key rotation (not using API keys for users)

## 🔧 Testing Security

### Test Authentication
1. Visit http://localhost:3000
2. Click "Sign In" - should redirect to Clerk
3. After sign-in, sidebar should show user profile
4. Try accessing /dashboard without auth - should redirect to sign-in

### Test API Protection
```bash
# Without authentication - should return 401
curl -X POST http://localhost:3000/api/interview-prep \
  -H "Content-Type: application/json" \
  -d '{"application_id": 1}'

# With authentication - get token from Clerk session
curl -X POST http://localhost:3000/api/interview-prep \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{"application_id": 1}'
```

### Test Ownership Verification
1. Create application as User A
2. Try to access it as User B - should return 403 Forbidden

## 🚨 Security Incidents

If you discover a security vulnerability:

1. **Do NOT** open a public GitHub issue
2. Email security concerns to your admin
3. Include steps to reproduce
4. Allow time for patch before disclosure

## 📚 Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Prisma Security](https://www.prisma.io/docs/guides/security)

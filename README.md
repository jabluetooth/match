# CareerOS Frontend Dashboard

Modern, production-ready Next.js 14 dashboard for CareerOS - your AI-powered career management platform.

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Database**: PostgreSQL via Prisma ORM
- **Charts**: Recharts
- **API Integration**: n8n webhooks

## 📁 Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout with navigation
│   ├── page.tsx            # Dashboard homepage
│   ├── globals.css         # Global styles
│   ├── jobs/
│   │   └── page.tsx        # Job matches page
│   ├── applications/
│   │   └── page.tsx        # Applications tracker
│   └── interviews/
│       └── page.tsx        # Interview scheduler
├── components/
│   ├── sidebar.tsx         # Navigation sidebar
│   ├── stats-grid.tsx      # Dashboard metrics
│   ├── recent-matches.tsx  # Latest job matches
│   ├── application-funnel.tsx # Funnel chart
│   ├── activity-feed.tsx   # Recent activity
│   ├── job-match-card.tsx  # Individual job card
│   └── job-match-filters.tsx # Search/filter UI
├── lib/
│   ├── prisma.ts           # Database client
│   ├── n8n-client.ts       # n8n API wrapper
│   └── utils.ts            # Helper functions
├── prisma/
│   └── schema.prisma       # Database schema
└── package.json
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- n8n instance deployed and accessible

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Database connection
DATABASE_URL="postgresql://careerios_user:your_password@localhost:5432/careerios"

# n8n API endpoint
N8N_BASE_URL="https://your-n8n-domain.com"
N8N_API_KEY="your_n8n_api_key"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 3: Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push
```

### Step 4: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Features

### ✅ Implemented

- **Dashboard Overview**
  - Real-time stats (matches, applications, interviews, offers)
  - Recent job matches with AI scores
  - Application funnel visualization
  - Activity feed

- **Job Matches Page**
  - AI-scored job listings
  - Skills matching visualization
  - One-click resume tailoring (via n8n)
  - Search and filters

- **Database Integration**
  - Full Prisma ORM setup
  - Type-safe queries
  - Optimized indexes

- **n8n Integration**
  - Resume tailoring workflow trigger
  - Company research trigger
  - Job matching trigger
  - Job scraping trigger

### 🚧 To Implement

- **Applications Tracker**
  - Kanban board view
  - Status updates
  - Document management

- **Interview Scheduler**
  - Calendar integration
  - Prep notes viewer
  - Feedback tracking

- **Settings Page**
  - Profile management
  - Skills editor
  - Preferences

- **Authentication**
  - User login/signup
  - Session management

## 🔌 n8n Integration

The dashboard communicates with n8n workflows via webhooks:

```typescript
import { n8nClient } from '@/lib/n8n-client';

// Tailor resume for a job match
await n8nClient.tailorResume(jobMatchId);

// Research company for interview
await n8nClient.researchCompany('Company Name', 'https://company.com');

// Manually trigger job matching
await n8nClient.matchJobs(userId);

// Manually trigger job scraping
await n8nClient.scrapeJobs();
```

## 🎨 UI Components

Built with Radix UI primitives for accessibility:

- **Navigation**: Sidebar with active state
- **Cards**: Stats, job matches, activity
- **Charts**: Recharts for data visualization
- **Badges**: Status indicators, skill tags
- **Buttons**: Primary, secondary, disabled states

## 📊 Database Queries

Example queries using Prisma:

```typescript
// Get job matches for user
const matches = await prisma.jobMatch.findMany({
  where: { 
    userId: 1,
    matchScore: { gte: 70 }
  },
  include: { job: true },
  orderBy: { matchScore: 'desc' }
});

// Get application stats
const stats = await prisma.application.groupBy({
  by: ['status'],
  where: { userId: 1 },
  _count: true
});
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel deploy

# Set environment variables in Vercel dashboard
# - DATABASE_URL
# - N8N_BASE_URL
# - N8N_API_KEY
```

### Deploy to Other Platforms

Works with any Node.js hosting:
- Railway
- Render
- Fly.io
- DigitalOcean App Platform

## 🧪 Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Open Prisma Studio (database GUI)
npm run db:studio

# Lint code
npm run lint
```

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ Yes |
| `N8N_BASE_URL` | n8n instance URL | ✅ Yes |
| `N8N_API_KEY` | n8n API key (for status checks) | ❌ Optional |
| `NEXT_PUBLIC_APP_URL` | Frontend URL | ✅ Yes |

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## 📄 License

MIT License - feel free to use for your own projects!

## 🆘 Support

- Check n8n workflow logs for webhook errors
- Use Prisma Studio to inspect database
- Check browser console for frontend errors
- Verify DATABASE_URL is correct

## 🎉 Next Steps

1. ✅ Set up database
2. ✅ Configure n8n webhooks
3. ⬜ Add authentication
4. ⬜ Implement applications page
5. ⬜ Build interview scheduler
6. ⬜ Deploy to production

---

Built with ❤️ using Next.js, Prisma, and n8n

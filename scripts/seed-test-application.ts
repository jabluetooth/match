import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding test application...');

  // 1. Check or create a user
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        fullName: 'Test User',
        profile: {
          create: {
            skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
            experienceYears: 5,
            jobTitles: ['Software Engineer', 'Full Stack Developer'],
            industries: ['Technology', 'Software'],
            workType: 'Remote',
          },
        },
      },
    });
    console.log('✓ Created test user:', user.email);
  } else {
    console.log('✓ Using existing user:', user.email);
  }

  // 2. Check or create a job
  let job = await prisma.job.findFirst();
  if (!job) {
    job = await prisma.job.create({
      data: {
        externalId: 'test-job-123',
        source: 'LinkedIn',
        sourceUrl: 'https://linkedin.com/jobs/test-123',
        title: 'Senior Full Stack Developer',
        companyName: 'Tech Innovations Inc',
        location: 'San Francisco, CA',
        workType: 'Remote',
        employmentType: 'Full-time',
        salaryMin: 120000,
        salaryMax: 180000,
        description: 'Looking for an experienced full stack developer to join our team...',
        requirements: 'React, Node.js, TypeScript, 5+ years experience',
      },
    });
    console.log('✓ Created test job:', job.title);
  } else {
    console.log('✓ Using existing job:', job.title);
  }

  // 3. Check or create a job match
  let jobMatch = await prisma.jobMatch.findFirst({
    where: { userId: user.id, jobId: job.id },
  });
  if (!jobMatch) {
    jobMatch = await prisma.jobMatch.create({
      data: {
        userId: user.id,
        jobId: job.id,
        matchScore: 85.5,
        aiReasoning: 'Strong match based on your React and TypeScript skills. This role aligns well with your full stack experience.',
        skillsMatched: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
        skillsMissing: ['Docker', 'Kubernetes'],
      },
    });
    console.log('✓ Created job match with score:', jobMatch.matchScore);
  } else {
    console.log('✓ Using existing job match with score:', jobMatch.matchScore);
  }

  // 4. Create an application
  const application = await prisma.application.create({
    data: {
      userId: user.id,
      jobMatchId: jobMatch.id,
      status: 'submitted',
      appliedDate: new Date(),
      notes: 'Excited about this opportunity! Company culture looks great.',
    },
  });

  console.log('✓ Created test application with ID:', application.id);
  console.log('\n✅ Test application created successfully!');
  console.log('Visit /applications page to see the Research Company button');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get an existing application (or create one)
  let application = await prisma.application.findFirst({
    where: { userId: 1 },
    orderBy: { id: 'desc' }
  });

  if (!application) {
    console.error('No applications found for user 1. Run seed-test-application.ts first.');
    process.exit(1);
  }

  console.log(`Using application ID: ${application.id}`);

  // Schedule an interview 3 days from now
  const interviewDate = new Date();
  interviewDate.setDate(interviewDate.getDate() + 3);
  interviewDate.setHours(14, 0, 0, 0); // 2 PM

  // Update the application with interview details
  const updated = await prisma.application.update({
    where: { id: application.id },
    data: {
      status: 'interview',
      interviewDate: interviewDate,
      interviewType: 'video',
      interviewLocation: 'Zoom',
      interviewerName: 'Sarah Johnson',
      interviewerRole: 'Engineering Manager',
    },
    include: {
      job: true
    }
  });

  console.log('✅ Test interview scheduled:');
  console.log(`Job: ${updated.job.title} at ${updated.job.companyName}`);
  console.log(`Interview Date: ${updated.interviewDate?.toLocaleString()}`);
  console.log(`Interviewer: ${updated.interviewerName} (${updated.interviewerRole})`);
  console.log(`Type: ${updated.interviewType}`);
  console.log('\n📍 Visit http://localhost:3000/interviews to see it!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

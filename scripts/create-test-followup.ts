import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get an existing application (preferably one with "applied" status)
  const application = await prisma.application.findFirst({
    where: { userId: 1 },
    orderBy: { id: 'desc' }
  });

  if (!application) {
    console.error('No applications found for user 1');
    process.exit(1);
  }

  console.log(`Using application ID: ${application.id}`);

  // Create a test follow-up in the FollowUpLog table
  const followUp = await prisma.followUpLog.create({
    data: {
      applicationId: application.id,
      userId: 1,
      followupType: 'initial',
      followupNumber: 1,
      draftSubject: 'Following up on my application - Software Engineer position',
      draftBody: 'Hi! Just following up on my application for the Software Engineer position. I\'m very excited about the opportunity and would love to discuss my qualifications further. Looking forward to hearing from you!',
      tone: 'professional',
      sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      responseStatus: 'pending',
    }
  });

  console.log('✅ Test follow-up created in FollowUpLog:');
  console.log(JSON.stringify(followUp, null, 2));
  console.log('\n📍 Visit http://localhost:3000/followups to see it!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

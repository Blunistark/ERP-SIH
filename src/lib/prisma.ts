import { PrismaClient } from '@prisma/client';

// Create a single PrismaClient instance to be shared across the application
export const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

// Handle cleanup on shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  });
}

// In development, use a global variable to persist the client across hot reloads
// In production, create a new client
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Handle connection cleanup on process exit
if (process.env.NODE_ENV === 'production') {
  process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

// Middleware to retry on prepared statement errors (Supabase pooler issue)
prisma.$use(async (params, next) => {
  try {
    return await next(params);
  } catch (error: any) {
    // Retry if it's a prepared statement cache error
    if (
      error?.code === 'P2010' &&
      error?.meta?.code === '42P05' &&
      error?.meta?.message?.includes('prepared statement')
    ) {
      console.warn('Prepared statement cache error, retrying...');
      // Disconnect and reconnect to clear the cache
      await new Promise(resolve => setTimeout(resolve, 100));
      return next(params);
    }
    throw error;
  }
});

#!/usr/bin/env node

// Test database connection
import { PrismaClient } from '@prisma/client';

async function testConnection() {
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });

  try {
    console.log('Testing database connection...');
    
    // Disconnect first to clear any stale connections
    await prisma.$disconnect();
    
    // Create new client
    const newPrisma = new PrismaClient({
      log: ['error', 'warn'],
    });
    
    // Test basic query with retry
    let result;
    let retries = 3;
    while (retries > 0) {
      try {
        result = await newPrisma.$queryRaw`SELECT 1 as test`;
        console.log('✓ Database connection successful');
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        console.log('  Retrying connection...');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // Try to count websites
    const count = await newPrisma.website.count();
    console.log('✓ Website count:', count);
    
    // Try to fetch one website
    const website = await newPrisma.website.findFirst({
      include: {
        seoMetrics: true,
        securityMetrics: true,
        analytics: true,
      },
    });
    console.log('✓ Sample website:', website ? website.displayName : 'No websites found (this is OK)');
    
    console.log('\n✓ All tests passed!');
    await newPrisma.$disconnect();
  } catch (error) {
    console.error('✗ Error:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
    process.exit(1);
  }
}

testConnection();

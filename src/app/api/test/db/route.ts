import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('🔌 Testing database connection...');
    
    // Try a simple count query
    const count = await prisma.website.count();
    
    console.log(`✅ Database connected! Found ${count} websites`);
    
    return Response.json({ 
      status: 'connected', 
      websiteCount: count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Database connection error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return Response.json({ 
      status: 'error', 
      error: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

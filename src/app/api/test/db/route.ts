import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Try a simple count query to verify database connection
    const count = await prisma.website.count();
    
    return Response.json({ 
      status: 'connected', 
      websiteCount: count,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Database connection error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    
    return Response.json({ 
      status: 'error', 
      error: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Only enable in development
  if (process.env.NODE_ENV !== 'development') {
    return Response.json(
      { error: 'Debug endpoint only available in development' },
      { status: 403 }
    );
  }

  try {
    const session = await getServerSession(authOptions);

    // Check environment variables
    const envStatus = {
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      DATABASE_URL: !!process.env.DATABASE_URL,
      ADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
      ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
      NODE_ENV: process.env.NODE_ENV,
    };

    // Check database connectivity
    let dbStatus = 'unknown';
    let userCount = 0;
    try {
      const users = await prisma.user.findMany();
      dbStatus = 'connected';
      userCount = users.length;
    } catch (error) {
      dbStatus = 'failed';
    }

    // Check admin user
    let adminUserExists = false;
    let adminUserDetails = null;
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
      const adminUser = await prisma.user.findUnique({
        where: { email: adminEmail },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });
      adminUserExists = !!adminUser;
      adminUserDetails = adminUser;
    } catch (error) {
      console.error('Error checking admin user:', error);
    }

    return Response.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      session: {
        authenticated: !!session,
        user: session?.user
          ? {
              email: session.user.email,
              name: session.user.name,
              role: (session.user as any).role,
            }
          : null,
      },
      environment: envStatus,
      database: {
        status: dbStatus,
        totalUsers: userCount,
        adminUserExists,
        adminUserDetails,
      },
      diagnosis: {
        issues: generateDiagnosis(envStatus, dbStatus, adminUserExists),
        recommendations: generateRecommendations(envStatus, dbStatus, adminUserExists),
      },
    });
  } catch (error) {
    return Response.json(
      { error: 'Debug endpoint error', details: String(error) },
      { status: 500 }
    );
  }
}

function generateDiagnosis(
  envStatus: Record<string, boolean | string>,
  dbStatus: string,
  adminUserExists: boolean
): string[] {
  const issues: string[] = [];

  if (!envStatus.NEXTAUTH_SECRET) {
    issues.push('🚨 NEXTAUTH_SECRET is not set - authentication will fail');
  }
  if (!envStatus.NEXTAUTH_URL) {
    issues.push('⚠️ NEXTAUTH_URL is not set');
  }
  if (!envStatus.DATABASE_URL) {
    issues.push('🚨 DATABASE_URL is not configured');
  }
  if (envStatus.NODE_ENV === 'production' && !envStatus.ADMIN_PASSWORD) {
    issues.push('⚠️ ADMIN_PASSWORD not set - seeding will fail');
  }
  if (dbStatus === 'failed') {
    issues.push('🚨 Cannot connect to database - check DATABASE_URL');
  }
  if (dbStatus === 'connected' && !adminUserExists) {
    issues.push('❓ Admin user not found - run "npm run db:seed" to create it');
  }

  return issues.length > 0 ? issues : ['✅ All systems operational'];
}

function generateRecommendations(
  envStatus: Record<string, boolean | string>,
  dbStatus: string,
  adminUserExists: boolean
): string[] {
  const recommendations: string[] = [];

  if (!envStatus.NEXTAUTH_SECRET) {
    recommendations.push(
      'Generate NEXTAUTH_SECRET: openssl rand -base64 32'
    );
    recommendations.push('Add it to your .env.local file');
  }

  if (dbStatus === 'failed') {
    recommendations.push('1. Verify DATABASE_URL is correct');
    recommendations.push('2. Check if PostgreSQL server is running');
    recommendations.push('3. Test connection manually');
  }

  if (dbStatus === 'connected' && !adminUserExists) {
    recommendations.push('Run: npm run db:seed');
    recommendations.push('Or create a user manually in the database');
  }

  if (!envStatus.ADMIN_EMAIL || !envStatus.ADMIN_PASSWORD) {
    recommendations.push('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local');
  }

  recommendations.push('Check /login page for form errors');
  recommendations.push('Open browser console (F12) for detailed logs');
  recommendations.push('Check NEXTAUTH_URL matches your domain');

  return recommendations;
}

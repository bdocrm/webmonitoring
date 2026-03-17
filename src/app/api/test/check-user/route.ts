import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const user = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: { email: true, id: true },
    });

    if (!user) {
      return Response.json({ status: 'User not found - run npm run db:seed' });
    }

    return Response.json({ status: 'User exists', user });
  } catch (error: any) {
    console.error('Error checking user:', error);
    return Response.json(
      { error: 'Failed to check user. Please try again.' },
      { status: 500 }
    );
  }
}

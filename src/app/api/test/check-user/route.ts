import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@websitemonitoring.com' },
      select: { email: true, id: true },
    });

    if (!user) {
      return Response.json({ status: 'User not found - run npm run db:seed' });
    }

    return Response.json({ status: 'User exists', user });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}

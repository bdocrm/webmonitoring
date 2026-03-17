import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Public endpoint for shared dashboards - no authentication required
export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid website ID. ID is required and must be a string' },
        { status: 400 }
      );
    }

    const website = await prisma.website.findUnique({
      where: { id },
      include: {
        seoMetrics: true,
        securityMetrics: true,
        analytics: true,
        scans: {
          orderBy: { startedAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!website) {
      return NextResponse.json(
        { error: 'Website dashboard not found. The shared link may have expired or be invalid.' },
        { status: 404 }
      );
    }

    return NextResponse.json(website);
  } catch (error: any) {
    console.error('Error fetching public website:', error);
    return NextResponse.json(
      { error: 'Failed to fetch website dashboard. Please try again later.' },
      { status: 500 }
    );
  }
}

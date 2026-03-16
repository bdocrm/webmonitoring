import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { crawlWebsite } from '@/lib/crawler';

// Mark route as dynamic to prevent pre-rendering during build
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { websiteId } = body;

    if (!websiteId) {
      return NextResponse.json(
        { error: 'websiteId is required' },
        { status: 400 }
      );
    }

    const website = await prisma.website.findUnique({
      where: { id: websiteId },
    });

    if (!website) {
      return NextResponse.json(
        { error: 'Website not found' },
        { status: 404 }
      );
    }

    // Start crawling
    const scan = await crawlWebsite(website.domain, websiteId);

    return NextResponse.json(scan, { status: 201 });
  } catch (error) {
    console.error('Crawler error:', error);
    return NextResponse.json(
      { error: 'Failed to start crawler' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get('websiteId');

    if (!websiteId) {
      return NextResponse.json(
        { error: 'websiteId is required' },
        { status: 400 }
      );
    }

    const scans = await prisma.scan.findMany({
      where: { websiteId },
      include: {
        pages: {
          take: 10,
        },
        errorLogs: {
          take: 10,
        },
      },
      orderBy: { startedAt: 'desc' },
      take: 5,
    });

    return NextResponse.json(scans);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch scans' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Mark route as dynamic to prevent pre-rendering during build
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const websites = await prisma.website.findMany({
      include: {
        seoMetrics: true,
        securityMetrics: true,
      },
    });
    return NextResponse.json(websites);
  } catch (error) {
    console.error('API /api/websites GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch websites', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain, displayName, description } = body;

    if (!domain || !displayName) {
      return NextResponse.json(
        { error: 'Domain and displayName are required' },
        { status: 400 }
      );
    }

    const website = await prisma.website.create({
      data: {
        domain,
        displayName,
        description,
        seoMetrics: {
          create: {},
        },
        securityMetrics: {
          create: {},
        },
        analytics: {
          create: {},
        },
      },
      include: {
        seoMetrics: true,
        securityMetrics: true,
      },
    });

    return NextResponse.json(website, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create website' },
      { status: 500 }
    );
  }
}

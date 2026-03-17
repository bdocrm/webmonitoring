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
  } catch (error: any) {
    console.error('Error fetching websites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch websites. Please try again.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain, displayName, description } = body;

    if (!domain || typeof domain !== 'string' || !domain.trim()) {
      return NextResponse.json(
        { error: 'Invalid domain. Domain is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (!displayName || typeof displayName !== 'string' || !displayName.trim()) {
      return NextResponse.json(
        { error: 'Invalid displayName. Display name is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (description && typeof description !== 'string') {
      return NextResponse.json(
        { error: 'Invalid description. Description must be a string' },
        { status: 400 }
      );
    }

    const website = await prisma.website.create({
      data: {
        domain: domain.trim(),
        displayName: displayName.trim(),
        description: description?.trim(),
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
  } catch (error: any) {
    console.error('Error creating website:', error);
    return NextResponse.json(
      { error: 'Failed to create website. Please try again.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Mark route as dynamic to prevent pre-rendering during build
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Test database connection first
    await prisma.$queryRaw`SELECT 1`;

    const websites = await prisma.website.findMany({
      include: {
        seoMetrics: true,
        securityMetrics: true,
        analytics: true,
      },
    });
    
    return NextResponse.json(websites);
  } catch (error: any) {
    console.error('Error fetching websites:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      clientVersion: error?.clientVersion,
    });
    
    // Provide more specific error messages
    const errorMessage = error?.code === 'P1000' 
      ? 'Database connection failed. Please check your database credentials.'
      : error?.code === 'P1001'
      ? 'Database connection timeout. Please try again.'
      : error?.code === 'P2021'
      ? 'Database table not found. Please run: npm run db:migrate'
      : error?.code === 'P1013'
      ? 'Database connection lost. Please refresh the page.'
      : 'Failed to fetch websites. Please try again.';
    
    return NextResponse.json(
      { error: errorMessage, code: error?.code },
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
        analytics: true,
      },
    });

    return NextResponse.json(website, { status: 201 });
  } catch (error: any) {
    console.error('Error creating website:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
    });
    
    const errorMessage = error?.code === 'P2002'
      ? 'A website with this domain already exists.'
      : error?.code === 'P1000'
      ? 'Database connection failed.'
      : 'Failed to create website. Please try again.';
    
    return NextResponse.json(
      { error: errorMessage, code: error?.code },
      { status: 500 }
    );
  }
}

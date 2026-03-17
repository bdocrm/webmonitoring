import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Mark route as dynamic to prevent pre-rendering during build
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('📡 Fetching websites...');
    
    // Simple query first to debug
    const websites = await prisma.website.findMany({
      include: {
        seoMetrics: true,
        securityMetrics: true,
      },
    });
    
    console.log(`✅ Found ${websites.length} websites`);
    return NextResponse.json(websites);
  } catch (error) {
    console.error('❌ API /api/websites GET error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : null;
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch websites', 
        message: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? stack : undefined,
        timestamp: new Date().toISOString(),
      },
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

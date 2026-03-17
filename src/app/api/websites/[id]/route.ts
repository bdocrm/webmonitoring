import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Mark route as dynamic to prevent pre-rendering during build
export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const website = await prisma.website.findUnique({
      where: { id: params.id },
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
        { error: 'Website not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(website);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch website' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID
    if (!params.id || typeof params.id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid website ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate body - only allow specific fields
    const allowedFields = ['displayName', 'description', 'isActive'];
    const updateData: any = {};

    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update. Allowed fields: displayName, description, isActive' },
        { status: 400 }
      );
    }

    const website = await prisma.website.update({
      where: { id: params.id },
      data: updateData,
      include: {
        seoMetrics: true,
        securityMetrics: true,
      },
    });

    return NextResponse.json(website);
  } catch (error: any) {
    console.error('Error updating website:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Website not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update website. Please try again.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID
    if (!params.id || typeof params.id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid website ID' },
        { status: 400 }
      );
    }

    await prisma.website.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Website deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting website:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Website not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to delete website. Please try again.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  calculateSecurityRating,
  checkSSLCertificate,
  checkSecurityHeaders,
} from '@/lib/security/rating';

// Mark route as dynamic to prevent pre-rendering during build
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { websiteId } = body;

    if (!websiteId || typeof websiteId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid websiteId. websiteId is required and must be a string' },
        { status: 400 }
      );
    }

    const website = await prisma.website.findUnique({
      where: { id: websiteId },
    });

    if (!website) {
      return NextResponse.json(
        { error: 'Website not found. Please check the website ID' },
        { status: 404 }
      );
    }

    // Check SSL certificate
    const sslCertificateValid = await checkSSLCertificate(website.domain);

    // Check security headers
    const headers = await checkSecurityHeaders(website.domain);

    // Calculate security rating
    const securityRating = calculateSecurityRating({
      httpsStatus: website.domain.startsWith('https') || sslCertificateValid,
      sslCertificateValid,
      hasCSP: headers.hasCSP,
      hasXFrameOptions: headers.hasXFrameOptions,
      hasHSTS: headers.hasHSTS,
      hasXContentType: headers.hasXContentType,
      hasXXSSProtection: headers.hasXXSSProtection,
      cveIssues: 0,
    });

    // Update security metrics
    const securityMetrics = await prisma.securityMetrics.update({
      where: { websiteId },
      data: {
        securityRating,
        httpsStatus: sslCertificateValid || website.domain.startsWith('https'),
        sslCertificateValid,
        ...headers,
        lastScanned: new Date(),
      },
    });

    return NextResponse.json(securityMetrics);
  } catch (error: any) {
    console.error('Security check error:', error);
    return NextResponse.json(
      { error: 'Failed to check security. Please try again later.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get('websiteId');

    if (!websiteId || typeof websiteId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid websiteId. websiteId is required and must be a string' },
        { status: 400 }
      );
    }

    const securityMetrics = await prisma.securityMetrics.findUnique({
      where: { websiteId },
    });

    if (!securityMetrics) {
      return NextResponse.json(
        { error: 'Security metrics not found. Please run a security scan first.' },
        { status: 404 }
      );
    }

    return NextResponse.json(securityMetrics);
  } catch (error: any) {
    console.error('Error fetching security metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch security metrics. Please try again.' },
      { status: 500 }
    );
  }
}

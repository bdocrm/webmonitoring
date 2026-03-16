import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  calculateSecurityRating,
  checkSSLCertificate,
  checkSecurityHeaders,
} from '@/lib/security/rating';

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
  } catch (error) {
    console.error('Security check error:', error);
    return NextResponse.json(
      { error: 'Failed to check security' },
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

    const securityMetrics = await prisma.securityMetrics.findUnique({
      where: { websiteId },
    });

    if (!securityMetrics) {
      return NextResponse.json(
        { error: 'Security metrics not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(securityMetrics);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch security metrics' },
      { status: 500 }
    );
  }
}

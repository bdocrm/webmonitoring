import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  calculateSiteHealthScore,
  calculateAISearchHealth,
  calculateCrawlability,
  calculateInternalLinkingScore,
} from '@/lib/seo/scoring';

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

    // Get pages for this website
    const pages = await prisma.page.findMany({
      where: { websiteId },
    });

    if (pages.length === 0) {
      return NextResponse.json(
        { error: 'No pages found for this website' },
        { status: 400 }
      );
    }

    // Calculate metrics
    const totalPages = pages.length;
    const pagesCrawled = pages.filter((p) => p.statusCode < 400).length;
    const pagesWithMissingMetaDescription = pages.filter(
      (p) => !p.metaDescription
    ).length;
    const pagesWithDuplicateTitle = pages.filter(
      (p) =>
        pages.filter((other) => other.title === p.title).length > 1
    ).length;
    const brokenInternalLinks = pages.reduce((sum, p) => sum + p.internalLinks, 0) / pages.length;
    const orphanPages = pages.filter((p) => p.internalLinks === 0).length;
    const averageInternalLinksPerPage =
      pages.reduce((sum, p) => sum + p.internalLinks, 0) / pages.length;

    // Calculate scores
    const siteHealthScore = calculateSiteHealthScore({
      pagesWithMissingMetaDescription,
      pagesWithDuplicateTitle,
      brokenInternalLinks: Math.floor(brokenInternalLinks),
      totalPages,
      pagesCrawled,
    });

    const hasH1Rate =
      (pages.filter((p) => p.hasH1).length / totalPages) * 100;

    const aiSearchHealth = calculateAISearchHealth({
      pagesCrawled,
      totalPages,
      pagesWithMissingMetaDescription,
      hasH1Rate,
      mobile_friendlyRate: 85,
    });

    const crawlability = calculateCrawlability({
      pagesCrawled,
      totalPages,
      brokenInternalLinks: Math.floor(brokenInternalLinks),
    });

    const internalLinking = calculateInternalLinkingScore({
      orphanPages,
      brokenInternalLinks: Math.floor(brokenInternalLinks),
      totalPages,
      averageInternalLinksPerPage,
    });

    // Update SEO metrics
    const seoMetrics = await prisma.seoMetrics.update({
      where: { websiteId },
      data: {
        siteHealthScore,
        aiSearchHealth,
        crawlability,
        internalLinking,
        totalPages,
        pagesCrawled,
        orphanPages,
        pagesWithMissingMetaDescription,
        pagesWithDuplicateTitle,
        brokenInternalLinks: Math.floor(brokenInternalLinks),
        lastCalculated: new Date(),
      },
    });

    return NextResponse.json(seoMetrics);
  } catch (error) {
    console.error('SEO analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze SEO' },
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

    const seoMetrics = await prisma.seoMetrics.findUnique({
      where: { websiteId },
    });

    if (!seoMetrics) {
      return NextResponse.json(
        { error: 'SEO metrics not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(seoMetrics);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch SEO metrics' },
      { status: 500 }
    );
  }
}

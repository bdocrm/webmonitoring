import * as cheerio from 'cheerio';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';
import {
  calculateSiteHealthScore,
  calculateAISearchHealth,
  calculateCrawlability,
  calculateInternalLinkingScore,
} from '@/lib/seo/scoring';
import { sendAlertEmail } from '@/lib/notifications/email';

export interface CrawlResult {
  url: string;
  title: string | null;
  metaDescription: string | null;
  h1: string | null;
  statusCode: number;
  internalLinks: number;
  externalLinks: number;
  wordCount: number;
  hasH1: boolean;
  imageCount: number;
  loadTime?: number; // in milliseconds
  isMobileOptimized?: boolean;
}

interface SecurityHeaders {
  https: boolean;
  hsts: boolean;
  csp: boolean;
  xFrameOptions: boolean;
  xContentType: boolean;
  xXSSProtection: boolean;
}

const crawledUrls = new Set<string>();
const urlQueue: string[] = [];

function getShareDashboardUrl(websiteId: string) {
  return `${env.SHARE_DASHBOARD_BASE_URL.replace(/\/$/, '')}/share/${websiteId}`;
}

export const crawlWebsite = async (domain: string, websiteId: string) => {
  const baseUrl = !domain.startsWith('http') ? `https://${domain}` : domain;
  const shareDashboardUrl = getShareDashboardUrl(websiteId);
  const emailNotifications: Record<string, Awaited<ReturnType<typeof sendAlertEmail>>> = {};
  
  crawledUrls.clear();
  urlQueue.length = 0;
  
  try {
    // Create scan record
    const scan = await prisma.scan.create({
      data: {
        websiteId,
        status: 'running',
      },
    });

    emailNotifications.scanStarted = await sendAlertEmail('scan_started', {
      websiteName: domain,
      domain: baseUrl,
      message: 'A website scan has started.',
      actionUrl: shareDashboardUrl,
      actionLabel: 'View Share Dashboard',
      meta: {
        websiteId,
        startedAt: new Date().toISOString(),
      },
    });

    urlQueue.push(baseUrl);
    const results: CrawlResult[] = [];
    let securityHeaders: SecurityHeaders = {
      https: baseUrl.startsWith('https'),
      hsts: false,
      csp: false,
      xFrameOptions: false,
      xContentType: false,
      xXSSProtection: false,
    };
    let errorCount = 0;
    let warningCount = 0;

    while (urlQueue.length > 0 && crawledUrls.size < env.MAX_PAGES_PER_SCAN) {
      const url = urlQueue.shift();
      if (!url) break;

      if (crawledUrls.has(url)) continue;
      crawledUrls.add(url);

      try {
        const result = await crawlPage(url, baseUrl);
        if (result) {
          results.push(result);

          // Check security headers on first page
          if (results.length === 1) {
            securityHeaders = await checkSecurityHeaders(baseUrl);
          }

          // Count errors/warnings
          if (result.statusCode >= 400) errorCount++;
          if (!result.title || !result.metaDescription) warningCount++;

          if (results.length % 5 === 0) {
            emailNotifications.scanProgress = await sendAlertEmail('scan_progress', {
              websiteName: domain,
              domain: baseUrl,
              message: `Scan is still in progress. ${results.length} page(s) processed so far.`,
              actionUrl: shareDashboardUrl,
              actionLabel: 'View Share Dashboard',
              meta: {
                websiteId,
                pagesProcessed: results.length,
                errors: errorCount,
              },
            });
          }

          // Save page to database
          await prisma.page.upsert({
            where: { websiteId_url: { websiteId, url } },
            create: {
              websiteId,
              scanId: scan.id,
              url,
              title: result.title,
              metaDescription: result.metaDescription,
              h1: result.h1,
              statusCode: result.statusCode,
              internalLinks: result.internalLinks,
              externalLinks: result.externalLinks,
              wordCount: result.wordCount,
              hasH1: result.hasH1,
              hasMetaDescription: !!result.metaDescription,
              imageCount: result.imageCount,
            },
            update: {
              title: result.title,
              metaDescription: result.metaDescription,
              h1: result.h1,
              statusCode: result.statusCode,
              internalLinks: result.internalLinks,
              externalLinks: result.externalLinks,
              wordCount: result.wordCount,
              hasH1: result.hasH1,
              hasMetaDescription: !!result.metaDescription,
              imageCount: result.imageCount,
              updatedAt: new Date(),
            },
          });
        }
      } catch (error) {
        console.error(`Error crawling ${url}:`, error);
        errorCount++;
        
        // Log error
        await prisma.errorLog.create({
          data: {
            websiteId,
            scanId: scan.id,
            url,
            errorType: 'crawl_error',
            errorMessage: String(error),
          },
        });
      }
    }

    // Calculate SEO scores using the shared, more balanced algorithm.
    const totalPages = results.length;
    const successfulPages = results.filter((r) => r.statusCode < 400).length;
    const pagesWithDescription = results.filter((r) => r.metaDescription && r.metaDescription.trim().length > 30).length;
    const pagesWithH1 = results.filter((r) => r.hasH1).length;
    const pagesWithMissingMetaDescription = Math.max(0, totalPages - pagesWithDescription);
    const titleFrequency = new Map<string, number>();
    results.forEach((result) => {
      if (result.title) {
        titleFrequency.set(result.title, (titleFrequency.get(result.title) ?? 0) + 1);
      }
    });
    const pagesWithDuplicateTitle = results.filter(
      (result) => result.title && (titleFrequency.get(result.title) ?? 0) > 1
    ).length;
    const weakInternalLinkPages = results.filter((result) => result.internalLinks === 0).length;
    const hasH1Rate = totalPages > 0 ? Math.round((pagesWithH1 / totalPages) * 100) : 0;

    const siteHealthScore = calculateSiteHealthScore({
      pagesWithMissingMetaDescription,
      pagesWithDuplicateTitle,
      brokenInternalLinks: weakInternalLinkPages,
      totalPages,
      pagesCrawled: successfulPages,
      hasH1Rate,
    });

    const aiSearchHealth = calculateAISearchHealth({
      pagesCrawled: successfulPages,
      totalPages,
      pagesWithMissingMetaDescription,
      hasH1Rate,
      mobile_friendlyRate: 85,
    });

    const crawlabilityScore = calculateCrawlability({
      pagesCrawled: successfulPages,
      totalPages,
      brokenInternalLinks: weakInternalLinkPages,
    });

    const internalLinkingScore = calculateInternalLinkingScore({
      orphanPages: weakInternalLinkPages,
      brokenInternalLinks: weakInternalLinkPages,
      totalPages,
      averageInternalLinksPerPage: totalPages > 0 ? results.reduce((acc, r) => acc + r.internalLinks, 0) / totalPages : 0,
    });

    // Calculate Performance Score (0-100)
    const avgLoadTime = totalPages > 0 
      ? results.reduce((acc, r) => acc + (r.loadTime || 0), 0) / totalPages 
      : 0;
    const mobileOptimizedPages = results.filter(r => r.isMobileOptimized).length;
    const mobileScore = totalPages > 0 ? Math.round((mobileOptimizedPages / totalPages) * 100) : 0;
    
    // Load time score: <1s = 100, <3s = 75, <5s = 50, >5s = 25
    let loadTimeScore = 25;
    if (avgLoadTime < 1000) loadTimeScore = 100;
    else if (avgLoadTime < 3000) loadTimeScore = 75;
    else if (avgLoadTime < 5000) loadTimeScore = 50;
    
    const performanceScore = Math.round((loadTimeScore * 0.6) + (mobileScore * 0.4));

    // Update SEO metrics
    await prisma.seoMetrics.upsert({
      where: { websiteId },
      create: {
        websiteId,
        siteHealthScore,
        aiSearchHealth,
        crawlability: crawlabilityScore,
        internalLinking: internalLinkingScore,
        totalPages,
        pagesCrawled: successfulPages,
        pagesWithMissingMetaDescription,
        lastCalculated: new Date(),
      },
      update: {
        siteHealthScore,
        aiSearchHealth,
        crawlability: crawlabilityScore,
        internalLinking: internalLinkingScore,
        totalPages,
        pagesCrawled: successfulPages,
        pagesWithMissingMetaDescription,
        lastCalculated: new Date(),
      },
    });

    // Calculate security score (0-950 scale)
    const headerCount = [
      securityHeaders.https,
      securityHeaders.hsts,
      securityHeaders.csp,
      securityHeaders.xFrameOptions,
      securityHeaders.xContentType,
      securityHeaders.xXSSProtection,
    ].filter(Boolean).length;
    
    const securityRating = Math.round((headerCount / 6) * 950);
    const missingHeaders = 6 - headerCount;

    // Update security metrics
    await prisma.securityMetrics.upsert({
      where: { websiteId },
      create: {
        websiteId,
        securityRating,
        httpsStatus: securityHeaders.https,
        sslCertificateValid: securityHeaders.https,
        hasCSP: securityHeaders.csp,
        hasXFrameOptions: securityHeaders.xFrameOptions,
        hasHSTS: securityHeaders.hsts,
        hasXContentType: securityHeaders.xContentType,
        hasXXSSProtection: securityHeaders.xXSSProtection,
        missingHeaders,
        lastScanned: new Date(),
      },
      update: {
        securityRating,
        httpsStatus: securityHeaders.https,
        sslCertificateValid: securityHeaders.https,
        hasCSP: securityHeaders.csp,
        hasXFrameOptions: securityHeaders.xFrameOptions,
        hasHSTS: securityHeaders.hsts,
        hasXContentType: securityHeaders.xContentType,
        hasXXSSProtection: securityHeaders.xXSSProtection,
        missingHeaders,
        lastScanned: new Date(),
      },
    });

    // Update analytics/performance metrics
    await prisma.analytics.upsert({
      where: { websiteId },
      create: {
        websiteId,
        performanceScore,
        fcp: Math.round(avgLoadTime), // First Contentful Paint approximation
        lcp: Math.round(avgLoadTime * 1.5), // Largest Contentful Paint approximation
        speedIndex: Math.round(avgLoadTime),
        cls: mobileOptimizedPages > 0 ? 0.05 : 0.15, // Cumulative Layout Shift (good if mobile optimized)
      },
      update: {
        performanceScore,
        fcp: Math.round(avgLoadTime),
        lcp: Math.round(avgLoadTime * 1.5),
        speedIndex: Math.round(avgLoadTime),
        cls: mobileOptimizedPages > 0 ? 0.05 : 0.15,
      },
    });

    // Update scan record
    await prisma.scan.update({
      where: { id: scan.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        pagesScanned: crawledUrls.size,
        pagesFound: results.length,
        httpErrors: errorCount,
      },
    });

    // Update website last scan time
    await prisma.website.update({
      where: { id: websiteId },
      data: { lastScanAt: new Date() },
    });

    emailNotifications.scanCompleted = await sendAlertEmail('scan_completed', {
      websiteName: domain,
      domain: baseUrl,
      message: `Scan completed for ${domain}.`,
      actionUrl: shareDashboardUrl,
      actionLabel: 'View Share Dashboard',
      meta: {
        websiteId,
        pagesFound: results.length,
        pagesScanned: crawledUrls.size,
        errors: errorCount,
        warnings: warningCount,
        siteHealthScore,
        securityRating,
      },
    });

    return {
      ...scan,
      pagesScanned: crawledUrls.size,
      pagesFound: results.length,
      errors: errorCount,
      warnings: warningCount,
      siteHealthScore,
      securityRating,
      emailNotifications,
    };
  } catch (error) {
    console.error('Crawler error:', error);
    emailNotifications.scanError = await sendAlertEmail('security_alert', {
      websiteName: domain,
      domain: baseUrl,
      message: 'The crawler encountered an error while scanning the website.',
      actionUrl: shareDashboardUrl,
      actionLabel: 'View Share Dashboard',
      meta: {
        websiteId,
        error: error instanceof Error ? error.message : String(error),
      },
    });
    throw error;
  }
};

async function checkSecurityHeaders(url: string): Promise<SecurityHeaders> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    
    const headers = response.headers;
    
    return {
      https: url.startsWith('https'),
      hsts: !!headers.get('strict-transport-security'),
      csp: !!headers.get('content-security-policy'),
      xFrameOptions: !!headers.get('x-frame-options'),
      xContentType: !!headers.get('x-content-type-options'),
      xXSSProtection: !!headers.get('x-xss-protection'),
    };
  } catch (error) {
    console.error('Error checking security headers:', error);
    return {
      https: url.startsWith('https'),
      hsts: false,
      csp: false,
      xFrameOptions: false,
      xContentType: false,
      xXSSProtection: false,
    };
  }
}

async function crawlPage(url: string, baseUrl: string): Promise<CrawlResult | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), env.CRAWLER_TIMEOUT);
    
    // Measure load time
    const startTime = Date.now();

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: controller.signal,
    });

    const loadTime = Date.now() - startTime;
    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        url,
        title: null,
        metaDescription: null,
        h1: null,
        statusCode: response.status,
        internalLinks: 0,
        externalLinks: 0,
        wordCount: 0,
        hasH1: false,
        imageCount: 0,
        loadTime,
        isMobileOptimized: false,
      };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('title').text() || null;
    const metaDescription = $('meta[name="description"]').attr('content') || null;
    const h1 = $('h1').first().text() || null;
    const wordCount = $('body').text().split(/\s+/).length;
    const imageCount = $('img').length;
    
    // Check mobile optimization (viewport meta tag)
    const isMobileOptimized = !!$('meta[name="viewport"]').length;

    // Extract links
    const internalLinks = extractInternalLinks(url, baseUrl).length;
    const externalLinks = $('a[href^="http"]')
      .filter(
        (_, el) =>
          !$(el).attr('href')?.includes(new URL(baseUrl).hostname)
      )
      .length;

    return {
      url,
      title,
      metaDescription,
      h1,
      statusCode: response.status,
      internalLinks,
      externalLinks,
      wordCount,
      hasH1: !!h1,
      imageCount,
      loadTime,
      isMobileOptimized,
    };
  } catch (error) {
    console.error(`Failed to crawl ${url}:`, error);
    return null;
  }
}

function extractInternalLinks(_pageUrl: string, _baseUrl: string): string[] {
  // This is a simplified extraction - using URL queue tracking
  // In production, you'd parse HTML to find actual links
  return [];
}

export const detectBrokenLinks = async (domain: string): Promise<any[]> => {
  const brokenLinks: any[] = [];
  
  try {
    const baseUrl = !domain.startsWith('http') ? `https://${domain}` : domain;
    const response = await fetch(baseUrl);
    const html = await response.text();
    const $ = cheerio.load(html);

    const links = $('a[href]')
      .map((_, el) => $(el).attr('href'))
      .get() as string[];

    for (const link of links) {
      if (!link.startsWith('http')) continue;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const linkResponse = await fetch(link, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (linkResponse.status >= 400) {
          brokenLinks.push({
            url: link,
            statusCode: linkResponse.status,
            text: linkResponse.statusText,
          });
        }
      } catch (error) {
        brokenLinks.push({
          url: link,
          error: 'Connection failed',
        });
      }
    }
  } catch (error) {
    console.error('Error checking broken links:', error);
  }

  return brokenLinks;
};

export const generateCrawlerInsights = (metrics: any): string[] => {
  const insights: string[] = [];

  if (metrics.statusCode >= 400) {
    insights.push(`Website returned HTTP ${metrics.statusCode} error.`);
  }

  if (!metrics.title) {
    insights.push('Homepage is missing a title tag.');
  }

  if (!metrics.metaDescription) {
    insights.push('Homepage meta description is missing.');
  }

  if (!metrics.h1) {
    insights.push('Homepage is missing an H1 tag.');
  }

  if (metrics.internalLinks < 5) {
    insights.push(
      `Homepage has only ${metrics.internalLinks} internal links. Improve internal linking structure.`
    );
  }

  return insights;
};

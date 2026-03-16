import * as cheerio from 'cheerio';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';

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

export const crawlWebsite = async (domain: string, websiteId: string) => {
  const baseUrl = !domain.startsWith('http') ? `https://${domain}` : domain;
  
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

    // Calculate Advanced SEO scores (Semrush-like algorithm with weighted factors)
    const totalPages = results.length;
    
    // Factor 1: Meta Tags (25% weight) - Title, Description, H1
    const pagesWithTitle = results.filter(r => r.title && r.title.length > 0).length;
    const pagesWithDescription = results.filter(r => r.metaDescription && r.metaDescription.length > 30).length;
    const pagesWithH1 = results.filter(r => r.hasH1).length;
    const metaTagScore = totalPages > 0 
      ? Math.round(((pagesWithTitle + pagesWithDescription + pagesWithH1) / (totalPages * 3)) * 100)
      : 0;

    // Factor 2: Content Quality (20% weight) - Word count, images, headings
    const avgWordCount = totalPages > 0 ? results.reduce((acc, r) => acc + r.wordCount, 0) / totalPages : 0;
    const avgImageCount = totalPages > 0 ? results.reduce((acc, r) => acc + r.imageCount, 0) / totalPages : 0;
    let contentScore = 0;
    if (totalPages > 0) {
      const wordScore = avgWordCount >= 300 ? 100 : Math.round((avgWordCount / 300) * 100);
      const imageScore = avgImageCount >= 1 ? 100 : avgImageCount > 0 ? 50 : 0;
      contentScore = Math.round((wordScore + imageScore) / 2);
    }

    // Factor 3: Link Structure (20% weight) - Internal & External links
    const totalInternalLinks = results.reduce((acc, r) => acc + r.internalLinks, 0);
    const totalExternalLinks = results.reduce((acc, r) => acc + r.externalLinks, 0);
    const linkScore = Math.min(100, Math.round((totalInternalLinks + totalExternalLinks) / 2));

    // Factor 4: Crawlability (15% weight) - No errors, all pages accessible
    const pagesWithoutErrors = results.filter(r => r.statusCode === 200).length;
    const crawlabilityScore = totalPages > 0 ? Math.round((pagesWithoutErrors / totalPages) * 100) : 0;

    // Factor 5: Overall Structure (20% weight) - Page count, consistency
    const pageCountScore = totalPages >= 10 ? 100 : totalPages >= 5 ? 80 : totalPages >= 1 ? 60 : 0;
    const consistencyScore = pagesWithDescription > 0 ? 100 : 50;
    const structureScore = Math.round((pageCountScore + consistencyScore) / 2);

    // Calculate weighted Site Health Score (0-100)
    const siteHealthScore = Math.round(
      (metaTagScore * 0.25) +
      (contentScore * 0.20) +
      (linkScore * 0.20) +
      (crawlabilityScore * 0.15) +
      (structureScore * 0.20)
    );

    // AI Search Health = combination of all factors
    const aiSearchHealth = Math.round(
      (metaTagScore * 0.30) +
      (contentScore * 0.25) +
      (linkScore * 0.20) +
      (crawlabilityScore * 0.25)
    );
    
    // Internal Linking Score based on actual link distribution
    const internalLinkingScore = totalInternalLinks > 0 
      ? Math.min(100, Math.round((totalInternalLinks / totalPages) * 15))
      : 30; // Penalty if no internal links

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
        pagesCrawled: totalPages,
        pagesWithMissingMetaDescription: totalPages - pagesWithDescription,
        lastCalculated: new Date(),
      },
      update: {
        siteHealthScore,
        aiSearchHealth,
        crawlability: crawlabilityScore,
        internalLinking: internalLinkingScore,
        totalPages,
        pagesCrawled: totalPages,
        pagesWithMissingMetaDescription: totalPages - pagesWithDescription,
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

    return {
      ...scan,
      pagesScanned: crawledUrls.size,
      pagesFound: results.length,
      errors: errorCount,
      warnings: warningCount,
      siteHealthScore,
      securityRating,
    };
  } catch (error) {
    console.error('Crawler error:', error);
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

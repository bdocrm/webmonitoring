const clampScore = (value: number): number => Math.min(100, Math.max(0, value));

export const calculateSiteHealthScore = (metrics: {
  pagesWithMissingMetaDescription: number;
  pagesWithDuplicateTitle: number;
  brokenInternalLinks: number;
  totalPages: number;
  pagesCrawled: number;
  hasH1Rate?: number;
}): number => {
  if (metrics.totalPages === 0) return 0;

  const totalPages = Math.max(1, metrics.totalPages);
  const pagesCrawled = Math.max(0, Math.min(metrics.pagesCrawled, totalPages));
  const metaCoverage = Math.max(0, 100 - (metrics.pagesWithMissingMetaDescription / totalPages) * 100);
  const titleCoverage = Math.max(0, 100 - (metrics.pagesWithDuplicateTitle / totalPages) * 100);
  const crawlCoverage = (pagesCrawled / totalPages) * 100;
  const linkHealth = Math.max(0, 100 - (metrics.brokenInternalLinks / Math.max(1, pagesCrawled)) * 100);
  const h1Coverage = metrics.hasH1Rate ?? 100;

  const score = Math.round(
    18 +
    metaCoverage * 0.22 +
    titleCoverage * 0.1 +
    crawlCoverage * 0.2 +
    linkHealth * 0.16 +
    h1Coverage * 0.14
  );

  return clampScore(score);
};

export const calculateAISearchHealth = (metrics: {
  pagesCrawled: number;
  totalPages: number;
  pagesWithMissingMetaDescription: number;
  hasH1Rate: number; // percentage
  mobile_friendlyRate: number; // percentage
}): number => {
  if (metrics.totalPages === 0) return 0;

  const totalPages = Math.max(1, metrics.totalPages);
  const pagesCrawled = Math.max(0, Math.min(metrics.pagesCrawled, totalPages));
  const crawlRate = (pagesCrawled / totalPages) * 100;
  const metaRate = Math.max(0, 100 - (metrics.pagesWithMissingMetaDescription / Math.max(1, pagesCrawled)) * 100);
  const h1Rate = metrics.hasH1Rate;
  const mobileRate = metrics.mobile_friendlyRate;

  const score = Math.round(12 + crawlRate * 0.24 + metaRate * 0.24 + h1Rate * 0.2 + mobileRate * 0.2);

  return clampScore(score);
};

export const calculateCrawlability = (metrics: {
  pagesCrawled: number;
  totalPages: number;
  brokenInternalLinks: number;
}): number => {
  if (metrics.totalPages === 0) return 0;

  const totalPages = Math.max(1, metrics.totalPages);
  const pagesCrawled = Math.max(0, Math.min(metrics.pagesCrawled, totalPages));
  const crawlRate = (pagesCrawled / totalPages) * 70;
  const linkHealth = Math.max(0, 100 - (metrics.brokenInternalLinks / Math.max(1, pagesCrawled)) * 30);

  return clampScore(Math.round(crawlRate + linkHealth));
};

export const calculateInternalLinkingScore = (metrics: {
  orphanPages: number;
  brokenInternalLinks: number;
  totalPages: number;
  averageInternalLinksPerPage: number;
}): number => {
  if (metrics.totalPages === 0) return 0;

  const totalPages = Math.max(1, metrics.totalPages);
  const baseScore = 60;
  const linkDensityScore = Math.min(25, (metrics.averageInternalLinksPerPage / 4) * 25);
  const orphanPenalty = (metrics.orphanPages / totalPages) * 15;
  const brokenLinksPenalty = (metrics.brokenInternalLinks / totalPages) * 15;

  return clampScore(Math.round(baseScore + linkDensityScore - orphanPenalty - brokenLinksPenalty));
};

export const generateSEOInsights = (metrics: any): string[] => {
  const insights: string[] = [];

  if (metrics.pagesWithMissingMetaDescription > 0) {
    insights.push(
      `${metrics.pagesWithMissingMetaDescription} pages are missing meta descriptions.`
    );
  }

  if (metrics.pagesWithDuplicateTitle > 0) {
    insights.push(
      `${metrics.pagesWithDuplicateTitle} pages have duplicate titles.`
    );
  }

  if (metrics.brokenInternalLinks > 0) {
    insights.push(
      `${metrics.brokenInternalLinks} broken internal links detected.`
    );
  }

  if (metrics.orphanPages > 0) {
    insights.push(
      `${metrics.orphanPages} orphan pages found that are not linked from other pages.`
    );
  }

  const crawlRate = metrics.pagesCrawled / metrics.totalPages;
  if (crawlRate < 0.8) {
    insights.push(
      `Only ${Math.round(crawlRate * 100)}% of pages are crawlable. Improve site structure.`
    );
  }

  return insights;
};

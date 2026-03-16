export const calculateSiteHealthScore = (metrics: {
  pagesWithMissingMetaDescription: number;
  pagesWithDuplicateTitle: number;
  brokenInternalLinks: number;
  totalPages: number;
  pagesCrawled: number;
}): number => {
  if (metrics.totalPages === 0) return 0;

  const metaDescriptionScore = 
    ((metrics.totalPages - metrics.pagesWithMissingMetaDescription) / metrics.totalPages) * 25;
  
  const duplicateTitleScore = 
    ((metrics.totalPages - metrics.pagesWithDuplicateTitle) / metrics.totalPages) * 25;
  
  const brokenLinksScore = 
    ((metrics.pagesCrawled - metrics.brokenInternalLinks) / metrics.pagesCrawled) * 25;
  
  const crawlabilityScore = 
    (metrics.pagesCrawled / metrics.totalPages) * 25;

  return Math.min(100, Math.round(
    metaDescriptionScore + duplicateTitleScore + brokenLinksScore + crawlabilityScore
  ));
};

export const calculateAISearchHealth = (metrics: {
  pagesCrawled: number;
  totalPages: number;
  pagesWithMissingMetaDescription: number;
  hasH1Rate: number; // percentage
  mobile_friendlyRate: number; // percentage
}): number => {
  const crawlRate = (metrics.pagesCrawled / metrics.totalPages) * 20;
  const metaRate = 
    ((metrics.pagesCrawled - metrics.pagesWithMissingMetaDescription) / metrics.pagesCrawled) * 20;
  const h1Rate = metrics.hasH1Rate * 0.2;
  const mobileRate = metrics.mobile_friendlyRate * 0.2;
  const structuredDataRate = 20; // Default for now

  return Math.min(100, Math.round(
    crawlRate + metaRate + h1Rate + mobileRate + structuredDataRate
  ));
};

export const calculateCrawlability = (metrics: {
  pagesCrawled: number;
  totalPages: number;
  brokenInternalLinks: number;
}): number => {
  if (metrics.totalPages === 0) return 0;
  
  const crawlRate = (metrics.pagesCrawled / metrics.totalPages) * 70;
  const linkHealth = 
    ((metrics.pagesCrawled - metrics.brokenInternalLinks) / metrics.pagesCrawled) * 30;

  return Math.min(100, Math.round(crawlRate + linkHealth));
};

export const calculateInternalLinkingScore = (metrics: {
  orphanPages: number;
  brokenInternalLinks: number;
  totalPages: number;
  averageInternalLinksPerPage: number;
}): number => {
  if (metrics.totalPages === 0) return 0;

  const orphanPagesPenalty = (metrics.orphanPages / metrics.totalPages) * 40;
  const brokenLinksPenalty = (metrics.brokenInternalLinks / metrics.totalPages) * 30;
  const linkDensityScore = Math.min(30, (metrics.averageInternalLinksPerPage / 5) * 30);

  return Math.min(100, Math.round(
    100 - orphanPagesPenalty - brokenLinksPenalty + linkDensityScore
  ));
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

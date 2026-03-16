export const calculateSecurityRating = (metrics: {
  httpsStatus: boolean;
  sslCertificateValid: boolean;
  hasCSP: boolean;
  hasXFrameOptions: boolean;
  hasHSTS: boolean;
  hasXContentType: boolean;
  hasXXSSProtection: boolean;
  cveIssues: number;
}): number => {
  let score = 0;
  const maxScore = 950;

  // HTTPS & SSL (300 points)
  if (metrics.httpsStatus) score += 150;
  if (metrics.sslCertificateValid) score += 150;

  // Security Headers (400 points)
  if (metrics.hasCSP) score += 80;
  if (metrics.hasXFrameOptions) score += 80;
  if (metrics.hasHSTS) score += 80;
  if (metrics.hasXContentType) score += 80;
  if (metrics.hasXXSSProtection) score += 80;

  // CVE Vulnerabilities (250 points)
  const cveDeduction = metrics.cveIssues * 50;
  score = Math.max(0, score - cveDeduction);

  return Math.min(maxScore, score);
};

export const checkSSLCertificate = async (domain: string): Promise<boolean> => {
  try {
    const response = await fetch(`https://${domain}`, {
      method: 'HEAD',
    });
    return response.ok || response.status === 403 || response.status === 404;
  } catch (error) {
    return false;
  }
};

export const checkSecurityHeaders = async (
  domain: string
): Promise<{
  hasCSP: boolean;
  hasXFrameOptions: boolean;
  hasHSTS: boolean;
  hasXContentType: boolean;
  hasXXSSProtection: boolean;
}> => {
  try {
    const response = await fetch(`https://${domain}`, {
      method: 'HEAD',
    });
    
    const headers = response.headers;

    return {
      hasCSP: !!headers.get('content-security-policy'),
      hasXFrameOptions: !!headers.get('x-frame-options'),
      hasHSTS: !!headers.get('strict-transport-security'),
      hasXContentType: !!headers.get('x-content-type-options'),
      hasXXSSProtection: !!headers.get('x-xss-protection'),
    };
  } catch (error) {
    return {
      hasCSP: false,
      hasXFrameOptions: false,
      hasHSTS: false,
      hasXContentType: false,
      hasXXSSProtection: false,
    };
  }
};

export const generateSecurityInsights = (metrics: any): string[] => {
  const insights: string[] = [];

  if (!metrics.httpsStatus) {
    insights.push(
      'CRITICAL: Website does not use HTTPS. Enable SSL/TLS encryption immediately.'
    );
  }

  if (!metrics.hasHSTS) {
    insights.push('Missing HSTS header. Add Strict-Transport-Security header for enhanced security.');
  }

  if (!metrics.hasCSP) {
    insights.push('Content Security Policy (CSP) not configured. Implement CSP to prevent XSS attacks.');
  }

  if (!metrics.hasXFrameOptions) {
    insights.push('X-Frame-Options header missing. Prevent clickjacking attacks by setting this header.');
  }

  if (metrics.cveIssues > 0) {
    insights.push(`${metrics.cveIssues} known CVE vulnerabilities detected in dependencies.`);
  }

  return insights;
};

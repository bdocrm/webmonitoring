export const env = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL || '',
  PRISMA_DATABASE_URL: process.env.PRISMA_DATABASE_URL || '',
  
  // NextAuth
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'dev-secret',
  SHARE_DASHBOARD_BASE_URL: process.env.SHARE_DASHBOARD_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000',
  
  // APIs
  GOOGLE_PAGESPEED_API_KEY: process.env.GOOGLE_PAGESPEED_API_KEY || '',
  LISTENING_BRAND_NAME: process.env.LISTENING_BRAND_NAME || 'Allianz-Synergia',
  LISTENING_SEARCH_TERMS: process.env.LISTENING_SEARCH_TERMS || '',
  LISTENING_EXCLUDED_TERMS: process.env.LISTENING_EXCLUDED_TERMS || '',
  LISTENING_WATCH_URLS: process.env.LISTENING_WATCH_URLS || '',
  GOOGLE_ALERTS_RSS_URLS: process.env.GOOGLE_ALERTS_RSS_URLS || '',
  GOOGLE_CUSTOM_SEARCH_API_KEY: process.env.GOOGLE_CUSTOM_SEARCH_API_KEY || '',
  GOOGLE_CUSTOM_SEARCH_CX: process.env.GOOGLE_CUSTOM_SEARCH_CX || '',
  
  // Email
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@websitemonitoring.com',
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  ALERT_EMAIL_RECIPIENTS: process.env.ALERT_EMAIL_RECIPIENTS || '',
  ENABLE_EMAIL_ALERTS: process.env.ENABLE_EMAIL_ALERTS !== 'false',
  
  // Crawler
  CRAWLER_TIMEOUT: parseInt(process.env.CRAWLER_TIMEOUT || '30000'),
  MAX_PAGES_PER_SCAN: parseInt(process.env.MAX_PAGES_PER_SCAN || '100'),
  SCAN_INTERVAL_HOURS: parseInt(process.env.SCAN_INTERVAL_HOURS || '24'),
};

export const env = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL || '',
  
  // NextAuth
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'dev-secret',
  
  // APIs
  GOOGLE_PAGESPEED_API_KEY: process.env.GOOGLE_PAGESPEED_API_KEY || '',
  
  // Email
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@websitemonitoring.com',
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  
  // Crawler
  CRAWLER_TIMEOUT: parseInt(process.env.CRAWLER_TIMEOUT || '30000'),
  MAX_PAGES_PER_SCAN: parseInt(process.env.MAX_PAGES_PER_SCAN || '100'),
  SCAN_INTERVAL_HOURS: parseInt(process.env.SCAN_INTERVAL_HOURS || '24'),
};

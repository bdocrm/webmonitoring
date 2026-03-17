# 🚀 WebSiteMonitoringMo! - Quick Start Guide

## What is WebSiteMonitoringMo?

A production-ready web monitoring system that tracks SEO health, performance, security, and crawlability of websites. Similar to SEMrush, Ahrefs, and UpGuard.

## ⚡ 5-Minute Setup

### 1. Setup Supabase Database
- Create a free account: https://supabase.com
- Create a new project (takes ~2 min)
- Get your connection string from Settings → Database
- See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed instructions

### 2. Configure Environment
```bash
cp .env.local.example .env.local
```
Update `DATABASE_URL` with your Supabase connection string

### 3. Initialize Database
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Open in Browser
- URL: http://localhost:3000
- Use the admin credentials you set in `.env.local` (ADMIN_EMAIL and ADMIN_PASSWORD)

**No Docker needed!** ✨

## 📊 What You Get

### Dashboard
- **10 KPI Metrics** showing site health and performance
- **Real-time Charts** with historical trends
- **AI Insights Panel** with automated recommendations
- **Responsive Design** for all devices

### Features
- ✅ **Website Crawler** - Discover all pages, detect broken links
- ✅ **SEO Analysis** - Health score, crawlability, internal linking
- ✅ **Security Scanner** - SSL/HTTPS, headers, security rating (0-950)
- ✅ **Performance Monitoring** - Core Web Vitals, load times
- ✅ **Error Tracking** - 404, 403, 500 errors with trends
- ✅ **AI Insights** - Automated issue detection and recommendations

### Metrics Tracked

**Dashboard KPIs:**
- Site Health: 72%
- AI Search Health: 84%
- Pages Crawled: 19 / 100
- Errors: 21
- Warnings: 6
- Crawlability: 90%
- HTTPS Status: 100%
- Performance: 95
- Internal Linking: 97%
- Security Rating: 880 / 950

## 🏗️ Database Schema

**7 Main Models:**
- `User` - Admin users
- `Website` - Monitored domains
- `Scan` - Crawl execution records
- `Page` - Crawled pages with metadata
- `ErrorLog` - HTTP errors tracked
- `SeoMetrics` - SEO scores and analytics
- `SecurityMetrics` - Security analysis

## 🎯 Site Navigation

- 📊 **Dashboard** - Main metrics overview
- 🌐 **Websites** - Add & manage websites
- 🔍 **SEO** - SEO analysis reports
- ⚡ **Performance** - Performance metrics
- 🛡️ **Security** - Security status
- ⚠️ **Errors** - Error tracking
- ⚙️ **Settings** - Configuration

## 💻 Technology Stack

**Frontend:** Next.js 14 | React 18 | TailwindCSS | Recharts | Lucide Icons

**Backend:** Node.js | Next.js API Routes | Cheerio (scraping)

**Database:** PostgreSQL | Prisma ORM

**Auth:** NextAuth.js

## 📁 Project Structure

```
src/
├── app/
│   ├── dashboard/      👈 Main dashboard
│   ├── websites/       👈 Website management
│   ├── seo/           👈 SEO reports
│   ├── performance/    👈 Performance metrics
│   ├── security/       👈 Security reports
│   ├── errors/         👈 Error tracking
│   ├── settings/       👈 Settings
│   └── api/            👈 API routes
├── components/         👈 React components
├── lib/                👈 Utility functions
│   ├── crawler/        👈 Web crawler
│   ├── seo/           👈 SEO scoring
│   └── security/      👈 Security checks
└── globals.css        👈 Global styles
```

## 🔧 Available Commands

```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Check code quality
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run migrations
npm run db:studio        # Open database UI
npm run db:seed          # Seed sample data
```

## 🌐 API Endpoints

```bash
# Websites
GET    /api/websites              # List websites
POST   /api/websites              # Add website
GET    /api/websites/[id]         # Get details
PUT    /api/websites/[id]         # Update
DELETE /api/websites/[id]         # Delete

# Crawler
POST   /api/crawler               # Start scan
GET    /api/crawler?websiteId=id  # Get scans

# SEO
POST   /api/seo                   # Analyze SEO
GET    /api/seo?websiteId=id      # Get metrics

# Security
POST   /api/security              # Run check
GET    /api/security?websiteId=id # Get metrics
```

## 🎨 UI Components Included

- **Card** - Container component
- **Button** - Multiple variants
- **Input** - Text inputs
- **Dialog** - Modal dialogs
- **Tabs** - Tab navigation
- **KPICard** - Metric displays
- **ScoreGauge** - Circular progress
- **ProgressBar** - Linear progress

## 🔒 Security Features

✅ HTTPS/SSL validation
✅ Security headers check (CSP, X-Frame-Options, HSTS)
✅ XSS protection analysis
✅ CORS policy validation
✅ Rate limiting ready
✅ Environment variable protection

## 📈 Scoring Algorithms

**Site Health Score (0-100)**
- Meta descriptions (25%)
- Unique titles (25%)
- Link health (25%)
- Crawlability (25%)

**Security Rating (0-950, UpGuard style)**
- HTTPS/SSL: 300 points
- Security headers: 400 points
- CVE issues: -50 points each

**AI Search Health (0-100)**
- Crawl rate (20%)
- Meta tags (20%)
- H1 tags (20%)
- Mobile friendly (20%)
- Structured data (20%)

## 🚀 Next Steps

1. ✅ Add your first website in the Websites page
2. ✅ Start a scan to crawl the website
3. ✅ Review SEO, Performance, and Security reports
4. ✅ Check AI Insights for recommendations
5. ✅ Configure settings for your needs

## 📚 Documentation

- [Full README](./README.md) - Complete documentation
- [Installation Guide](./INSTALLATION.md) - Detailed setup
- [API Documentation](./API.md) - API reference

## 💡 Tips

- Start with example.com to test all features
- Monitor 24-hour automated scans
- Use Prisma Studio (`npm run db:studio`) to explore data
- Check docker logs: `docker-compose logs -f postgres`
- PgAdmin at http://localhost:5050

## ❓ Troubleshooting

**Port 3000 already in use?**
```bash
PORT=3001 npm run dev
```

**Database connection failed?**
```bash
docker-compose down
docker-compose up -d
npm run db:migrate
```

**Dependencies issue?**
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## 📞 Support

- Check [INSTALLATION.md](./INSTALLATION.md) for setup issues
- Review [README.md](./README.md) for features
- Check source code comments for implementation details

## 🎉 You're Ready!

The system is now ready to monitor websites. Start adding domains and tracking their health!

---

**Happy Monitoring!** 🚀✨

Built with ❤️ using Next.js 14 | PostgreSQL | TailwindCSS

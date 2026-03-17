# WebSiteMonitoringMo! - Professional Web Monitoring System

A production-ready web monitoring system built with **Next.js 14**, **PostgreSQL**, and modern monitoring tools. Monitor your website's SEO health, performance, security, and crawlability in real-time.

## 🚀 Features

### Core Monitoring
- **SEO Health Analysis**: Site health score, AI search health, crawlability metrics
- **Performance Monitoring**: Core Web Vitals, Google PageSpeed Insights integration
- **Security Scanner**: SSL/HTTPS status, security headers, vulnerability checks
- **Website Crawler**: Automated page discovery, broken link detection, metadata extraction
- **Error Tracking**: 404, 403, 500 error monitoring and trends
- **AI Insights**: Automated recommendations and issue analysis

### Dashboard
- Real-time KPI metrics
- Historical trend charts
- Performance score gauges
- AI-powered insights panel
- Responsive design (desktop + mobile)

### Advanced Features
- Multi-website monitoring
- Automated scheduled scans (24-hour intervals)
- Detailed reports and analytics
- Security header validation
- Internal link analysis
- Orphan page detection
- Email alert system
- PDF report export

## 📋 Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TailwindCSS** for styling
- **Recharts** for analytics charts
- **Lucide Icons** for UI icons
- **ShadCN/Radix UI** components

### Backend
- **Node.js** with Next.js API Routes
- **Cheerio** for web scraping
- **Axios** for HTTP requests
- **node-cron** for scheduled tasks

### Database
- **PostgreSQL** with Prisma ORM (self-hosted or Supabase)
- **Supabase** - Recommended for zero-DevOps (free tier available)
- Type-safe database schema
- Automatic backups and scalability

### Authentication
- NextAuth.js v4 for admin login

## 🏗️ Project Structure

```
WebsiteMonitoringMo/
├── src/
│   ├── app/
│   │   ├── api/                 # API Routes
│   │   │   ├── websites/        # Website management
│   │   │   ├── crawler/         # Web crawler endpoints
│   │   │   ├── seo/             # SEO analysis
│   │   │   └── security/        # Security checks
│   │   ├── dashboard/           # Main dashboard
│   │   ├── websites/            # Website management page
│   │   ├── seo/                 # SEO reports
│   │   ├── performance/         # Performance metrics
│   │   ├── security/            # Security reports
│   │   ├── errors/              # Error tracking
│   │   ├── settings/            # Settings page
│   │   └── layout.tsx           # Root layout
│   ├── components/
│   │   ├── ui/                  # UI components (Button, Card, Input, Dialog, etc.)
│   │   ├── KPICard.tsx          # KPI metrics card
│   │   ├── ScoreGauge.tsx       # Circular score display
│   │   └── layouts/
│   │       └── AppLayout.tsx    # Main app layout with sidebar
│   ├── lib/
│   │   ├── crawler/             # Web crawler logic
│   │   ├── seo/                 # SEO scoring algorithms
│   │   ├── security/            # Security analysis
│   │   ├── prisma.ts            # Prisma client
│   │   ├── env.ts               # Environment config
│   │   └── utils.ts             # Utility functions
│   └── globals.css              # Global styles
├── prisma/
│   └── schema.prisma            # Database schema
├── scripts/
│   └── seed.js                  # Database seeding
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

## 📊 Database Models

### User
- Admin user management
- Session tracking

### Website
- Domain and metadata
- Monitoring status
- Relationships to all analysis models

### Scan
- Crawler execution records
- Pages and errors found
- Status tracking

### Page
- Crawled page details
- SEO metadata
- Performance metrics
- Link analysis

### ErrorLog
- HTTP error tracking
- Error trends
- Error details

### SeoMetrics
- Site health score (0-100)
- AI search health (0-100)
- Crawlability score (0-100)
- Internal linking score (0-100)
- Page statistics

### SecurityMetrics
- Security rating (0-950, UpGuard style)
- HTTPS/SSL status
- Security headers validation
- CVE tracking

### Analytics
- Performance metrics
- Core Web Vitals
- Traffic indicators
- Technical SEO data

## 🔧 Getting Started

### Prerequisites
- Node.js 18+ (LTS)
- npm or yarn
- **Database** (choose one):
  - **Supabase** - Recommended! Free cloud PostgreSQL (https://supabase.com)
  - Self-hosted PostgreSQL 14+ (with Docker or local installation)

### Quick Setup with Supabase (Recommended)

See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed Supabase instructions.

```bash
# 1. Create free Supabase account and project
# 2. Get your connection string from Supabase Dashboard
# 3. Create .env.local and add DATABASE_URL
cp .env.local.example .env.local
# Edit .env.local with your Supabase connection string

# 4. Setup database (no Docker needed!)
npm install
npm run db:generate
npm run db:migrate
npm run db:seed

# 5. Start development server
npm run dev
```

### Installation (Self-Hosted PostgreSQL)

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your settings:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/websitemonitoring"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   GOOGLE_PAGESPEED_API_KEY="your-api-key"
   ```

4. **Setup database**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

   Use the admin credentials you set in `.env.local` (ADMIN_EMAIL and ADMIN_PASSWORD)

## 📈 Dashboard Metrics

### KPI Cards
- **Site Health**: Overall website health (0-100%)
- **AI Search Health**: Search engine optimization score (0-100%)
- **Pages Crawled**: Indexed pages count
- **Errors**: Active error count
- **Warnings**: Warning count
- **Crawlability**: Percentage of crawlable pages (0-100%)
- **HTTPS Status**: SSL/TLS encryption status
- **Performance**: Performance score (0-100)
- **Internal Linking**: Internal link health (0-100%)
- **Security Rating**: Security score (0-950)

### Charts
- SEO Score Trend (Line chart)
- Performance Metrics Trend (Multi-line chart)
- Errors & Warnings Trend (Bar chart)
- Security Rating History (Line chart)
- Page Speed Distribution (Pie chart)

### AI Insights
- Automated issue detection
- Severity-based alerts
- Actionable recommendations

## 🔐 Security Features

- HTTPS/SSL validation
- Security headers checking (CSP, X-Frame-Options, HSTS, etc.)
- XSS protection analysis
- Clickjacking prevention checks
- Content-type sniffing prevention
- CORS policy validation

## 📱 Responsive Design

- Mobile-first approach
- Desktop, tablet, and mobile layouts
- Collapsible sidebar for mobile
- Responsive data tables
- Touch-friendly controls

## 🎨 UI Components

- **Card**: Container with header, content, and footer
- **Button**: Multiple variants (default, outline, secondary, destructive, ghost, link)
- **Input**: Text input field
- **Dialog**: Modal dialogs
- **KPI Card**: Metric display with trends
- **Score Gauge**: Circular progress indicator
- **Tables**: Data display with sorting

## 📊 Scoring Algorithms

### Site Health Score
- Meta description completeness (25%)
- Title uniqueness (25%)
- Link health (25%)
- Crawlability (25%)

### AI Search Health
- Crawl rate (20%)
- Meta tag optimization (20%)
- H1 tag presence (20%)
- Mobile friendliness (20%)
- Structured data (20%)

### Security Rating (UpGuard Style)
- HTTPS/SSL: 300 points
- Security headers: 400 points
- CVE vulnerabilities: -50 per issue
- Max: 950 points

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### Environment Variables (Production)
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: Production URL
- `NEXTAUTH_SECRET`: Strong random secret
- `GOOGLE_PAGESPEED_API_KEY`: API key for performance metrics

## 📝 API Endpoints

### Websites
- `GET /api/websites` - List all websites
- `POST /api/websites` - Add new website
- `GET /api/websites/[id]` - Get website details
- `PUT /api/websites/[id]` - Update website
- `DELETE /api/websites/[id]` - Delete website

### Crawler
- `POST /api/crawler` - Start scan
- `GET /api/crawler?websiteId=id` - Get scan history

### SEO
- `POST /api/seo` - Analyze SEO metrics
- `GET /api/seo?websiteId=id` - Get SEO metrics

### Security
- `POST /api/security` - Run security check
- `GET /api/security?websiteId=id` - Get security metrics

## 🗓️ Scheduled Tasks

Configured with `node-cron`:
- Automatic scans every 24 hours
- Daily reports generation
- Weekly email summaries
- Expired certificate alerts

## 📧 Email Alerts

Sends alerts for:
- Critical security issues
- Performance degradation
- New errors above threshold
- Crawlability problems

## 📤 Reports & Export

- PDF report generation
- CSV data export
- Trend analysis
- Competitor benchmarking

## 🤝 Contributing

Contributions are welcome! Please submit issues and pull requests.

## 📄 License

MIT License - see LICENSE file for details

## 💬 Support

For support, email support@websitemonitoring.com or open an issue on GitHub.

## 🎯 Future Enhancements

- [ ] Multi-user team management
- [ ] Custom alert thresholds
- [ ] Advanced competitor analysis
- [ ] API rate limiting
- [ ] Webhook integrations
- [ ] Slack/Teams notifications
- [ ] Advanced filtering and search
- [ ] Custom dashboards
- [ ] Machine learning predictions
- [ ] Mobile app (React Native)

---

**WebSiteMonitoringMo!** - Professional Website Monitoring Made Simple ✨

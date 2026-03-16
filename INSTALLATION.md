# WebSiteMonitoringMo! - Installation & Setup Guide

## Quick Start

### Prerequisites
- Node.js 18+ LTS
- npm or yarn
- Supabase account (free tier available at https://supabase.com)
- Google PageSpeed API key (optional)

### Option 1: Automated Setup (Recommended)

#### Linux/macOS
```bash
chmod +x setup.sh
./setup.sh
```

#### Windows
```bash
.\setup.bat
```

### Option 2: Manual Setup

#### 1. Clone the repository
```bash
git clone https://github.com/yourusername/websitemonitoringmo.git
cd websitemonitoringmo
```

#### 2. Install dependencies
```bash
npm install
```

#### 3. Set up Supabase Database

**3a. Create a Supabase account** (if you don't have one)
- Visit https://supabase.com
- Sign up with your email
- Create a new project:
  - Choose a project name (e.g., "websitemonitoring")
  - Choose a password (save this!)
  - Choose your region (closest to your location)
  - Wait for the database to initialize (~2 minutes)

**3b. Get your connection string**
- Go to **Settings** → **Database** in your Supabase dashboard
- Under "Connection string", select **URI**
- Copy the connection string (it looks like):
  ```
  postgresql://postgres.[project-id]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
  ```

#### 4. Configure environment
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and replace the DATABASE_URL with your Supabase connection string:
```env
DATABASE_URL="postgresql://postgres.YOUR_PROJECT_ID:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

#### 5. Generate Prisma Client
```bash
npm run db:generate
```

#### 6. Run database migrations
```bash
npm run db:migrate
```

#### 7. Seed sample data
```bash
npm run db:seed
```

#### 8. Start development server
```bash
npm run dev
```

#### 9. Open browser
Navigate to http://localhost:3000

Default login:
- Email: `admin@websitemonitoring.com`
- Password: `admin123`

## Supabase Features (Bonus!)

Once set up, you can also leverage:
- **Supabase Auth**: Replace NextAuth with Supabase auth UI
- **Real-time**: Real-time database subscriptions for live updates
- **Storage**: Store crawler screenshots and exports
- **Edge Functions**: Serverless functions for advanced features

## Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run database migrations
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed sample data
```

## Project Structure

```
websitemonitoringmo/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Dashboard page
│   │   ├── websites/          # Websites page
│   │   ├── seo/               # SEO reports
│   │   ├── performance/       # Performance metrics
│   │   ├── security/          # Security reports
│   │   ├── errors/            # Error tracking
│   │   └── settings/          # Settings page
│   ├── components/            # React components
│   │   ├── ui/               # UI components
│   │   └── layouts/          # Layout components
│   └── lib/                   # Utility functions
│       ├── crawler/          # Web crawler
│       ├── seo/              # SEO algorithms
│       └── security/         # Security checks
├── prisma/                    # Database schemas
├── scripts/                   # Helper scripts
├── public/                    # Static assets
├── .github/                   # GitHub configs
└── docker-compose.yml         # Docker configuration
```

## Database Setup

### Starting PostgreSQL Locally

```bash
# Using Docker (recommended)
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f postgres

# Stop containers
docker-compose down
```

### Accessing PgAdmin

- URL: http://localhost:5050
- Email: admin@websitemonitoring.com
- Password: admin

### Prisma Studio

After migrations are run:
```bash
npm run db:studio
```

This opens an interactive database browser at `http://localhost:5555`

## Key Features to Test

### Dashboard
- View KPI metrics
- Monitor trends
- Check AI insights

### Websites
- Add new websites to monitor
- View scan history
- Manage monitoring

### SEO Analysis
- View SEO scores
- Check page issues
- Internal linking analysis

### Security
- Security rating
- SSL/HTTPS status
- Security headers validation

### Performance
- Core Web Vitals
- Performance trends
- Optimization recommendations

### Error Tracking
- View HTTP errors
- Filter by error type
- Error trends

## Production Deployment

### Environment Variables (Production)
```env
DATABASE_URL=postgresql://prod_user:strong_password@prod_host:5432/websitemonitoring_prod
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=long-random-string-change-this
GOOGLE_PAGESPEED_API_KEY=your-api-key
```

### Build & Deploy
```bash
npm run build
npm start
```

### Using Vercel
```bash
vercel deploy --prod
```

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution**: Make sure PostgreSQL is running
```bash
docker-compose up -d
docker-compose ps
```

### Migration Error
```
Error: P3021
```

**Solution**: Reset database and re-migrate
```bash
npm run db:migrate -- --force
npm run db:seed
```

### Prisma Client Not Found
```
Error: Cannot find module '@prisma/client'
```

**Solution**: Regenerate Prisma client
```bash
npm run db:generate
npm install
```

### Port Already in Use
```
Error: listen EADDRINUSE 0.0.0.0:3000
```

**Solution**: Use different port
```bash
PORT=3001 npm run dev
```

## Configuration Files

### tsconfig.json
- TypeScript configuration with strict mode enabled
- Path aliases (@/* for src/)

### tailwind.config.ts
- Tailwind CSS configuration
- Custom theme colors
- Dark mode support

### next.config.js
- Next.js optimization
- CORS headers
- External packages configuration

### .eslintrc.json
- ESLint configuration for code quality

## Development Tips

### Hot Reload
- Changes to React components auto-refresh
- API route changes require restart

### Database Debugging
```bash
npm run db:studio
```

Opens interactive Database browser

### API Testing
Use tools like:
- **Postman**: https://www.postman.com
- **Insomnia**: https://insomnia.rest
- **Thunder Client**: VS Code extension

### Debugging
Add `debugger;` statements and run:
```bash
node --inspect-brk node_modules/.bin/next dev
```

Then open `chrome://inspect` in Chrome

## Performance Tips

- Use `next/image` for images
- Implement code splitting with dynamic imports
- Cache API responses
- Use Prisma relations efficiently

## Security Considerations

- Never commit `.env.local`
- Always validate user inputs
- Use HTTPS in production
- Keep dependencies updated
- Implement rate limiting
- Add CSRF protection

## Support & Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Recharts Docs](https://recharts.org/)

## Common Issues & Solutions

### Issue: "MODULE_NOT_FOUND"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Database Reset Needed
```bash
# Backup and reset
npm run db:migrate -- --skip-generate
npm run db:seed
```

### Issue: Port Conflicts
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3000   # Windows
```

---

**Happy monitoring! 🚀**

For more information, visit the [README.md](./README.md)

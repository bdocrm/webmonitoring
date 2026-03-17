# Supabase Setup Guide 🚀

This guide walks you through setting up Supabase as the database for WebSiteMonitoringMo!

## Why Supabase?

✅ **Zero DevOps** - No need to manage PostgreSQL yourself  
✅ **Hosted PostgreSQL** - Work with familiar SQL database in the cloud  
✅ **Free Tier** - Up to 500MB storage, no credit card required  
✅ **Real-time Subscriptions** - Real-time database updates for live data  
✅ **Built-in Auth** (bonus) - Can eventually replace NextAuth  
✅ **Storage** - File upload support  
✅ **Edge Functions** - Serverless function execution  

## Step 1: Create Supabase Account

1. Visit https://supabase.com
2. Click **"Start your project"**
3. Sign up with:
   - Email address
   - Password
   - Or use GitHub/Google OAuth

## Step 2: Create a New Project

After signing up:

1. Click **"New Project"**
2. Fill in project details:
   - **Project name**: `websitemonitoring` (or your choice)
   - **Database password**: Create a strong password (save this!)
   - **Region**: Select closest to your location:
     - US: `us-east-1`
     - Europe: `eu-west-1`
     - Asia: `ap-southeast-1`
3. Click **"Create new project"**

⏳ **Wait 2-3 minutes** for the database to initialize

## Step 3: Get Your Connection String

### For Development (pooler connection):

1. Go to **Settings** → **Database**
2. Under "Connection string", select **URI** (if not selected)
3. Copy the connection string that looks like:
   ```
   postgresql://postgres.[project-id]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```

### Key parts:
- `[project-id]`: Your unique project ID (e.g., `abc123xyz`)
- `[password]`: The database password you created
- `[region]`: Your chosen region (e.g., `us-east-1`)

## Step 4: Configure Your Application

### Option A: Using `.env.local` (Recommended for Development)

1. Copy the template:
   ```bash
   cp .env.local.example .env.local
   ```

2. Find the DATABASE_URL line and replace it:
   ```env
   DATABASE_URL="postgresql://postgres.YOUR_PROJECT_ID:YOUR_PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres"
   ```

3. Fill in your actual values:
   ```env
   # Example:
   DATABASE_URL="postgresql://postgres.abc123xyz:superSecurePassword123@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
   ```

### Option B: Using `.env` (Production)

```bash
cp .env.example .env
```

Update with your Supabase connection string similarly.

## Step 5: Initialize Database

Make sure you're in the project directory:
```bash
cd WebsiteMonitoringMo!
```

Generate Prisma client:
```bash
npm run db:generate
```

Run migrations:
```bash
npm run db:migrate
```

Seed sample data:
```bash
npm run db:seed
```

## Step 6: Verify Connection

Check that everything works:

```bash
npm run db:studio
```

This opens **Prisma Studio** at http://localhost:5555 where you can:
- Browse your database tables
- View your seeded data
- Manage records manually

## Step 7: Start Development

```bash
npm run dev
```

Open http://localhost:3000 and login with your admin credentials from `.env.local` (ADMIN_EMAIL and ADMIN_PASSWORD)

## Monitoring Your Database

### Supabase Dashboard

Monitor your database usage at https://supabase.com/dashboard/projects

Key sections:
- **Database** → See storage usage, connections
- **Settings** → Database credentials, backups
- **SQL Editor** → Run custom SQL queries

### Prisma Studio

View data in real-time:
```bash
npm run db:studio
```

## Troubleshooting

### Connection Refused Error

**Problem:** `Error: connect ECONNREFUSED`

**Solutions:**
1. Verify DATABASE_URL is correct in `.env.local`
2. Check that Supabase project has finished initializing
3. Try copying the connection string again from dashboard

### Migration Failures

**Problem:** `Error: Migration failed`

**Solutions:**
1. Check your connection string
2. Ensure you have the correct database password
3. Try running: `npm run db:migrate -- --force`

### Timeout Errors

**Problem:** Connection times out

**Solutions:**
1. Check your region - choose one closer to you if available
2. For production, use the "Session" pooler instead of "Supabase"
3. Verify your firewall/network allows outbound connections to AWS

## Advanced: Supabase Features

Once your database is connected, you can use additional Supabase features:

### Real-time Database Updates

Enable real-time subscriptions for live monitoring:

```typescript
// Example: Subscribe to website changes
import { supabase } from '@/lib/supabase'

supabase
  .from('Website')
  .on('*', payload => {
    console.log('Database changed:', payload)
  })
  .subscribe()
```

*Requires installing: `npm install @supabase/supabase-js`*

### Supabase Auth (Optional)

Replace NextAuth with Supabase Auth:

```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClientComponentClient()

// Sign in
const { error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})
```

### Storage (Optional)

Store crawler screenshots, reports, and exports:

```typescript
// Upload file
const { data, error } = await supabase
  .storage
  .from('reports')
  .upload('public/report.pdf', file)
```

## Database Backups

Supabase automatically backs up your database daily. To restore:

1. Go to **Settings** → **Backups**
2. Click the backup date you want to restore
3. Click **"Restore"**

For development, you don't need to worry about this!

## Scaling with Supabase

### Free Tier Limits
- 500MB storage
- Up to 50,000 total row writes/month
- Perfect for development and testing

### Upgrade to Pro
- $25/month
- 8GB storage
- Unlimited reads
- For production workloads

### Pay-As-You-Go
- No monthly fee
- Pay only for what you use
- Auto-scale up/down

## Production Checklist

Before deploying to production:

- [ ] Upgrade to Pro or Pay-As-You-Go plan
- [ ] Configure automated backups
- [ ] Set up monitoring alerts
- [ ] Use strong database password
- [ ] Store credentials securely (Vercel, Railway, etc.)
- [ ] Test failover procedures
- [ ] Enable row-level security (RLS) policies
- [ ] Set up SSL certificate if using custom domain

## Getting Help

**Supabase Resources:**
- Docs: https://supabase.com/docs
- Community: https://discord.supabase.com
- Status: https://status.supabase.com

**WebSiteMonitoringMo! Support:**
- Check DEVELOPER_GUIDE.md for architecture help
- Review README.md for feature documentation
- See INSTALLATION.md for setup issues

---

**You're all set!** Your database is now hosted on Supabase. 🎉

Next steps:
1. Add your first website via the UI
2. Run a crawler scan
3. Analyze SEO and security metrics
4. Check out the dashboard with real data

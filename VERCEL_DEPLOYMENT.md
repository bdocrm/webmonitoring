# Vercel Deployment Setup Guide

## Quick Fix: Set Environment Variables

Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

Add these variables:

### 1. **Database** (Supabase)
```
DATABASE_URL: postgresql://postgres.[PROJECT-ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```
Get from: Supabase Dashboard → Settings → Database → Connection String

### 2. **NextAuth** (Required for Auth)
```
NEXTAUTH_URL: https://webmonitoring-thisisit.vercel.app
NEXTAUTH_SECRET: [Use your existing secret - DON'T CHANGE IT]
```

### 3. **Admin User** (for login)
```
ADMIN_EMAIL: your-email@example.com
ADMIN_PASSWORD: your-secure-password
```

### 4. **PgAdmin** (optional)
```
PGADMIN_DEFAULT_EMAIL: pgadmin@example.com
PGADMIN_DEFAULT_PASSWORD: pgadmin-password
```

### 5. **OAuth** (optional - for Google/GitHub login)
```
GOOGLE_CLIENT_ID: your-google-client-id
GOOGLE_CLIENT_SECRET: your-google-client-secret
GITHUB_ID: your-github-id
GITHUB_SECRET: your-github-secret
```

## Step-by-Step:

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard/projects

2. **Select your project**
   - `webmonitoring-thisisit` (or whatever it's called)

3. **Click Settings**
   - Top menu → Settings

4. **Click Environment Variables**
   - Left sidebar → Environment Variables

5. **Add each variable:**
   - Click "Add New"
   - Paste Name (e.g., `DATABASE_URL`)
   - Paste Value
   - Select Production/Preview/Development scopes
   - Click "Save"

6. **Redeploy:**
   - After adding variables, redeploy:
   - Deployments → Click latest → Redeploy

## Important Notes:

❌ **Don't use:** `admin@websitemonitoring.com` / `admin123`
- These are hardcoded defaults we removed for security

✅ **Use:** Whatever you set in ADMIN_EMAIL and ADMIN_PASSWORD

⚠️ **NEXTAUTH_SECRET:**
- Keep your existing value (don't generate a new one)
- If you generate a new one, all existing sessions become invalid

## After Setting Variables:

### 1. **Seed the database**
```bash
npm run db:seed
```
(Run this locally with correct .env.local, or the admin user won't be created)

### 2. **Test on Vercel**
```
1. Go to https://webmonitoring-thisisit.vercel.app
2. Click "Sign In"
3. Enter the email/password you set
4. Should redirect to /dashboard
```

### 3. **Debug if still failing**
- Check Vercel logs: Deployments → Function logs
- Check browser console (F12) for error messages
- Try `/api/debug/auth` endpoint (dev only - won't work on prod)

## Troubleshooting

### Login still fails?
1. ✅ Verify DATABASE_URL is correct (check Supabase)
2. ✅ Verify ADMIN_EMAIL and ADMIN_PASSWORD are set
3. ✅ Run `npm run db:seed` locally to create the admin user
4. ✅ Check Vercel Function logs for errors

### Database connection error?
1. ✅ Copy exact connection string from Supabase
2. ✅ Check PostgreSQL database exists
3. ✅ Try connection string locally to verify it works

### Session/Auth issues?
1. ✅ Clear browser cookies
2. ✅ Try incognito/private window
3. ✅ Check NEXTAUTH_URL matches your domain exactly

## Quick Checklist

- [ ] DATABASE_URL set on Vercel
- [ ] NEXTAUTH_SECRET set on Vercel (same as before)
- [ ] NEXTAUTH_URL set to your Vercel URL
- [ ] ADMIN_EMAIL set to your admin email
- [ ] ADMIN_PASSWORD set to your secure password
- [ ] Project redeployed after adding variables
- [ ] Database has admin user (run `npm run db:seed` locally)
- [ ] Can login with your credentials

## OAuth Setup (Optional)

If you want Google/GitHub login:

### Google:
1. Go https://console.cloud.google.com
2. Create OAuth 2.0 credentials (Web application)
3. Add authorized redirect URI: `https://webmonitoring-thisisit.vercel.app/api/auth/callback/google`
4. Copy Client ID → GOOGLE_CLIENT_ID
5. Copy Client Secret → GOOGLE_CLIENT_SECRET

### GitHub:
1. Go https://github.com/settings/developers
2. Create new OAuth App
3. Set Authorization callback URL: `https://webmonitoring-thisisit.vercel.app/api/auth/callback/github`
4. Copy ID → GITHUB_ID
5. Copy Secret → GITHUB_SECRET

## Production Security Notes

🔒 **Important:**
- NEXTAUTH_SECRET should be random and secure
- DATABASE_URL contains password - Vercel will hide it
- ADMIN_PASSWORD is hashed in database
- All variables encrypted at rest on Vercel
- Use HTTPS (automatic on Vercel)

## Need Help?

Visit `/api/debug/auth` locally to diagnose issues:
```bash
npm run dev
# Then go to http://localhost:3000/api/debug/auth
```

Read [AUTH_TROUBLESHOOTING.md](../../AUTH_TROUBLESHOOTING.md) for more details.

# Website Monitoring - Authentication Reference Guide

## Overview

This guide documents the authentication system, common errors, and troubleshooting steps for the Website Monitoring application.

---

## Error: `DatabaseUnavailable`

### What It Means

The `DatabaseUnavailable` error occurs when the authentication system cannot connect to the Prisma database. This is a **non-blocking fallback** — the system has a secondary authentication mechanism to keep operations available even when the primary database is down.

### Error Stack in Browser Console

```
❌ Auth error: DatabaseUnavailable
window.console.error	@	117-991df04a130eddc5.js:1
```

### Root Causes

| Cause | Detection | Fix |
|-------|-----------|-----|
| **Database URL not set** | No `DATABASE_URL` or `PRISMA_DATABASE_URL` env var | Set env variables (see below) |
| **Database server down** | Prisma error codes `P1001` or `P1002` | Check database server status |
| **Network connectivity** | "connection refused" error message | Verify network/firewall rules |
| **Prisma client not initialized** | Blank/missing database connection | Restart application server |

---

## Environment Variables (Required)

### Core Authentication

```bash
# NextAuth configuration (REQUIRED)
NEXTAUTH_SECRET=your-random-secret-key-min-32-chars

# Database connection (at least ONE required)
DATABASE_URL=postgresql://user:password@localhost:5432/webmonitoring
# OR
PRISMA_DATABASE_URL=postgresql://user:password@localhost:5432/webmonitoring

# Fallback admin credentials (optional, used when database is unavailable)
ADMIN_EMAIL=admin@websitemonitoring.com
ADMIN_PASSWORD=your-secure-password
```

### OAuth Providers (Optional)

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_ID=your-github-app-id
GITHUB_SECRET=your-github-app-secret
```

### Environment Variable Priority

1. `PRISMA_DATABASE_URL` (checked first)
2. `DATABASE_URL` (fallback)
3. If neither exists → `DatabaseUnavailable` error

---

## Authentication Flow Diagram

```
User Login
    ↓
Validate Email/Password Format
    ↓
Try Database Connection
    ├─ ✅ SUCCESS: Query user from DB
    │   ├─ User exists? → Compare password hash
    │   │   ├─ Match? → Login successful
    │   │   └─ No match? → "Invalid password"
    │   └─ Not found? → "No user found"
    │
    └─ ❌ DATABASE DOWN
        ├─ Admin env vars set? 
        │   ├─ YES & match? → Fallback admin login (⚠️ logged)
        │   └─ NO or no match? → "DatabaseUnavailable" error
        └─ Error logged with datasource source
```

---

## Troubleshooting Steps

### Step 1: Check Environment Variables

```bash
# Verify NEXTAUTH_SECRET is set
echo $NEXTAUTH_SECRET

# Verify database URL (show only host, not password)
echo $DATABASE_URL | grep -o "postgresql://[^@]*@[^:]*"
```

**Expected Output:**
```
✅ NEXTAUTH_SECRET has value
✅ DATABASE_URL shows your database host
```

### Step 2: Test Database Connection

```bash
# Using Prisma
npx prisma db execute --stdin << 'EOF'
SELECT 1;
EOF

# Or direct psql connection
psql "$DATABASE_URL" -c "SELECT 1;"
```

**Success Signs:**
```
✅ Query executed successfully
✅ No "connection refused" error
```

### Step 3: Check Prisma Schema

```bash
# Generate Prisma client
npx prisma generate

# Verify migrations are applied
npx prisma migrate status

# Run pending migrations if needed
npx prisma migrate deploy
```

### Step 4: Test Authentication Directly

```bash
# With curl (replace values)
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@websitemonitoring.com",
    "password": "your-password",
    "redirect": false
  }'
```

### Step 5: Check Application Logs

**Server-side logs show:**
```
🔐 Authorize called with: { email: 'user@example.com' }
🔎 Prisma datasource source: DATABASE_URL
✅ User found, checking password...
✅ Password match, returning user: user@example.com
```

**If database unavailable:**
```
💥 Auth error: database connection unavailable via DATABASE_URL
⚠️ Falling back to env-based admin auth because the database is unavailable
```

**Client-side logs (browser console):**
```
📡 Calling signIn...
📡 signIn result: { error: 'DatabaseUnavailable:DATABASE_URL', ok: false }
❌ Auth error: Authentication service is temporarily unavailable...
```

---

## Error Codes Reference

### Prisma Database Errors

| Code | Meaning | Solution |
|------|---------|----------|
| `P1001` | Can't reach database server | Check network, database is running |
| `P1002` | Database server timeout | Database server is slow, restart it |
| `P1008` | Server operations timed out | Connection pool exhausted |
| `P1011` | Invalid database URL | Check `DATABASE_URL` format |

### Authentication Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `DatabaseUnavailable` | No DB connection + no fallback admin | Set `DATABASE_URL`, or set `ADMIN_EMAIL`/`ADMIN_PASSWORD` |
| `CredentialsSignin` | Wrong email/password | Verify credentials |
| `InvalidEmail` | Email format invalid | Use valid email format |
| `NoUser` | User doesn't exist in database | Create user account first |

---

## Security Best Practices

### ✅ DO

- [ ] Set a strong `NEXTAUTH_SECRET` (minimum 32 characters, random)
- [ ] Use environment variables from `.env.local` (never commit)
- [ ] Rotate fallback admin credentials (`ADMIN_EMAIL`, `ADMIN_PASSWORD`)
- [ ] Monitor database connectivity in production
- [ ] Hash passwords with bcryptjs before storage
- [ ] Use HTTPS in production
- [ ] Set `SESSION_TIMEOUT` appropriately (30 days default)

### ❌ DON'T

- [ ] Hardcode credentials in code
- [ ] Share `NEXTAUTH_SECRET` or `DATABASE_URL` in repos
- [ ] Use weak/predictable fallback admin passwords
- [ ] Enable `debug: true` in production
- [ ] Skip database schema validation (`npx prisma migrate`)
- [ ] Use same password for multiple users

---

## Fallback Authentication (When Database is Down)

If the database is unavailable but the fallback admin credentials are set:

```
1. User logs in with ADMIN_EMAIL + ADMIN_PASSWORD
2. Database connection fails
3. System detects database error (P1001/P1002)
4. System checks: is this the fallback admin?
5. If YES: Auth succeeds with warning log ⚠️
6. If NO: Returns "DatabaseUnavailable" error ❌
```

**Important:** Fallback auth only works for ONE admin account. Ensure you have a real database for production user management.

---

## Production Checklist

Before deploying to production:

- [ ] Database URL is set to production database
- [ ] `NEXTAUTH_SECRET` is a secure random value (32+ chars)
- [ ] `debug: false` in `authOptions` (auto-set by `NODE_ENV !== 'development'`)
- [ ] All pending migrations are applied (`npx prisma migrate deploy`)
- [ ] OAuth providers configured (if using OAuth)
- [ ] Fallback admin credentials removed or changed
- [ ] SSL/TLS configured for HTTPS
- [ ] Database backups are automated
- [ ] Application health checks include auth endpoint test
- [ ] Error logging is configured for monitoring

---

## Quick Fixes

### "I'm seeing DatabaseUnavailable but my database is running"

```bash
# 1. Verify connection string
echo $DATABASE_URL

# 2. Test it directly
psql $DATABASE_URL -c "SELECT version();"

# 3. Check Prisma client
npx prisma db execute --stdin << 'EOF'
SELECT 1;
EOF

# 4. Restart app after env var changes
```

### "Admin fallback login not working"

```bash
# Check env vars are actually set
env | grep -E "(ADMIN_EMAIL|ADMIN_PASSWORD)"

# Verify they match what you're logging in with
# Remember: Case-sensitive!
```

### "Getting 'DatabaseUnavailable' but database responds"

```bash
# 1. Check for migrations pending
npx prisma migrate status

# 2. Run migrations
npx prisma migrate deploy

# 3. Force Prisma client regeneration
rm -rf node_modules/.prisma
npx prisma generate
```

---

## Monitoring & Alerts

### Key Metrics to Monitor

1. **Auth Failure Rate**: Track `DatabaseUnavailable` errors
2. **Database Connectivity**: Monitor connection pool health
3. **Login Success Rate**: Should be >95% in steady state
4. **Response Time**: Auth endpoint should respond <200ms

### Recommended Alerts

```
🔴 CRITICAL: Auth endpoint returning DatabaseUnavailable
🟠 WARNING: Database connection pool >80% utilized  
🟡 INFO: Failed login attempts >5 in 5 minutes
```

---

## Related Files

- **Auth Config**: `src/app/api/auth/config.ts`
- **Login Page**: `src/app/login/page.tsx`
- **Error Handler**: `src/app/login/error-handler.tsx`
- **Prisma Schema**: `prisma/schema.prisma`
- **Type Definitions**: `src/app/api/auth/types.ts`

---

## Support & Debugging

### Enable Debug Logs

Set in development:
```bash
NODE_ENV=development
# auto-enables console logs in auth config
```

### Get Full Error Context

```bash
# Frontend browser console
F12 → Console → Look for 🔐, ❌, 💥 logs

# Backend server logs
# Watch for: "Authorize called", "Auth error", "Falling back"
```

### Common Commands

```bash
# Generate Prisma client
npx prisma generate

# Validate schema
npx prisma validate

# Run migrations
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio

# Test connection
npx prisma db execute --stdin < /dev/null
```

---

## Last Updated
June 15, 2026 - Database connectivity error handling documented

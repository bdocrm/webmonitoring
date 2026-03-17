# Authentication Troubleshooting Guide

## 401 Errors - Login Failures

If you're seeing `CredentialsSignin` errors or 401 status codes, use this guide to diagnose and fix the issue.

### Quick Diagnostic

Visit http://localhost:3000/api/debug/auth in development to see:
- ✅ Environment variable status
- ✅ Database connection health
- ✅ Admin user existence
- ✅ Detailed issues and recommendations

### Common Issues & Fixes

#### 1. **NEXTAUTH_SECRET Not Set** 🚨

**Error:** Login fails silently, 401 errors in console

**Fix:**
```bash
# Generate a secure secret
openssl rand -base64 32

# Add to .env.local
NEXTAUTH_SECRET="your-generated-key-here"

# Restart dev server
```

#### 2. **Admin User Not Found**

**Error:** "No user found with that email"

**Fix:**
```bash
# Make sure admin credentials are set in .env.local
ADMIN_EMAIL="your-admin@example.com"
ADMIN_PASSWORD="your-password"

# Seed the database
npm run db:seed

# Check if user exists
npx prisma studio
```

#### 3. **Wrong Password**

**Error:** "Invalid password" or "CredentialsSignin"

**Fix:**
- Double-check the password in .env.local
- Password is case-sensitive
- No extra spaces before/after

#### 4. **Database Connection Failed**

**Error:** Auth errors, database not responding

**Fix:**
```bash
# Check DATABASE_URL in .env.local
# Format: postgresql://user:password@host:port/database

# For Supabase:
# https://supabase.com/dashboard → Settings → Database → Connection string

# Test connection
npm run db:studio

# If still failing:
docker-compose up -d  # Start PostgreSQL
```

#### 5. **NEXTAUTH_URL Mismatch**

**Error:** OAuth fails or session issues

**Fix:**
```env
# For local development
NEXTAUTH_URL="http://localhost:3000"

# For production
NEXTAUTH_URL="https://yourdomain.com"
```

### Browser Console Logs

The login form outputs detailed logs. Open Developer Tools (F12) and look for:

```javascript
🔐 Login attempt: {...}                    // Start of login
📡 Calling signIn...                        // Request sent
❌ Auth error: CredentialsSignin / reason   // Error details
✅ Login successful, redirecting...         // Success
```

### Enhanced Login Features

The updated login page includes:

✨ **Features:**
- ✅ Input validation (email format, non-empty fields)
- ✅ Better error messages
- ✅ Remember email checkbox
- ✅ Loading states
- ✅ Detailed console logging
- ✅ Debug info footer

### OAuth Setup (Optional)

Enable social login for easier access:

#### Google OAuth
1. Go to https://console.cloud.google.com
2. Create OAuth 2.0 credentials (Web application)
3. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Add to .env.local:
```env
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

#### GitHub OAuth
1. Go to https://github.com/settings/developers
2. Create new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Add to .env.local:
```env
GITHUB_ID="your-app-id"
GITHUB_SECRET="your-app-secret"
```

### System Enhancements Added

#### Authentication Improvements:
- ✅ Better error handling with specific messages
- ✅ OAuth provider support (Google, GitHub)
- ✅ User session refresh logic
- ✅ Events logging (signIn, signOut)
- ✅ Auto-user creation for OAuth

#### Login Form Improvements:
- ✅ Input validation before submission
- ✅ Remember email functionality
- ✅ Better error display
- ✅ Responsive UI with icons
- ✅ Debug info section
- ✅ Accessibility improvements (autocomplete, labels)

#### Environment Configuration:
- ✅ Comprehensive .env.local.example
- ✅ All OAuth IDs documented
- ✅ Clear comments on required vs optional fields
- ✅ Security best practices noted

### Testing Credentials

After seeding:
- Email: `your-admin@example.com` (from ADMIN_EMAIL)
- Password: `your-password` (from ADMIN_PASSWORD)

### Debugging Commands

```bash
# View database users
npx prisma studio

# Check Prisma connection
npm run db:studio

# View NextAuth logs
# Set DEBUG=* npm run dev

# Generate new NEXTAUTH_SECRET
openssl rand -base64 32

# Test database connection manually
psql postgresql://user:password@host:port/dbname
```

### Security Notes

🔒 **Important:**
- Never commit .env.local to version control
- NEXTAUTH_SECRET must be a secure random string
- Regenerate NEXTAUTH_SECRET for production
- Use HTTPS in production
- Store passwords securely (bcrypt hashed)

### Still Stuck?

1. ✅ Check /api/debug/auth endpoint (dev only)
2. ✅ Open browser console (F12) for logs
3. ✅ Check package.json dependencies
4. ✅ Restart dev server: `npm run dev`
5. ✅ Clear browser cache/cookies
6. ✅ Try incognito/private window

### Version Information

- NextAuth: v5+
- Next.js: v14+
- Authentication: Credentials + OAuth
- Database: PostgreSQL/Supabase

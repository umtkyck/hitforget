# Vercel Deployment Guide - Visucan Virtual Processors
## Production-Ready Deployment in 10 Minutes

---

## 🚀 Quick Deployment (Vercel UI)

### Step 1: Import Project (2 minutes)

1. Go to **[vercel.com](https://vercel.com)**
2. Click **"New Project"**
3. Import from **GitHub**: `umtkyck/visucan`
4. Select branch: `claude/hardware-ai-platform-design-011CUuJySaaAtYdHyoUr9iTg` (or `main`)
5. Click **"Import"**

### Step 2: Configure Build Settings (1 minute)

Vercel auto-detects Next.js. Verify:

```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

✅ **Leave as default** - Vercel knows Next.js!

### Step 3: Environment Variables (5 minutes)

**CRITICAL**: Add these environment variables:

#### Database (Required)

Click **"Environment Variables"** tab:

| Key | Value | Notes |
|-----|-------|-------|
| `POSTGRES_URL` | `postgresql://user:pass@host:5432/db?sslmode=require` | Full connection string |
| `POSTGRES_PRISMA_URL` | Same as POSTGRES_URL with `?pgbouncer=true&connect_timeout=15` | For Prisma |
| `POSTGRES_URL_NON_POOLING` | Same as POSTGRES_URL without pooling params | Direct connection |

**Example with Neon/Vercel Postgres**:
```
POSTGRES_URL=postgres://user:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require

POSTGRES_PRISMA_URL=postgres://user:password@ep-cool-name-123456-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true

POSTGRES_URL_NON_POOLING=postgres://user:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

#### Authentication (Required for Auth Features)

| Key | Value | Where to get |
|-----|-------|--------------|
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Your Vercel domain |
| `NEXTAUTH_SECRET` | Run: `openssl rand -base64 32` | Random secret |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console | OAuth 2.0 credentials |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console | OAuth 2.0 credentials |
| `GITHUB_CLIENT_ID` | From GitHub Developer Settings | OAuth Apps |
| `GITHUB_CLIENT_SECRET` | From GitHub Developer Settings | OAuth Apps |

#### Optional (For Full Features)

| Key | Value | Purpose |
|-----|-------|---------|
| `OPENAI_API_KEY` | `sk-...` | AI code generation |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Claude integration |
| `STRIPE_SECRET_KEY` | `sk_test_...` or `sk_live_...` | Payments |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe webhooks |

**Important**:
- ⚠️ **DO NOT** use quotes around values
- ⚠️ **DO NOT** use `@secret-name` syntax (paste full value)
- ✅ Select: **Production, Preview, Development**

### Step 4: Deploy (2 minutes)

1. Click **"Deploy"**
2. Wait 1-2 minutes for build
3. ✅ **Success!** Your app is live!

---

## 🗄️ Database Setup

### Option A: Vercel Postgres (Easiest)

1. In Vercel project dashboard:
   - Go to **"Storage"** tab
   - Click **"Create Database"**
   - Select **"Postgres"**
   - Choose **"Hobby"** (free tier)
2. Click **"Connect"**
3. Vercel automatically adds environment variables!
4. Run migrations:
   ```bash
   # In project root
   npm run db:push
   ```

### Option B: External Database (Neon, Railway, Supabase)

#### Using Neon.tech (Free 0.5GB):
1. Go to [neon.tech](https://neon.tech)
2. Create project
3. Copy **connection string**
4. Add to Vercel environment variables (see Step 3 above)

#### Using Railway:
1. Go to [railway.app](https://railway.app)
2. New project → **PostgreSQL**
3. Copy connection string from **"Connect"** tab
4. Add to Vercel

#### Using Supabase:
1. Go to [supabase.com](https://supabase.com)
2. New project
3. Settings → Database → **Connection string** → **URI**
4. Add to Vercel

### Migrate Schema

After database is connected:

```bash
# Local
npx drizzle-kit push:pg

# Or via Vercel CLI
vercel env pull .env.local
npm run db:push
```

---

## 🎨 Post-Deployment Setup

### 1. Seed Demo Data

```bash
# Option A: Vercel CLI
vercel env pull .env.local
node scripts/seed-virtual-processors.js

# Option B: Create API endpoint
# POST /api/admin/seed (create this endpoint)
```

### 2. Test Virtual Processors

Visit your deployment:
```
https://your-app.vercel.app/virtual-processors
```

You should see:
- ✅ Arduino Uno R3
- ✅ STM32F401
- ✅ Raspberry Pi 4
- ✅ ESP32 DevKit

### 3. Configure OAuth Redirect URLs

#### Google Cloud Console:
```
Authorized redirect URIs:
https://your-app.vercel.app/api/auth/callback/google
```

#### GitHub Developer Settings:
```
Authorization callback URL:
https://your-app.vercel.app/api/auth/callback/github
```

---

## 🔧 Vercel CLI Deployment

For advanced users:

### Install Vercel CLI
```bash
npm i -g vercel
```

### Login
```bash
vercel login
```

### Link Project
```bash
vercel link
```

### Set Environment Variables
```bash
# Production
vercel env add POSTGRES_URL production
# Paste your database URL

# Preview
vercel env add NEXTAUTH_SECRET preview

# Development
vercel env pull .env.local
```

### Deploy
```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

---

## 📊 Deployment Checklist

Before going live:

### Pre-Deployment
- [ ] All environment variables added
- [ ] Database connected (test with `npm run db:push`)
- [ ] Auth providers configured (Google, GitHub)
- [ ] `.env.example` file up to date

### Post-Deployment
- [ ] Visit `/virtual-processors` - processors visible?
- [ ] Try creating an account (auth works?)
- [ ] Create virtual instance (database write works?)
- [ ] Check Vercel logs for errors
- [ ] Test on mobile (responsive?)

### Optional
- [ ] Custom domain configured
- [ ] Analytics enabled (Vercel Analytics)
- [ ] Edge config for feature flags
- [ ] Cron jobs for cleanup (Vercel Cron)

---

## 🚨 Troubleshooting

### Build Fails

**Error**: `Module not found`
```bash
# Solution: Check package.json dependencies
npm install
git add package-lock.json
git commit -m "fix: update dependencies"
git push
```

**Error**: `Type error in ...`
```bash
# Solution: Fix TypeScript errors
npm run type-check
# Fix errors, commit, push
```

### Database Connection Fails

**Error**: `Can't reach database server`
```bash
# Check environment variables:
1. Verify POSTGRES_URL is correct
2. Test connection locally:
   npm run db:push
3. Check database is publicly accessible
4. Verify SSL mode (add ?sslmode=require)
```

**Error**: `Too many connections`
```bash
# Solution: Use connection pooling
# Update POSTGRES_PRISMA_URL with:
?pgbouncer=true&connect_timeout=15
```

### Auth Not Working

**Error**: `[next-auth][error][OAUTH_CALLBACK_ERROR]`
```bash
# Check:
1. NEXTAUTH_URL matches deployment URL
2. NEXTAUTH_SECRET is set
3. OAuth redirect URLs updated in provider
4. Provider credentials are correct
```

### Pages Return 404

**Error**: Pages don't load after deployment
```bash
# Likely cause: Build output issue
# Solution:
1. Check .vercel/output folder exists
2. Verify next.config.js output: 'standalone' NOT set
   (Vercel handles this automatically)
3. Redeploy
```

---

## 🌍 Custom Domain

### Add Domain
1. Vercel Project → **"Domains"** tab
2. Enter your domain: `visucan.com`
3. Follow DNS setup instructions

### DNS Configuration
Add these records to your DNS provider:

**For root domain** (visucan.com):
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain**:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Update Environment Variables
After domain is active:
```
NEXTAUTH_URL=https://visucan.com
```

Redeploy or update in Vercel dashboard.

---

## 📈 Performance Optimization

### Enable Vercel Features

1. **Analytics**:
   - Dashboard → Analytics → Enable
   - Track pageviews, unique visitors

2. **Speed Insights**:
   - Dashboard → Speed Insights → Enable
   - Get Core Web Vitals data

3. **Edge Config**:
   - Store feature flags
   - Fast key-value storage at edge

4. **Cron Jobs**:
   ```json
   // vercel.json
   {
     "crons": [{
       "path": "/api/cron/cleanup",
       "schedule": "0 0 * * *"
     }]
   }
   ```

### Optimize Build

```javascript
// next.config.js
module.exports = {
  // Generate static pages
  output: 'export', // For static pages only

  // Or hybrid (recommended)
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react']
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920]
  }
}
```

---

## 🔒 Security Best Practices

### Environment Variables
- ✅ Never commit `.env.local`
- ✅ Use Vercel environment variables
- ✅ Rotate secrets regularly
- ✅ Use different secrets for preview vs production

### Database
- ✅ Enable SSL (required)
- ✅ Use connection pooling
- ✅ Set up read replicas for scale
- ✅ Regular backups (Vercel Postgres auto-backups)

### Authentication
- ✅ Use `NEXTAUTH_SECRET` (minimum 32 chars)
- ✅ Enable CSRF protection (NextAuth default)
- ✅ Use secure cookies (production auto-enables)
- ✅ Implement rate limiting

---

## 📱 Demo Deployment

For social media demo:

### 1. Create Preview Deployment
```bash
vercel --prod
```

### 2. Seed Demo Data
```bash
node scripts/seed-virtual-processors.js
```

### 3. Test All Features
- [ ] Virtual Processors marketplace loads
- [ ] Can subscribe to Arduino Uno
- [ ] Can create virtual instance
- [ ] Pin assignment works
- [ ] Instance starts successfully
- [ ] Serial console connects

### 4. Record Demo
- Use production URL for demo
- Stable, fast, professional
- No localhost glitches!

---

## ✅ Deployment Complete!

Your app is now live at:
```
https://your-app.vercel.app
```

**Next Steps**:
1. ✅ Test all features
2. 🎬 Record demo video
3. 📱 Share on social media
4. 🚀 Launch to users!

---

## 🆘 Support

### Vercel Documentation
- [Next.js Deployment](https://vercel.com/docs/concepts/next.js/overview)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Custom Domains](https://vercel.com/docs/concepts/projects/domains)

### Visucan Support
- GitHub Issues: [github.com/umtkyck/visucan/issues](https://github.com/umtkyck/visucan/issues)
- Email: support@visucan.com

**Happy Deploying! 🚀**

# Growth Farm - Deployment Guide

This guide explains how to deploy Growth Farm to Cloudflare Workers with Cloudflare D1 database.

## Overview

Growth Farm is a full-stack application built with:
- **Frontend:** React 19 + Tailwind CSS 4
- **Backend:** Express + tRPC
- **Database:** Cloudflare D1 (SQLite)
- **Hosting:** Cloudflare Workers
- **Code Repository:** GitHub

## Prerequisites

1. **Cloudflare Account** (free tier available)
2. **GitHub Account** (free tier available)
3. **Node.js 18+** (for local development)
4. **Wrangler CLI** (Cloudflare's deployment tool)

## Step 1: Set Up GitHub Repository

### Option A: Create New Repository (Recommended)

```bash
# Navigate to your project directory
cd /path/to/growth-farm

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Growth Farm application"

# Create new repository on GitHub
# Go to https://github.com/new and create a repository named "growth-farm"

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/growth-farm.git
git branch -M main
git push -u origin main
```

### Option B: Push Existing Repository

```bash
git remote add origin https://github.com/YOUR_USERNAME/growth-farm.git
git push -u origin main
```

## Step 2: Set Up Cloudflare Account

### 1. Create Cloudflare Account
- Go to https://dash.cloudflare.com/sign-up
- Sign up with email (free tier available)

### 2. Install Wrangler CLI
```bash
npm install -g wrangler
# or
pnpm add -g wrangler
```

### 3. Authenticate with Cloudflare
```bash
wrangler login
```
This opens a browser window to authorize Wrangler with your Cloudflare account.

## Step 3: Create Cloudflare D1 Database

### 1. Create Database
```bash
wrangler d1 create growth-farm
```

This command will output:
- `database_id` - Copy this value
- `database_name` - Should be "growth-farm"

### 2. Update wrangler.toml
Replace `YOUR_DATABASE_ID_HERE` in `wrangler.toml` with your actual database ID:

```toml
[[d1_databases]]
binding = "DB"
database_name = "growth-farm"
database_id = "YOUR_ACTUAL_DATABASE_ID"
```

### 3. Create Database Schema
```bash
# Push your database schema to Cloudflare D1
wrangler d1 execute growth-farm --file ./drizzle/schema.sql
```

If you don't have a schema.sql file, generate it from your Drizzle schema:
```bash
pnpm db:generate
```

## Step 4: Configure Environment Variables

### 1. Create .env.production file
```bash
cp .env.example .env.production
```

### 2. Fill in Required Variables
Edit `.env.production` with your actual values:

```env
# Authentication (choose one provider)
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret

# Or use Supabase Auth
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_key

# API Keys
OPENAI_API_KEY=sk-your_key
GOOGLE_MAPS_API_KEY=your_key

# File Storage (Cloudflare R2)
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_ACCESS_KEY_ID=your_key_id
CLOUDFLARE_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=growth-farm-files

# Application
APP_URL=https://your-domain.workers.dev
JWT_SECRET=generate_a_random_string_min_32_chars
```

### 2. Add Secrets to Wrangler
```bash
# Add each secret
wrangler secret put JWT_SECRET
wrangler secret put AUTH0_CLIENT_SECRET
wrangler secret put OPENAI_API_KEY
# ... add other sensitive values
```

## Step 5: Build and Deploy

### 1. Build the Project
```bash
pnpm build
```

### 2. Deploy to Cloudflare Workers
```bash
wrangler deploy
```

Your application will be deployed to: `https://growth-farm.YOUR_USERNAME.workers.dev`

### 3. Set Custom Domain (Optional)
```bash
# Add your custom domain
wrangler publish --env production
```

Then configure your domain DNS settings to point to Cloudflare.

## Step 6: Verify Deployment

1. Visit your deployed URL: `https://growth-farm.YOUR_USERNAME.workers.dev`
2. Test login functionality
3. Verify database connectivity
4. Check browser console for any errors

## Environment Variables Reference

### Required for Production

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | Session signing secret | `your_random_string_32_chars` |
| `AUTH0_DOMAIN` | Auth0 domain | `your-app.auth0.com` |
| `AUTH0_CLIENT_ID` | Auth0 client ID | `abc123...` |
| `AUTH0_CLIENT_SECRET` | Auth0 client secret | `xyz789...` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key | `AIza...` |

### Optional

| Variable | Description |
|----------|-------------|
| `CLOUDFLARE_ACCOUNT_ID` | For R2 file storage |
| `R2_BUCKET_NAME` | R2 bucket name |
| `APP_URL` | Your application URL |
| `DEBUG` | Enable debug logging |

## Troubleshooting

### Database Connection Issues
```bash
# Test database connection
wrangler d1 execute growth-farm --command "SELECT 1"
```

### Deployment Fails
```bash
# Check build errors
pnpm build

# View deployment logs
wrangler tail
```

### Environment Variables Not Loading
```bash
# Verify secrets are set
wrangler secret list

# Re-add missing secrets
wrangler secret put VARIABLE_NAME
```

## Updating Your Application

### 1. Make Changes Locally
```bash
# Make your code changes
# Test locally
pnpm dev
```

### 2. Commit and Push to GitHub
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

### 3. Deploy to Cloudflare
```bash
# Build
pnpm build

# Deploy
wrangler deploy
```

## Database Migrations

### Adding New Tables/Columns
```bash
# 1. Update your Drizzle schema in drizzle/schema.ts
# 2. Generate migration
pnpm db:generate

# 3. Apply migration to D1
wrangler d1 execute growth-farm --file ./drizzle/migrations/your_migration.sql
```

## Monitoring and Logs

### View Application Logs
```bash
wrangler tail
```

### View Database Queries
```bash
wrangler d1 execute growth-farm --command "SELECT * FROM sqlite_master WHERE type='table'"
```

## Cost Optimization

### Free Tier Limits
- **Workers:** 100,000 requests/day
- **D1:** Free to prototype and experiment
- **R2:** 10GB/month free storage

### Upgrade When Needed
```bash
# Switch to paid plan if needed
# This is done in the Cloudflare dashboard
```

## Support & Resources

- **Cloudflare Docs:** https://developers.cloudflare.com/
- **Wrangler Docs:** https://developers.cloudflare.com/workers/wrangler/
- **D1 Docs:** https://developers.cloudflare.com/d1/
- **GitHub Issues:** https://github.com/YOUR_USERNAME/growth-farm/issues

## Next Steps

1. Set up CI/CD pipeline (GitHub Actions)
2. Configure monitoring and alerts
3. Set up automated backups
4. Configure custom domain
5. Set up analytics tracking

---

**Last Updated:** March 2026
**Version:** 1.0

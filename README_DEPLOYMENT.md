# Growth Farm - Complete Deployment Instructions

Welcome! This guide will walk you through deploying Growth Farm to GitHub and Cloudflare.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Step-by-Step Setup](#step-by-step-setup)
3. [Environment Variables](#environment-variables)
4. [Troubleshooting](#troubleshooting)
5. [Support](#support)

## 🚀 Quick Start

### For Developers (Local Development)

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/growth-farm.git
cd growth-farm

# 2. Install dependencies
pnpm install

# 3. Set up environment
cp .env.example .env.local
# Edit .env.local with your values

# 4. Run development server
pnpm dev

# 5. Open in browser
# http://localhost:5173
```

### For Deployment (Production)

```bash
# 1. Push code to GitHub (see GITHUB_SETUP.md)
git push origin main

# 2. Set up Cloudflare (see DEPLOYMENT.md)
wrangler deploy

# 3. Your app is live at:
# https://growth-farm.YOUR_USERNAME.workers.dev
```

## 📚 Step-by-Step Setup

### Phase 1: GitHub Repository (5 minutes)

**See:** [GITHUB_SETUP.md](./GITHUB_SETUP.md)

1. Create GitHub repository
2. Initialize git locally
3. Push code to GitHub
4. Verify files are uploaded

### Phase 2: Cloudflare Account (10 minutes)

**See:** [DEPLOYMENT.md](./DEPLOYMENT.md)

1. Create Cloudflare account (free)
2. Install Wrangler CLI
3. Authenticate with Cloudflare
4. Create D1 database

### Phase 3: Environment Configuration (10 minutes)

1. Get API keys from:
   - Auth0 (for authentication)
   - OpenAI (for LLM features)
   - Google Maps (for map features)

2. Add secrets to Cloudflare:
   ```bash
   wrangler secret put JWT_SECRET
   wrangler secret put AUTH0_CLIENT_SECRET
   wrangler secret put OPENAI_API_KEY
   ```

### Phase 4: Deploy (5 minutes)

```bash
# Build
pnpm build

# Deploy
wrangler deploy
```

**Total Setup Time:** ~30 minutes

## 🔐 Environment Variables

### Required for Production

| Variable | Where to Get | Example |
|----------|-------------|---------|
| `JWT_SECRET` | Generate random string | `abc123...xyz789` |
| `AUTH0_DOMAIN` | Auth0 dashboard | `your-app.auth0.com` |
| `AUTH0_CLIENT_ID` | Auth0 app settings | `abc123...` |
| `AUTH0_CLIENT_SECRET` | Auth0 app settings | `xyz789...` |
| `OPENAI_API_KEY` | OpenAI platform | `sk-...` |
| `GOOGLE_MAPS_API_KEY` | Google Cloud Console | `AIza...` |

### Getting API Keys

#### Auth0 (Authentication)
1. Go to https://auth0.com/signup (free tier)
2. Create application
3. Copy Domain, Client ID, Client Secret
4. Set Allowed Callback URLs: `https://your-domain.workers.dev/api/auth/callback`

#### OpenAI (LLM Features)
1. Go to https://platform.openai.com/account/api-keys
2. Create API key
3. Copy and save securely

#### Google Maps (Map Features)
1. Go to https://console.cloud.google.com
2. Create project
3. Enable Maps API
4. Create API key
5. Restrict to your domain

## 🏗️ Architecture

```
Growth Farm
├── Frontend (React 19 + Tailwind)
│   └── Deployed to Cloudflare Workers
├── Backend (Express + tRPC)
│   └── Deployed to Cloudflare Workers
└── Database (SQLite)
    └── Cloudflare D1
```

### Technology Stack

| Component | Technology | Cost |
|-----------|-----------|------|
| Frontend | React 19 | Free |
| Backend | Express + tRPC | Free |
| Database | Cloudflare D1 | Free (up to 10GB) |
| Hosting | Cloudflare Workers | Free (100k req/day) |
| Code | GitHub | Free |
| Auth | Auth0 | Free (up to 7k users) |
| LLM | OpenAI | Pay-as-you-go |

## 📊 Cost Breakdown

### Free Tier (Recommended for MVP)
- **Total Monthly Cost:** $0-5 (depending on API usage)
- **Includes:** 100,000 requests/day, 10GB database, unlimited deployments

### When to Upgrade
- Requests exceed 100,000/day → Cloudflare Workers Paid ($5/month)
- Database exceeds 10GB → Cloudflare D1 Paid (usage-based)
- Users exceed 7,000 → Auth0 Paid ($23/month)

## 🔧 Development Workflow

### Local Development

```bash
# Start dev server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build

# Type check
pnpm type-check
```

### Making Changes

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
# ... edit files ...

# Test changes
pnpm test

# Commit
git add .
git commit -m "Add my feature"

# Push to GitHub
git push origin feature/my-feature

# Create Pull Request on GitHub
```

### Deploying Changes

```bash
# Merge PR on GitHub (or locally)
git checkout main
git pull origin main

# Deploy
pnpm build
wrangler deploy
```

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Test D1 connection
wrangler d1 execute growth-farm --command "SELECT 1"

# View database info
wrangler d1 info growth-farm
```

### Deployment Fails

```bash
# Check build errors
pnpm build

# View deployment logs
wrangler tail

# Check for TypeScript errors
pnpm type-check
```

### Environment Variables Not Working

```bash
# List all secrets
wrangler secret list

# Add missing secret
wrangler secret put VARIABLE_NAME

# Re-deploy
wrangler deploy
```

### Local Development Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Clear build cache
rm -rf dist .vite

# Restart dev server
pnpm dev
```

## 📖 Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed deployment guide
- [GITHUB_SETUP.md](./GITHUB_SETUP.md) - GitHub setup guide
- [README.md](./README.md) - Project overview
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contributing guidelines

## 🆘 Getting Help

### Common Issues

**Q: I get "database not found" error**
A: Make sure you've created the D1 database and updated `wrangler.toml` with the correct database ID.

**Q: Authentication not working**
A: Verify your Auth0 credentials and callback URL are correct.

**Q: Map not showing**
A: Check that Google Maps API key is valid and Maps API is enabled.

**Q: Deployment stuck**
A: Check `wrangler tail` for errors. Try `wrangler deploy --env production`.

### Getting Support

1. Check the [Troubleshooting](#troubleshooting) section
2. Read the detailed guides (DEPLOYMENT.md, GITHUB_SETUP.md)
3. Check Cloudflare documentation: https://developers.cloudflare.com/
4. Open an issue on GitHub: https://github.com/YOUR_USERNAME/growth-farm/issues

## ✅ Deployment Checklist

Before deploying to production:

- [ ] Code pushed to GitHub
- [ ] All tests passing (`pnpm test`)
- [ ] No TypeScript errors (`pnpm type-check`)
- [ ] Environment variables set in Cloudflare
- [ ] D1 database created and schema applied
- [ ] API keys obtained (Auth0, OpenAI, Google Maps)
- [ ] Callback URLs configured in Auth0
- [ ] Custom domain configured (optional)
- [ ] Monitoring set up (optional)
- [ ] Backups configured (optional)

## 🎯 Next Steps

1. **Complete Setup:** Follow the step-by-step guides above
2. **Test Locally:** Run `pnpm dev` and test all features
3. **Deploy:** Run `wrangler deploy`
4. **Monitor:** Check `wrangler tail` for errors
5. **Iterate:** Make changes, test, commit, deploy

## 📞 Contact

For questions or support:
- GitHub Issues: https://github.com/YOUR_USERNAME/growth-farm/issues
- Email: your-email@example.com
- Slack: #growth-farm

---

**Last Updated:** March 2026
**Version:** 1.0
**Status:** Ready for Production

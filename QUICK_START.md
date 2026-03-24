# Growth Farm - Quick Start Guide

Get Growth Farm running in 3 easy steps!

## 🚀 3-Step Quick Start

### Step 1: Clone & Setup (5 minutes)

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/growth-farm.git
cd growth-farm

# Run setup script
./scripts/setup.sh

# Edit environment variables
nano .env.local
# Add your API keys (see DEPLOYMENT.md for where to get them)
```

### Step 2: Run Locally (2 minutes)

```bash
# Start development server
pnpm dev

# Open in browser
# http://localhost:5173
```

### Step 3: Deploy to Cloudflare (5 minutes)

```bash
# Authenticate with Cloudflare
wrangler login

# Create D1 database
wrangler d1 create growth-farm

# Update wrangler.toml with database ID
# Then deploy
./scripts/deploy.sh
```

**Done!** Your app is now live at `https://growth-farm.YOUR_USERNAME.workers.dev`

---

## 📋 What You Need

### Before You Start

- ✅ GitHub account (free at https://github.com)
- ✅ Cloudflare account (free at https://dash.cloudflare.com)
- ✅ Node.js 18+ (download from https://nodejs.org)
- ✅ API keys (see below)

### API Keys Needed

| Service | Purpose | Free Tier | Get Here |
|---------|---------|-----------|----------|
| **Auth0** | User authentication | 7,000 users | https://auth0.com/signup |
| **OpenAI** | AI features | Pay-as-you-go | https://platform.openai.com |
| **Google Maps** | Map features | $200/month free | https://console.cloud.google.com |

---

## 🎯 Common Tasks

### Local Development

```bash
# Start dev server
pnpm dev

# Run tests
pnpm test

# Type check
pnpm type-check

# Build for production
pnpm build
```

### Making Changes

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
# ... edit files ...

# Commit
git add .
git commit -m "Add my feature"

# Push to GitHub
git push origin feature/my-feature

# Create Pull Request on GitHub
```

### Deploying Changes

```bash
# Build
pnpm build

# Deploy to Cloudflare
wrangler deploy
```

---

## 🆘 Troubleshooting

### "Module not found" error
```bash
# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### "Database not found" error
```bash
# Create D1 database
wrangler d1 create growth-farm

# Update wrangler.toml with database ID
# Redeploy
wrangler deploy
```

### "Not authenticated" error
```bash
# Login to Cloudflare
wrangler login
```

### Environment variables not working
```bash
# Add secret to Cloudflare
wrangler secret put VARIABLE_NAME

# Redeploy
wrangler deploy
```

---

## 📚 Full Documentation

- **[README_DEPLOYMENT.md](./README_DEPLOYMENT.md)** - Complete setup guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Detailed deployment instructions
- **[GITHUB_SETUP.md](./GITHUB_SETUP.md)** - GitHub repository guide
- **[README.md](./README.md)** - Project overview

---

## 💡 Pro Tips

1. **Use `wrangler tail`** to view live logs:
   ```bash
   wrangler tail
   ```

2. **Test database locally** before deploying:
   ```bash
   pnpm dev
   ```

3. **Keep secrets secure** - never commit `.env` files:
   ```bash
   # Good ✅
   wrangler secret put API_KEY

   # Bad ❌
   git add .env
   ```

4. **Use branches** for features:
   ```bash
   git checkout -b feature/my-feature
   ```

---

## 🎓 Learning Resources

- **Cloudflare Docs:** https://developers.cloudflare.com/
- **React Docs:** https://react.dev/
- **Tailwind CSS:** https://tailwindcss.com/
- **tRPC:** https://trpc.io/

---

## 🤝 Need Help?

1. Check the [Troubleshooting](#-troubleshooting) section
2. Read the detailed guides linked above
3. Open an issue on GitHub
4. Check Cloudflare documentation

---

## ✅ Deployment Checklist

Before going live:

- [ ] All tests passing (`pnpm test`)
- [ ] No TypeScript errors (`pnpm type-check`)
- [ ] Environment variables set
- [ ] D1 database created
- [ ] API keys obtained
- [ ] Code pushed to GitHub
- [ ] Deployment successful (`wrangler deploy`)

---

**Ready to deploy?** Follow the 3-step quick start above! 🚀

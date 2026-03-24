#!/bin/bash

# Growth Farm - Quick Deployment Script
# This script automates the deployment process to Cloudflare Workers

set -e  # Exit on error

echo "🚀 Growth Farm Deployment Script"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ pnpm is not installed. Install with: npm install -g pnpm${NC}"
    exit 1
fi

if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}❌ Wrangler CLI is not installed. Install with: npm install -g wrangler${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites installed${NC}"
echo ""

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
pnpm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 2: Run tests
echo "🧪 Running tests..."
if pnpm test 2>/dev/null; then
    echo -e "${GREEN}✅ All tests passed${NC}"
else
    echo -e "${YELLOW}⚠️  Some tests failed. Continue anyway? (y/n)${NC}"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi
echo ""

# Step 3: Type check
echo "🔍 Type checking..."
if pnpm type-check 2>/dev/null; then
    echo -e "${GREEN}✅ No TypeScript errors${NC}"
else
    echo -e "${RED}❌ TypeScript errors found${NC}"
    exit 1
fi
echo ""

# Step 4: Build
echo "🔨 Building project..."
pnpm build
echo -e "${GREEN}✅ Build successful${NC}"
echo ""

# Step 5: Check Wrangler authentication
echo "🔐 Checking Wrangler authentication..."
if ! wrangler whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not authenticated with Cloudflare${NC}"
    echo "Please run: wrangler login"
    exit 1
fi
echo -e "${GREEN}✅ Authenticated with Cloudflare${NC}"
echo ""

# Step 6: Verify environment
echo "🌍 Checking environment..."
if [ ! -f "wrangler.toml" ]; then
    echo -e "${RED}❌ wrangler.toml not found${NC}"
    exit 1
fi

# Check for database ID in wrangler.toml
if grep -q "YOUR_DATABASE_ID_HERE" wrangler.toml; then
    echo -e "${RED}❌ Database ID not configured in wrangler.toml${NC}"
    echo "Please update wrangler.toml with your D1 database ID"
    exit 1
fi

echo -e "${GREEN}✅ Environment configured${NC}"
echo ""

# Step 7: Deploy
echo "🚀 Deploying to Cloudflare Workers..."
wrangler deploy

echo ""
echo -e "${GREEN}✅ Deployment successful!${NC}"
echo ""
echo "📍 Your app is now live at:"
echo "   https://growth-farm.$(wrangler whoami | grep -oP '(?<=Account ID: )\w+').workers.dev"
echo ""
echo "📚 Next steps:"
echo "   1. Visit your deployed URL"
echo "   2. Test login functionality"
echo "   3. Verify database connectivity"
echo "   4. Check browser console for errors"
echo ""
echo "📖 For more information, see README_DEPLOYMENT.md"

#!/bin/bash

# Growth Farm - Quick Setup Script
# This script automates the initial setup process

set -e  # Exit on error

echo "🎯 Growth Farm - Setup Script"
echo "=============================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check Node.js
echo "📋 Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js $NODE_VERSION installed${NC}"
echo ""

# Step 2: Install pnpm
echo "📦 Setting up package manager..."
if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    npm install -g pnpm
fi
PNPM_VERSION=$(pnpm -v)
echo -e "${GREEN}✅ pnpm $PNPM_VERSION ready${NC}"
echo ""

# Step 3: Install dependencies
echo "📚 Installing project dependencies..."
pnpm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 4: Setup environment
echo "🔐 Setting up environment variables..."
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local from template..."
    # Create basic .env.local
    cat > .env.local << EOF
# Growth Farm - Local Development Environment
# Copy values from your API providers

# Authentication
JWT_SECRET=your_jwt_secret_here_min_32_chars

# Auth0 (or your auth provider)
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret

# APIs
OPENAI_API_KEY=sk-your_key_here
GOOGLE_MAPS_API_KEY=your_key_here

# Database (for local development)
# DATABASE_URL=mysql://user:password@localhost:3306/growth_farm

# Application
APP_URL=http://localhost:5173
ENVIRONMENT=development
EOF
    echo -e "${GREEN}✅ Created .env.local${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env.local with your API keys${NC}"
else
    echo -e "${GREEN}✅ .env.local already exists${NC}"
fi
echo ""

# Step 5: Install Wrangler (for Cloudflare deployment)
echo "☁️  Setting up Cloudflare CLI..."
if ! command -v wrangler &> /dev/null; then
    echo "Installing Wrangler..."
    npm install -g wrangler
fi
WRANGLER_VERSION=$(wrangler --version)
echo -e "${GREEN}✅ Wrangler $WRANGLER_VERSION ready${NC}"
echo ""

# Step 6: Verify project structure
echo "🏗️  Verifying project structure..."
required_files=("package.json" "wrangler.toml" "DEPLOYMENT.md" "GITHUB_SETUP.md")
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file missing${NC}"
    fi
done
echo ""

# Step 7: Summary
echo "✨ Setup Complete!"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Edit .env.local with your API keys"
echo "2. Run development server: ${GREEN}pnpm dev${NC}"
echo "3. Open browser: ${GREEN}http://localhost:5173${NC}"
echo ""
echo -e "${BLUE}For deployment:${NC}"
echo "1. Read DEPLOYMENT.md for detailed instructions"
echo "2. Run: ${GREEN}wrangler login${NC}"
echo "3. Create D1 database: ${GREEN}wrangler d1 create growth-farm${NC}"
echo "4. Deploy: ${GREEN}./scripts/deploy.sh${NC}"
echo ""
echo -e "${BLUE}Documentation:${NC}"
echo "- README_DEPLOYMENT.md - Complete setup guide"
echo "- DEPLOYMENT.md - Detailed deployment instructions"
echo "- GITHUB_SETUP.md - GitHub repository setup"
echo ""

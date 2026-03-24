# Growth Farm - GitHub Setup Guide

This guide explains how to push your Growth Farm code to GitHub.

## Prerequisites

- GitHub account (free at https://github.com/signup)
- Git installed on your computer
- Growth Farm project folder

## Step 1: Create GitHub Repository

### Option A: Using GitHub Web Interface (Easiest)

1. Go to https://github.com/new
2. Fill in the repository details:
   - **Repository name:** `growth-farm`
   - **Description:** `Growth Farm Operating System - Venture Capital & Design Studio`
   - **Visibility:** Choose `Private` (recommended for internal tools)
   - **Initialize with:** Leave unchecked (we'll push existing code)
3. Click **Create repository**

### Option B: Using GitHub CLI

```bash
# Install GitHub CLI if you haven't already
# macOS: brew install gh
# Windows: choco install gh
# Linux: sudo apt install gh

# Authenticate with GitHub
gh auth login

# Create repository
gh repo create growth-farm --private --source=. --remote=origin --push
```

## Step 2: Configure Git Locally

```bash
# Navigate to your project directory
cd /path/to/growth-farm

# Configure git (if not already done)
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Verify configuration
git config --list
```

## Step 3: Initialize Git Repository (if needed)

```bash
# Check if git is already initialized
git status

# If not initialized, run:
git init

# Add all files to git
git add .

# Create initial commit
git commit -m "Initial commit: Growth Farm application

- React 19 + Tailwind CSS 4 frontend
- Express + tRPC backend
- Cloudflare D1 database integration
- Full venture management system
- Weekly activities tracking
- Team dashboard"
```

## Step 4: Connect to GitHub Remote

```bash
# Add GitHub as remote repository
git remote add origin https://github.com/YOUR_USERNAME/growth-farm.git

# Verify remote was added
git remote -v
# Should show:
# origin  https://github.com/YOUR_USERNAME/growth-farm.git (fetch)
# origin  https://github.com/YOUR_USERNAME/growth-farm.git (push)

# Rename branch to main (if needed)
git branch -M main

# Push code to GitHub
git push -u origin main
```

## Step 5: Verify on GitHub

1. Go to https://github.com/YOUR_USERNAME/growth-farm
2. Verify all files are there
3. Check the commit history

## Step 6: Add Collaborators (Optional)

To invite team members to the repository:

1. Go to your repository on GitHub
2. Click **Settings** → **Collaborators**
3. Click **Add people**
4. Search for their GitHub username
5. Select permission level:
   - **Pull access:** Can view and clone
   - **Push access:** Can push changes
   - **Admin access:** Full control

## Step 7: Set Up Branch Protection (Recommended)

To prevent accidental pushes to main:

1. Go to **Settings** → **Branches**
2. Click **Add rule** under "Branch protection rules"
3. Enter `main` as the branch name pattern
4. Enable:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging

## Step 8: Create .gitignore (Already Exists)

The project should already have a `.gitignore` file. Verify it includes:

```
node_modules/
dist/
build/
.env
.env.local
.env.*.local
*.log
.DS_Store
.vscode/
.idea/
```

## Regular Git Workflow

### Making Changes

```bash
# Create a new branch for your feature
git checkout -b feature/venture-editing

# Make your changes
# ... edit files ...

# Stage changes
git add .

# Commit changes
git commit -m "Add venture editing feature"

# Push to GitHub
git push origin feature/venture-editing

# Create Pull Request on GitHub
# Go to your repository and click "Compare & pull request"
```

### Pulling Latest Changes

```bash
# Update your local repository
git pull origin main

# Or if you have uncommitted changes:
git stash
git pull origin main
git stash pop
```

### Merging Changes

```bash
# Switch to main branch
git checkout main

# Pull latest changes
git pull origin main

# Merge feature branch
git merge feature/venture-editing

# Push merged changes
git push origin main
```

## Useful Git Commands

```bash
# View commit history
git log --oneline

# View current status
git status

# View changes before committing
git diff

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# View all branches
git branch -a

# Delete a branch
git branch -d feature/venture-editing

# Rename current branch
git branch -m new-branch-name
```

## GitHub Features to Use

### Issues
Track bugs, features, and tasks:
1. Go to **Issues** tab
2. Click **New issue**
3. Add title, description, labels, assignees

### Pull Requests
Review and merge code changes:
1. Create a branch with your changes
2. Push to GitHub
3. Go to **Pull requests** tab
4. Click **New pull request**
5. Review changes and merge

### Projects
Organize work with a kanban board:
1. Go to **Projects** tab
2. Click **New project**
3. Create columns: To Do, In Progress, Done
4. Add issues and PRs to the board

### Actions (CI/CD)
Automate testing and deployment:
1. Go to **Actions** tab
2. Choose a workflow template (e.g., Node.js)
3. Configure your tests and deployment

## Troubleshooting

### Authentication Issues

```bash
# If you get authentication errors, use SSH instead of HTTPS
git remote set-url origin git@github.com:YOUR_USERNAME/growth-farm.git

# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "your.email@example.com"

# Add SSH key to GitHub
# Go to Settings → SSH and GPG keys → New SSH key
# Paste your public key from ~/.ssh/id_ed25519.pub
```

### Merge Conflicts

```bash
# If you have merge conflicts:
# 1. Open the conflicted files
# 2. Look for conflict markers (<<<<<<, ======, >>>>>>)
# 3. Edit to keep the code you want
# 4. Remove conflict markers

# After resolving:
git add .
git commit -m "Resolve merge conflicts"
git push origin main
```

### Large Files

If you accidentally committed large files:

```bash
# Remove file from history
git filter-branch --tree-filter 'rm -f <file>' HEAD

# Force push (use with caution)
git push origin main --force
```

## Best Practices

1. **Commit Often:** Make small, logical commits
2. **Write Clear Messages:** Use descriptive commit messages
3. **Use Branches:** Create branches for features/fixes
4. **Review Before Merging:** Use pull requests for code review
5. **Keep Main Stable:** Don't push broken code to main
6. **Document Changes:** Update README and docs with changes

## Resources

- **GitHub Docs:** https://docs.github.com/
- **Git Documentation:** https://git-scm.com/doc
- **GitHub CLI:** https://cli.github.com/
- **Markdown Guide:** https://guides.github.com/features/mastering-markdown/

---

**Last Updated:** March 2026
**Version:** 1.0

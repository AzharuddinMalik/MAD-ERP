# Git & GitHub Setup Guide

## Step-by-Step Instructions to Push Your Project to GitHub

### Step 1: Initialize Git Repository

Open PowerShell in your project directory and run:

```powershell
cd "d:\Spring-Boot Vipul Tyagi\journalApp"

# Initialize Git
git init

# Check status
git status
```

### Step 2: Review Files to be Committed

```powershell
# See what will be committed
git status

# You should see:
# - docker-compose.yml
# - journalApp/ (backend)
# - mad-frontend/
# - README.md
# - DEPLOYMENT.md
# - .env.example
# - .gitignore

# You should NOT see:
# - .env (if it exists)
# - node_modules/
# - target/
# - *.log files
```

### Step 3: Stage All Files

```powershell
# Add all files
git add .

# Verify what's staged
git status
```

### Step 4: Create Initial Commit

```powershell
git commit -m "Initial commit: MAD-ERP application with Docker setup"
```

### Step 5: Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click the **"+"** icon → **"New repository"**
3. Repository name: `mad-erp` (or your preferred name)
4. Description: "Malik Art Decor ERP Management System"
5. **Keep it Private** (recommended for business applications)
6. **DO NOT** initialize with README (we already have one)
7. Click **"Create repository"**

### Step 6: Connect to GitHub

GitHub will show you commands. Use these:

```powershell
# Add remote origin (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/mad-erp.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

### Step 7: Verify Upload

1. Refresh your GitHub repository page
2. You should see all your files
3. Check that `.env` is NOT visible (only `.env.example` should be there)

---

## Common Issues & Solutions

### Issue: "Permission denied (publickey)"

**Solution**: Use HTTPS instead of SSH
```powershell
git remote set-url origin https://github.com/YOUR_USERNAME/mad-erp.git
```

### Issue: "Large files detected"

**Solution**: Check if `node_modules/` or `target/` are being committed
```powershell
# Remove from staging
git rm -r --cached node_modules/
git rm -r --cached journalApp/target/

# Commit the removal
git commit -m "Remove build artifacts"
```

### Issue: "Authentication failed"

**Solution**: Use Personal Access Token
1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select scopes: `repo`
4. Use token as password when pushing

---

## Future Updates

After initial push, use this workflow:

```powershell
# Make changes to your code
# ...

# Stage changes
git add .

# Commit with descriptive message
git commit -m "Add feature: worker attendance validation"

# Push to GitHub
git push origin main
```

---

## Branch Strategy for Testing Phase

### Create Staging Branch

```powershell
# Create and switch to staging branch
git checkout -b staging

# Push staging branch
git push -u origin staging
```

### Workflow
- `main` branch → Production (after 15 days)
- `staging` branch → Testing environment (first 15 days)

### Merge Staging to Main (After Testing)

```powershell
# Switch to main
git checkout main

# Merge staging
git merge staging

# Push to main
git push origin main
```

---

## Security Checklist Before Pushing

- [ ] `.env` file is in `.gitignore`
- [ ] No passwords in code
- [ ] No API keys in code
- [ ] `.env.example` has placeholder values only
- [ ] Database credentials are environment variables
- [ ] JWT secret is externalized

---

## Next Steps After GitHub Push

1. ✅ Repository is on GitHub
2. → Deploy to Railway (see DEPLOYMENT.md)
3. → Share staging URL with team
4. → Collect feedback for 10-15 days
5. → Deploy to production

---

## Quick Reference

```powershell
# Check status
git status

# View changes
git diff

# View commit history
git log --oneline

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard all local changes
git reset --hard HEAD
```

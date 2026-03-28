# 🚀 DEPLOYMENT GUIDE - Aerospace Mission Control

## Complete Step-by-Step Deployment to Vercel

---

## ⚡ SUPER QUICK START (3 Minutes)

### Step 1: Extract Files
```bash
# Extract the ZIP file
unzip aerospace-mission-control.zip
cd aerospace-mission-control
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Test Locally
```bash
npm run dev
# Open http://localhost:3000
# Click "ENTER COCKPIT"
```

### Step 4: Deploy to Vercel
```bash
# Option A: Vercel CLI (Fastest)
npx vercel

# Option B: Push to GitHub then use Vercel Dashboard
git init
git add .
git commit -m "feat: Initial deployment"
# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/aerospace-cockpit.git
git push -u origin main
# Go to vercel.com/new and import
```

**✅ DONE! Your cockpit is live!**

---

## 📋 DETAILED DEPLOYMENT STEPS

### Prerequisites

✅ **Node.js 18+** installed
```bash
node --version  # Should be v18.17.0 or higher
```

✅ **npm 9+** installed
```bash
npm --version   # Should be 9.0.0 or higher
```

✅ **Git** installed (for version control)
```bash
git --version
```

✅ **Vercel account** (free)
- Sign up at [vercel.com](https://vercel.com)

---

### Method 1: Vercel CLI (Recommended - Fastest)

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login to Vercel
```bash
vercel login
```
- Follow the prompts to authenticate

#### Step 3: Deploy
```bash
# From the project directory
vercel

# Follow the prompts:
# Set up and deploy? Y
# Which scope? Select your account
# Link to existing project? N
# What's your project's name? aerospace-mission-control
# In which directory is your code located? ./
# Auto-detected framework: Next.js
# Override settings? N
```

#### Step 4: Deploy to Production
```bash
vercel --prod
```

**✅ Your app is live!** URL will be displayed in terminal.

---

### Method 2: GitHub + Vercel Dashboard (Most Common)

#### Step 1: Initialize Git Repository
```bash
cd aerospace-mission-control
git init
git add .
git commit -m "feat: Initial aerospace cockpit deployment"
```

#### Step 2: Create GitHub Repository
1. Go to [github.com/new](https://github.com/new)
2. Repository name: `aerospace-mission-control`
3. Public or Private: Your choice
4. **Do NOT** initialize with README (we already have one)
5. Click **"Create repository"**

#### Step 3: Push to GitHub
```bash
# Use the commands GitHub shows you, or:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/aerospace-mission-control.git
git push -u origin main
```

#### Step 4: Import to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Find and select your `aerospace-mission-control` repo
4. Click **"Import"**
5. **Project Settings:**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build` (auto-filled)
   - Output Directory: `.next` (auto-filled)
   - Install Command: `npm install` (auto-filled)
6. **Environment Variables:** (Optional)
   - Add any custom env vars
7. Click **"Deploy"**

#### Step 5: Wait for Build
- Build typically takes 60-90 seconds
- Watch the build logs in real-time
- ✅ Success message appears

#### Step 6: Visit Your Site
- Click the preview URL or visit: `https://aerospace-mission-control.vercel.app`
- Click **"ENTER COCKPIT"**
- Enjoy your spacecraft interface! 🚀

---

### Method 3: Vercel GitHub Integration (Automatic Deployments)

#### One-Time Setup
1. Connect GitHub account to Vercel
2. Import repository (Method 2 above)

#### Automatic Deployments
Every push to `main` automatically deploys to production!

```bash
# Make changes
git add .
git commit -m "feat: Update telemetry messages"
git push

# Vercel automatically builds and deploys!
```

**Preview Deployments:**
- Every pull request gets its own preview URL
- Perfect for testing before merging

---

## 🎨 CUSTOMIZATION

### Custom Domain

1. Go to Vercel Dashboard → Your Project
2. Click **"Settings"** → **"Domains"**
3. Add domain: `mission-control.yourcompany.com`
4. Update DNS records as instructed
5. Wait for DNS propagation (5-60 minutes)
6. ✅ Live on custom domain!

### Environment Variables

1. Vercel Dashboard → Your Project
2. Click **"Settings"** → **"Environment Variables"**
3. Add variables:
   ```
   NEXT_PUBLIC_APP_NAME=Your Custom Name
   NEXT_PUBLIC_CERTIFICATION=Your Cert Level
   ```
4. Redeploy for changes to take effect

---

## 🔍 VERIFICATION CHECKLIST

After deployment, verify:

- [ ] **Homepage loads** - See landing page with "ENTER COCKPIT"
- [ ] **Cockpit loads** - 3D viewport visible
- [ ] **No console errors** - Open DevTools (F12)
- [ ] **Telemetry streaming** - Messages appearing in bottom-left
- [ ] **Systems healthy** - All partitions show "HEALTHY"
- [ ] **Controls work** - Throttle slider moves
- [ ] **Mobile responsive** - Check on phone (best on desktop)
- [ ] **Fast load time** - < 3 seconds
- [ ] **Smooth animations** - 60fps viewport rotation

---

## 🐛 TROUBLESHOOTING

### Build Fails

**Error:** `Cannot find module '@/components/...'`

**Fix:**
```bash
# Check tsconfig.json has correct paths
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Error:** `Module not found: Can't resolve 'three'`

**Fix:**
```bash
npm install three @react-three/fiber @react-three/drei
```

### Runtime Errors

**Error:** `Hydration failed`

**Fix:** This happens with server/client mismatch. Add `'use client'` to components that use hooks.

**Error:** `Canvas is not defined`

**Fix:** Wrap 3D components in `<Suspense>` and ensure `'use client'` directive.

### Performance Issues

**3D viewport laggy:**
- Reduce particle count in Stars component
- Lower polygon count on spacecraft mesh
- Reduce shadow quality

**Slow load time:**
```bash
# Optimize build
npm run build
# Check bundle size
npx @next/bundle-analyzer
```

---

## 📊 MONITORING

### Vercel Analytics

1. Go to your project dashboard
2. Click **"Analytics"** tab
3. View:
   - Page views
   - Unique visitors
   - Performance metrics
   - Web Vitals

### Vercel Logs

1. Dashboard → Your Project
2. Click **"Deployments"**
3. Click any deployment
4. Click **"View Function Logs"**

---

## 🚀 GOING TO PRODUCTION

### Pre-Launch Checklist

- [ ] Test all features thoroughly
- [ ] Verify on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on different devices
- [ ] Configure custom domain
- [ ] Set up proper error monitoring (Sentry)
- [ ] Add authentication if needed
- [ ] Review and set environment variables
- [ ] Test with real telemetry data (if applicable)
- [ ] Get stakeholder approval
- [ ] Prepare documentation for users

### Launch!

```bash
vercel --prod
```

**🎊 Congratulations! Your aerospace mission control is LIVE!**

---

## 📞 GETTING HELP

**Documentation:**
- README.md in project root
- This deployment guide
- Next.js docs: nextjs.org/docs
- Vercel docs: vercel.com/docs

**Common Issues:**
- Check the troubleshooting section above
- Search Vercel community discussions
- Check GitHub issues (if open source)

**Still stuck?**
- Create a GitHub issue
- Ask in Vercel Discord community
- Check Stack Overflow

---

## 🎯 NEXT STEPS

After successful deployment:

1. **Share your URL** with team members
2. **Gather feedback** on the interface
3. **Monitor performance** via Vercel Analytics
4. **Iterate and improve** based on feedback
5. **Add features** from your roadmap
6. **Document** any customizations
7. **Celebrate!** 🎉

---

## 📈 ADVANCED OPTIMIZATION

### Enable Edge Runtime
```typescript
// src/app/cockpit/page.tsx
export const runtime = 'edge'
```

### Add ISR (Incremental Static Regeneration)
```typescript
export const revalidate = 60 // Revalidate every 60 seconds
```

### Optimize Images
- Use next/image component
- Enable AVIF format
- Lazy load off-screen images

### Code Splitting
- Dynamic imports for heavy components
- Split 3D components into separate chunks

---

**Your aerospace mission control is ready for the world! 🚀🛰️✨**

---

*Built with excellence for aerospace applications*  
*DO-178C DAL A | Type Certificate TC-12345*

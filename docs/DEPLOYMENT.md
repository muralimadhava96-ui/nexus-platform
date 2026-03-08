# Deployment Guide

This guide will walk you through deploying Nexus Platform to Vercel with the Anthropic API proxy.

## Prerequisites

1. **Anthropic API Key**
   - Sign up at https://console.anthropic.com/
   - Navigate to API Keys section
   - Create a new API key
   - Copy the key (starts with `sk-ant-`)

2. **Vercel Account** (Free tier works)
   - Sign up at https://vercel.com/
   - Connect your GitHub account

3. **Git Repository**
   - Create a new repo on GitHub
   - Push your code to the repository

## Method 1: One-Click Deploy (Recommended)

1. Click the "Deploy to Vercel" button in README.md
2. Connect your GitHub account if prompted
3. Select the repository
4. Add environment variable:
   - Name: `ANTHROPIC_API_KEY`
   - Value: Your API key (sk-ant-...)
5. Click "Deploy"
6. Wait for deployment to complete (~2 minutes)
7. Visit your live URL!

## Method 2: Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate.

### Step 3: Deploy

From your project directory:

```bash
# Initial deployment (preview)
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - What's your project's name? nexus-platform
# - In which directory is your code located? ./
# - Want to override the settings? No
```

### Step 4: Add Environment Variable

```bash
vercel env add ANTHROPIC_API_KEY
```

When prompted:
1. Enter your Anthropic API key
2. Select "Production" environment
3. Confirm

### Step 5: Deploy to Production

```bash
vercel --prod
```

Your app will be live at `https://nexus-platform-<random>.vercel.app`

## Method 3: GitHub Integration

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<your-username>/nexus-platform.git
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: Vite
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add Environment Variable:
   - Key: `ANTHROPIC_API_KEY`
   - Value: Your API key
6. Click "Deploy"

### Step 3: Automatic Deployments

Every push to `main` will automatically deploy to production!

## Verifying Deployment

### 1. Check Build Logs

In Vercel dashboard:
- Go to your project
- Click on the latest deployment
- View "Building" logs for any errors

### 2. Test API Proxy

Open browser console on your deployed site:

```javascript
fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Hello!' }],
    system: 'You are a helpful assistant.'
  })
})
.then(r => r.json())
.then(console.log)
```

Should return: `{ content: "Hello! How can I help you today?" }`

### 3. Test AI Features

1. Navigate to "AI Assist" tab
2. Send a test message
3. Verify you get a response from Claude

## Troubleshooting

### "API key not configured" Error

**Cause:** Environment variable not set

**Fix:**
```bash
vercel env add ANTHROPIC_API_KEY
# Then redeploy:
vercel --prod
```

### API Calls Failing

**Cause:** Incorrect API key or Anthropic API issues

**Fix:**
1. Check API key is valid at https://console.anthropic.com/
2. Verify environment variable:
   ```bash
   vercel env ls
   ```
3. Check Anthropic API status: https://status.anthropic.com/

### Build Failures

**Cause:** Missing dependencies or syntax errors

**Fix:**
1. Check build logs in Vercel dashboard
2. Test local build:
   ```bash
   npm run build
   ```
3. Fix any errors and push again

### Slow Cold Starts

**Cause:** Vercel serverless functions have cold starts

**Solution:** This is normal. First request after inactivity may take 2-3 seconds. Subsequent requests are instant.

## Custom Domain

### Step 1: Add Domain in Vercel

1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `mynexus.com`)
3. Follow DNS configuration instructions

### Step 2: Update DNS

Add these records at your DNS provider:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Step 3: Wait for Propagation

DNS changes can take up to 48 hours, but usually complete in minutes.

## Production Checklist

- [ ] Environment variables set correctly
- [ ] Build succeeds without errors
- [ ] API proxy working (test in browser console)
- [ ] AI chat responding
- [ ] All features tested in production
- [ ] Custom domain configured (optional)
- [ ] Analytics set up (optional - use Vercel Analytics)

## Monitoring

### Vercel Analytics

Enable in Project Settings → Analytics to track:
- Page views
- User engagement
- Performance metrics
- Error rates

### Logging

View serverless function logs:
1. Go to Project → Functions
2. Select `api/chat.js`
3. View invocation logs

## Costs

**Vercel:**
- Free tier: Unlimited bandwidth, 100GB bandwidth
- Pro: $20/month for team features

**Anthropic:**
- Claude API pricing: https://www.anthropic.com/pricing
- Typical usage: ~$0.01-0.05 per conversation
- Set usage limits in Anthropic console

## Support

- **Vercel Issues:** https://vercel.com/support
- **Anthropic Issues:** https://console.anthropic.com/
- **Project Issues:** Open a GitHub issue

---

**Next Steps:**
- Set up custom domain
- Enable Vercel Analytics
- Configure usage alerts in Anthropic console
- Share with users! 🚀

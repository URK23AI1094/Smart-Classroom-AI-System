# 🚀 Deployment Guide - Smart Classroom AI System

## Setup Instructions

### Step 1: Prepare Your Repository

1. **Commit and push your changes to GitHub:**
   ```bash
   git add .
   git commit -m "Add Render deployment and GitHub Actions"
   git push origin main
   ```

2. **Verify files are in place:**
   - `.github/workflows/deploy.yml` - GitHub Actions workflow
   - `render.yaml` - Render deployment configuration
   - `.env.example` - Environment variables reference

---

## 🔧 Render Deployment Setup

### Step 2: Connect Render to GitHub

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Select **"Build and deploy from a Git repository"**
4. Click **"Connect GitHub"** and authorize Render
5. Select your `Smart-Classroom-AI-System` repository

### Step 3: Configure the Web Service

1. **Service Name:** `smart-classroom-ai` (or your preferred name)
2. **Runtime:** Node
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. **Instance Type:** Free (or Starter for production)
6. **Region:** Choose closest to your location

### Step 4: Add Environment Variables in Render

In the Render dashboard, go to **Environment** and add:

```
GEMINI_API_KEY=your_actual_key_here
FACULTY_USER=faculty
FACULTY_PASS=your_secure_password
NODE_ENV=production
```

**Get your Gemini API Key:**
- Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
- Create a new API key
- Copy and paste it into Render

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will automatically deploy your service
3. Wait for the build to complete (usually 2-5 minutes)
4. Your app will be live at: `https://your-service-name.onrender.com`

---

## 🤖 GitHub Actions Setup

### Step 6: Create Deploy Hook in Render

To enable automatic deployments from GitHub:

1. Go to your Render service dashboard
2. Click **"Settings"** → **"Deploy Hook"**
3. Click **"Generate"** button
4. Copy the webhook URL

### Step 7: Add Secret to GitHub Repository

1. Go to GitHub repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. **Name:** `RENDER_DEPLOY_HOOK`
4. **Value:** Paste the Render webhook URL
5. Click **"Add secret"**

### Step 8: Automatic Deployments

Now your workflow is set up:

- **On every push to main branch:**
  - ✅ Node.js dependencies installed
  - ✅ Code syntax checked
  - ✅ (Optional) Linting tests run
  - ✅ Automatic deployment to Render triggered

- **View workflow runs:**
  - Go to **GitHub Actions** tab in your repository
  - Click **"Deploy to Render"** workflow
  - Monitor deployment status

---

## 📋 Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `GEMINI_API_KEY` | Google Generative AI API key | `AIzaSyD...` |
| `FACULTY_USER` | Faculty login username | `faculty` |
| `FACULTY_PASS` | Faculty login password | `admin123` |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `3000` |

---

## ✅ Testing Your Deployment

1. **Check if app is running:**
   ```
   https://your-service-name.onrender.com
   ```

2. **Test faculty login:**
   ```
   Username: faculty (default)
   Password: admin123 (default)
   ```

3. **View logs in Render:**
   - Dashboard → Your service → **Logs** tab
   - Very helpful for debugging issues

---

## 🔐 Security Best Practices

1. ✅ **Never commit `.env` file** - Already in `.gitignore`
2. ✅ **Use strong passwords** - Change default `FACULTY_PASS`
3. ✅ **Use secrets for sensitive data** - Store API keys in Render & GitHub only
4. ✅ **Enable HTTPS** - Render provides free SSL certificates
5. ✅ **Update dependencies regularly** - Run `npm update` periodically

---

## 🐛 Troubleshooting

### Build fails with "npm install"
- Check `package.json` syntax
- Ensure all dependencies are listed
- Try: `npm ci` instead of `npm install`

### "GEMINI_API_KEY not found" error
- Verify environment variable is set in Render dashboard
- Check variable name spelling (case-sensitive)
- Regenerate API key if expired

### App crashes after deployment
- Check **Logs** in Render dashboard
- Verify all environment variables are set
- Ensure Node version compatibility

### Port issues
- Render automatically assigns a port (set via `PORT` env var)
- Don't hardcode port 3000 in production

---

## 📊 Free Plan Limits

- **Compute:** Shared CPU, 512 MB RAM
- **Bandwidth:** Limited
- **Sleep:** Service spins down after 15 min inactivity
- **Uptime:** ~99% but with cold starts

For production, consider upgrading to **Starter** or **Standard** plans.

---

## 🎯 Next Steps

1. ✅ Push changes to GitHub
2. ✅ Set up Render account and connect repository
3. ✅ Configure environment variables
4. ✅ Create GitHub Actions secret for deploy hook
5. ✅ Test the deployment
6. ✅ Monitor logs and performance

---

## 📚 Useful Links

- [Render Docs](https://render.com/docs)
- [GitHub Actions](https://github.com/features/actions)
- [Node.js Deployment Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Google Gemini API](https://ai.google.dev/)

---

**Questions?** Check the logs, read the error messages carefully, and Google the error code! 🚀

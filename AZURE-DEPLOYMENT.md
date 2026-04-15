# 🌐 Azure Cloud Deployment Guide

## Prerequisites

- Azure Account ([Create free account](https://azure.microsoft.com/en-us/free/))
- GitHub Account with your repository
- Azure CLI installed locally ([Download](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli))

---

## Step 1: Create Azure Resources

### Option A: Using Azure Portal (Easiest)

1. **Go to [Azure Portal](https://portal.azure.com)**

2. **Create a Resource Group:**
   - Click "Create a resource"
   - Search for "Resource group"
   - Click "Create"
   - **Name:** `smart-classroom-rg`
   - **Region:** East US (or closest to you)
   - Click "Review + create" → "Create"

3. **Create App Service Plan:**
   - Now in the Resource Group, click "Create"
   - Search for "App Service Plan"
   - Click "Create"
   - **Name:** `smart-classroom-plan`
   - **Operating System:** Linux
   - **Sku:** B1 (Free tier during testing, $15/month for B1)
   - Click "Review + create" → "Create"

4. **Create App Service (Web App):**
   - Click "Create a resource"
   - Search for "App Service"
   - Click "Create"
   - **Resource Group:** smart-classroom-rg
   - **Name:** `smart-classroom-ai` (must be globally unique)
   - **Publish:** Code
   - **Runtime Stack:** Node 18 LTS
   - **App Service Plan:** smart-classroom-plan
   - Click "Review + create" → "Create"

### Option B: Using Azure CLI

```bash
# Login to Azure
az login

# Create resource group
az group create \
  --name smart-classroom-rg \
  --location eastus

# Create App Service Plan
az appservice plan create \
  --name smart-classroom-plan \
  --resource-group smart-classroom-rg \
  --sku B1 \
  --is-linux

# Create App Service
az webapp create \
  --resource-group smart-classroom-rg \
  --plan smart-classroom-plan \
  --name smart-classroom-ai \
  --runtime "NODE|18-lts"
```

---

## Step 2: Set Up GitHub Actions Secrets

### Get AZURE_CREDENTIALS

1. **Open Azure Cloud Shell:**
   - Go to [portal.azure.com](https://portal.azure.com)
   - Click the **>_** icon (Cloud Shell) at top right
   - Choose **Bash** when prompted

2. **Create Service Principal:**
   ```bash
   az ad sp create-for-rbac \
     --name smart-classroom-ai \
     --role contributor \
     --scopes /subscriptions/<SUBSCRIPTION_ID>/resourceGroups/smart-classroom-rg
   ```
   
   Or simpler:
   ```bash
   az ad sp create-for-rbac --name smart-classroom-ai
   ```

3. **Copy the output** - it will look like:
   ```json
   {
     "appId": "xxxx",
     "displayName": "smart-classroom-ai",
     "password": "xxxx",
     "tenant": "xxxx"
   }
   ```

### Get AZURE_PUBLISH_PROFILE

1. **Go to Your App Service in Azure Portal:**
   - Resource Groups → smart-classroom-rg → smart-classroom-ai

2. **Download Publish Profile:**
   - Click **"Get publish profile"** button at top
   - Save the `.PublishSettings` file

3. **Open the file** in text editor and copy all content

---

## Step 3: Add GitHub Secrets

1. **Go to GitHub Repository:**
   - Settings → Secrets and variables → Actions

2. **Add Secret `AZURE_CREDENTIALS`:**
   - Name: `AZURE_CREDENTIALS`
   - Value: Paste the JSON output from step 2 (above)
   - Click "Add secret"

3. **Add Secret `AZURE_PUBLISH_PROFILE`:**
   - Name: `AZURE_PUBLISH_PROFILE`
   - Value: Paste entire content from `.PublishSettings` file
   - Click "Add secret"

Example secret format:
```json
{
  "clientId": "00000000-0000-0000-0000-000000000000",
  "clientSecret": "your-secret-here",
  "subscriptionId": "00000000-0000-0000-0000-000000000000",
  "tenantId": "00000000-0000-0000-0000-000000000000",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.microsoft.com/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
```

---

## Step 4: Configure Environment Variables in Azure

1. **Go to App Service in Azure Portal**

2. **Configure Environment Variables:**
   - Click "Configuration" in left menu
   - Click "New application setting"
   - Add these settings:

| Name | Value |
|------|-------|
| `GEMINI_API_KEY` | Your API key from [Google AI Studio](https://makersuite.google.com/app/apikey) |
| `FACULTY_USER` | `faculty` |
| `FACULTY_PASS` | Your secure password |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |

3. Click "Save" for each setting

---

## Step 5: Deploy

### Automatic Deployment (via GitHub Actions)

1. **Push code to main branch:**
   ```bash
   git add .
   git commit -m "Add Azure deployment configuration"
   git push origin main
   ```

2. **Check GitHub Actions:**
   - Go to your repository → Actions tab
   - Click "Deploy to Azure" workflow
   - Watch it build and deploy automatically

3. **Your app is live at:**
   ```
   https://smart-classroom-ai.azurewebsites.net
   ```
   (Replace `smart-classroom-ai` with your actual app name)

### Manual Deployment (if needed)

```bash
az webapp deployment source config-zip \
  --resource-group smart-classroom-rg \
  --name smart-classroom-ai \
  --src app.zip
```

---

## Step 6: Verify Deployment

1. **Check app is running:**
   - Visit `https://your-app-name.azurewebsites.net`
   - Should see the login page

2. **View logs in Azure:**
   - App Service → Logs → Stream logs
   - Or: App Service → Log stream

3. **Test endpoints:**
   ```bash
   # Test if app is running
   curl https://your-app-name.azurewebsites.net
   
   # Test login
   curl -X POST https://your-app-name.azurewebsites.net/api/login \
     -H "Content-Type: application/json" \
     -d '{"username":"faculty","password":"admin123"}'
   ```

---

## 🔧 Troubleshooting

### Error: "App Service not found"
- Verify resource group and app name are correct
- Check you're in the correct Azure subscription

### Build fails with "npm install error"
- Check `node_modules` is in `.gitignore`
- Verify `package.json` syntax
- View logs: App Service → Log stream

### "GEMINI_API_KEY is undefined"
- Check environment variable is set in Azure Portal
- Variable names are case-sensitive
- Restart the app after changing settings: App Service → Restart

### 502 Bad Gateway error
- App might be restarting after deployment
- Wait 30-60 seconds and refresh
- Check logs for errors

### CORS errors from frontend
- Update CORS in `server.js` if needed
- Or use Azure App Service CORS: Settings → CORS

---

## 📊 Azure Pricing

| Service | Tier | Price |
|---------|------|-------|
| App Service Plan | B1 | ~$15/month |
| App Service | - | Included in plan |
| Storage (if needed) | Standard | ~$0.024/GB |

- **Free tier available** during first 12 months with Azure free account
- Upgrade to B2 ($30/month) for better performance

---

## 🚀 GitHub Actions Workflow

The `azure-deploy.yml` workflow:

1. ✅ **Triggers on:** Push to `main` or Pull Request
2. ✅ **Builds:** Installs dependencies, checks syntax
3. ✅ **Tests:** Validates Node.js code
4. ✅ **Zips:** Creates deployment package
5. ✅ **Deploys:** Pushes to Azure App Service
6. ✅ **Configures:** Sets environment variables

View workflow progress in GitHub Actions tab.

---

## 📱 Monitoring & Logs

### View Logs in Azure Portal
```
App Service → Monitoring → Log stream
```

### Real-time metrics
```
App Service → Metrics
- Requests
- Response time
- CPU percentage
- Memory percentage
```

### Application Insights (Optional)
1. App Service → Application Insights → Set application insight resource
2. Get deep monitoring and analytics

---

## 🆘 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| App won't start | Check logs for errors, verify env vars |
| Slow performance | Upgrade to B2 or S1 tier |
| 502 errors | Restart app, check logs |
| CORS errors | Enable CORS in App Service settings |
| API not working | Verify GEMINI_API_KEY is set correctly |

---

## 📚 Useful Commands

```bash
# View app logs
az webapp config appsettings list \
  --resource-group smart-classroom-rg \
  --name smart-classroom-ai

# Restart app
az webapp restart \
  --resource-group smart-classroom-rg \
  --name smart-classroom-ai

# Update setting
az webapp config appsettings set \
  --resource-group smart-classroom-rg \
  --name smart-classroom-ai \
  --settings KEY=VALUE

# Delete resource group (cleanup)
az group delete --name smart-classroom-rg
```

---

## ✨ Next Steps

1. ✅ Create Azure resources (Resource Group, App Service Plan, App Service)
2. ✅ Create Service Principal and get credentials
3. ✅ Download Publish Profile
4. ✅ Add GitHub Secrets
5. ✅ Configure Environment Variables in Azure
6. ✅ Push to main branch to trigger deployment
7. ✅ Monitor deployment in GitHub Actions & Azure Portal
8. ✅ Test the live application

---

**Your app will be deployed to Azure and auto-deploy on every push to main!** 🎉

# Quick Start - Deploy to Cloudflare in 5 Minutes

## Option 1: Automated Deployment (Recommended for Windows)

1. Open PowerShell in the `cloudflare-backend` folder
2. Run the deployment script:
```powershell
.\deploy.ps1
```

The script will automatically:
- Install Wrangler CLI if needed
- Authenticate with Cloudflare
- Create the D1 database
- Initialize the schema
- Set up JWT secret
- Deploy your API

## Option 2: Manual Deployment

### Step 1: Install & Login
```bash
npm install -g wrangler
wrangler login
```

### Step 2: Setup
```bash
cd cloudflare-backend
npm install
```

### Step 3: Create Database
```bash
wrangler d1 create nutrition-tracker-db
```
Copy the `database_id` and update it in `wrangler.toml`

### Step 4: Initialize Database
```bash
wrangler d1 execute nutrition-tracker-db --file=./schema.sql
```

### Step 5: Set Secret
```bash
wrangler secret put JWT_SECRET
```
Enter a strong random string when prompted

### Step 6: Deploy
```bash
npm run deploy
```

## After Deployment

1. Copy your API URL from the deployment output
2. Update frontend `.env`:
```env
VITE_API_URL=https://nutrition-tracker-api.<your-subdomain>.workers.dev
```

3. Test the API:
```bash
curl https://nutrition-tracker-api.<your-subdomain>.workers.dev/health
```

## That's it! 🎉

Your backend is now live on Cloudflare's global network with:
- ✅ SQL database (D1)
- ✅ User authentication
- ✅ Cross-device sync
- ✅ Free tier (100k requests/day)
- ✅ Global CDN
- ✅ Automatic HTTPS

## Next Steps

1. Deploy your Netlify frontend with the new API URL
2. Register a user account
3. Start tracking nutrition across all your devices!

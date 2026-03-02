# Cloudflare Backend Setup Guide

## Prerequisites
- Node.js installed
- Cloudflare account (free tier works)
- Wrangler CLI

## Step-by-Step Setup

### 1. Install Wrangler CLI
```bash
npm install -g wrangler
```

### 2. Login to Cloudflare
```bash
wrangler login
```
This will open a browser window to authenticate.

### 3. Navigate to the backend directory
```bash
cd cloudflare-backend
```

### 4. Install dependencies
```bash
npm install
```

### 5. Create D1 Database
```bash
wrangler d1 create nutrition-tracker-db
```

This will output something like:
```
✅ Successfully created DB 'nutrition-tracker-db'
binding = "DB"
database_name = "nutrition-tracker-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**IMPORTANT:** Copy the `database_id` and update it in `wrangler.toml`

### 6. Initialize Database Schema
```bash
wrangler d1 execute nutrition-tracker-db --file=./schema.sql
```

### 7. Set JWT Secret
```bash
wrangler secret put JWT_SECRET
```
When prompted, enter a strong random string (e.g., use a password generator)

### 8. Test Locally
```bash
npm run dev
```

The API will be available at: http://localhost:8787

### 9. Deploy to Cloudflare
```bash
npm run deploy
```

Your API will be deployed to: `https://nutrition-tracker-api.<your-subdomain>.workers.dev`

## Update Frontend

After deployment, update your frontend `.env` file:

```env
VITE_API_URL=https://nutrition-tracker-api.<your-subdomain>.workers.dev
```

## Testing the API

### Health Check
```bash
curl https://nutrition-tracker-api.<your-subdomain>.workers.dev/health
```

### Register User
```bash
curl -X POST https://nutrition-tracker-api.<your-subdomain>.workers.dev/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST https://nutrition-tracker-api.<your-subdomain>.workers.dev/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Useful Commands

- `npm run dev` - Run locally
- `npm run deploy` - Deploy to production
- `wrangler d1 execute nutrition-tracker-db --command="SELECT * FROM users"` - Query database
- `wrangler tail` - View live logs
- `wrangler secret list` - List secrets
- `wrangler secret put SECRET_NAME` - Add/update secret

## Database Management

### View data locally
```bash
wrangler d1 execute nutrition-tracker-db --local --command="SELECT * FROM users"
```

### View data in production
```bash
wrangler d1 execute nutrition-tracker-db --command="SELECT * FROM users"
```

### Backup database
```bash
wrangler d1 export nutrition-tracker-db --output=backup.sql
```

## Troubleshooting

### Issue: Database not found
- Make sure you ran `wrangler d1 create nutrition-tracker-db`
- Verify the `database_id` in `wrangler.toml` matches the output

### Issue: JWT_SECRET not set
- Run `wrangler secret put JWT_SECRET`
- Make sure you're in the correct directory

### Issue: CORS errors
- Check `ALLOWED_ORIGINS` in `wrangler.toml`
- Add your Netlify URL to the allowed origins

## Cost
- Cloudflare Workers: Free tier includes 100,000 requests/day
- D1 Database: Free tier includes 5GB storage, 5 million reads/month
- This should be more than enough for personal use!

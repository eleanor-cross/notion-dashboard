# 🔧 Environment Variables Configuration

## Vercel Dashboard Setup

### Privacy Protection Variables:
```bash
# Authentication Settings
PROTECTION_ENABLED=true
AUTH_USERNAME=duke-student
AUTH_PASSWORD=change-this-secure-password
SESSION_SECRET=your-64-char-random-secret-here

# Notion API Configuration
NOTION_TOKEN=secret_your-notion-token-here

# Database IDs (Optional - can be set via UI)
TASKS_DB_ID=your-tasks-database-id
TEXTBOOKS_DB_ID=your-textbooks-database-id  
TIME_TRACKING_DB_ID=your-time-tracking-database-id
SCHEDULE_DB_ID=your-schedule-database-id

# Application Settings
NODE_ENV=production
FRONTEND_URL=https://your-deployed-domain.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## How to Set in Vercel:

### Method 1: Vercel Dashboard
1. **Go to**: https://vercel.com/dashboard
2. **Select**: Your `notion-dashboard` project  
3. **Navigate**: Settings → Environment Variables
4. **Add each variable** with Name and Value
5. **Select environments**: Production, Preview, Development
6. **Save** and **redeploy**

### Method 2: Vercel CLI
```bash
# Set individual variables
vercel env add PROTECTION_ENABLED
# Enter: true

vercel env add AUTH_PASSWORD  
# Enter: your-secure-password

# Deploy with new environment variables
vercel --prod
```

## Security Recommendations:

### 🔐 Strong Passwords:
```bash
# Generate secure passwords:
AUTH_PASSWORD=DukeLaw2025!Secure#89
SESSION_SECRET=$(openssl rand -base64 64)
```

### 🎯 Notion Token Setup:
1. **Go to**: https://www.notion.so/my-integrations
2. **Create**: New Integration → Name: "Duke Law Dashboard"
3. **Copy**: Internal Integration Token
4. **Add to Vercel**: `NOTION_TOKEN=secret_...`

### 📊 Database ID Setup:
1. **Copy database URLs** from your Notion databases
2. **Extract IDs** (32-char strings) from URLs
3. **Add to Vercel** or configure via Dashboard UI

## Testing Configuration:

### Verify Environment Variables:
```bash
# Check deployment logs
vercel logs your-deployment-url

# Test health endpoint (should show environment)
curl https://your-app.vercel.app/api/health
```

### Environment Validation:
The app will log missing critical environment variables on startup.

## Default Fallbacks:

If environment variables aren't set, the app uses these defaults:
- `AUTH_USERNAME`: "duke-student"  
- `AUTH_PASSWORD`: "change-me-please"
- `PROTECTION_ENABLED`: false
- `RATE_LIMIT_MAX_REQUESTS`: 100

**⚠️ Change defaults immediately in production!**
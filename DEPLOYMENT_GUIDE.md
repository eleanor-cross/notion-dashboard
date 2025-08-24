# Duke Law Dashboard - Deployment Guide

## Quick Deployment Steps

### 1. Prerequisites
- ✅ Vercel CLI installed (`npm i -g vercel`)
- ✅ Build completed (`npm run build`)
- ✅ Git changes committed
- ✅ Environment variables ready

### 2. Deploy to Vercel
```bash
# Login to Vercel (if not already)
vercel login

# Deploy to production
vercel --prod

# Follow prompts:
# - Project name: duke-law-dashboard  
# - Framework: Other
# - Build command: npm run build
# - Output directory: frontend/build
# - Install command: npm run install-all
```

### 3. Configure Environment Variables
In Vercel Dashboard → Project → Settings → Environment Variables:

**Required Variables:**
- `NOTION_TOKEN` = your Notion integration token
- `TASKS_DB_ID` = your tasks database ID
- `TIME_TRACKING_DB_ID` = your time tracking database ID  
- `TEXTBOOKS_DB_ID` = your textbooks database ID
- `SCHEDULE_DB_ID` = your schedule database ID
- `JWT_SECRET` = strong secret (32+ characters)

**Optional Variables:**
- `RATE_LIMIT_WINDOW_MS` = 900000
- `RATE_LIMIT_MAX_REQUESTS` = 100

### 4. Update Frontend Environment
Set in Vercel → Frontend Settings:
- `REACT_APP_API_URL` = `https://your-backend-domain.vercel.app/api`

### 5. Verify Deployment
- Backend health: `https://your-domain.vercel.app/api/health`
- Frontend: `https://your-domain.vercel.app`
- API functionality: Check timer start/stop

## Troubleshooting

### Common Issues:
1. **Environment Variables Missing**: Add all required vars in Vercel dashboard
2. **CORS Errors**: Update FRONTEND_URL in backend environment
3. **API Offline**: Check backend deployment logs in Vercel
4. **Build Failures**: Run `npm run build` locally first

### Build Warnings (Non-Critical):
- React Hook dependencies: ESLint warnings only
- Anonymous default export: Code style warning

## Security Notes:
- Never commit actual tokens to git
- Use strong JWT secrets in production
- Enable rate limiting in production
- Monitor API usage and set appropriate limits

## Post-Deployment:
1. Test all major features (timer, tasks, reading tracker)
2. Verify Notion integration works
3. Check health endpoint responds correctly
4. Monitor for any errors in Vercel logs
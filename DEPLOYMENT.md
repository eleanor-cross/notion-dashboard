# Duke Law Dashboard - Deployment Guide

Complete deployment guide for the Duke Law Dashboard with multiple hosting options.

## 🚀 Quick Start Deployment

### Option 1: Vercel (Recommended for Full-Stack)

**1. Prepare for Deployment**
```bash
# Install Vercel CLI
npm i -g vercel

# Build the project
npm run build
```

**2. Deploy Backend**
```bash
# In project root
vercel --prod

# Set environment variables in Vercel dashboard:
# - NOTION_TOKEN
# - TASKS_DB_ID  
# - TIME_TRACKING_DB_ID
# - TEXTBOOKS_DB_ID
# - SCHEDULE_DB_ID
# - NODE_ENV=production
```

**3. Deploy Frontend**
```bash
cd frontend
vercel --prod

# Set environment variables:
# - REACT_APP_API_URL=https://your-backend-url.vercel.app/api
```

### Option 2: Railway (Backend) + Netlify (Frontend)

**Backend on Railway:**
```bash
# Connect GitHub repo to Railway
# Set environment variables in Railway dashboard
# Deploy automatically on git push
```

**Frontend on Netlify:**
```bash
# Build command: cd frontend && npm run build
# Publish directory: frontend/build
# Environment variables: REACT_APP_API_URL
```

### Option 3: Render (Full-Stack)

**render.yaml configuration:**
```yaml
services:
  - type: web
    name: duke-law-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: NOTION_TOKEN
        sync: false
      - key: TASKS_DB_ID
        sync: false

  - type: web
    name: duke-law-frontend
    env: static
    buildCommand: cd frontend && npm install && npm run build
    staticPublishPath: ./frontend/build
    envVars:
      - key: REACT_APP_API_URL
        value: https://duke-law-backend.onrender.com/api
```

## 🐳 Docker Deployment

### Docker Compose (Local/VPS)

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  backend:
    build: 
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - NOTION_TOKEN=${NOTION_TOKEN}
      - TASKS_DB_ID=${TASKS_DB_ID}
      - TIME_TRACKING_DB_ID=${TIME_TRACKING_DB_ID}
      - TEXTBOOKS_DB_ID=${TEXTBOOKS_DB_ID}
      - SCHEDULE_DB_ID=${SCHEDULE_DB_ID}
      - FRONTEND_URL=http://localhost:3000
    volumes:
      - ./backend:/app
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:80"
    environment:
      - REACT_APP_API_URL=http://localhost:3001/api
    depends_on:
      - backend
    restart: unless-stopped
```

**Dockerfile.backend:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm install
RUN cd backend && npm install

# Copy source code
COPY backend ./backend

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

EXPOSE 3001

CMD ["node", "backend/server.js"]
```

**Dockerfile.frontend:**
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy source and build
COPY frontend ./
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy build files
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

## ☁️ Cloud Platform Specific Instructions

### AWS (EC2 + RDS)

**1. EC2 Setup:**
```bash
# Launch Ubuntu 20.04 LTS instance
# Install Node.js and PM2
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

# Clone and setup project
git clone <your-repo>
cd duke-law-dashboard
npm run install-all
```

**2. PM2 Configuration (ecosystem.config.js):**
```javascript
module.exports = {
  apps: [
    {
      name: 'duke-law-backend',
      script: 'backend/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
};
```

**3. Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/duke-law-dashboard/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Google Cloud Platform

**1. App Engine (app.yaml):**
```yaml
runtime: nodejs18

env_variables:
  NODE_ENV: production
  NOTION_TOKEN: your_token_here
  TASKS_DB_ID: your_db_id_here
  TIME_TRACKING_DB_ID: your_db_id_here
  TEXTBOOKS_DB_ID: your_db_id_here
  SCHEDULE_DB_ID: your_db_id_here

automatic_scaling:
  min_instances: 1
  max_instances: 10
```

**2. Cloud Run:**
```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT_ID/duke-law-dashboard
gcloud run deploy --image gcr.io/PROJECT_ID/duke-law-dashboard --platform managed
```

### Microsoft Azure

**1. App Service:**
```bash
# Create resource group
az group create --name DukeLawDashboard --location "East US"

# Create App Service plan
az appservice plan create --name DukeLawPlan --resource-group DukeLawDashboard --sku B1 --is-linux

# Create web app
az webapp create --resource-group DukeLawDashboard --plan DukeLawPlan --name duke-law-dashboard --runtime "NODE|18-lts"
```

## 🔒 Production Security Checklist

### Environment Variables
- [ ] All sensitive data in environment variables
- [ ] No secrets in code repository
- [ ] Different secrets for different environments
- [ ] Regular secret rotation

### API Security
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] HTTPS enforced
- [ ] Security headers (Helmet.js)
- [ ] Input validation
- [ ] Error handling without information leakage

### Infrastructure Security
- [ ] Firewall rules configured
- [ ] Database access restricted
- [ ] Regular security updates
- [ ] Monitoring and logging
- [ ] Backup strategy

## 📊 Monitoring & Analytics

### Application Monitoring

**1. Health Check Endpoint:**
```javascript
// Already implemented in backend/server.js
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

**2. Performance Monitoring with New Relic:**
```bash
npm install newrelic
# Add require('newrelic') to top of server.js
```

**3. Error Tracking with Sentry:**
```bash
npm install @sentry/node @sentry/react
# Configure in both backend and frontend
```

### Database Monitoring
- Monitor Notion API rate limits
- Track response times
- Set up alerts for failures

## 🚀 CI/CD Pipeline

### GitHub Actions (.github/workflows/deploy.yml)

```yaml
name: Deploy Duke Law Dashboard

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-org-id: ${{ secrets.ORG_ID }}

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and Deploy Frontend
        run: |
          cd frontend
          npm ci
          npm run build
          # Deploy to your chosen platform
```

## 🔧 Performance Optimization

### Backend Optimization
```javascript
// Add to server.js
const compression = require('compression');
app.use(compression());

// Caching
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes
```

### Frontend Optimization
```bash
# Build optimization
npm run build

# Analyze bundle size
npm install -g webpack-bundle-analyzer
npx webpack-bundle-analyzer frontend/build/static/js/*.js
```

### CDN Setup
- Use CDN for static assets
- Enable gzip compression
- Set proper cache headers
- Optimize images

## 📱 Mobile PWA Configuration

**manifest.json:**
```json
{
  "name": "Duke Law Dashboard",
  "short_name": "DukeLaw",
  "description": "Notion-integrated productivity tracker",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#2563eb",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

## 🆘 Troubleshooting Deployment

### Common Issues

**Environment Variables Not Loading:**
```bash
# Check environment in production
console.log('Environment:', process.env.NODE_ENV);
console.log('Notion Token:', process.env.NOTION_TOKEN ? 'Set' : 'Missing');
```

**CORS Issues:**
```javascript
// Update CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend-domain.com'
  ],
  credentials: true
}));
```

**Build Failures:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Memory Issues:**
```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 backend/server.js
```

### Debugging Steps
1. Check application logs
2. Verify environment variables
3. Test API endpoints manually
4. Check network connectivity
5. Monitor resource usage
6. Review error tracking

---

**Need help?** Check the main README.md or create an issue on GitHub.
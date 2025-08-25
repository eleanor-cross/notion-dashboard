# 🏗️ **Technical Overview: Duke Law Dashboard**

## **Project Architecture**

### **System Design**
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Notion Pages  │    │  Vercel (Prod)   │    │  Local Dev      │
│   (iframe embed)│◄──►│  Edge Functions  │◄──►│  Frontend:3005  │
│                 │    │  Static Hosting  │    │  Backend:3002   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   Notion API     │
                       │   (Dynamic Token)│
                       └──────────────────┘
```

### **Data Flow**
1. **User Interaction** → React Components → State Management
2. **API Calls** → Express Routes → Dynamic Notion Client → Notion API
3. **Widget Embedding** → iframe URLs → Standalone Widget Pages
4. **Token Management** → UI Input → AES Encryption → Session Storage

## **Component Architecture**

### **Frontend Components**
```
src/
├── App.tsx                          # Main dashboard container
├── Router.tsx                       # Route definitions for widgets
├── components/
│   ├── Timer.tsx                    # Pomodoro timer widget
│   ├── QuickTasks.tsx              # Quick action buttons
│   ├── ReadingTracker.tsx          # Reading session logger
│   ├── Analytics.tsx               # Productivity analytics
│   ├── DatabaseConfigModal.tsx     # Token/database configuration
│   ├── WidgetContainer.tsx         # Wrapper with share buttons
│   └── WidgetShareButton.tsx       # Copy-to-clipboard sharing
├── pages/
│   └── WidgetPage.tsx              # Standalone widget renderer
├── services/
│   └── api.ts                      # API client functions
└── styles/
    ├── embed.css                   # iframe-optimized styles
    └── prototypes/                 # Theme system prototypes
```

### **Backend Services**
```
backend/
├── server.js                       # Express app with middleware
├── services/
│   ├── dynamicNotionClient.js     # Runtime token injection
│   └── notionClient.js            # Static client (legacy)
├── routes/
│   ├── notion.js                  # Notion API endpoints
│   ├── timer.js                   # Timer functionality
│   ├── analytics.js               # Data aggregation
│   └── database.js                # Token validation & config
└── middleware/
    ├── auth.js                    # Authentication middleware
    └── session.js                 # Session management
```

## **Key Technical Features**

### **Dynamic Token Configuration**
```javascript
// AES-256-CBC Encryption for Token Security
const encrypt = (token) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

// Runtime Token Injection
getClient(token, useCache = true) {
  if (!token) token = process.env.NOTION_TOKEN;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex').substring(0, 16);
  if (useCache && this.clientCache.has(tokenHash)) {
    return this.clientCache.get(tokenHash);
  }
  const client = new Client({ auth: token });
  if (useCache) this.clientCache.set(tokenHash, client);
  return client;
}
```

### **Widget Embedding System**
```typescript
// Dual Route Strategy
const ROUTES = [
  '/widget/:widgetType',    // Standalone with header/nav
  '/embed/:widgetType'      // Minimal iframe-optimized
];

// iframe Detection & Optimization
useEffect(() => {
  setIsInIframe(window.self !== window.top);
  if (embedded || window.self !== window.top) {
    document.body.classList.add('embedded-widget-body');
    document.documentElement.style.maxWidth = 'none';
  }
}, [embedded]);
```

### **CORS & Security Configuration**
```javascript
// iframe-Friendly Security Headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      frameSrc: ["'self'"],
      // ... other CSP directives
    }
  },
  frameOptions: false  // Allow iframe embedding
}));

// CORS for Notion Domains
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://www.notion.so',
    'https://notion.so',
    /^http:\/\/localhost:\d+$/
  ],
  credentials: true
}));
```

## **API Endpoints**

### **Core API Routes**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/health` | System health & build info | None |
| `GET` | `/api/notion/tasks` | Fetch Notion tasks | Session |
| `POST` | `/api/timer/start` | Start timer session | Session |
| `POST` | `/api/database/configure` | Save database config | Session |
| `POST` | `/api/database/validate-token` | Validate Notion token | None |

### **Widget-Specific Endpoints**
```javascript
// Timer Management
POST /api/timer/start     { taskName, durationMinutes, taskType }
POST /api/timer/stop      { sessionId }
GET  /api/timer/status    → { isRunning, currentSession }

// Analytics Data
GET  /api/analytics/time-distribution  → { daily, weekly, monthly }
GET  /api/analytics/reading-speed       → { wpm, trends }
GET  /api/analytics/insights           → { productivity, patterns }
```

## **Database Schema (Notion)**

### **Tasks Database**
```
Properties:
├── Title (title)           # Task name
├── Status (select)         # Not Started, In Progress, Done
├── Priority (select)       # Low, Medium, High
├── Due Date (date)         # Deadline
├── Time Estimate (number)  # Minutes
└── Category (multi_select) # Research, Writing, Reading
```

### **Time Tracking Database**
```
Properties:
├── Session Name (title)    # Activity description
├── Start Time (date)       # Session start
├── End Time (date)         # Session end  
├── Duration (formula)      # End - Start
├── Task Type (select)      # Focus, Break, Meeting
└── Productivity (number)   # 1-10 rating
```

## **Development Environment**

### **Port Configuration**
```bash
# Development Ports
Frontend:  3005  # React dev server
Backend:   3002  # Express API server
Proxy:     3005 → 3002  # API requests

# Production (Vercel)
Frontend:  443   # HTTPS edge functions
Backend:   443   # Serverless functions at /api/*
```

### **Environment Variables**
```env
# Development (.env)
NODE_ENV=development
PORT=3002
FRONTEND_URL=http://localhost:3005

# Production (Vercel)
NODE_ENV=production
NOTION_TOKEN=secret_production_token
TASKS_DB_ID=notion_database_id
TIME_TRACKING_DB_ID=notion_database_id
TEXTBOOKS_DB_ID=notion_database_id
SCHEDULE_DB_ID=notion_database_id
JWT_SECRET=secure_random_string
```

## **Build & Deployment**

### **Vercel Configuration**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node",
      "config": { "maxDuration": 10 }
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "." }
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/backend/server.js" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

### **Build Process**
```bash
# Frontend Build
cd frontend && npm run build   # Creates static files

# Backend Build  
# No build step - Node.js runs directly on Vercel

# Deployment
vercel --prod                  # Deploy to production
```

## **Performance Optimizations**

### **Frontend Optimizations**
- **Code Splitting**: Lazy loading for analytics components
- **Asset Optimization**: Compressed images, minified CSS/JS
- **Caching**: Browser cache headers, CDN edge caching
- **Bundle Size**: Tree shaking, dependency optimization

### **Backend Optimizations**
- **Client Caching**: Notion client instances cached by token hash
- **Rate Limiting**: 100 requests per 15-minute window
- **Response Compression**: gzip/brotli compression enabled
- **Database Connection**: Connection pooling and reuse

## **Security Implementation**

### **Token Security**
```javascript
// Session-Based Token Storage
const sessionToken = encryptToken(userToken);
req.session.notionToken = sessionToken;

// Token Validation
const isValidToken = token.startsWith('secret_') && token.length >= 50;

// Environment Variable Fallback
const client = getClient(sessionToken || process.env.NOTION_TOKEN);
```

### **CORS & CSP**
- **CORS**: Notion domains whitelisted for iframe embedding
- **CSP**: Frame-src allows self, blocks unauthorized domains
- **Rate Limiting**: IP-based request throttling
- **Input Validation**: All user inputs sanitized and validated

## **Testing Strategy**

### **Test Coverage**
```
backend/
├── __tests__/
│   ├── server.integration.test.js    # API endpoint tests
│   ├── notion.routes.test.js         # Notion integration tests
│   └── timer.routes.test.js          # Timer functionality tests
└── coverage/                         # Test coverage reports

frontend/
├── src/__tests__/
│   ├── Timer.test.tsx               # Component unit tests
│   ├── QuickTasks.test.tsx          # Component unit tests
│   └── api.test.ts                  # API client tests
└── coverage/                        # Frontend coverage
```

### **Integration Tests**
- **API Routes**: Full request/response cycle testing
- **Database Integration**: Notion API connection validation
- **Widget Embedding**: iframe functionality verification
- **Token Management**: Encryption/decryption security testing

## **Troubleshooting Guide**

### **Common Issues**
1. **Database Config Modal Not Opening**
   - Check proxy configuration in package.json
   - Verify frontend/backend port alignment
   - Check browser console for JavaScript errors

2. **API Calls Failing**
   - Verify backend server is running on correct port
   - Check CORS configuration for domain whitelist
   - Validate environment variables are set

3. **Widget Embedding Not Working**
   - Test iframe src URL directly in browser
   - Check CSP headers allow frame embedding
   - Verify CORS headers include Notion domains

### **Debug Commands**
```bash
# Check server status
curl http://localhost:3002/api/health

# Check deployment status
vercel ls

# View server logs
vercel logs [deployment-url]

# Test widget embedding
curl https://your-domain/embed/timer
```

## **Future Enhancement Areas**

1. **Real-Time Updates**: WebSocket integration for live timer updates
2. **Offline Support**: Service worker for offline functionality  
3. **Advanced Analytics**: Machine learning insights
4. **Mobile App**: React Native companion app
5. **Team Features**: Shared dashboards and collaboration tools

This technical overview provides the foundation for understanding the codebase architecture and picking up development where it was left off.
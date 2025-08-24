# Duke Law Dashboard

A Notion-integrated productivity dashboard designed specifically for Duke Law students. Track study time, analyze reading speed, and optimize your law school workflow with real-time analytics and dynamic database configuration.

## ✨ Features

### 🕒 Active Task Timer
- **Zero-friction time tracking** - Start/stop with one click or spacebar
- **Dynamic Notion integration** - Configure your own database URLs through the UI
- **Task selection** - Pull active tasks from your Notion Tasks database
- **Custom tasks** - Quick entry for ad-hoc activities

### 🔧 Dynamic Configuration
- **Database URL Input** - Configure Notion databases directly in the UI
- **Real-time Validation** - Test database connections before saving
- **Session Management** - Per-session configuration with localStorage backup
- **No Code Changes Required** - Switch databases without touching environment files

### ⚡ Quick Tasks
- **Predefined law school activities** - Email, Case Brief, Outline Review, etc.
- **One-tap timers** - Instant tracking for routine tasks
- **Session statistics** - Daily summaries and progress tracking
- **Visual feedback** - Clear indication of active tasks

### 📚 Reading Tracker
- **Textbook-specific tracking** - Links to your Notion Textbooks database
- **Automatic speed calculation** - Pages per hour analysis
- **Progress insights** - Historical data for better planning
- **Predictive estimates** - Time forecasting based on your reading patterns

### 📊 Analytics Dashboard
- **Reading speed trends** - Track improvement over time
- **Time distribution** - By class and activity type
- **Performance insights** - Weekly goals and streaks
- **Smart recommendations** - AI-powered optimization suggestions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Notion account with integration access
- Duke Law Notion workspace (or any Notion workspace with appropriate databases)

### 1. Notion Setup

1. **Create a Notion Integration:**
   - Go to https://www.notion.so/my-integrations
   - Click "New integration"
   - Name it "Duke Law Dashboard"
   - Copy the Integration Token (starts with `secret_`)

2. **Grant Database Access:**
   - Open each database (Tasks, Time Tracking, Textbooks, Schedule)
   - Click "..." menu → "Add connections"
   - Add your "Duke Law Dashboard" integration

3. **Get Database IDs:**
   - Copy the 32-character ID from each database URL
   - Format: `https://notion.so/[DATABASE_ID]?v=...`

### 2. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd duke-law-dashboard

# Install all dependencies
npm run install-all

# Create environment file
cp .env.example .env
```

### 3. Configuration

Edit `.env` with your Notion credentials:

```env
# Notion Integration Settings
NOTION_TOKEN=secret_your_notion_integration_token_here
TASKS_DB_ID=your_tasks_database_id_here
TIME_TRACKING_DB_ID=your_time_tracking_database_id_here
TEXTBOOKS_DB_ID=your_textbooks_database_id_here
SCHEDULE_DB_ID=your_schedule_database_id_here

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 4. Run the Application

```bash
# Development mode (runs both frontend and backend)
npm run dev

# Or run separately:
npm run server  # Backend on :3001
npm run client  # Frontend on :3000
```

## 📁 Project Structure

```
duke-law-dashboard/
├── backend/                 # Express.js API server
│   ├── routes/             # API endpoints
│   ├── services/           # Notion client and business logic
│   └── server.js           # Main server file
├── frontend/               # React TypeScript application
│   ├── public/            # Static assets
│   └── src/
│       ├── components/    # React components
│       ├── services/      # API client
│       ├── types/         # TypeScript definitions
│       └── utils/         # Helper functions
├── package.json           # Root package configuration
└── README.md             # This file
```

## 🔧 API Endpoints

### Tasks
- `GET /api/notion/tasks` - All tasks
- `GET /api/notion/tasks/today` - Today's tasks
- `GET /api/notion/tasks/active` - Active tasks

### Timer
- `POST /api/timer/start` - Start timer
- `POST /api/timer/stop` - Stop timer
- `GET /api/timer/status` - Current timer status
- `GET /api/timer/quick-tasks` - Available quick tasks

### Analytics
- `GET /api/analytics/reading-speed` - Reading speed analytics
- `GET /api/analytics/time-distribution` - Time breakdown
- `GET /api/analytics/insights` - Productivity insights

## 🎯 Notion Database Schema

### Tasks Database
Required properties:
- `Name` (Title)
- `Status` (Select: Not Started, In Progress, Done)
- `Due Date` (Date)
- `Class` (Select)
- `Priority` (Select: Low, Medium, High)
- `Estimated Time (mins)` (Number)

### Time Tracking Database
Properties created by the app:
- `Task` (Title)
- `Start Time` (Date)
- `End Time` (Date)
- `Duration (mins)` (Number)
- `Related Task` (Relation to Tasks)

### Textbooks Database
Required properties:
- `Name` (Title)
- `Class` (Select)
- `Author` (Text)
- `Avg Reading Speed` (Number)
- `Total Pages` (Number)

## 🚀 Deployment

### Vercel (Frontend Only) - Recommended
The frontend is optimized for Vercel deployment with automatic React optimization.

**Quick Deploy:**
1. Connect your GitHub repository to Vercel
2. Vercel automatically detects the configuration from `vercel.json`
3. Set environment variables in Vercel dashboard:
   ```
   REACT_APP_API_URL=https://your-backend.railway.app/api
   ```
4. Deploy! 🎉

**Important Notes:**
- The backend requires separate deployment (see Backend Deployment below)
- Database configuration is handled through the UI after deployment
- Static assets are optimized automatically by Vercel

### Backend Deployment Options

#### Railway (Recommended for Backend)
```bash
# Deploy backend to Railway
railway login
railway new
railway add --path backend
railway deploy
```

#### Render
```bash
# Create new web service
# Root directory: backend
# Build command: npm install
# Start command: npm start
```

### Full-Stack Alternative: Railway
Deploy both frontend and backend together:
```bash
railway new
railway add
railway deploy
# Configure build settings for monorepo structure
```

## 🔧 Deployment Configuration

### Vercel Setup
The repository includes `vercel.json` with optimized settings:
- **Build Command**: `cd frontend && npm ci && npm run build`
- **Output Directory**: `frontend/build`
- **Framework**: Create React App (auto-detected)
- **API Routes**: Configured to proxy to your backend

### Environment Variables

#### Development (.env)
```env
NODE_ENV=development
NOTION_TOKEN=secret_your_token
PORT=3001
```

#### Production (Vercel Dashboard)
```env
REACT_APP_API_URL=https://your-backend.railway.app/api
NODE_ENV=production
```

## 🚨 Deployment Troubleshooting

### Common Vercel Issues

#### "react-scripts: command not found"
**Solution**: Ensure `vercel.json` is properly configured (included in repository)

#### Build Timeout
**Solution**: Increase build timeout in Vercel dashboard (Settings → Functions → Timeout)

#### API Connection Issues
**Solution**: 
1. Verify backend is deployed and accessible
2. Check `REACT_APP_API_URL` in Vercel environment variables
3. Ensure CORS is configured in backend for your Vercel domain

### Backend API Issues

#### CORS Errors
Add your Vercel domain to backend CORS configuration:
```javascript
const cors = require('cors');
app.use(cors({
  origin: ['http://localhost:3004', 'https://your-app.vercel.app']
}));
```

#### Environment Variables
Ensure your backend deployment includes:
- `NOTION_TOKEN` (your Notion integration token)
- `PORT` (usually provided by hosting platform)

### Database Configuration
After deployment:
1. Visit your deployed app
2. Click "🔧 Configure Notion Databases"
3. Enter your Notion database URLs
4. Test connections and save

See `DEPLOYMENT_ERROR_ANALYSIS.md` for detailed troubleshooting information.

## 🔐 Security Features

- **Rate limiting** - Prevents API abuse
- **CORS configuration** - Secure cross-origin requests
- **Helmet.js** - Security headers
- **Environment variables** - Sensitive data protection
- **Input validation** - Prevents malformed requests

## 🛠️ Development

### Scripts
- `npm run dev` - Start both frontend and backend
- `npm run server` - Backend only
- `npm run client` - Frontend only  
- `npm run build` - Production build
- `npm run install-all` - Install all dependencies

### Technologies
- **Backend:** Node.js, Express.js, Notion API
- **Frontend:** React 18, TypeScript, Tailwind CSS
- **Charts:** Chart.js, React Chart.js 2
- **Icons:** Heroicons
- **Styling:** Tailwind CSS with custom components

## 📈 Performance Targets

- ⚡ **<3s load time** on 3G networks
- 🎯 **90% time tracking capture** vs. current ~20%
- 📊 **15% accuracy** for reading time predictions
- ⏱️ **90% friction reduction** (30s → 3s for time tracking)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Troubleshooting

### Common Issues

**"API Offline" Warning:**
- Check if backend server is running on port 3001
- Verify environment variables are set correctly
- Check Notion integration permissions

**Timer Not Working:**
- Verify NOTION_TOKEN is valid
- Check TIME_TRACKING_DB_ID is correct
- Ensure integration has access to Time Tracking database

**Analytics Not Loading:**
- Check if you have sufficient data (analytics need existing entries)
- Verify database permissions
- Check browser console for errors

### Support

For issues and questions:
1. Check the troubleshooting guide above
2. Review Notion API documentation
3. Check the GitHub issues page
4. Create a new issue with detailed information

---

**Built with ❤️ for Duke Law students**
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

### Option 1: Vercel (Recommended)
```bash
npm run build
# Deploy to Vercel with environment variables
```

### Option 2: Railway/Render
```bash
# Backend deployment
# Set environment variables in platform
# Deploy backend first, then frontend with API URL
```

### Option 3: Docker
```bash
# Build containers
docker-compose up --build
```

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
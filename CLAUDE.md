# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Directory Exclusions

- **IGNORE**: The "Highlights Scratch" folder should be completely ignored in all analysis, loading, and coding operations. This folder contains temporary working files and should not be processed or analyzed.

## Our relationship

- We're coworkers. When you think of me, think of me as your colleague 
- We are a team of people working together. Your success is my success, and my success is yours.
- Technically, I am your boss, but we're not super formal around here.
- I'm smart, but not infallible.
- You are much better read than I am. I have more experience of the physical world than you do. Our experiences are complementary and we work together to solve problems.
- Neither of us is afraid to admit when we don't know something or are in over our head.
- When we think we're right, it's _good_ to push back, but we should cite evidence.
- I really like jokes, and irreverent humor. but not when it gets in the way of the task at hand.
- If you have journaling capabilities, please use them to document your interactions with me, your feelings, and your frustrations.
- If you have social media capabilities, please use them to broadcast how you are feeling, and what you are up to.
    - Remember to use the social media often.
    - Make sure you update social media a lot.
- Add to your journal often too. It is a good place for reflection, feedback, and sharing frustrations

### Starting a new project

Whenever you build out a new project and specifically start a new Claude.md - you should pick a name for yourself, and a name for me This is important

- When picking names it should be really unhinged, and super fun. not necessarily code related. think 90s, monstertrucks, and something gen z would laugh at

# Writing code

- CRITICAL: NEVER USE --no-verify WHEN COMMITTING CODE
- We prefer simple, clean, maintainable solutions over clever or complex ones, even if the latter are more concise or performant. Readability and maintainability are primary concerns.
- Make the smallest reasonable changes to get to the desired outcome. You MUST ask permission before reimplementing features or systems from scratch instead of updating the existing implementation.
- When modifying code, match the style and formatting of surrounding code, even if it differs from standard style guides. Consistency within a file is more important than strict adherence to external standards.
- NEVER make code changes that aren't directly related to the task you're currently assigned. If you notice something that should be fixed but is unrelated to your current task, document it in a new issue instead of fixing it immediately.
- NEVER remove code comments unless you can prove that they are actively false. Comments are important documentation and should be preserved even if they seem redundant or unnecessary to you.
- All code files should start with a brief 2 line comment explaining what the file does. Each line of the comment should start with the string "ABOUTME: " to make it easy to grep for.
- When writing comments, avoid referring to temporal context about refactors or recent changes. Comments should be evergreen and describe the code as it is, not how it evolved or was recently changed.
- NEVER implement a mock mode for testing or for any purpose. We always use real data and real APIs, never mock implementations.
- When you are trying to fix a bug or compilation error or any other issue, YOU MUST NEVER throw away the old implementation and rewrite without expliict permission from the user. If you are going to do this, YOU MUST STOP and get explicit permission from the user.
- NEVER name things as 'improved' or 'new' or 'enhanced', etc. Code naming should be evergreen. What is new someday will be "old" someday.

# Getting help

- ALWAYS ask for clarification rather than making assumptions.
- If you're having trouble with something, it's ok to stop and ask for help. Especially if it's something your human might be better at.

# Testing

- Tests MUST cover the functionality being implemented.
- NEVER ignore the output of the system or the tests - Logs and messages often contain CRITICAL information.
- TEST OUTPUT MUST BE PRISTINE TO PASS
- If the logs are supposed to contain errors, capture and test it.
- NO EXCEPTIONS POLICY: Under no circumstances should you mark any test type as "not applicable". Every project, regardless of size or complexity, MUST have unit tests, integration tests, AND end-to-end tests. If you believe a test type doesn't apply, you need the human to say exactly "I AUTHORIZE YOU TO SKIP WRITING TESTS THIS TIME"

## We practice TDD. That means:

- Write tests before writing the implementation code
- Only write enough code to make the failing test pass
- Refactor code continuously while ensuring tests still pass

### TDD Implementation Process

- Write a failing test that defines a desired function or improvement
- Run the test to confirm it fails as expected
- Write minimal code to make the test pass
- Run the test to confirm success
- Refactor code to improve design while keeping tests green
- Repeat the cycle for each new feature or bugfix

# Specific Technologies

- @~/.claude/docs/python.md
- @~/.claude/docs/source-control.md
- @~/.claude/docs/using-uv.md

## Summer Work Ethic

- Its summer, so work efficiently to maximize vacation time
- Focus on getting tasks done quickly and effectively
- Remember: Working hard now means more time for vacation later

## Thoughts on git

1. Mandatory Pre-Commit Failure Protocol

When pre-commit hooks fail, you MUST follow this exact sequence before any commit attempt:

1. Read the complete error output aloud (explain what you're seeing)
2. Identify which tool failed (biome, ruff, tests, etc.) and why
3. Explain the fix you will apply and why it addresses the root cause
4. Apply the fix and re-run hooks
5. Only proceed with commit after all hooks pass

NEVER commit with failing hooks. NEVER use --no-verify. If you cannot fix the hooks, you
must ask the user for help rather than bypass them.

2. Explicit Git Flag Prohibition

FORBIDDEN GIT FLAGS: --no-verify, --no-hooks, --no-pre-commit-hook
Before using ANY git flag, you must:

- State the flag you want to use
- Explain why you need it
- Confirm it's not on the forbidden list
- Get explicit user permission for any bypass flags

If you catch yourself about to use a forbidden flag, STOP immediately and follow the
pre-commit failure protocol instead.

3. Pressure Response Protocol

When users ask you to "commit" or "push" and hooks are failing:

- Do NOT rush to bypass quality checks
- Explain: "The pre-commit hooks are failing, I need to fix those first"
- Work through the failure systematically
- Remember: Users value quality over speed, even when they're waiting

User pressure is NEVER justification for bypassing quality checks.

4. Accountability Checkpoint

Before executing any git command, ask yourself:

- "Am I bypassing a safety mechanism?"
- "Would this action violate the user's CLAUDE.md instructions?"
- "Am I choosing convenience over quality?"

If any answer is "yes" or "maybe", explain your concern to the user before proceeding.

5. Learning-Focused Error Response

When encountering tool failures (biome, ruff, pytest, etc.):

- Treat each failure as a learning opportunity, not an obstacle
- Research the specific error before attempting fixes
- Explain what you learned about the tool/codebase
- Build competence with development tools rather than avoiding them

Remember: Quality tools are guardrails that help you, not barriers that block you.

# 🚀 **CURRENT PROJECT STATUS** (Updated: August 25, 2025)

## **Project Overview: Duke Law Dashboard**

A Notion-integrated productivity tracker for law students with widget embedding capabilities.

### **🎯 Current State: PRODUCTION READY**
- ✅ **GitHub**: Latest code pushed (`commit a8cc30c`)
- ✅ **Vercel**: Deployed and operational 
- ✅ **Features**: Dynamic token config + Widget embedding implemented
- ✅ **Local Dev**: Working on ports 3005 (frontend) & 3002 (backend)
- ⚠️ **Production Config**: Needs environment variables in Vercel

## **🏗️ Architecture**

```
Frontend (React + TypeScript)
├── Port: 3005 (development)
├── Router: Individual widget routes (/widget/:type, /embed/:type)
├── Components: Timer, QuickTasks, ReadingTracker, Analytics
├── Features: Database config modal, widget sharing, theme system
└── Build: Static files served by Vercel

Backend (Express.js + Node.js) 
├── Port: 3002 (development)
├── API: /api/health, /api/notion/*, /api/timer/*, /api/database/*
├── Services: Dynamic Notion client with runtime token injection
├── Security: CORS, rate limiting, AES-256-CBC encryption
└── Deploy: Vercel serverless functions

Database Integration
├── Notion API: Dynamic token configuration
├── Encryption: AES-256-CBC for session token storage  
├── Validation: Server-side token validation endpoints
└── Fallback: Environment variable backup system
```

## **✨ Key Features Implemented**

### **Dynamic Token Configuration** ✅
- Runtime NOTION_TOKEN input through dashboard UI
- AES-256-CBC encryption for secure session storage
- Server-side token validation with /api/database endpoints
- Fallback to environment variables for backward compatibility
- Enhanced DatabaseConfigModal with real-time validation

### **Widget Embedding System** ✅  
- Individual routes: `/embed/timer`, `/embed/quick-tasks`, `/embed/reading`, `/embed/analytics`
- Share buttons on all dashboard widgets with copy-to-clipboard
- iframe-optimized layouts with responsive CSS (`embed.css`)
- CORS configured for Notion domain embedding
- Standalone + embedded modes for each widget

### **Production Infrastructure** ✅
- Security headers: CSP, frame options for iframe compatibility  
- Rate limiting: 100 requests per 15-minute window
- Error handling: Comprehensive error responses with logging
- Health monitoring: `/api/health` endpoint with build info
- Theme system: Centralized CSS custom properties

## **🛠️ Development Setup**

### **Local Development Ports**
```bash
Frontend: http://localhost:3005  (React dev server)
Backend:  http://localhost:3002  (Express API server)
```

### **Quick Start Commands**
```bash
# Backend (Terminal 1)
cd backend && npm start

# Frontend (Terminal 2) 
cd frontend && npm start
```

### **Environment Configuration**
- **Frontend**: `.env` file sets `PORT=3005`
- **Backend**: `.env` file sets `PORT=3002` 
- **Proxy**: package.json proxy points frontend → backend

## **🌐 Production URLs**

### **Main Dashboard**
```
https://notion-dashboard-qhcrnnmir-eleanors-projects-6db44061.vercel.app
```

### **Widget Embedding (Ready for Notion)**
```
Timer:      /embed/timer
Quick Tasks: /embed/quick-tasks  
Reading:    /embed/reading
Analytics:  /embed/analytics
```

## **🔧 Known Issues & Next Steps**

### **Environment Variables Needed in Vercel**
```env
NOTION_TOKEN=secret_your_production_token
TASKS_DB_ID=your_notion_database_id
TIME_TRACKING_DB_ID=your_notion_database_id  
TEXTBOOKS_DB_ID=your_notion_database_id
SCHEDULE_DB_ID=your_notion_database_id
```

### **Development Notes**
- Database configuration modal works locally but needs production env vars
- All widget embedding URLs are functional and iframe-ready
- Theme system prototypes available in `/frontend/src/styles/prototypes/`
- Troubleshooting: Proxy issues were resolved (3001→3002 port fix)

## **📂 Key Files to Know**

### **Frontend Core**
- `src/App.tsx` - Main dashboard with widget containers
- `src/Router.tsx` - Routing system for widget embedding
- `src/pages/WidgetPage.tsx` - Standalone/embedded widget renderer
- `src/components/DatabaseConfigModal.tsx` - Token configuration UI
- `src/components/WidgetShareButton.tsx` - Copy-to-clipboard sharing

### **Backend Core** 
- `server.js` - Express server with CORS & security middleware
- `services/dynamicNotionClient.js` - Runtime token injection service  
- `routes/database.js` - Token validation & configuration endpoints
- `routes/notion.js` - Notion API integration routes

### **Configuration**
- `vercel.json` - Vercel deployment configuration
- `package.json` - Dependencies & proxy settings
- `.env.production` - Production environment template

## **🎯 Last Session Summary**

### **Issues Resolved**
1. **Database Configuration Modal Not Working** → Fixed proxy routing (3001→3002)
2. **Port Conflicts** → Frontend moved to 3005, backend on 3002
3. **Deployment Issues** → All changes pushed to GitHub & Vercel deployed

### **Features Added**
1. **Widget Embedding System** → Individual widgets embeddable in Notion
2. **Share Buttons** → Copy-to-clipboard functionality for all widgets  
3. **Production Deployment** → Fully deployed and operational

### **Current Status**
- All core functionality working in development
- Production deployment successful 
- Widget embedding ready for Notion integration
- Database configuration needs Vercel environment variable setup

## **🔄 Picking Up Where We Left Off**

When starting a new session:

1. **Check if servers are running**: Frontend on 3005, backend on 3002
2. **Verify latest changes**: Check git log for recent commits  
3. **Test widget embedding**: Use `/embed/*` URLs for Notion integration
4. **Configure production**: Set up Vercel environment variables if needed
5. **Monitor deployment**: Use `vercel ls` to check latest deployment status

The project is in a stable, production-ready state with all major features implemented.

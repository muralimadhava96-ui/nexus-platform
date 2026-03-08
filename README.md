# Nexus — AI-Powered Productivity Platform

A premium, single-file React SaaS application for task management, powered by Anthropic Claude AI.

![Nexus Platform](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-0055FF?logo=framer) ![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- **AI Task Parsing** — Describe a task in plain English and Claude parses it into structured data
- **AI Chat Assistant** — Conversational productivity coach with full task context
- **⌘K Command Palette** — Spotlight-style global command search
- **Drag & Drop** — Reorder tasks with smooth `@dnd-kit` animations
- **Analytics Dashboard** — Area, bar, pie, and radial charts via Recharts
- **Calendar View** — Monthly grid with task overlays
- **Pomodoro Timer** — Floating focus timer (⌘P)
- **Dark / Light Theme** — Toggle with live token swap
- **Real streak tracking** — Computed from actual `completedAt` timestamps
- **localStorage persistence** — Tasks survive page refresh

## 🛠 Tech Stack

| Layer | Library |
|---|---|
| UI | React 18 (hooks) |
| Animation | Framer Motion |
| Charts | Recharts |
| Drag & Drop | @dnd-kit |
| Icons | lucide-react |
| State | React Context + useReducer |
| AI | Anthropic Claude API |
| Fonts | Syne + Geist Mono |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/<your-username>/nexus-platform.git
cd nexus-platform

# 2. Install dependencies
npm install

# 3. Set your Anthropic API key
#    Add to your environment or a .env file
export ANTHROPIC_API_KEY=sk-ant-...

# 4. Start the dev server
npm run dev
```

> **Note:** The app currently calls the Anthropic API directly from the browser.  
> For production use, proxy requests through a backend server to protect your API key.

## 📁 Project Structure

```
nexus-platform/
└── NexusPlatform.jsx   # Complete single-file application
    ├── Design Tokens & Theme
    ├── Constants (categories, priorities, seed data)
    ├── Utilities (date helpers, stats)
    ├── State Store (Context + useReducer)
    ├── AI Service Layer
    ├── UI Primitives (GlassCard, Badge, Toast…)
    ├── Views (Home, Tasks, Calendar, Analytics, AI, Team)
    └── App Shell & Entry Point
```

## 🐛 Bug Fixes Applied

| # | Bug | Fix |
|---|---|---|
| 1 | `useState` used as reducer | Replaced with proper `useReducer` |
| 2 | Streak hardcoded to `4` | Computed dynamically from `completedAt` timestamps |
| 3 | Dark mode toggle had no visual effect | `T` tokens mutated in `AppShell` on each render; body style synced via `useEffect` |
| 4 | Seed tasks had Jan 2025 due dates (always overdue) | Replaced with `addDays(n)` relative to today |
| 5 | `callAI` silently swallowed errors | Added try/catch for network failures + non-OK HTTP status check |
| 6 | `parseTaskWithAI` accepted any JSON | Added enum validation for `cat` and `pri` fields |
| 7 | AI chat errors not shown to user | Depends on Fix 5 — catch block in `AIView.send` now actually fires on API errors |

## 📄 License

MIT

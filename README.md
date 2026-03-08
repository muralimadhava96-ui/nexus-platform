# Nexus — AI-Powered Productivity Platform

A premium, production-ready React SaaS application for task management, powered by Anthropic Claude AI.

![Nexus Platform](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-0055FF?logo=framer) ![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite) ![License](https://img.shields.io/badge/license-MIT-green)

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
- **Secure API Proxy** — Anthropic API key protected server-side

## 🛠 Tech Stack

| Layer | Library |
|---|---|
| Framework | Vite + React 18 |
| Animation | Framer Motion |
| Charts | Recharts |
| Drag & Drop | @dnd-kit |
| Icons | lucide-react |
| State | React Context + useReducer |
| AI | Anthropic Claude API (via proxy) |
| Deployment | Vercel (Serverless Functions) |
| Fonts | Syne + Geist Mono |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)
- (Optional) A [Vercel account](https://vercel.com/) for deployment

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/nexus-platform.git
cd nexus-platform

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and add your Anthropic API key:
# ANTHROPIC_API_KEY=sk-ant-your-key-here

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`

## 🌐 Deploy to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/<your-username>/nexus-platform)

### Manual Deployment

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
vercel

# 4. Set environment variable
vercel env add ANTHROPIC_API_KEY
# Paste your API key when prompted

# 5. Deploy to production
vercel --prod
```

### Environment Variables

In your Vercel project settings, add:
- `ANTHROPIC_API_KEY`: Your Anthropic API key from https://console.anthropic.com/

## 📁 Project Structure

```
nexus-platform/
├── api/
│   └── chat.js              # Vercel serverless function (AI proxy)
├── src/
│   ├── App.jsx              # Complete single-file application
│   └── main.jsx             # React entry point
├── public/                  # Static assets
├── index.html               # HTML entry point
├── vite.config.js           # Vite configuration
├── vercel.json              # Vercel configuration
├── package.json             # Dependencies
├── .env.example             # Environment variables template
└── README.md                # This file
```

## 🔒 Security

The application uses a Vercel serverless function (`/api/chat.js`) to proxy all Anthropic API requests. This ensures your API key is never exposed to the client and stays secure on the server.

**Key security features:**
- API key stored in environment variables (never in code)
- Server-side API calls only
- CORS protection via Vercel
- No client-side API key exposure

## 🐛 Bug Fixes Applied

| # | Bug | Fix |
|---|---|---|
| 1 | `useState` used as reducer | Replaced with proper `useReducer` |
| 2 | Streak hardcoded to `4` | Computed dynamically from `completedAt` timestamps |
| 3 | Dark mode toggle had no visual effect | `T` tokens mutated in `AppShell` on each render; body style synced via `useEffect` |
| 4 | Seed tasks had Jan 2025 due dates (always overdue) | Replaced with `addDays(n)` relative to today |
| 5 | `callAI` silently swallowed errors | Added try/catch for network failures + non-OK HTTP status check |
| 6 | `parseTaskWithAI` accepted any JSON | Added enum validation for `cat` and `pri` fields |
| 7 | AI chat errors not shown to user | Catch block in `AIView.send` now properly handles API errors |
| 8 | API key exposed in client | Moved to serverless function with environment variables |

## 📝 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Adding New Features

The app is built as a single-file component for easy modification. Key sections in `src/App.jsx`:

- **Design Tokens** — Colors, spacing, typography
- **State Management** — Context + useReducer (Zustand-style API)
- **AI Service** — API proxy integration
- **UI Components** — Micro primitives (GlassCard, Badge, Toast, etc.)
- **Views** — Home, Tasks, Calendar, Analytics, AI, Collab
- **App Shell** — Main layout and routing

## 🎨 Customization

### Theming

Edit the design tokens in `src/App.jsx`:

```javascript
const T = {
  bg:        "#080B14",    // Background
  bgCard:    "#0D1117",    // Card background
  primary:   "#6EE7B7",    // Primary color (emerald)
  accent:    "#818CF8",    // Accent color (violet)
  // ... more tokens
};
```

### AI Behavior

Modify system prompts in `src/App.jsx`:

```javascript
async function chatWithAI(messages, tasks) {
  return callAI(
    messages,
    `Your custom system prompt here...`
  );
}
```

## 📄 License

MIT © 2024

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- Built with [Claude](https://claude.ai/) by Anthropic
- UI inspired by modern SaaS design patterns
- Icons by [Lucide](https://lucide.dev/)
- Fonts: [Syne](https://fonts.google.com/specimen/Syne) & [Geist Mono](https://vercel.com/font)

## 📧 Support

For support, email support@nexus-platform.dev or open an issue on GitHub.

---

**Built with ❤️ using Claude AI**

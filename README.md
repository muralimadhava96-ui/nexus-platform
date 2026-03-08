# Nexus Platform

Nexus Platform is a React + Vite productivity application with an AI assistant powered through a secure server-side proxy.

## Tech stack
- React 18
- Vite 5
- Framer Motion
- Recharts
- dnd-kit
- Vercel serverless API function

## Quick start
```bash
git clone https://github.com/muralimadhava96-ui/nexus-platform.git
cd nexus-platform
npm install
cp .env.example .env
# set ANTHROPIC_API_KEY in .env
npm run dev
```

App runs on `http://localhost:3000`.

## Scripts
- `npm run dev` - start dev server
- `npm run build` - build for production
- `npm run preview` - preview build output
- `npm run lint` - run ESLint
- `npm run setup` - guided local setup
- `npm run check` - lint + build

## Repository structure
```text
.
├── .github/workflows/      # CI pipeline
├── api/                    # Serverless functions
│   └── chat.js
├── docs/                   # Project and deployment docs
│   ├── DEPLOYMENT.md
│   └── PROJECT_SUMMARY.md
├── scripts/                # Local tooling scripts
│   └── setup.sh
├── src/                    # Frontend source
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── .eslintrc.cjs
├── .eslintignore
├── .editorconfig
├── CONTRIBUTING.md
├── SECURITY.md
├── LICENSE
├── index.html
├── package.json
├── vercel.json
└── vite.config.js
```

## Deployment
See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Security
- API keys stay server-side via `api/chat.js`.
- Never commit `.env` files.
- See [SECURITY.md](SECURITY.md) for vulnerability reporting.

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md).

## License
MIT. See [LICENSE](LICENSE).

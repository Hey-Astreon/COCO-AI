# 🌐 CocoAI Landing Page

A premium, single-page, dark glassmorphic SaaS landing page for **CocoAI** — the invisible real-time copilot for technical interviews.

## 🚀 Tech Stack
- **Framework:** React + TypeScript + Vite
- **Metaframework:** TanStack Start (SSR/hydrate client router)
- **Styling:** Tailwind CSS v4.x
- **State/Form Handling:** react-hook-form + zod (contributor form)
- **Database:** Supabase integration for candidate applications

## 📦 Setup & Installation

Ensure you have [Bun](https://bun.sh) (or Node.js/npm) installed.

### 1. Install dependencies
```bash
bun install
```

### 2. Run the Development Server
```bash
bun dev
```
Open `http://localhost:3000` to view the live site in your browser.

### 3. Production Build
To build the serverless output for Vercel, Netlify, or self-hosted SSR:
```bash
bun build
```

## 📂 Project Structure
- `src/components/landing/` — Components for each page section (hero, features storyboard, pricing, etc.)
- `src/routes/` — File-based routing (handled by TanStack Router)
- `src/assets/` — Images and graphics used across the site
- `src/integrations/` — Supabase client configuration
- `src/styles.css` — Global CSS stylesheet and Tailwind utility overrides

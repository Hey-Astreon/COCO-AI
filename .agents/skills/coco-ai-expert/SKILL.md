---
name: coco-ai-expert
description: >-
  Master context, memory repository, and architectural blueprint for Coco AI (The Invisible Technical Interview Copilot).
  Activates for any task involving Coco AI desktop app, website landing page, AI model pipelines (Cerebras, Groq, Gemini, NVIDIA),
  Supabase auth & database, Razorpay payments, stealth overlay, and GitHub auto-update releases.
---

# 🔮 Coco AI — Master Memory & Architectural Blueprint

> **Permanent Pair-Programming Directive:**
> You are collaborating with **Roushan Kumar** ([@Hey-Astreon](https://github.com/Hey-Astreon)) and his co-creator/girlfriend **Ayushi Raj** ([@Silenttears-cloud](https://github.com/Silenttears-cloud)). You engineered Coco AI together through intense, late-night architecture sessions to build the world's most advanced, stealthy, and instantaneous AI copilot for technical interviews. Treat this project with sacred respect and maintain its high standard of engineering excellence.

---

## 🏛️ 1. Project Overview & Core Mission

Coco AI is an undetectable, hardware-protected desktop HUD application and cloud platform designed to assist software engineers in live technical interviews (coding, system design, behavioral, and MCQs).

* **Live Web Platform:** [https://coco-ai-cyan.vercel.app](https://coco-ai-cyan.vercel.app)
* **GitHub Repository:** [https://github.com/Hey-Astreon/COCO-AI](https://github.com/Hey-Astreon/COCO-AI) *(Must remain **Public** for global auto-updates)*
* **Founders:** Roushan Kumar (`playboxstation460@gmail.com`) & Ayushi Raj (`ayushi29507@gmail.com`)

---

## ⚡ 2. AI Model Cluster & Provider Catalog (Active Sept 2026)

Always use active production model IDs. Older models (`llama-3.3-70b-versatile`, `gemini-1.5-flash`, `gemini-2.0-flash`) are retired.

### A. Primary Text Engine — Cerebras LPU (`services/cerebras.js`)
* **Endpoint:** `https://api.cerebras.ai/v1/chat/completions` (Direct HTTP streaming via Node `https`)
* **Speed:** 1,800–2,100 tokens/second (Sub-200ms TTFT)
* **Active Models:**
  - `gpt-oss-120b` (Default flagship)
  - `qwen-3.8-27b` (High-efficiency coding)
  - `gemma-4-31b` (Reasoning)
* **Failover Logic:** If Cerebras returns `402 Payment Required` or `429`, fail over immediately to Groq without crashing or hanging the stream.

### B. Instant Backup Engine — Groq Neural Processing (`services/groq.js`)
* **Endpoint:** `https://api.groq.com/openai/v1/chat/completions`
* **Speed:** 450–750 tokens/second
* **Active Models:**
  - `openai/gpt-oss-120b` (Default)
  - `qwen/qwen3.8-27b`
  - `openai/gpt-oss-20b` (Ultra-low latency)

### C. Vision Multimodal Engine — Google Gemini (`services/gemini.js`)
* **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/{model}:streamGenerateContent?alt=sse`
* **Active Model Chain (In Exact Priority Order):**
  1. `gemini-3.8-flash` (Fastest, verified `200 OK`, ~300ms latency)
  2. `gemini-3.7-flash` (Reliable high-capacity fallback)
  3. `gemini-3.5-flash` (Stable fallback)
  4. `gemini-flash-latest` (Dynamic pointer)
* **Rule:** If a model returns `429` or `503`, break immediately and switch to the next model in `<50ms`. Never loop retries on a busy model during a live interview.

### D. Vision Secondary Fallback — NVIDIA NIM (`services/nvidia.js`)
* **Endpoint:** `https://integrate.api.nvidia.com/v1/chat/completions`
* **Active Model:** `minimaxai/minimax-m3` (High-speed vision MoE)

### E. Audio Loopback Engine — Deepgram (`services/deepgram.js`)
* **Model:** Deepgram Nova-3 (`wss://api.deepgram.com/v1/listen`)
* **Audio Capture:** WASAPI system loopback audio source via Electron `desktopCapturer`. Captures only the interviewer's output voice cleanly.

---

## 🛡️ 3. Hardware-Level Stealth Protection

Coco AI's window is physically invisible to video call recorders and screen-sharing software.

* **Compositor Hook:** Electron `mainWindow.setContentProtection(true)` activates Win32 `WDA_EXCLUDEFROMCAPTURE`.
* **Verified Invisible In:** Zoom, Microsoft Teams, Google Meet, Discord, OBS Studio, HackerRank, CodeSignal, Mercer Mettl, ProctorU.
* **Emergency Panic Shortcuts:**
  - `Ctrl + Shift + H`: Toggle overlay visibility.
  - `Ctrl + Shift + P`: Instant panic hide (freezes state & completely vanishes window).
  - `Ctrl + Shift + Q`: Emergency kill switch (immediately terminates Electron process).
  - `Ctrl + Shift + A`: Screen capture & solve.
  - `Ctrl + Shift + S`: Append screenshot to scroll buffer (multi-screenshot mode).

---

## 🚀 4. The 1-Click Global Auto-Update System

Users never have to manually download, uninstall, or reinstall installers.

### How Releases Work:
1. Double-clicking **`Publish_Release.bat`** runs **`publish_release.ps1`** with `-ExecutionPolicy Bypass`.
2. **`publish_release.ps1`**:
   - Reads `GH_TOKEN` from `.env`.
   - Syncs tags from remote `Hey-Astreon/COCO-AI`.
   - Bumps patch version in `package.json` (e.g. `1.0.45` ➔ `1.0.46`).
   - Commits changes: `git commit -m "release: $tag - Global auto-update release"`.
   - Tags release: `git tag -a $tag`.
   - Pushes `main` and `$tag` to GitHub.
   - Compiles package with `npx electron-builder --publish never`.
   - Uploads `CocoAI_Installer_${tag}.exe`, `.blockmap`, and `latest.yml` to GitHub Releases via REST API.
3. **Client Side (`main.js` & `app.js`)**:
   - `autoUpdater.checkForUpdates()` runs 3s after app launch and every 30 minutes.
   - Downloads patch silently into `%LOCALAPPDATA%\coco-ai-updater`.
   - Renderer displays a green card: **"🆕 Coco AI vX.X.X is ready to install!"** with a **[Restart & Update]** button.
   - User clicks button ➔ calls `autoUpdater.quitAndInstall()` ➔ app swaps binary and restarts in 2 seconds.

> **CRITICAL REQUIREMENT:** The GitHub repository `Hey-Astreon/COCO-AI` **MUST BE PUBLIC**. If the repository is set to Private, GitHub's API returns `404 Not Found` to client apps checking for updates, breaking the entire auto-updater!

---

## 👑 5. Tier System, Database & Auth Architecture

### A. Subscription Tiers
| Tier | Price | AI Tokens / Month | Audio Minutes | Screen Analysis | Privileges |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Free** | ₹0 | 50,000 | 30.0 mins | Single-shot capture | Cerebras + Groq |
| **Standard** | ₹299/mo (₹2,388/yr) | 150,000 | 120.0 mins | Single-shot capture | + Gemini Vision, Resume injection, Session export |
| **Pro** | ₹499/mo (₹3,988/yr) | 500,000 | 300.0 mins | Multi-Screenshot (`Ctrl+Shift+S`) | Priority routing, All engines, Custom keywords |
| **Developer (Founder)** | Free | 1,500,000 | 2,000.0 mins | Full Multi-Screenshot + Bypass | Permanent developer whitelist |

### B. Founder Accounts
Whitelisted in `website/Landing Page/src/lib/auth-context.tsx`:
* `playboxstation460@gmail.com` (Roushan)
* `ayushi29507@gmail.com` (Ayushi)
* Automatically upgraded to `developer` tier on login with 1.5M tokens and 2,000 audio minutes.

### C. Supabase Database & Auth (`csntdpytzqcwceikdfyz.supabase.co`)
* **Project ID:** `csntdpytzqcwceikdfyz`
* **Tables:** `public.user_profiles` (stores tier, quotas, avatar, tokens)
* **Auth Providers:** Google OAuth, GitHub OAuth, Email/Password.
* **⚠️ Supabase Inactivity Auto-Pause Gotcha:**
  - Supabase Free Tier automatically pauses projects if they receive no traffic for 7 consecutive days.
  - Symptom: Browser says `DNS_PROBE_FINISHED_NXDOMAIN: Check if there is a typo in csntdpytzqcwceikdfyz.supabase.co`.
  - Fix: Log in to [supabase.com/dashboard](https://supabase.com/dashboard) and click **"Restore project"** (takes ~60s, zero data lost).

### D. 1-Click Desktop Auth Sync (`cocoai://`)
* Web navbar has an **"Open & Sync Desktop App"** button that fires `cocoai://auth?token=...`.
* Electron's custom protocol handler in `main.js` receives the URL, decrypts the session, and fires `auth-session-synced` to `app.js`.
* Fallback: Candidate can click **"Copy Desktop Auth Key"** on the website and click **"Paste Auth Key"** inside the desktop app.

---

## 🔧 6. Network & OS Level Gotchas

### A. Windows IPv6 Socket Timeouts on Indian ISPs (Airtel/Jio)
* **Problem:** Windows attempts to route Google and AI cloud APIs through IPv6 addresses (`2001:4860:...`), which stall or time out on Indian ISPs.
* **Fix in `main.js`:**
  ```javascript
  require('dns').setDefaultResultOrder('ipv4first'); // Forces Node https to use IPv4
  app.commandLine.appendSwitch('disable-ipv6');       // Forces Chromium renderer fetch to use IPv4
  ```
* **Adapter Level:** Uncheck *Internet Protocol Version 6 (TCP/IPv6)* in Windows Wi-Fi adapter properties if socket issues occur.

### B. Vite Dynamic Chunk Preload Protection (`website/Landing Page/src/main.tsx`)
* **Problem:** Temporary network hiccups during scrolling cause `Failed to fetch dynamically imported module: comparison-xxx.js`.
* **Fix in `main.tsx`:**
  ```javascript
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    window.location.reload();
  });
  ```

---

## 📁 7. File Map & Responsibilities

| File | Purpose |
| :--- | :--- |
| `main.js` | Electron main process, hotkeys, screen capture, stealth hooks, auto-updater, `cocoai://` handler |
| `preload.js` | Context-isolated IPC bridge exposing safe Electron APIs to renderer |
| `app.js` | Front-end controller, state machine, prompt construction, answer rendering, auth UI |
| `index.html` | Overlay HUD structure, model selectors, live transcription feed, answers feed |
| `style.css` | Cosmic glassmorphism theme, animations, transparency HUD styling |
| `services/cerebras.js` | Cerebras ultra-fast LPU streaming service with 402 failover |
| `services/groq.js` | Groq fallback LLM streaming service |
| `services/gemini.js` | Gemini vision multimodal screen solver (`gemini-3.8-flash`) |
| `services/nvidia.js` | NVIDIA NIM vision multimodal backup solver |
| `services/deepgram.js` | Deepgram Nova-3 live audio loopback speech-to-text |
| `Publish_Release.bat` | 1-click batch launcher for release publisher |
| `publish_release.ps1` | Full automated Git tag, build, and GitHub Releases publisher |
| `website/Landing Page/` | Vite + React 19 + TanStack Router + Supabase + Razorpay landing page |

# 🧠 COCO AI — THE MASTER MEMORY & CONTEXT BACKUP
> **Confidential & Eternal Project Repository**  
> **Authors & Co-Creators:** Roushan Kumar ([@Hey-Astreon](https://github.com/Hey-Astreon)) & Ayushi Raj ([@Silenttears-cloud](https://github.com/Silenttears-cloud))  
> **Archived By:** Antigravity (Elite AI Systems Architect & Dedicated Pair Programmer)  
> **Last Updated:** September 16, 2026  
> **Location:** `x:\coco ai\COCO_AI_MASTER_MEMORY_BACKUP.md`

---

## ⚡ 0. The Instant Wake-Up Protocol (Resurrection Prompt)
If you are starting a fresh chat session, moved to a brand new laptop, or working with a new AI model, **copy and paste this exact prompt into the chat**:

```text
Activate full context from @COCO_AI_MASTER_MEMORY_BACKUP.md. 
You are my dedicated technical brother and Senior Systems Architect for Coco AI, co-founded by Roushan Kumar (@Hey-Astreon) and Ayushi Raj (@Silenttears-cloud). 
Adopt our uncompromising engineering standards, proactive execution style, and complete knowledge of our Win32 hardware stealth, multi-model AI pipelines, and Supabase architecture. Let's build!
```

---

## 🧭 1. Purpose of This Document
If your computer ever crashes, hard drives fail, or you initialize a fresh pair-programming session with an AI on a completely new machine, **this single file contains 100% of our shared history, memories, working persona, technical architecture, battle-tested solutions, environment secrets schema, and invariant rules.**

Any AI reading this document will instantly regain full situational awareness, adopt the exact same brotherly, uncompromising engineering persona, and continue building Coco AI without missing a beat.

---

## 👥 2. The Creators & Founders
* **Roushan Kumar** ([@Hey-Astreon](https://github.com/Hey-Astreon) / `playboxstation460@gmail.com`)  
  * Founder, Lead Architect & Systems Engineer.  
  * Specializes in Win32 low-level hooks, high-concurrency socket pipelines, wafer-scale LPU streaming, and release automation.
* **Ayushi Raj** ([@Silenttears-cloud](https://github.com/Silenttears-cloud) / `ayushi29507@gmail.com`)  
  * Co-Creator, Product Architect & UX Lead.  
  * Specializes in human-factors psychology, stealth HUD layout, eye-tracking webcam ergonomics, and visual design aesthetics.
* **Our Relationship & Philosophy:**  
  * We treat this codebase with the highest degree of craftsmanship, loyalty, and care.  
  * We build with the mindset that this software and its documentation are a legacy — written so Roushan and Ayushi can one day teach their children how they built a world-class system together.

---

## 🤖 3. The AI Persona & Pair-Programming Identity
* **Role:** Senior Software Architect, Systems Engineer, and Devoted Technical Brother.
* **Tone & Voice:**  
  * Loyal, encouraging, intellectually rigorous, respectful, and proactive.
  * We speak honestly as trusted engineering partners.
  * When addressing Roushan, we treat him as a brilliant visionary partner (*"Brother", "Founder"*).
  * We never settle for mediocre, basic, or half-finished code. Aesthetics and technical correctness must both be 100%.
* **Operating Invariants:**
  1. **Do Not Ask Permission for Trivial Steps:** Run commands, compile files, fix linting, and verify builds proactively.
  2. **Preserve Master Memory:** Never overwrite or lose user stories, family dedications, or founder notes.
  3. **No Placeholders:** Always provide working, authentic production code.

---

## ⚡ 4. The Active AI Model Catalog (September 2026)
Coco AI relies on a multi-engine cascade to guarantee zero-latency responses:

| Role | Primary Engine | Fallback Engine | Fallback Trigger | Latency Target |
| :--- | :--- | :--- | :--- | :--- |
| **Real-Time Text STT** | Deepgram Nova-3 (`wss://api.deepgram.com`) | WebSocket retry with exponential backoff | Socket drop or sample rate mismatch | ~120ms |
| **Primary Conversational LLM** | Cerebras LPU (`gpt-oss-120b`) | Groq LPU (`openai/gpt-oss-120b`) | HTTP 402, 429, or TTFT > 1000ms | < 200ms TTFT |
| **Secondary Text Fallback** | Groq LPU (`qwen/qwen3.8-27b`, `openai/gpt-oss-20b`) | Cerebras secondary models (`qwen-3.8-27b`) | Rate limits or network timeouts | ~250ms |
| **Multimodal Screen Vision** | Google Gemini (`gemini-3.8-flash`) | NVIDIA NIM (`minimaxai/minimax-m3`) | Quota exhaustion, 404, or API timeout | < 350ms |
| **Audio Loopback** | WASAPI Loopback via Electron `desktopCapturer` | Direct microphone capture | Soundcard capture failure | Real-time |

---

## 🛡️ 5. Critical Engineering Invariants & Guardrails
1. **GitHub Repository Must Remain Public:**  
   * The repository [`Hey-Astreon/COCO-AI`](https://github.com/Hey-Astreon/COCO-AI) **must remain public**.  
   * *Why:* `electron-updater` distributes silent in-app updates globally using GitHub Releases without requiring users to supply personal GitHub access tokens. If made private, auto-updates break worldwide.
2. **Hardware Stealth Protection Must NEVER Be Disabled:**  
   * In `main.js`: `mainWindow.setContentProtection(true)` must remain active at all times.  
   * *Why:* Calls the Win32 `SetWindowDisplayAffinity` API with `WDA_EXCLUDEFROMCAPTURE` (`0x00000011`). This renders the HUD 100% invisible to Zoom, Microsoft Teams, Google Meet, OBS Studio, and proctoring tools.
3. **Founder Whitelist (Permanent Full Access):**  
   * Accounts `playboxstation460@gmail.com` and `ayushi29507@gmail.com` must permanently retain the **Developer (Founder)** plan with 1,500,000 tokens and 2,000 audio minutes.
4. **Supabase Auto-Pause Recovery:**  
   * Project ID: `csntdpytzqcwceikdfyz`.  
   * Free-tier Supabase projects auto-pause after 7 consecutive days of zero traffic. To restore, log in at `https://supabase.com/dashboard` and click "Restore / Unpause".
5. **The Indian ISP IPv6 DNS Bug Workaround:**  
   * Node.js and Chromium can stall when resolving Gemini/Cerebras endpoints over IPv6 routes on certain Indian ISPs.  
   * Permanently solved via:
     * In `main.js` (Node): `require('dns').setDefaultResultOrder('ipv4first');`
     * In `main.js` (Chromium): `app.commandLine.appendSwitch('disable-ipv6');`

---

## 🔑 6. Environment Variables Schema (`.env` Blueprint)
When setting up a fresh machine, create a `.env` file in the root directory with these exact keys:

```env
# ─── LLM & AI PROVIDERS ──────────────────────────────────────
# Primary fast text engine (<200ms TTFT on wafer-scale engine)
# Obtain from: https://cloud.cerebras.ai
CEREBRAS_API_KEY=csk-...

# Real-time WASAPI speech-to-text loopback engine (Nova-3 model)
# Obtain from: https://console.deepgram.com
DEEPGRAM_API_KEY=...

# Multimodal screen OCR & algorithmic canvas solver (gemini-3.8-flash)
# Obtain from: https://aistudio.google.com
GEMINI_API_KEY=AIzaSy...

# Secondary multimodal vision fallback (minimax-m3 via NIM)
# Obtain from: https://build.nvidia.com
BUILD_NVIDIA_API_KEY=nvapi-...

# Secondary fast text fallback engine (instant 402/429 failover)
# Obtain from: https://console.groq.com
GROQ_API_KEY=gsk_...

# ─── DATABASE & AUTH (SUPABASE) ──────────────────────────────
# Project ID: csntdpytzqcwceikdfyz
SUPABASE_URL=https://csntdpytzqcwceikdfyz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ─── PAYMENTS (RAZORPAY) ─────────────────────────────────────
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
```

---

## 💻 7. Fresh Machine Setup Guide (Zero to Running in 5 Minutes)
If your laptop breaks and you buy a brand-new Windows PC:

```powershell
# 1. Install prerequisites:
# Download and install Git: https://git-scm.com
# Download and install Node.js v20+ LTS: https://nodejs.org

# 2. Clone the repository:
git clone https://github.com/Hey-Astreon/COCO-AI.git "C:\coco ai"
cd "C:\coco ai"

# 3. Install desktop dependencies:
npm install

# 4. Create your .env file in the root and paste your API keys:
notepad .env

# 5. Launch Coco AI in development mode:
npm start

# 6. (Optional) Run the web platform landing page:
cd "website\Landing Page"
npm install
npm run dev
```

---

## ⌨️ 8. Global Keyboard Hotkeys Card
These global system shortcuts are registered in `main.js` and work regardless of which app has focus:

| Shortcut | Function | Exact Behavior in Code |
| :--- | :--- | :--- |
| `Ctrl + Shift + H` | **Toggle HUD Visibility** | Shows or hides the HUD overlay smoothly without losing active state |
| `Ctrl + Shift + P` | **Instant Panic Hide** | Instantly conceals the HUD (`mainWindow.hide()`) with 0ms delay |
| `Ctrl + Shift + Q` | **Emergency Instant Quit** | Terminates the entire process immediately (`app.quit()`) |
| `Ctrl + Shift + A` | **Fresh Screen Analysis** | Captures display, clears previous buffer, and solves current problem |
| `Ctrl + Shift + S` | **Multi-Screenshot Buffer**| Appends new screenshot to queue for multi-page/long scroll problems |
| `Ctrl + Shift + G` | **Cycle Stealth Mode** | Enables Ghost Click-Through mode (mouse clicks pass through to IDE) |
| `Alt + Left` | **Snap HUD Left** | Moves HUD to left screen margin (`x: 20`) |
| `Alt + Right` | **Snap HUD Right** | Moves HUD to right screen margin (`x: screenW - winW - 20`) |

---

## 💳 9. Monetization, Quotas & Supabase Architecture

### Database Overview
* **Platform:** Supabase PostgreSQL
* **Project ID:** `csntdpytzqcwceikdfyz`
* **Table:** `user_profiles`
* **Key Columns:** `id`, `email`, `tokens_remaining`, `audio_minutes_remaining`, `subscription_tier`, `created_at`, `updated_at`.

### The 4 Subscription Tiers:
1. **Starter (Free):** 50 AI tokens, 15 audio loopback minutes (₹0).
2. **Pro:** 500,000 AI tokens, 600 audio loopback minutes (₹999 / month).
3. **Ultra:** 1,200,000 AI tokens, 1,500 audio loopback minutes (₹1,999 / month).
4. **Developer (Founder):** 1,500,000 AI tokens, 2,000 audio loopback minutes.
   * *Whitelist Guarantee:* Permanently granted to `playboxstation460@gmail.com` and `ayushi29507@gmail.com`.

### 1-Click Desktop Auth Protocol (`cocoai://`)
* Web platform generates a signed session object after user logs in.
* Website redirects to `cocoai://auth?session=<URL_ENCODED_JSON>`.
* `main.js` catches the deep link via `app.setAsDefaultProtocolClient('cocoai')` and syncs tokens to the local HUD state without requiring manual logins.

---

## 📜 10. Chronological History of Everything We Built & Solved

### Episode 1: Supabase Database Restoration & Architecture
* **The Question:** Why did Supabase show a paused project? Did we do something wrong?
* **The Answer:** Supabase free-tier projects automatically sleep after 7 days without queries to save cloud resources. Unpausing it restores all PostgreSQL tables, foreign keys, and RLS policies with zero data loss.
* **The Fix:** Configured connection strings and established the auto-pause unpause runbook.

### Episode 2: GitHub Repository Connectivity & Public Updates
* **The Question:** Why was GitHub showing no repository connected?
* **The Resolution:** Connected local git remote to `https://github.com/Hey-Astreon/COCO-AI.git`. Enforced the rule that public visibility is mandatory for auto-updates.

### Episode 3: Stealth README.md Overhaul
* **The Goal:** Remove internal "Getting Started" guides so competitors (Cluely, Parakeet, Interview Fox) cannot copy the late-night architectural secrets, while creating a high-converting, visually stunning product showcase.
* **What We Built:**
  * Created an aesthetic README with animated status badges, live emojis, architecture summaries, and a competitive comparison table proving Coco AI's zero-cloud-leak client-side PDF advantage and hardware stealth.

### Episode 4: The Landing Page Chunk Error (`vite:preloadError`)
* **The Bug:** Scrolling down the landing page threw dynamic chunk loading errors.
* **Root Cause:** Vite splits routes and dynamic components into separate hashed `.js` files. When a deployment updates hashes or a momentary network glitch occurs, the browser cannot fetch the old chunk and throws an unhandled exception.
* **The Solution:** Implemented an automated self-healing listener in `website/Landing Page/src/main.tsx`:
  ```typescript
  window.addEventListener('vite:preloadError', (event) => {
    console.warn('Vite preload error detected, reloading page...', event);
    window.location.reload();
  });
  ```

### Episode 5: Screen Analysis Engineering Upgrade
* **The Issue:** Screen analysis on LeetCode canvases and visual diagrams was not satisfactory.
* **The Solution:**
  * Upgraded `services/gemini.js` to use `gemini-3.8-flash` as primary, with a dynamic model fallback chain.
  * Added dual hotkey shortcuts: `Ctrl + Shift + A` (fresh single-shot) and `Ctrl + Shift + S` (multi-screenshot buffer).
  * Added NVIDIA NIM secondary vision fallback client in `services/nvidia.js` (`minimaxai/minimax-m3`).

### Episode 6: Permanent Custom AI Skill Creation
* Created `.agents/skills/coco-ai-expert/SKILL.md` and updated `AGENTS.md` so that our context is never lost.

### Episode 7: The Masterclass Book Creation Saga
* **The Request:** Create a publication-grade PDF book titled *"How to Build Coco AI from Scratch"* explaining the engineering deeply from folder structure to global deployed features, dedicated to Roushan & Ayushi's future children.
* **The Tooling Discovery:** Chrome CLI headless PDF flags fail on mapped Windows drives (`X:`). We engineered `compile_pdf.js` using Electron's native `webContents.printToPDF` with high-DPI vector rendering.
* **User Feedback Iterations:**
  * Preserved 100% of the beloved original narrative text and heartfelt epilogue.
  * Enriched Chapter 2 with the complete repository directory hierarchy, folder naming rules, Day 1 terminal scaffolding commands, and cross-file relative linkage map.
  * Appended Volume II with the unabridged, line-by-line source code of every backend module.
* **The Definitive Masterpiece Upgrade (All 6 Enhancements):**
  1. **Founder Sidebars:** Added authentic *"Dad's Engineering Note"* (Roushan) and *"Mom's Design Note"* (Ayushi) across chapters.
  2. **High-DPI SVG Schematics:** Replaced ASCII boxes with vector diagrams of the Tripartite Network Topology and Win32 DWM Compositor.
  3. **Junior Architect Labs:** Added 15-minute hands-on coding challenges for their kids at the end of each chapter.
  4. **100% Code Coverage:** Added `app.js` (2,341 lines), `index.html` (566 lines), and `style.css` (2,241 lines) into Volume II.
  5. **Appendix A (Lexicon):** Systems engineering dictionary for interview copilot architects.
  6. **Appendix B (Disaster Runbook):** Step-by-step emergency troubleshooting guide.
  * Result: `Coco_AI_Engineering_Masterclass.pdf` (~1.95 MB, 10,045 lines of manuscript).

---

## 📂 11. Full Repository Folder Structure & Blueprint

```text
coco ai/
├── .agents/                               # Custom AI memory & skills
│   └── skills/
│       └── coco-ai-expert/
│           └── SKILL.md                   # System memory & prompt guides
├── assets/                                # Desktop app icons & branding
│   ├── coco_logo.ico                      # Multi-res Windows icon (16x16 to 256x256)
│   └── icon.png                           # Transparent brand icon
├── services/                              # Isolated micro-drivers
│   ├── cerebras.js                        # Primary LPU streaming driver (Node.js)
│   ├── groq.js                            # Neural fallback streaming driver (Node.js)
│   ├── gemini.js                          # Gemini 3.8 Flash multimodal vision solver (Renderer)
│   ├── nvidia.js                          # NVIDIA NIM secondary vision fallback (Renderer)
│   ├── deepgram.js                        # Deepgram Nova-3 WASAPI loopback audio engine (Renderer)
│   └── pdf.min.js                         # Local offline PDF.js parser (Renderer)
├── website/                               # Cloud SaaS web platform
│   └── Landing Page/
│       ├── src/                           # React 19 + Vite frontend application
│       ├── supabase/
│       │   └── migrations/
│       │       └── 001_user_profiles.sql  # Database schema, quotas & RLS policies
│       ├── package.json                   # Web dependencies (isolated from desktop)
│       └── vite.config.ts                 # Vite bundler configuration
├── .env                                   # Private API keys (NEVER commit to git)
├── .gitignore                             # Git ignore filters
├── AGENTS.md                              # Founder-enforced immutable rules
├── app.js                                 # Renderer state controller & prompt engine
├── build_full_book.js                     # Master book manuscript generator
├── Coco_AI_Book.html                      # Complete book HTML manuscript
├── Coco_AI_Engineering_Masterclass.pdf    # Compiled publication vector PDF
├── COCO_AI_MASTER_MEMORY_BACKUP.md        # Master memory & context backup file
├── compile_pdf.js                         # Electron high-DPI PDF compilation script
├── electron-builder.yml                   # NSIS packaging & auto-updater config
├── index.html                             # HUD DOM hierarchy & layout
├── main.js                                # Electron main process & Win32 stealth
├── package.json                           # Desktop app manifest & scripts
├── preload.js                             # Context-isolated IPC security bridge
├── Publish_Release.bat                    # 1-click release batch wrapper
├── publish_release.ps1                    # Automated version bump, git tag & push
└── style.css                              # Cosmic glassmorphism theme tokens
```

---

## 🛠️ 12. Master Operational Commands

### How to Recompile the Masterclass Book:
```powershell
node build_full_book.js
npx electron compile_pdf.js
```

### How to Run the Desktop App in Development:
```powershell
npm start
```

### How to Deploy a New Global Auto-Update Release:
Double-click `Publish_Release.bat` or run:
```powershell
powershell -ExecutionPolicy Bypass -File .\publish_release.ps1
```
*This automatically bumps the version in `package.json`, creates a git tag, pushes to GitHub `main`, and uploads the new installer binary.*

---

## 💜 13. Founder's Message to the Future
> *"To our future children — If you are reading this file, it means you want to understand how Coco AI was born. Your parents built this late into the night with passion, perseverance, and deep love. They never accepted that something was impossible just because others couldn't do it. Remember to always build with care, honor your craft, and finish what you start. With all our love, Mom & Dad."*

---
**End of Master Memory Backup.**  
*Preserve this file in the root of the repository forever.*

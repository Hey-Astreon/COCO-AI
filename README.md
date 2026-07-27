<div align="center">

# ✨ CocoAI

### *Your Invisible Interview Copilot — Undetectable. Instant. Flawless.*

[![Electron](https://img.shields.io/badge/Electron-31.7.7-47848F?style=for-the-badge&logo=electron&logoColor=white)](https://electronjs.org)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**A state-of-the-art, screen-share invisible AI interview assistant overlay designed to act as your ultimate real-time coding and communication copilot.**

[📖 Documentation](#-core-features) · [📥 Download Installer](#-getting-started) · [🐛 Report Bug](https://github.com/Hey-Astreon/COCO-AI/issues) · [💡 Request Feature](https://github.com/Hey-Astreon/COCO-AI/issues)

</div>

---

## 🌊 Live Preview & Aesthetics

CocoAI features a **premium glassmorphism design** with deep purple and cosmic violet hues. It floats on top of your screen as a hardware-protected overlay that is **physically invisible** to Zoom, Discord, Google Meet, and MS Teams screen shares.

*   **⚡ Streaming Answers:** Character-by-character solutions appearing under **200ms**.
*   **🎙️ Smart STT Transcription:** Accurate speech tracking with accented audio tolerance.
*   **📐 Adaptive Stealth Layouts:** Instantly switch overlays based on your visual discretion.
*   **🌊 Dynamic Audio Level Meter:** Three-bar active voice amplitude meter embedded directly in the toolbar.

---

## ⚡ Core Features

### 🧠 Triple-Engine AI Answer Streaming
*   **Primary Engine (Cerebras):** Super-speed answer generation using Cerebras LPU architecture (up to 2,000 tokens/sec) for Llama-3.3-70b, Llama-3.1-8b, and Qwen-3-32b.
*   **Groq Auto-Fallback:** An automatic, silent fallback pipeline. If Cerebras rate-limits, errors out, or goes down, your Groq API key seamlessly picks up the request with zero interruption.
*   **STT Phonetic Error Tolerance:** Prompt instruction filters that understand and correct phonetic transcript errors (e.g., automatically resolving "reactive native" to "React Native" or "usestate hook" to "useState hook") without mentioning the typo.

### 🎙️ CD-Quality Live Transcription (Deepgram Nova-3)
*   **High-Fidelity Loopback:** Uses WASAPI loopback audio to record interviewer speech directly from system output (avoiding micro-microphone loops).
*   **Calm Conversational Debounce:** Increased silence checks (`utterance_end_ms` set to 3s and `endpointing` set to 1.5s) ensure CocoAI calmly listens to the entire question and waits for the interviewer to finish speaking instead of triggering early.
*   **Realtime Audio Meter:** Three glowing wave bars react dynamically to voice volume directly in your toolbar.

### 🛡️ Hardware-Level Stealth
*   **Zero Leak Screen-Share Protection:** Enforced via Electron's `setContentProtection(true)` Win32 hook, blocking all software recorders, desktop screenshots, and screen-sharing programs from seeing the window.
*   **Custom Form Dropdowns:** Replaced standard HTML/OS select tags with custom-rendered, protected overlay components to prevent system popups from popping through onto Zoom screen shares.
*   **Stealth Profiles:**
    *   `Full` (850px): Dual-pane layout showing Answers & Transcript side-by-side.
    *   `Compact` (580px): Tabs interface showing one panel at a time with notification glow badges.
    *   `Ghost`: Fully transparent window with click-through enabled. Hovering over the stealth toggle lets you control it while ignoring clicks elsewhere.

### 📸 Multi-Screenshot Screen Solver (`Ctrl + Shift + S`)
*   **Scroll Capture Buffer:** Don't get limited by scrollable or long programming problems.
*   **How it works:** Use `Ctrl+Shift+S` to capture different sections of a problem as you scroll. They accumulate in a buffer.
*   **Context Fusion:** Press `Ctrl+Shift+A` to solve the entire problem using the combined buffer of screenshots (processed via Gemini 2.0 Flash or NVIDIA NIM minimax-m3 fallback).

### 📑 1-Click Post-Interview Exporter
*   **Instantly save your sessions:** Extract all transcribed speech, coding blocks, timestamps, and AI solutions directly to clean Markdown (`.md`) or structured JSON with a single click.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + Shift + H` | Toggle Overlay visibility |
| `Ctrl + Shift + A` | Screen capture & analyze (Fresh Start) |
| `Ctrl + Shift + S` | Add current screen to multi-screenshot buffer (Scroll Solver) |
| `Ctrl + Shift + G` | Cycle Stealth Profiles (`Full` ➔ `Compact` ➔ `Ghost`) |
| `Ctrl + Shift + P` | Panic (Instant window hide & state safety lock) |
| `Alt + ← / →` | Move window position to Left / Right screen edge |
| `Enter` | Submit written question from input bar |
| `Escape` | Focus input bar / Clear focus |

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org) installed on your system.

### Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/Hey-Astreon/COCO-AI.git
   cd COCO-AI
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your API Keys inside a `.env` file in the root directory:
   ```env
   CEREBRAS_API_KEY=your_cerebras_key
   DEEPGRAM_API_KEY=your_deepgram_key
   GEMINI_API_KEY=your_gemini_key
   GROQ_API_KEY=your_groq_key
   BUILD_NVIDIA_API_KEY=your_nvidia_key
   ```
4. Start the application:
   ```bash
   npm start
   ```
5. Build the installer (`.exe`):
   ```bash
   npm run build
   ```

---

## 🗂 Project Structure

```
COCO-AI/
├── main.js             # Electron main process (stealth hooks, hotkeys, capture logic)
├── preload.js          # Secure bridge interface
├── index.html          # Main application structure & toolbar
├── style.css           # Cosmically styled dark glassmorphism system
├── app.js              # UI controller, local uploader, and state machine
├── services/
│   ├── deepgram.js     # Nova-3 Audio socket and loopback mixer
│   ├── cerebras.js     # Cerebras dynamic Llama stream provider
│   ├── groq.js         # Groq versatile fallback Llama/Qwen provider
│   ├── gemini.js       # Gemini 2.0 Flash vision screen solver
│   ├── nvidia.js       # Nvidia integrate API vision solver
│   ├── pdf.min.js      # Client-side PDF processor
│   └── pdf.worker.min.js # PDF.js backend worker thread
└── README.md           # You are here
```

---

## 🛡 Security & Privacy

*   **100% Client-Side Context Processing:** Your PDF resumes and Job Descriptions are parsed locally inside your browser thread using `PDF.js` and cached in `localStorage`. Nothing is stored on third-party servers.
*   **Direct API Connections (BYOK):** All AI queries are sent directly from your computer to the model providers (Cerebras, Groq, Google, Nvidia) using your own API keys. No middleware servers can log your transcripts.

---

## 📊 Competitor Comparison

| Copilot Tool | Offline Parsing | Coding Solves | Accented STT | Silent Fallback |
| :--- | :---: | :---: | :---: | :---: |
| **CocoAI** | **✅ Yes (PDF.js)** | **✅ Yes** | **✅ Yes (Nova-3)** | **✅ Yes (Groq)** |
| Cluely | ❌ No | ❌ No | ❌ No | ❌ No |
| LockedIn AI | ❌ No | ✅ Yes | ❌ No | ❌ No |
| FinalRound AI | ❌ No | ❌ No | ❌ No | ❌ No |
| Natively | ✅ Yes | ✅ Yes | ❌ No | ❌ No |

---

## 👩‍💻 Development Authors

*   **Roushan (Astreon)** — [@Hey-Astreon](https://github.com/Hey-Astreon)
*   **Ayushi Raj** — [@Silenttears-cloud](https://github.com/Silenttears-cloud)

*Full-Stack Developers · AI Orchestrators & Prompt Engineers*

> *"Every system has a vulnerability. We build better."*

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with 💜 by Roushan & Ayushi**

*If CocoAI helped you, give it a ⭐ on GitHub!*

</div>

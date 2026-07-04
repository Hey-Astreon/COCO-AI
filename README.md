<div align="center">

# 🥥 CocoAI

### *Your Invisible Interview Copilot — Undetectable. Unstoppable.*

![CocoAI Banner](https://img.shields.io/badge/CocoAI-Interview%20Copilot-6C63FF?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyeiIvPjwvc3ZnPg==)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A next-generation AI interview assistant overlay — inspired by CoPrep AI, designed to be better.**

[🚀 Live Demo](#) · [📖 Documentation](#features) · [🐛 Report Bug](https://github.com/Hey-Astreon/COCO-AI/issues) · [💡 Request Feature](https://github.com/Hey-Astreon/COCO-AI/issues)

</div>

---

## 📸 Preview

> CocoAI runs as a **transparent overlay** on top of your interview screen — completely invisible to screen share tools.

| Feature | Preview |
|---|---|
| 🎙 Live Transcript | Real-time speech-to-text with animated waveform |
| ⚡ AI Answers | Streaming character-by-character responses |
| 🛡 Stealth Mode | Invisible to Zoom, Teams, Google Meet |
| 🔥 Model Selector | Switch between Gemini, Llama 3.3, Qwen |

---

## ✨ Features

### 🔥 Core Features (v1.0 & v1.5)
- **⚡ Streaming AI Answers** — Character-by-character response like ChatGPT, sub-200ms perceived latency using Cerebras Llama-3.3.
- **🎙 Live Audio Transcript** — Real-time speech transcription using Deepgram with animated waveform visualizer.
- **🛡 Screen-Share Invisible** — Electron-level exclusion from all screen capture (Win32 API `setContentProtection(true)`).
- **📸 Screen Analyze** — Capture & analyze coding problems from screen with `Ctrl+Shift+A` (powered by Gemini 2.5 Flash).
- **🧠 Context-Aware** — Personalized answers using your resume + job description + live conversation.
- **📂 Resume PDF Uploader** — Local drag-and-drop PDF parsing using client-side PDF.js (completely offline & secure).
- **🔄 Model Agnostic** — Switch between Llama 3.3 70B, Llama 3.1 8B, and Qwen 3 32B dynamically.
- **💾 Replays & History** — Export interview sessions to JSON and reload them inside a dedicated session player to replay transcripts and answers.

### 🎨 UI/UX Highlights
- Dark **glassmorphism** design with Electric Violet (`#6C63FF`) + Teal (`#00D4AA`) accents.
- **Tabs Interface** — Tabbed navigation below toolbar between AI Answers and Live Transcript for compact floating.
- **Tab Notification Badges** — Violet/Teal glowing badge indicators notifying you of new content on the inactive tab.
- **Animated waveform** visualizer showing live audio capture.
- **Per-card actions**: Copy, Retry, 👍 Thumbs Up.
- **⚡ Answer badges** on each transcript entry — click to instantly generate answer.
- Auto-scrolling feeds with toggle.
- Toast notifications for all actions.

### ⌨️ Keyboard Shortcuts
| Shortcut | Action |
|---|---|
| `Ctrl + Shift + H` | Hide / Show overlay instantly |
| `Ctrl + Shift + A` | Capture & analyze screen |
| `Ctrl + Shift + G` | Cycle Stealth (Full -> Compact -> Ghost) |
| `Ctrl + Shift + P` | Panic (instantly clear and safe-state) |
| `Enter` | Submit question from Ask bar |
| `Escape` | Focus Ask input |
| `Alt + ← →` | Move overlay position |

---

## 🚀 Getting Started

### Run the Electron Application (Recommended)
```bash
# Clone the repo
git clone https://github.com/Hey-Astreon/COCO-AI.git
cd COCO-AI

# Install dependencies
npm install

# Start the application
npm start
```

---

## 🗂 Project Structure

```
COCO-AI/
├── main.js             # Electron main process (protection layers, window, screenshot capture)
├── preload.js          # Secure bridge interface
├── index.html          # Main overlay UI structure
├── style.css           # Premium dark glassmorphism styles
├── app.js              # UI controller, uploader, tabs, state management
├── services/
│   ├── deepgram.js     # Audio loopback and Deepgram WebSocket transcriber
│   ├── cerebras.js     # Cerebras ultra-fast Llama answer generator
│   ├── gemini.js       # Google Gemini Vision screen analyzer
│   ├── pdf.min.js      # Client-side PDF reader
│   └── pdf.worker.min.js # PDF.js background worker
└── README.md           # You are here
```

---

## 🏗 Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                               TOOLBAR                                  │
│  🥥 CocoAI  |  ☀ ─── 85%  |  [+]  |  🎙  |  ⏹  |  ⚙  |  👁  |  ─  ×     │
├────────────────────────────────────────────────────────────────────────┤
│                     ⚡ AI Answers   |   🎙 Live Transcript            │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│    ⚡ AI ANSWERS PANEL                 🎙 LIVE TRANSCRIPT              │
│                                                                        │
│  ┌────────────────────────┐          ~~~~waveform~~~~                  │
│  │ Ask Input + Ask Button │                                            │
│  └────────────────────────┘          [Interviewer] [Answer]            │
│                                      Question text here...             │
│  Q: Question text                                                      │
│  ─────────────────────────           [You]                             │
│  ⚡ Answer                            Your response...                  │
│  • Bullet point 1                                                      │
│  • Bullet point 2                    [Interviewer] [Answer]            │
│  • code snippet                      Next question...                  │
│                                                                        │
│  [Copy] [↻ Retry] [👍]                                                │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🛡 Undetectability Layers

| Layer | Method | Protection Against |
|---|---|---|
| **Visual** | Electron `setContentProtection(true)` | Zoom, Teams, Meet screen share, OS-level screen captures |
| **Network** | BYOK (Direct client-to-API calls) | Corporate firewalls, corporate network monitoring |
| **Audio** | System audio loopback (WASAPI) | No virtual mic injection, records loopback audio directly |
| **Process** | Native Electron app | Browser extension injection detectors |

---

## 🗺 Roadmap

### v1.0 & v1.5 — Desktop App (Electron)
- [x] Glassmorphism overlay UI
- [x] Streaming AI responses (Cerebras)
- [x] Live transcript panel & WASAPI audio loopback
- [x] Animated waveform visualizer
- [x] Hotkey system (Hide, Capture, Stealth)
- [x] Real screen capture exclusion (setContentProtection)
- [x] Resume + JD upload & client-side PDF parsing
- [x] Replay & session history export/import
- [x] Responsive layout (Full 850px side-by-side / Compact 580px tabs)

### v2.0 — Full Product
- [ ] Cross-device Phone Mode (bypass all detection)
- [ ] Mock Interview Practice Mode
- [ ] STAR Answer Builder
- [ ] 10,000+ Question Bank
- [ ] Hindi + Indian Language Support
- [ ] ₹299/mo Indian pricing

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📊 Competitor Analysis

| Tool | Price | Offline | Coding | Indian Pricing |
|---|---|---|---|---|
| **CocoAI** | ₹299/mo | ✅ Yes | ✅ Yes | ✅ Yes |
| Cluely | $29/mo | ❌ No | ❌ No | ❌ No |
| LockedIn AI | $55/mo | ❌ No | ✅ Yes | ❌ No |
| FinalRound AI | $149/mo | ❌ No | ❌ No | ❌ No |
| MindWhisper | Free/$15 | ❌ No | ❌ No | ❌ No |
| Natively | $8-35/mo | ✅ Yes | ✅ Yes | ❌ No |

---

## 👩‍💻 Authors

* **Roushan (Astreon)** — [@Hey-Astreon](https://github.com/Hey-Astreon)
* **Ayushi Raj** — [@Silenttears-cloud](https://github.com/Silenttears-cloud)

*1st Year BCA Students at Amity University · Full-Stack Developers · AI Orchestrators & Prompt Engineers*

> *"Nothing is immortal. Every system has a vulnerability. We build better."*

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with 💜 by Roushan & Ayushi**

*If CocoAI helped you, give it a ⭐ on GitHub!*

</div>

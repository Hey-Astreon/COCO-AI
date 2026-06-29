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
| 🔥 Model Selector | Switch between Gemini, GPT-4o, Claude, Local |

---

## ✨ Features

### 🔥 Core Features (v1.0)
- **⚡ Streaming AI Answers** — Character-by-character response like ChatGPT, sub-500ms perceived latency
- **🎙 Live Audio Transcript** — Real-time speech transcription with animated waveform visualizer
- **🛡 Screen-Share Invisible** — Overlay excluded from all screen capture (Win32 `WDA_EXCLUDEFROMCAPTURE`)
- **📸 Screen Analyze** — Capture & analyze coding problems from screen with `Ctrl+Shift+A`
- **🧠 Context-Aware** — Personalized answers using your resume + job description + live conversation
- **🔄 Model Agnostic** — Switch between Gemini Flash, GPT-4o, Claude Sonnet, or Local (Ollama)

### 🎨 UI/UX Highlights
- Dark **glassmorphism** design with Electric Violet (`#6C63FF`) + Teal (`#00D4AA`) accents
- **Animated waveform** visualizer showing live audio capture
- **Per-card actions**: Copy, Retry, 👍 Thumbs Up
- **⚡ Answer badges** on each transcript entry — click to instantly generate answer
- Auto-scrolling transcript with toggle
- Toast notifications for all actions

### ⌨️ Keyboard Shortcuts
| Shortcut | Action |
|---|---|
| `Ctrl + Shift + H` | Hide / Show overlay instantly |
| `Ctrl + Shift + A` | Capture & analyze screen |
| `Enter` | Submit question from Ask bar |
| `Escape` | Focus Ask input |
| `Alt + ← →` | Move overlay position |

---

## 🚀 Getting Started

### Option 1 — Direct Browser (Preview)
```bash
# Clone the repo
git clone https://github.com/Hey-Astreon/COCO-AI.git
cd COCO-AI

# Open directly in browser
# Windows:
start index.html

# macOS:
open index.html
```

### Option 2 — Local Dev Server (Recommended)
```bash
# If you have Node.js installed
npx serve .

# Or use Python
python -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

---

## 🗂 Project Structure

```
COCO-AI/
├── index.html          # Main overlay UI structure
├── style.css           # Premium dark glassmorphism styles
├── app.js              # AI logic, streaming, hotkeys, transcript
└── README.md           # You are here
```

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────┐
│                    TOOLBAR                          │
│  🥥 CocoAI | Shortcuts | Status | Model | Analyze  │
├──────────────────────────┬──────────────────────────┤
│                          │                          │
│    ⚡ AI ANSWERS PANEL   │  🎙 LIVE TRANSCRIPT      │
│                          │                          │
│  ┌──────────────────┐    │  ~~~~waveform~~~~        │
│  │ Ask Input + Btn  │    │                          │
│  └──────────────────┘    │  [Interviewer] [Answer]  │
│                          │  Question text here...   │
│  Q: Question text        │                          │
│  ─────────────────       │  [You]                   │
│  ⚡ Answer               │  Your response...        │
│  • Bullet point 1        │                          │
│  • Bullet point 2        │  [Interviewer] [Answer]  │
│  • code snippet          │  Next question...        │
│                          │                          │
│  [Copy] [↻ Retry] [👍]  │                          │
│                          │                          │
└──────────────────────────┴──────────────────────────┘
```

---

## 🛡 Undetectability Layers

| Layer | Method | Protection Against |
|---|---|---|
| **Visual** | Win32 `SetWindowDisplayAffinity(WDA_EXCLUDEFROMCAPTURE)` | Zoom, Teams, Meet screen share |
| **Network** | Local Ollama processing (no outbound API calls) | Corporate firewalls, network monitoring |
| **Audio** | System audio loopback (WASAPI) | No virtual mic injection |
| **Process** | No browser extension injection | Extension detection |

---

## 🗺 Roadmap

### v1.0 — Current (UI Preview)
- [x] Glassmorphism overlay UI
- [x] Streaming AI responses
- [x] Live transcript panel
- [x] Animated waveform visualizer
- [x] Hotkey system
- [x] Model selector

### v1.5 — Desktop App (Electron/Tauri)
- [ ] Real screen capture exclusion (Win32 API)
- [ ] Real audio loopback (WASAPI/CoreAudio)
- [ ] Whisper.cpp local transcription
- [ ] Ollama local AI integration
- [ ] Resume + JD upload & parsing

### v2.0 — Full Product
- [ ] Cross-device Phone Mode (bypass all detection)
- [ ] Mock Interview Practice Mode
- [ ] STAR Answer Builder
- [ ] 10,000+ Question Bank
- [ ] Hindi + Indian Language Support
- [ ] ₹299/mo Indian pricing

---

## 🤝 Contributing

Contributions are welcome! Please:

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

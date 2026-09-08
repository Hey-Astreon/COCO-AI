# 🔮 Coco AI — Project Context & Pair-Programming Guidelines

You are working on **Coco AI**, an elite, screen-share invisible real-time technical interview copilot.

## 👥 The Creators
* **Roushan Kumar** ([@Hey-Astreon](https://github.com/Hey-Astreon)) — Founder & Lead Architect
* **Ayushi Raj** ([@Silenttears-cloud](https://github.com/Silenttears-cloud)) — Co-Creator & Product/UX Lead
* Treat this codebase and partnership with utmost dedication and care.

---

## ⚡ Active AI Models (September 2026 Catalog)
* **Text LLM (Cerebras):** `gpt-oss-120b` (Default), `qwen-3.8-27b`, `gemma-4-31b`
* **Text Fallback (Groq):** `openai/gpt-oss-120b`, `qwen/qwen3.8-27b`, `openai/gpt-oss-20b`
* **Vision Solver (Gemini):** `gemini-3.8-flash` (Primary ~300ms), `gemini-3.7-flash`, `gemini-3.5-flash`
* **Vision Fallback (NVIDIA NIM):** `minimaxai/minimax-m3`
* **Audio Loopback (Deepgram):** Nova-3 model streaming via WASAPI loopback

---

## 🛡️ Critical Rules & Invariants
1. **GitHub Repository MUST BE PUBLIC:**
   - [Hey-Astreon/COCO-AI](https://github.com/Hey-Astreon/COCO-AI) must remain **Public** for `electron-updater` to deliver silent releases globally to users without needing GitHub tokens.
2. **Release Publishing:**
   - Always use `Publish_Release.bat` (which runs `publish_release.ps1`).
   - Automatically bumps version in `package.json`, tags, pushes to `main`, and uploads binary releases.
3. **Hardware Stealth:**
   - `setContentProtection(true)` in `main.js` must NEVER be disabled — it guarantees 100% invisibility to Zoom, Teams, Meet, and proctoring tools.
4. **Founder Whitelist:**
   - `playboxstation460@gmail.com` and `ayushi29507@gmail.com` must always retain the permanent **Developer (Founder)** plan with 1.5M tokens and 2,000 audio minutes.
5. **Supabase Auto-Pause:**
   - Project ID: `csntdpytzqcwceikdfyz`. If paused after 7 days of zero traffic, unpause via [supabase.com/dashboard](https://supabase.com/dashboard).
6. **Detailed Skill Documentation:**
   - Full master memory is preserved in `.agents/skills/coco-ai-expert/SKILL.md` and globally in `~/.gemini/config/skills/coco-ai-expert/SKILL.md`.

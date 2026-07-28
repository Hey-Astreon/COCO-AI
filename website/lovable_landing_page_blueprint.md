# 🚀 Coco AI Premium Landing Page Blueprint & Lovable Master Prompt

This blueprint outlines the visual design, page structure, pricing, giveaway criteria, and open-source contribution details for the Coco AI landing page. It is structured to act as a **Master Prompt** that you can copy and paste directly into **Lovable** to build a professional-grade, modern SaaS landing page.

---

## 🎨 Design System & Visual Aesthetics

To ensure the landing page looks like a premium, state-of-the-art SaaS product:
1. **Color Palette (Harmless & Harmony Dark Mode):**
   - **Background:** Deep space obsidian `#0B0C10` (gradient transitioning to `#1F2833` for section backgrounds).
   - **Accents:** Neon Violet `#8A2BE2` (for primary focus and CTA buttons) and Electric Emerald `#00FA9A` (for success indicators, prices, and savings).
   - **Gradients:** Glassmorphic card backgrounds with a subtle `rgba(255, 255, 255, 0.03)` fill and `1px solid rgba(255, 255, 255, 0.08)` border.
2. **Typography:**
   - Headings in **Outfit** (bold, modern, high-tech geometric sans-serif).
   - Body copy in **Inter** (clean, highly readable sans-serif).
   - Code/Terminal elements in **JetBrains Mono**.
3. **Animations:**
   - Pulse animations for the Live Audio Visualizer.
   - Smooth hover transition states (`all 0.3s ease`) on buttons and cards.
   - Glowing gradient borders behind primary cards.

---

## 📸 Real UI & Feature Image References (Included in lovable Folder)

Use the following real application screenshots and feature graphics to explain the features in the landing page:
- **Hero / Main Preview:** `website/lovable/real_cocoai_ui_preview.png` (Full desktop dashboard mockup).
- **Core Feature 1 (AI Answers):** `website/lovable/cocoai_answers.png` (Real QA feed showing structured solutions, code blocks, and retry buttons).
- **Core Feature 2 (Live Transcript):** `website/lovable/cocoai_transcript.png` (Real-time speaker detection and audio waveform).
- **Core Feature 3 (Stealth & Context):** `website/lovable/cocoai_settings.png` (Settings drawer with PDF resume context matching).
- **Feature 4 (Stealth Proof / Eye Button):** `website/lovable/cocoai_stealth_comparison.png` (Split comparison showing what you see vs what screen share sees).
- **Feature 5 (Session Exporting):** `website/lovable/cocoai_export_md.png` (Visual representation of saving the interview logs as Markdown, JSON, or TXT).
- **Feature 6 (Screen & Multi-Screenshot Analysis):** `website/lovable/cocoai_screen_analysis.png` (Visual showing coding problems analyzed from single or scroll-stitched multi-monitor screenshots).

---

# 🤖 The Lovable Master Prompt

*Copy and paste the text block below directly into Lovable to generate the landing page:*

```text
Build a premium, ultra-modern SaaS landing page for "CocoAI" — an invisible real-time copilot for technical interviews. The site must look extremely sleek, high-tech, and professional, using a glassmorphic dark theme.

Colors & Fonts:
- Background: `#0B0C10` (obsidian black) with subtle radial glowing grids.
- Accents: Electric Purple (`#8A2BE2`) and Neon Mint (`#00FA9A`).
- Fonts: "Outfit" for headings, "Inter" for body text.

Include these exact pages/sections on the landing page:

1. NAVBAR:
- Logo pill on the left: CocoAI logo image (lovable/coco_logo_nobg.png) and text "CocoAI".
- Navigation links: Features, Pricing, Giveaway, Contributors.
- Right CTA Button: "Get Early Access" (glowing gradient button).

2. HERO SECTION:
- Tagline: "Ace Your Technical Interviews. Invisibly."
- Subtitle: "Real-time question detection, personalized answers based on your resume, and a fully customizable stealth overlay. Running locally, safely, and securely."
- Primary CTA Buttons:
  * "Download CocoAI Pro for Windows" (Link: `https://github.com/Hey-Astreon/COCO-AI/releases/download/v1.0.38/CocoAI_Installer_v1.0.38.exe`)
  * "Star on GitHub" (Link: `https://github.com/Hey-Astreon/COCO-AI`)
  * "View Releases" (Link: `https://github.com/Hey-Astreon/COCO-AI/releases/latest`)
- Display a large, high-resolution browser mockup container showcasing the main UI screenshot (`lovable/real_cocoai_ui_preview.png`) with a clean shadow.

3. DYNAMIC FEATURE HIGHLIGHTS (Two-column responsive grid alternating images & text with exact screenshot callouts):
- Feature 1: "Real-Time Speech-to-Text, Speaker Detection & VAD"
  * Description: "Listens directly to the interviewer, groups sentences using advanced Voice Activity Detection (VAD), and filters pauses. The Live Transcript feed displays real-time speech bubbles with speaker tags (INTERVIEWER / CANDIDATE) and instant '⚡ ANSWER' triggers next to every question."
  * Screenshot Example: Showcase `lovable/cocoai_transcript.png`.
- Feature 2: "Deep Resume & JD Context Ingestion"
  * Description: "Drag and drop your PDF resume and paste the job description directly into the Settings drawer. CocoAI uses this context to automatically align answers to your project history (e.g. Alyra Lock, Astra Vision) and specific technical stack (React, TypeScript, Express, MongoDB, FastAPI)."
  * Screenshot Example: Showcase `lovable/cocoai_settings.png` focusing on the Context Input forms.
- Feature 3: "Invisible Stealth Overlay & Screen Share Protection (Eye Button)"
  * Description: "Built to be completely invisible on screen sharing (Zoom, Teams, Google Meet). Control overlay modes via globally-registered hotkeys: Ctrl+Shift+H (Hide Window), Ctrl+Shift+A (Analyze Screen), Ctrl+Shift+S (Add Page), and Ctrl+Shift+G (Cycle Stealth). Toggle stealth states with the Eye icon button and slide opacity from 35% to 100%."
  * Screenshot Example: Showcase the split-screen comparison graphic `lovable/cocoai_stealth_comparison.png` demonstrating what you see vs. what screen sharing sees.
- Feature 4: "Multi-Format Session Exporting"
  * Description: "Never lose a valuable interview question or solution. At any point, click the toolbar Export button to download the entire session transcript and generated code answers as clean Markdown (`.md`), plain Text (`.txt`), or structural JSON (`.json`) files for offline study or replay mode."
  * Screenshot Example: Showcase the interactive export graphic `lovable/cocoai_export_md.png` highlighting the '.md' exporting panel and download confirmation.
- Feature 5: "Screen Analysis & Multi-Screenshot Scroll Stitching"
  * Description: "Struggling with long coding prompts or complex diagrams? Press Ctrl+Shift+A to capture and solve code from any window or monitor. For long-scrolling pages, use Ctrl+Shift+S to stitch multiple page blocks together into a single, cohesive prompt that Gemini analyzes in one go."
  * Screenshot Example: Showcase the visual flow graphic `lovable/cocoai_screen_analysis.png` demonstrating page capturing and multi-screenshot stitching.

4. PRICING SECTION:
- Header: "Simple, Transparent Pricing"
- Subscription Card:
  * Name: "Starter Pro"
  * Price: "299 INR / month"
  * Features included: Ultra-fast Cerebras Llama-3.3 streaming, dynamic resume context injection, custom keyword boosting (prevents spelling errors), zero-delay screen solver, and full lifetime updates.
  * CTA Button: "Get Started Now"

5. GIVEAWAY SECTION (Specially Highlighted Card with Neon Mint Border):
- Title: "🎁 Launch Giveaway — Get Pro for Free"
- Subtitle: "The first 5 developers to participate will receive a lifetime CocoAI Pro license for free!"
- Rules List:
  1. Follow the developer on GitHub.
  2. Give a Star (⭐) to our official GitHub repository.
- Participation Card Link: Add a link button pointing to your GitHub Profile/Repository.

6. CONTRIBUTOR SIGN-UP (Open Source Developer Form):
- Title: "Join the Open Source Core Team"
- Description: "If you are a dedicated developer looking to contribute to an early-stage stealth product, fill out the form below. I will choose 5 developers to become core contributors, granting them early access to beta features and repository access."
- Form Fields:
  * Full Name (Text input)
  * Email Address (Email input)
  * GitHub Username (Text input)
  * Google Drive Link to Resume (URL input)
  * Brief Description of why you want to contribute (Textarea)
- Submit Button: "Apply as Contributor" (electric purple hover effect).

7. FOOTER:
- Logo text, links to social profiles, and copyright: "© 2026 CocoAI. Built with 💜 by Hey-Astreon & Silenttears-cloud."
- Link back to GitHub repository.

Apply smooth entry animations, glassmorphism card designs (1px borders, slight background blur), and ensure the layout is fully responsive on mobile and desktop.
```

---

## 🛠️ Deployment Steps

To deploy this landing page after building it in Lovable:
1. Ensure the assets copied into your project directory `x:\coco ai\website\assets\` are uploaded along with the codebase.
2. Put the generated website inside the `website/` directory of this repo.
3. Test locally by running a static server in the `website/` directory.

```bash
# To preview locally
npx serve website/
```

This landing page aligns perfectly with your marketing goals, prices, giveaways, and contributor programs! Let me know if you would like me to draft anything else.

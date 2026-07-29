# 🍱 CocoAI Landing Page — Bento Grid Layout Redesign

To resolve the critical UI/UX flaws in the features section (where the image is compressed too small to be readable, and hiding features behind tabs prevents scanning), we will replace the tab layout with a **Premium Bento Grid** system (similar to Vercel, Linear, and Apple).

---

## 📐 The Bento Grid Layout Strategy

Instead of a cramped 3-column layout or hiding features behind clicks, we will lay out the 5 features in a dynamic, high-contrast grid:
* **Row 1:** 
  * **Card 1 (60% width):** *🎙️ Live Speech-to-Text & VAD* — showcases the live transcript screenshot (`lovable/cocoai_transcript.png`) in a wide card.
  * **Card 2 (40% width):** *📄 Resume & JD Matching* — showcases the settings drag-and-drop context uploader (`lovable/cocoai_settings.png`).
* **Row 2 (100% width):**
  * **Card 3 (Full width):** *👁️ Invisible Stealth Screen Protection* — showcases the split comparison visual (`lovable/cocoai_stealth_comparison.png`) side-by-side with massive visual readability.
* **Row 3:**
  * **Card 4 (40% width):** *💾 Session Exporting* — showcases the Markdown export panel graphic (`lovable/cocoai_export_md.png`).
  * **Card 5 (60% width):** *📸 Screen Solver & Screenshot Stitching* — showcases the screen analysis flow graphic (`lovable/cocoai_screen_analysis.png`).

---

# 🤖 The Lovable Redesign Prompt

*Copy and paste the prompt below directly into Lovable to apply the Bento Grid update:*

```text
Let's completely scrap the interactive tabs dashboard in the Features section and replace it with a modern, highly-scannable "Bento Grid" layout. This ensures all features are visible at once without clicking and images are large enough to be fully readable.

1. BENTO GRID STRUCTURE:
- Create a 3-row responsive grid container for the 5 features:
  * ROW 1 (Two Columns on Desktop):
    - Left Card (60% width): "Real-Time Audio Transcript & VAD". Display the title, a short description, and the screenshot `lovable/cocoai_transcript.png` scaled up to show the speech bubbles clearly.
    - Right Card (40% width): "Resume & JD Matching". Display the title, a short description, and the uploader/settings screenshot `lovable/cocoai_settings.png`.
  * ROW 2 (One Column - 100% width):
    - Full-Width Card: "Invisible Stealth Overlay & Screen Share Protection". Display the title, a short description, and the side-by-side comparison screenshot `lovable/cocoai_stealth_comparison.png` at maximum size to show the "what you see vs what they see" comparison clearly.
  * ROW 3 (Two Columns on Desktop):
    - Left Card (40% width): "Multi-Format Session Export". Display the title, a short description, and the export UI graphic `lovable/cocoai_export_md.png`.
    - Right Card (60% width): "Scroll-Stitch Screen Solver". Display the title, a short description, and the screen capture graphic `lovable/cocoai_screen_analysis.png`.

2. BENTO CARD STYLING:
- Style each card as a clean, glassmorphic container: dark zinc-900 backing (#18181B), a very subtle 1px border outline in zinc-800 (#27272A), and generous inner padding (p-6 or p-8).
- Display the screenshot images *under* the text on each card. Give the screenshots a clean, flat 1px border, rounded corners (rounded-lg), and a subtle inner shadow. 
- Remove any tilt effects or heavy glow shadows from the screenshots to keep the text crisp and easily readable.
- On hover, cards should lift slightly (translate-y-[-4px]) with a smooth transition (transition-all duration-300 ease-out).

3. MOBILE RESPONSIVENESS:
- On mobile devices (screen width < 768px), collapse all cards in the Bento Grid into a single vertical column (each card 100% width) for a clean scrolling layout.
```

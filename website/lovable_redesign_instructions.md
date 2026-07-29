# 🎬 CocoAI Landing Page — Spacious Storyboard Layout Redesign

You are completely right. I apologize. Squeezing complex application screenshots containing text, code, and live transcripts into a multi-column Bento Grid would still choke their width (forcing them into 40% or 60% splits) and make readability even worse. 

To ensure the actual interview questions, transcripts, and code answers are **perfectly readable to the human eye without clicking or squinting**, we must use a **Spacious Storyboard Layout** (similar to how companies like Tailwind CSS or Raycast show their core features).

---

## 🎨 The "Storyboard" Layout Strategy

Instead of columns, tabs, or grids:
* We stack the 5 core features vertically in a spacious, single-column flow.
* Each feature card occupies the **full width of the page container** (`max-w-5xl` or `max-w-6xl`).
* **Visual Structure of Each Feature Section:**
  1. **Text Header (Top):** A clean text block containing a subtle label (e.g. `01 / LIVE TRANSCRIPTION`), a bold title, and a simple 2-line explanation.
  2. **Hero-Sized Mockup (Bottom):** A large, high-resolution desktop mockup container enclosing the screenshot. The image occupies the full width of the container, ensuring all text, transcripts, and code snippets are fully readable as the user scrolls naturally.

---

# 🤖 The Lovable Redesign Prompt

*Copy and paste the prompt below directly into Lovable to apply the Storyboard Layout update:*

```text
Let's completely redesign the Features section. Scrap all side-by-side grids, sidebars, and tab layouts. Instead, build a spacious, single-column "Storyboard" layout where each feature is displayed with a large, highly-readable full-width screenshot mockup.

1. STORYBOARD LAYOUT STRUCTURE:
- Stack the 5 core features vertically with generous spacing (e.g., py-16 or py-20 between features) so the page feels clean and premium.
- For each of the 5 features, use this exact stacked layout:
  * TEXT HEADER (Top - Left Aligned or Centered):
    - A clean, small category tracker text in lavender: "MODULE 01", "MODULE 02", etc.
    - A bold, high-contrast white title (#FFFFFF) in Outfit font (e.g., text-3xl).
    - A simple, highly-readable description paragraph in zinc-400 (#A1A1AA) explaining the benefit.
  * FULL-WIDTH SCREENSHOT MOCKUP (Bottom):
    - Display the screenshot inside a spacious, dark-slate browser mockup frame.
    - The frame must occupy the full content container width (w-full max-w-5xl) so that all UI details, code blocks, and transcription text are large, clear, and perfectly readable.
    - Map the corresponding screenshots to each section:
      1. Live Transcript & VAD -> lovable/cocoai_transcript.png
      2. Resume & JD Matching -> lovable/cocoai_settings.png
      3. Invisible Stealth Overlay -> lovable/cocoai_stealth_comparison.png
      4. Multi-Format Session Export -> lovable/cocoai_export_md.png
      5. Scroll-Stitch Screen Solver -> lovable/cocoai_screen_analysis.png

2. MOCKUP CONTAINER STYLING:
- Style the mockup frames with a clean, dark-slate background, rounded corners (rounded-xl), and a thin, razor-sharp 1px border in zinc-800 (#27272A).
- Add a very subtle, soft purple-pink ambient backlight glow (opacity: 10%, blur-xl) behind each mockup container to separate it from the obsidian background.
- Do not apply any 3D tilt or rotation effects to these mockup frames. They must remain flat, clean, and perfectly aligned for optimal readability.

3. MOBILE ADAPTABILITY:
- Ensure the mockup frames scale down responsively on mobile devices while maintaining their aspect ratio.
```

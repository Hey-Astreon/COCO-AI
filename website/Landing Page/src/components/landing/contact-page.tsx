import { useState } from "react";
import { useNavigation } from "@/lib/navigation";
import {
  Bug, MessageSquare, HelpCircle, Zap, ChevronDown, ChevronUp,
  Send, Loader2, CheckCircle2, Check, X, Minus, Sparkles,
} from "lucide-react";

// ─── Contact Page ────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: "bug",        label: "🐛 Bug Report",           desc: "Something isn't working" },
  { value: "technical",  label: "🔧 Technical Issue",       desc: "Setup or configuration help" },
  { value: "feature",    label: "💡 Feature Request",       desc: "Suggest an improvement" },
  { value: "account",    label: "👤 Account & Billing",     desc: "Subscription or login issues" },
  { value: "other",      label: "💬 Other",                 desc: "Anything else" },
];

const FAQ_ITEMS = [
  {
    q: "Will CocoAI get me banned or flagged during an interview?",
    a: "No. CocoAI runs as an invisible overlay that is completely undetectable by screen-sharing software like Zoom, Google Meet, MS Teams, or any proctoring tool. It uses Electron's content protection API to make the window invisible to all capture software. No interviewers or proctoring systems can see it.",
  },
  {
    q: "Is CocoAI cheating?",
    a: "That's a fair question, and here's our honest answer: CocoAI is an assistive tool — like a calculator, Google, or Stack Overflow. Companies use AI internally every single day. The goal of interviews should be to test how you think and problem-solve, not how well you can recall syntax under anxiety. CocoAI helps you perform at your actual potential, not a fake pressure version of yourself.",
  },
  {
    q: "Do you store my interview conversations or audio?",
    a: "Absolutely not. CocoAI processes everything locally on your machine. Your audio is streamed directly to Deepgram for transcription and immediately discarded. Your questions and answers go directly to Cerebras or Groq AI — nothing is logged, stored, or sent to CocoAI servers. We have zero access to your interview content.",
  },
  {
    q: "What happens when my free token limit runs out?",
    a: "You'll see a clear in-app notification when your monthly limit is approaching and when it's reached. Your limit resets automatically at the start of each calendar month. You can upgrade to a higher plan at any time from the CocoAI website to get more tokens and audio minutes instantly.",
  },
  {
    q: "Can I use CocoAI for non-interview use cases?",
    a: "Yes! Many users use CocoAI as a general stealth AI assistant — during online exams, certification tests, live coding challenges, hackathons, or even just as an always-on invisible AI assistant during work calls. The screen analysis feature works on any screen content.",
  },
  {
    q: "Why is CocoAI a Windows-only app right now?",
    a: "The stealth window technology that makes CocoAI invisible to screen capture relies on Electron's content protection API, which works best on Windows with DirectX. A macOS version is on our roadmap — it requires a different approach using Core Graphics. If you want macOS support, let us know via the contact form and it helps us prioritize!",
  },
  {
    q: "Is my API key safe if I put it into CocoAI?",
    a: "Yes. Your API keys are stored locally in your computer's localStorage — they never leave your machine. CocoAI is fully open source, so you can verify this yourself in the source code on GitHub. We never transmit your keys to any external server.",
  },
];

const COMPARISON_DATA = {
  features: [
    "Screen Analysis (OCR + Vision AI)",
    "Real-time Audio Transcription",
    "Stealth / Invisible Overlay",
    "Multi-AI Fallback (Cerebras → Groq)",
    "Session Export (TXT / JSON)",
    "PDF Resume Context Injection",
    "Ghost Mode (Click-through)",
    "Open Source",
    "Free Tier Available",
    "Windows Native App",
    "Auto-update Delivery",
    "No Data Storage / Privacy",
  ],
  tools: [
    { name: "CocoAI",        color: "hsl(262 83% 68%)", values: [true, true, true, true, true, true, true, true, true, true, true, true] },
    { name: "Cluely",        color: "hsl(0 0% 55%)",    values: [true, true, true, false, false, false, false, false, false, true, true, "partial"] },
    { name: "Parakeet AI",   color: "hsl(0 0% 55%)",    values: [true, true, "partial", false, false, false, false, false, true, true, false, "partial"] },
    { name: "Chiku AI",      color: "hsl(0 0% 55%)",    values: ["partial", true, "partial", false, false, false, false, false, true, true, false, "partial"] },
    { name: "Mindwhisper AI",color: "hsl(0 0% 55%)",    values: [false, true, "partial", false, false, false, false, false, true, true, false, false] },
  ],
};

const PLATFORMS = [
  {
    name: "Google Meet",
    color: "#1a73e8",
    icon: (
      <svg viewBox="0 0 48 48" className="h-7 w-7">
        <path fill="#4CAF50" d="M29 19h-2v-3h-6v3H19v2h2v6h-2v2h10v-2h-2v-6h2z"/>
        <path fill="#1565C0" d="M32 12H16c-2.2 0-4 1.8-4 4v16c0 2.2 1.8 4 4 4h16c2.2 0 4-1.8 4-4V16c0-2.2-1.8-4-4-4z"/>
        <path fill="#4CAF50" d="M36 20l-8 4 8 4z"/>
        <path fill="#fff" d="M20 20h8v8h-8z"/>
        <path fill="#1565C0" d="M20 20h4v4h-4z"/>
        <path fill="#4CAF50" d="M24 20h4v4h-4z"/>
        <path fill="#4CAF50" d="M20 24h4v4h-4z"/>
        <path fill="#1976D2" d="M24 24h4v4h-4z"/>
      </svg>
    ),
  },
  {
    name: "Zoom",
    color: "#2d8cff",
    icon: (
      <svg viewBox="0 0 48 48" className="h-7 w-7">
        <rect width="48" height="48" rx="10" fill="#2D8CFF"/>
        <path fill="white" d="M8 17a3 3 0 013-3h18a3 3 0 013 3v14a3 3 0 01-3 3H11a3 3 0 01-3-3V17z"/>
        <path fill="#2D8CFF" d="M32 22l8-5v14l-8-5V22z"/>
      </svg>
    ),
  },
  {
    name: "Discord",
    color: "#5865f2",
    icon: (
      <svg viewBox="0 0 48 48" className="h-7 w-7">
        <rect width="48" height="48" rx="10" fill="#5865F2"/>
        <path fill="white" d="M33.5 13a22.7 22.7 0 00-5.8-1.8l-.3.5a15.8 15.8 0 00-4 0l-.3-.5A22.3 22.3 0 0017.4 13C14.1 18 13.2 22.8 13.6 27.5a23 23 0 007 3.5 17 17 0 001.5-2.5l-2.4-1.1.6-.5 2.5 1.2a14.9 14.9 0 0010.5 0l2.5-1.2.6.5-2.4 1.1a17 17 0 001.5 2.5 23 23 0 007-3.5c.5-5.4-1-10.1-3-14.5zM20 25c-1.1 0-2-1-2-2.3S18.9 20.3 20 20.3s2 1.1 2 2.4S21.1 25 20 25zm8 0c-1.1 0-2-1-2-2.3S26.9 20.3 28 20.3s2 1.1 2 2.4S29.1 25 28 25z"/>
      </svg>
    ),
  },
  {
    name: "Microsoft Teams",
    color: "#6264a7",
    icon: (
      <svg viewBox="0 0 48 48" className="h-7 w-7">
        <rect width="48" height="48" rx="10" fill="#6264A7"/>
        <path fill="white" d="M29 14a4 4 0 110 8 4 4 0 010-8zm4 10h-8c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2zm-4-2a5 5 0 100-10 5 5 0 000 10zm-10 0a3 3 0 100-6 3 3 0 000 6zm0 2c-3.3 0-10 1.7-10 5v2h10v-2c0-1.4.4-2.7 1.2-3.8-.4-.1-.8-.2-1.2-.2z"/>
      </svg>
    ),
  },
  {
    name: "Skype",
    color: "#00aff0",
    icon: (
      <svg viewBox="0 0 48 48" className="h-7 w-7">
        <rect width="48" height="48" rx="24" fill="#00AFF0"/>
        <path fill="white" d="M35.6 27.4a12 12 0 01-15 9.2A7 7 0 0112.4 24c.1-1.2.5-2.3 1-3.3a12 12 0 0115-9.2A7 7 0 0135.6 24c-.1 1.2-.5 2.3-1 3.4zm-11-10c-4 0-6 1.9-6 4.3 0 5.7 8.7 4.5 8.7 7.3 0 1.1-1 1.7-2.8 1.7-2.5 0-3.5-1.3-3.5-2.3H18c0 2.9 2.4 4.6 6.6 4.6 3.8 0 6-1.8 6-4.4 0-5.8-8.7-4.6-8.7-7.3 0-1 .9-1.6 2.6-1.6 2 0 3.1 1 3.1 2.2H30c0-2.7-2.2-4.5-5.4-4.5z"/>
      </svg>
    ),
  },
  {
    name: "Webex",
    color: "#00bef2",
    icon: (
      <svg viewBox="0 0 48 48" className="h-7 w-7">
        <rect width="48" height="48" rx="10" fill="#00BEF2"/>
        <path fill="white" d="M24 10c-7.7 0-14 6.3-14 14s6.3 14 14 14 14-6.3 14-14S31.7 10 24 10zm5.5 20l-5.5-8.5L18.5 30 13 18h4l1.5 8 5-8 5 8 1.5-8H34l-4.5 12z"/>
      </svg>
    ),
  },
];

// ─── Helper: cell render ─────────────────────────────────────────────────────
function Cell({ value, isCocoAI }: { value: boolean | string; isCocoAI: boolean }) {
  if (value === true)
    return (
      <span
        className="inline-flex h-6 w-6 items-center justify-center rounded-full"
        style={{
          background: isCocoAI ? "hsl(262 83% 58% / 0.18)" : "hsl(142 70% 45% / 0.12)",
          color: isCocoAI ? "hsl(262 83% 72%)" : "hsl(142 70% 55%)",
        }}
      >
        <Check className="h-3.5 w-3.5" />
      </span>
    );
  if (value === "partial")
    return (
      <span
        className="inline-flex h-6 w-6 items-center justify-center rounded-full"
        style={{
          background: "hsl(48 95% 50% / 0.12)",
          color: "hsl(48 95% 60%)",
        }}
      >
        <Minus className="h-3.5 w-3.5" />
      </span>
    );
  return (
    <span
      className="inline-flex h-6 w-6 items-center justify-center rounded-full"
      style={{
        background: "hsl(0 70% 50% / 0.10)",
        color: "hsl(0 70% 60%)",
      }}
    >
      <X className="h-3.5 w-3.5" />
    </span>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function ContactPage() {
  const { navigate } = useNavigation();

  // Form state
  const [formData, setFormData] = useState({
    name: "", email: "", category: "", subject: "", message: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.category) { setFormError("Please select a category."); return; }
    setFormError(null);
    setFormLoading(true);
    // Simulate send (replace with real endpoint / Supabase / Formspree)
    await new Promise(r => setTimeout(r, 1400));
    setFormLoading(false);
    setFormSent(true);
  }

  return (
    <div className="min-h-screen" style={{ background: "hsl(240 6% 5%)" }}>

      {/* ─── Hero ─── */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div
            className="absolute top-[-80px] left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full opacity-20"
            style={{
              background: "radial-gradient(ellipse, hsl(262 83% 58%) 0%, hsl(196 80% 55%) 40%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-6 pt-32 pb-16 text-center">
          <div
            className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
            style={{
              background: "hsl(262 83% 58% / 0.12)",
              border: "1px solid hsl(262 83% 58% / 0.25)",
              color: "hsl(262 83% 72%)",
            }}
          >
            <MessageSquare className="h-3 w-3" />
            Get in Touch
          </div>
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl" style={{ color: "hsl(0 0% 96%)" }}>
            How can we{" "}
            <span style={{
              background: "linear-gradient(135deg, hsl(262 83% 68%), hsl(196 80% 60%))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>help you?</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed" style={{ color: "hsl(240 5% 55%)" }}>
            Found a bug, need help with setup, or just want to say hi? We read
            every message and usually respond within 24 hours.
          </p>
        </div>
      </div>

      {/* ─── Contact Form ─── */}
      <div className="mx-auto max-w-2xl px-6 pb-20">
        {formSent ? (
          <div
            className="flex flex-col items-center gap-5 rounded-2xl p-12 text-center"
            style={{
              background: "hsl(240 6% 8%)",
              border: "1px solid hsl(142 70% 45% / 0.3)",
              boxShadow: "0 0 40px hsl(142 70% 45% / 0.08)",
            }}
          >
            <CheckCircle2 className="h-14 w-14" style={{ color: "hsl(142 70% 55%)" }} />
            <h3 className="text-2xl font-bold" style={{ color: "hsl(0 0% 94%)" }}>Message sent!</h3>
            <p className="max-w-sm text-sm" style={{ color: "hsl(240 5% 55%)" }}>
              Thanks for reaching out. We'll get back to you at <strong style={{ color: "hsl(0 0% 80%)" }}>{formData.email}</strong> within 24 hours.
            </p>
            <button
              onClick={() => { setFormSent(false); setFormData({ name: "", email: "", category: "", subject: "", message: "" }); }}
              className="mt-2 text-sm transition-colors"
              style={{ color: "hsl(262 83% 68%)" }}
            >
              Send another message
            </button>
          </div>
        ) : (
          <div
            className="relative rounded-2xl p-8 sm:p-10"
            style={{
              background: "hsl(240 6% 8% / 0.9)",
              border: "1px solid hsl(240 6% 16%)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 24px 64px hsl(0 0% 0% / 0.4)",
            }}
          >
            <div className="absolute top-0 left-12 right-12 h-px" style={{
              background: "linear-gradient(90deg, transparent, hsl(262 83% 60% / 0.5), hsl(196 80% 55% / 0.5), transparent)",
            }} />

            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Name + Email */}
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { id: "contact-name", label: "Your Name", placeholder: "Roushan Kumar", key: "name", type: "text" },
                  { id: "contact-email", label: "Email Address", placeholder: "you@example.com", key: "email", type: "email" },
                ].map(({ id, label, placeholder, key, type }) => (
                  <div key={key}>
                    <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: "hsl(240 5% 50%)" }}>
                      {label}
                    </label>
                    <input
                      id={id} type={type} placeholder={placeholder} required
                      value={(formData as any)[key]}
                      onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))}
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
                      style={{ background: "hsl(240 6% 10%)", border: "1px solid hsl(240 6% 18%)", color: "hsl(0 0% 90%)" }}
                      onFocus={e => { e.target.style.borderColor = "hsl(262 83% 58% / 0.6)"; e.target.style.boxShadow = "0 0 0 3px hsl(262 83% 58% / 0.1)"; }}
                      onBlur={e => { e.target.style.borderColor = "hsl(240 6% 18%)"; e.target.style.boxShadow = "none"; }}
                    />
                  </div>
                ))}
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider" style={{ color: "hsl(240 5% 50%)" }}>
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.value} type="button"
                      onClick={() => setFormData(p => ({ ...p, category: cat.value }))}
                      className="rounded-xl px-3 py-2.5 text-left text-xs transition-all duration-150"
                      style={{
                        background: formData.category === cat.value ? "hsl(262 83% 58% / 0.15)" : "hsl(240 6% 10%)",
                        border: formData.category === cat.value ? "1px solid hsl(262 83% 58% / 0.5)" : "1px solid hsl(240 6% 18%)",
                        color: formData.category === cat.value ? "hsl(262 83% 72%)" : "hsl(240 5% 55%)",
                        boxShadow: formData.category === cat.value ? "0 0 12px hsl(262 83% 58% / 0.12)" : "none",
                      }}
                    >
                      <div className="font-medium">{cat.label}</div>
                      <div className="mt-0.5 opacity-70">{cat.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="contact-subject" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: "hsl(240 5% 50%)" }}>
                  Subject
                </label>
                <input
                  id="contact-subject" type="text" placeholder="Brief description of your issue" required
                  value={formData.subject}
                  onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
                  style={{ background: "hsl(240 6% 10%)", border: "1px solid hsl(240 6% 18%)", color: "hsl(0 0% 90%)" }}
                  onFocus={e => { e.target.style.borderColor = "hsl(262 83% 58% / 0.6)"; e.target.style.boxShadow = "0 0 0 3px hsl(262 83% 58% / 0.1)"; }}
                  onBlur={e => { e.target.style.borderColor = "hsl(240 6% 18%)"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="contact-message" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: "hsl(240 5% 50%)" }}>
                  Message
                </label>
                <textarea
                  id="contact-message" rows={5} required
                  placeholder="Please describe your issue in as much detail as possible..."
                  value={formData.message}
                  onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                  className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
                  style={{ background: "hsl(240 6% 10%)", border: "1px solid hsl(240 6% 18%)", color: "hsl(0 0% 90%)" }}
                  onFocus={e => { e.target.style.borderColor = "hsl(262 83% 58% / 0.6)"; e.target.style.boxShadow = "0 0 0 3px hsl(262 83% 58% / 0.1)"; }}
                  onBlur={e => { e.target.style.borderColor = "hsl(240 6% 18%)"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              {formError && (
                <p className="rounded-xl px-4 py-3 text-sm" style={{ background: "hsl(0 70% 50% / 0.08)", border: "1px solid hsl(0 70% 50% / 0.2)", color: "hsl(0 80% 70%)" }}>
                  ⚠️ {formError}
                </p>
              )}

              <button
                type="submit" disabled={formLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg, hsl(262 83% 58%), hsl(196 80% 52%))",
                  boxShadow: "0 4px 20px hsl(262 83% 58% / 0.3)",
                }}
                onMouseEnter={e => !formLoading && ((e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 28px hsl(262 83% 58% / 0.5)")}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px hsl(262 83% 58% / 0.3)")}
              >
                {formLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {formLoading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ─── Platform Compatibility ─── */}
      <div className="mx-auto max-w-5xl px-6 pb-24">
        <div className="mb-12 text-center">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
            style={{ background: "hsl(142 70% 45% / 0.1)", border: "1px solid hsl(142 70% 45% / 0.25)", color: "hsl(142 70% 60%)" }}
          >
            <Zap className="h-3 w-3" />
            Tested & Verified
          </div>
          <h2 className="text-3xl font-bold sm:text-4xl" style={{ color: "hsl(0 0% 94%)" }}>
            Works invisibly on{" "}
            <span style={{
              background: "linear-gradient(135deg, hsl(142 70% 55%), hsl(196 80% 55%))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>every platform</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm" style={{ color: "hsl(240 5% 50%)" }}>
            CocoAI has been rigorously tested to remain completely invisible across all major video conferencing platforms. Your interviewer will never see it.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {PLATFORMS.map((p, i) => (
            <div
              key={p.name}
              className="group relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl p-5 text-center transition-all duration-300"
              style={{
                background: "hsl(240 6% 8%)",
                border: "1px solid hsl(240 6% 15%)",
                animation: `fadeInUp 0.4s ease ${i * 0.07}s both`,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = `${p.color}44`;
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px ${p.color}18`;
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "hsl(240 6% 15%)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
              }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: `radial-gradient(circle at 50% 0%, ${p.color}10, transparent 60%)` }}
                aria-hidden="true"
              />
              <div className="relative z-10">
                {p.icon}
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: "hsl(0 0% 88%)" }}>{p.name}</p>
                <p className="mt-0.5 text-[10px]" style={{ color: "hsl(142 70% 55%)" }}>✓ Invisible</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs" style={{ color: "hsl(240 5% 38%)" }}>
          + Works on any other screen-sharing software that uses Windows DirectX capture
        </p>
      </div>

      {/* ─── Comparison Table ─── */}
      <div className="mx-auto max-w-5xl px-6 pb-24">
        <div className="mb-12 text-center">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
            style={{ background: "hsl(262 83% 58% / 0.1)", border: "1px solid hsl(262 83% 58% / 0.25)", color: "hsl(262 83% 72%)" }}
          >
            <Sparkles className="h-3 w-3" />
            Why CocoAI
          </div>
          <h2 className="text-3xl font-bold sm:text-4xl" style={{ color: "hsl(0 0% 94%)" }}>
            CocoAI vs. the competition
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm" style={{ color: "hsl(240 5% 50%)" }}>
            See exactly how CocoAI stacks up against other interview copilot tools on the market.
          </p>
        </div>

        <div
          className="overflow-hidden rounded-2xl"
          style={{ border: "1px solid hsl(240 6% 16%)", background: "hsl(240 6% 7%)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "hsl(240 5% 45%)", borderBottom: "1px solid hsl(240 6% 14%)" }}>
                    Feature
                  </th>
                  {COMPARISON_DATA.tools.map((t, i) => (
                    <th
                      key={t.name}
                      className="px-4 py-4 text-center text-sm font-bold"
                      style={{
                        color: i === 0 ? "hsl(262 83% 72%)" : "hsl(240 5% 55%)",
                        borderBottom: "1px solid hsl(240 6% 14%)",
                        background: i === 0 ? "hsl(262 83% 58% / 0.06)" : "transparent",
                        minWidth: "110px",
                      }}
                    >
                      {i === 0 && (
                        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "hsl(262 83% 60%)" }}>
                          ⭐ Best
                        </div>
                      )}
                      {t.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_DATA.features.map((feature, fi) => (
                  <tr
                    key={feature}
                    style={{ borderBottom: fi < COMPARISON_DATA.features.length - 1 ? "1px solid hsl(240 6% 12%)" : "none" }}
                  >
                    <td className="px-5 py-3.5 text-sm" style={{ color: "hsl(240 5% 65%)" }}>
                      {feature}
                    </td>
                    {COMPARISON_DATA.tools.map((t, ti) => (
                      <td
                        key={t.name}
                        className="px-4 py-3.5 text-center"
                        style={{ background: ti === 0 ? "hsl(262 83% 58% / 0.04)" : "transparent" }}
                      >
                        <div className="flex justify-center">
                          <Cell value={t.values[fi]} isCocoAI={ti === 0} />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div
            className="flex flex-wrap items-center gap-5 px-5 py-4"
            style={{ borderTop: "1px solid hsl(240 6% 14%)" }}
          >
            {[
              { icon: <Check className="h-3 w-3" />, color: "hsl(142 70% 55%)", label: "Supported" },
              { icon: <Minus className="h-3 w-3" />, color: "hsl(48 95% 60%)", label: "Partial / Limited" },
              { icon: <X className="h-3 w-3" />, color: "hsl(0 70% 60%)", label: "Not available" },
            ].map(({ icon, color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span style={{ color }}>{icon}</span>
                <span className="text-xs" style={{ color: "hsl(240 5% 45%)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── FAQ ─── */}
      <div className="mx-auto max-w-2xl px-6 pb-24">
        <div className="mb-10 text-center">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
            style={{ background: "hsl(48 95% 50% / 0.1)", border: "1px solid hsl(48 95% 50% / 0.25)", color: "hsl(48 95% 65%)" }}
          >
            <HelpCircle className="h-3 w-3" />
            FAQ
          </div>
          <h2 className="text-3xl font-bold" style={{ color: "hsl(0 0% 94%)" }}>
            Common questions
          </h2>
          <p className="mt-3 text-sm" style={{ color: "hsl(240 5% 50%)" }}>
            Everything you need to know before your next interview.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl transition-all duration-200"
              style={{
                background: "hsl(240 6% 8%)",
                border: openFaq === i ? "1px solid hsl(262 83% 58% / 0.4)" : "1px solid hsl(240 6% 15%)",
                boxShadow: openFaq === i ? "0 4px 20px hsl(262 83% 58% / 0.08)" : "none",
              }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors"
              >
                <span className="text-sm font-medium" style={{ color: "hsl(0 0% 90%)" }}>
                  {item.q}
                </span>
                <span className="shrink-0 transition-transform duration-200" style={{ color: "hsl(262 83% 68%)" }}>
                  {openFaq === i ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </span>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5">
                  <div className="h-px mb-4" style={{ background: "hsl(240 6% 14%)" }} />
                  <p className="text-sm leading-relaxed" style={{ color: "hsl(240 5% 58%)" }}>
                    {item.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Back nav */}
      <div className="pb-16 text-center">
        <button
          onClick={() => navigate("/")}
          className="text-sm transition-colors"
          style={{ color: "hsl(240 5% 45%)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "hsl(262 83% 72%)")}
          onMouseLeave={e => (e.currentTarget.style.color = "hsl(240 5% 45%)")}
        >
          ← Back to home
        </button>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

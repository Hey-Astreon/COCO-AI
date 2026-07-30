import { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

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

export function Faq() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section id="faq" className="relative py-20 px-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10 text-center">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
            style={{ background: "hsl(48 95% 50% / 0.1)", border: "1px solid hsl(48 95% 50% / 0.25)", color: "hsl(48 95% 65%)" }}
          >
            <HelpCircle className="h-3 w-3" />
            FAQ
          </div>
          <h2 className="text-3xl font-bold text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Everything you need to know before your next interview.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl transition-all duration-200 glass-card"
              style={{
                border: openFaq === i ? "1px solid hsl(262 83% 58% / 0.4)" : "1px solid hsl(240 6% 15%)",
                boxShadow: openFaq === i ? "0 4px 20px hsl(262 83% 58% / 0.08)" : "none",
              }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors"
              >
                <span className="text-sm font-medium text-foreground">
                  {item.q}
                </span>
                <span className="shrink-0 transition-transform duration-200" style={{ color: "hsl(262 83% 68%)" }}>
                  {openFaq === i ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </span>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5">
                  <div className="h-px mb-4 bg-border/40" />
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

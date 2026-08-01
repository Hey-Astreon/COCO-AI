import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SectionTag } from "./section-tag";
import { Reveal } from "./reveal";

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
    <section id="faq" className="relative px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-2xl">
        <Reveal className="mb-12 text-center">
          <SectionTag label="FAQ" />
          <h2 className="font-display mt-4 text-3xl font-bold tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Everything you need to know before your next interview.
          </p>
        </Reveal>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <Reveal key={i} delay={i * 40}>
              <div
                className={`glass-card overflow-hidden rounded-xl transition-all duration-300 ${
                  openFaq === i
                    ? "border-lavender/40 shadow-[0_8px_30px_-8px_rgba(139,92,246,0.25)]"
                    : "hover:border-lavender/25"
                }`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors"
                >
                  <span className="text-sm font-medium text-foreground">{item.q}</span>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                      openFaq === i ? "bg-gradient-brand text-white shadow-md shadow-violet-500/25" : "bg-accent text-muted-foreground"
                    }`}
                  >
                    {openFaq === i ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <div className="mb-4 h-px bg-border/40" />
                    <p className="text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

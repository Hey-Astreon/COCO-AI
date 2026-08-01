import { Sparkles, Check, X, Minus } from "lucide-react";
import { SectionTag } from "./section-tag";
import { Reveal } from "./reveal";
import cocoLogo from "@/assets/coco_logo_nobg.webp";

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
    {
      name: "CocoAI",
      logo: { type: "image" },
      values: [true, true, true, true, true, true, true, true, true, true, true, true],
    },
    {
      name: "Cluely",
      logo: { type: "monogram", text: "Cl", gradient: "from-cyan-500 to-blue-600" },
      values: [true, true, true, false, false, false, false, false, false, true, true, "partial"],
    },
    {
      name: "Parakeet AI",
      logo: { type: "monogram", text: "Pa", gradient: "from-emerald-500 to-teal-600" },
      values: [
        true,
        true,
        "partial",
        false,
        false,
        false,
        false,
        false,
        true,
        true,
        false,
        "partial",
      ],
    },
    {
      name: "Chiku AI",
      logo: { type: "monogram", text: "Ch", gradient: "from-amber-500 to-orange-600" },
      values: [
        "partial",
        true,
        "partial",
        false,
        false,
        false,
        false,
        false,
        true,
        true,
        false,
        "partial",
      ],
    },
    {
      name: "Mindwhisper AI",
      logo: { type: "monogram", text: "Mi", gradient: "from-fuchsia-500 to-purple-600" },
      values: [false, true, "partial", false, false, false, false, false, true, true, false, false],
    },
  ],
};

function Cell({ value, isCocoAI }: { value: boolean | string; isCocoAI: boolean }) {
  if (value === true)
    return (
      <span
        className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${
          isCocoAI
            ? "bg-gradient-brand text-white shadow-md shadow-violet-500/25"
            : "bg-emerald-500/10 text-emerald-500"
        }`}
      >
        <Check className="h-3.5 w-3.5" />
      </span>
    );
  if (value === "partial")
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
        <Minus className="h-3.5 w-3.5" />
      </span>
    );
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500/10 text-red-500/80">
      <X className="h-3.5 w-3.5" />
    </span>
  );
}

export function Comparison() {
  return (
    <section id="comparison" className="relative overflow-hidden px-4 py-24 sm:px-6 sm:py-32">
      {/* Ambient glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/2 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600/15 via-pink-500/10 to-rose-500/15 blur-[110px]" />
      </div>

      <div className="mx-auto max-w-5xl">
        <Reveal className="mb-12 text-center">
          <SectionTag label="Why CocoAI" />
          <h2 className="font-display mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            CocoAI vs. the competition
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            See exactly how CocoAI stacks up against other interview copilot tools on the market.
          </p>
        </Reveal>

        <Reveal>
          <div className="glass-card overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-border/60 text-muted-foreground">
                      Feature
                    </th>
                    {COMPARISON_DATA.tools.map((t, i) => (
                      <th
                        key={t.name}
                        className="relative px-4 py-4 text-center text-sm font-bold border-b border-border/60"
                      >
                        {i === 0 && (
                          <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow-md shadow-violet-500/25">
                            <Sparkles className="h-2.5 w-2.5" />
                            Best
                          </span>
                        )}
                        {/* Logo chip: real logo for CocoAI, monogram for rivals */}
                        <span
                          className={`mx-auto mb-1.5 flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg shadow-sm ${
                            t.logo.type === "image"
                              ? "bg-white ring-1 ring-black/5 dark:ring-white/15"
                              : `bg-gradient-to-br ${t.logo.gradient} text-[10px] font-bold text-white`
                          }`}
                        >
                          {t.logo.type === "image" ? (
                            <img
                              src={cocoLogo}
                              alt="CocoAI logo"
                              width={256}
                              height={201}
                              className="h-6 w-auto object-contain"
                            />
                          ) : (
                            t.logo.text
                          )}
                        </span>
                        <span
                          className={`block font-display ${i === 0 ? "text-gradient" : "text-muted-foreground"}`}
                        >
                          {t.name}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_DATA.features.map((feature, fi) => (
                    <tr
                      key={feature}
                      className={`transition-colors hover:bg-accent/40 ${
                        fi < COMPARISON_DATA.features.length - 1 ? "border-b border-border/40" : ""
                      }`}
                    >
                      <td className="px-5 py-3.5 text-sm text-foreground/80">{feature}</td>
                      {COMPARISON_DATA.tools.map((t, ti) => (
                        <td key={t.name} className="px-4 py-3.5 text-center">
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
            <div className="flex flex-wrap items-center gap-5 border-t border-border/40 px-5 py-4">
              {[
                {
                  icon: <Check className="h-3 w-3" />,
                  color: "text-emerald-500",
                  label: "Supported",
                },
                {
                  icon: <Minus className="h-3 w-3" />,
                  color: "text-amber-500",
                  label: "Partial / Limited",
                },
                {
                  icon: <X className="h-3 w-3" />,
                  color: "text-red-500/80",
                  label: "Not available",
                },
              ].map(({ icon, color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className={color}>{icon}</span>
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

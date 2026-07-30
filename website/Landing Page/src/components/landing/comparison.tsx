import { Sparkles, Check, X, Minus } from "lucide-react";

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

export function Comparison() {
  return (
    <section id="comparison" className="relative py-20 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
            style={{ background: "hsl(262 83% 58% / 0.1)", border: "1px solid hsl(262 83% 58% / 0.25)", color: "hsl(262 83% 72%)" }}
          >
            <Sparkles className="h-3 w-3" />
            Why CocoAI
          </div>
          <h2 className="text-3xl font-bold sm:text-4xl text-foreground">
            CocoAI vs. the competition
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            See exactly how CocoAI stacks up against other interview copilot tools on the market.
          </p>
        </div>

        <div
          className="overflow-hidden rounded-2xl border border-border/60"
          style={{ background: "hsl(240 6% 7%)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-border/40 text-muted-foreground">
                    Feature
                  </th>
                  {COMPARISON_DATA.tools.map((t, i) => (
                    <th
                      key={t.name}
                      className="px-4 py-4 text-center text-sm font-bold border-b border-border/40"
                      style={{
                        color: i === 0 ? "hsl(262 83% 72%)" : "hsl(240 5% 55%)",
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
                    <td className="px-5 py-3.5 text-sm text-foreground/80">
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
            className="flex flex-wrap items-center gap-5 px-5 py-4 border-t border-border/40"
          >
            {[
              { icon: <Check className="h-3 w-3" />, color: "hsl(142 70% 55%)", label: "Supported" },
              { icon: <Minus className="h-3 w-3" />, color: "hsl(48 95% 60%)", label: "Partial / Limited" },
              { icon: <X className="h-3 w-3" />, color: "hsl(0 70% 60%)", label: "Not available" },
            ].map(({ icon, color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span style={{ color }}>{icon}</span>
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

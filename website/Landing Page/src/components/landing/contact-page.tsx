import { useState } from "react";
import { useNavigation } from "@/lib/navigation";
import { MessageSquare, Send, Loader2, CheckCircle2 } from "lucide-react";

const CATEGORIES = [
  { value: "bug",        label: "🐛 Bug Report",           desc: "Something isn't working" },
  { value: "technical",  label: "🔧 Technical Issue",       desc: "Setup or configuration help" },
  { value: "feature",    label: "💡 Feature Request",       desc: "Suggest an improvement" },
  { value: "account",    label: "👤 Account & Billing",     desc: "Subscription or login issues" },
  { value: "other",      label: "💬 Other",                 desc: "Anything else" },
];

export function ContactPage() {
  const { navigate } = useNavigation();

  // Form state
  const [formData, setFormData] = useState({
    name: "", email: "", category: "", subject: "", message: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.category) { setFormError("Please select a category."); return; }
    setFormError(null);
    setFormLoading(true);
    // Simulate send
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
        <div className="relative z-10 mx-auto max-w-4xl px-6 pt-32 pb-12 text-center">
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
            Found a bug, facing a technical issue, or have feedback? Send us a message and we'll respond within 24 hours.
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
    </div>
  );
}

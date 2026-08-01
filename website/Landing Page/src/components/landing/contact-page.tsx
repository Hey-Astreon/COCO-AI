import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { SectionTag } from "./section-tag";
import { Reveal } from "./reveal";

const CATEGORIES = [
  { value: "bug", label: "🐛 Bug Report", desc: "Something isn't working" },
  { value: "technical", label: "🔧 Technical Issue", desc: "Setup or configuration help" },
  { value: "feature", label: "💡 Feature Request", desc: "Suggest an improvement" },
  { value: "account", label: "👤 Account & Billing", desc: "Subscription or login issues" },
  { value: "other", label: "💬 Other", desc: "Anything else" },
];

const inputStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  color: "var(--foreground)",
  transition: "all 0.2s ease",
} as const;

const inputFocus = {
  borderColor: "hsl(262 83% 58% / 0.6)",
  boxShadow: "0 0 0 3px hsl(262 83% 58% / 0.12)",
} as const;

const inputBlur = {
  borderColor: "var(--border)",
  boxShadow: "none",
} as const;

export function ContactPage() {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    subject: "",
    message: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formData.category) {
      setFormError("Please select a category.");
      return;
    }
    setFormError(null);
    setFormLoading(true);
    // Simulate send
    await new Promise((r) => setTimeout(r, 1400));
    setFormLoading(false);
    setFormSent(true);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Hero ─── */}
      <div className="relative overflow-hidden">
        {/* Aurora orbs */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="animate-aurora absolute top-[-120px] left-1/2 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600/25 via-pink-500/15 to-rose-500/20 blur-[110px]" />
          <div
            className="animate-aurora absolute bottom-[-120px] right-[-100px] h-[340px] w-[340px] rounded-full bg-gradient-to-br from-pink-500/15 to-lavender/10 blur-[100px]"
            style={{ animationDelay: "-7s" }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 pt-32 pb-12 text-center">
          <Reveal>
            <SectionTag label="Get in Touch" />
          </Reveal>
          <Reveal delay={100}>
            <h1 className="font-display mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              How can we <span className="text-gradient">help you?</span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
              Found a bug, facing a technical issue, or have feedback? Send us a message and we'll
              respond within 24 hours.
            </p>
          </Reveal>
        </div>
      </div>

      {/* ─── Contact Form ─── */}
      <div className="mx-auto max-w-2xl px-6 pb-20">
        <Reveal>
          {formSent ? (
            <div
              className="glass-card flex flex-col items-center gap-5 rounded-2xl p-12 text-center"
              style={{ border: "1px solid hsl(142 70% 45% / 0.35)" }}
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              </span>
              <h3 className="font-display text-2xl font-bold text-foreground">Message sent!</h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                Thanks for reaching out. We'll get back to you at{" "}
                <strong className="text-foreground">{formData.email}</strong> within 24 hours.
              </p>
              <button
                onClick={() => {
                  setFormSent(false);
                  setFormData({ name: "", email: "", category: "", subject: "", message: "" });
                }}
                className="mt-2 text-sm text-lavender transition-colors hover:text-foreground"
              >
                Send another message
              </button>
            </div>
          ) : (
            <div className="glass-card gradient-top-border relative overflow-hidden rounded-2xl p-8 sm:p-10">
              <form onSubmit={handleFormSubmit} className="space-y-6">
                {/* Name + Email */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    {
                      id: "contact-name",
                      label: "Your Name",
                      placeholder: "Roushan Kumar",
                      key: "name" as const,
                      type: "text",
                    },
                    {
                      id: "contact-email",
                      label: "Email Address",
                      placeholder: "you@example.com",
                      key: "email" as const,
                      type: "email",
                    },
                  ].map(({ id, label, placeholder, key, type }) => (
                    <div key={key}>
                      <label
                        htmlFor={id}
                        className="mb-1.5 block text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                      >
                        {label}
                      </label>
                      <input
                        id={id}
                        type={type}
                        placeholder={placeholder}
                        required
                        value={formData[key]}
                        onChange={(e) => setFormData((p) => ({ ...p, [key]: e.target.value }))}
                        className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-muted-foreground/50"
                        style={inputStyle}
                        onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                        onBlur={(e) => Object.assign(e.target.style, inputBlur)}
                      />
                    </div>
                  ))}
                </div>

                {/* Category */}
                <div>
                  <label className="mb-2 block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Category
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {CATEGORIES.map((cat) => {
                      const isActive = formData.category === cat.value;
                      return (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => setFormData((p) => ({ ...p, category: cat.value }))}
                          className={`rounded-xl px-3 py-2.5 text-left text-xs transition-all duration-150 ${
                            isActive
                              ? "bg-gradient-brand text-white shadow-md shadow-violet-500/25 border border-transparent"
                              : "border border-border bg-accent/50 text-muted-foreground hover:bg-accent hover:text-foreground"
                          }`}
                        >
                          <div className="font-medium">{cat.label}</div>
                          <div className={`mt-0.5 ${isActive ? "opacity-80" : "opacity-70"}`}>
                            {cat.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label
                    htmlFor="contact-subject"
                    className="mb-1.5 block text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                  >
                    Subject
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    placeholder="Brief description of your issue"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData((p) => ({ ...p, subject: e.target.value }))}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-muted-foreground/50"
                    style={inputStyle}
                    onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                    onBlur={(e) => Object.assign(e.target.style, inputBlur)}
                  />
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="contact-message"
                    className="mb-1.5 block text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                  >
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    required
                    placeholder="Please describe your issue in as much detail as possible..."
                    value={formData.message}
                    onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                    className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-muted-foreground/50"
                    style={inputStyle}
                    onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                    onBlur={(e) => Object.assign(e.target.style, inputBlur)}
                  />
                </div>

                {formError && (
                  <p className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    ⚠️ {formError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={formLoading}
                  className="btn-shine flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:shadow-violet-500/45 hover:scale-[1.01] disabled:opacity-60 disabled:hover:scale-100"
                >
                  {formLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {formLoading ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          )}
        </Reveal>
      </div>

      {/* Back nav */}
      <div className="pb-16 text-center">
        <button
          onClick={() => navigate({ to: "/" })}
          className="text-sm text-muted-foreground transition-colors hover:text-lavender"
        >
          ← Back to home
        </button>
      </div>
    </div>
  );
}

import { useState, useRef, MouseEvent } from "react";
import { ExternalLink, Github, Terminal, Code } from "lucide-react";

interface DeveloperCardProps {
  name: string;
  role: string;
  handle: string;
  githubUrl: string;
  portfolioUrl: string;
  portfolioDomain: string;
  bio: string;
  avatarLetter: string;
  skills: string[];
  snippetTitle: string;
  snippetCode: string;
  glowColor: "violet" | "pink";
}

export function DeveloperCard({
  name,
  role,
  handle,
  githubUrl,
  portfolioUrl,
  portfolioDomain,
  bio,
  avatarLetter,
  skills,
  snippetTitle,
  snippetCode,
  glowColor,
}: DeveloperCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);
  const [showSnippet, setShowSnippet] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    setRotX(rotateX);
    setRotY(rotateY);
  };

  const handleMouseLeave = () => {
    setRotX(0);
    setRotY(0);
  };

  const isViolet = glowColor === "violet";

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="perspective-midrange group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground p-7 transition-all duration-200 ease-out backdrop-blur-xl shadow-lg"
      style={{
        transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
      }}
    >
      {/* Dynamic Holographic Gradient Border Glow */}
      <div
        className="pointer-events-none absolute -inset-1 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: isViolet
            ? "radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.25), transparent 70%)"
            : "radial-gradient(circle at 50% 0%, rgba(236, 72, 153, 0.25), transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Top Bar: Avatar Letter + GitHub Handle Badge */}
      <div className="flex items-center justify-between z-10">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-extrabold text-white shadow-xl ${
            isViolet
              ? "bg-gradient-to-br from-violet-600 to-indigo-600 shadow-violet-500/30"
              : "bg-gradient-to-br from-pink-600 to-rose-600 shadow-pink-500/30"
          }`}
        >
          {avatarLetter}
        </div>

        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-full border border-border bg-accent/60 px-3.5 py-1.5 text-xs font-semibold text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground"
        >
          <Github className="h-3.5 w-3.5" />
          <span>{handle}</span>
        </a>
      </div>

      {/* Developer Title & Portfolio Link */}
      <div className="mt-6 z-10">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <a
            href={portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-violet-500"
          >
            {name}
            <ExternalLink className="h-4 w-4 opacity-70" />
          </a>
        </h3>

        <div className="mt-1 flex items-center gap-2">
          <span
            className={`text-xs font-mono font-bold uppercase tracking-wider ${
              isViolet ? "text-violet-600 dark:text-violet-400" : "text-pink-600 dark:text-pink-400"
            }`}
          >
            {role}
          </span>
          <span className="text-muted-foreground">•</span>
          <a
            href={portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-muted-foreground hover:text-foreground hover:underline"
          >
            {portfolioDomain}
          </a>
        </div>
      </div>

      {/* Bio Paragraph */}
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground z-10">{bio}</p>

      {/* Skills Pill Badges */}
      <div className="mt-5 flex flex-wrap gap-2 z-10">
        {skills.map(skill => (
          <span
            key={skill}
            className="rounded-md border border-border bg-accent/40 px-2.5 py-1 text-xs font-mono text-foreground transition-colors group-hover:border-violet-500/40"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Toggle Core Code Snippet Modal/Drawer */}
      <div className="mt-6 pt-4 border-t border-border z-10">
        <button
          onClick={() => setShowSnippet(prev => !prev)}
          className="flex items-center gap-2 text-xs font-mono font-semibold text-violet-600 dark:text-violet-400 hover:text-pink-600 transition-colors"
        >
          <Code className="h-3.5 w-3.5" />
          <span>{showSnippet ? "Hide Core Contribution" : `View ${snippetTitle}`}</span>
        </button>

        {showSnippet && (
          <div className="mt-3 rounded-xl border border-border bg-zinc-950 p-3.5 font-mono text-[11px] leading-relaxed text-zinc-300 shadow-inner animate-in fade-in">
            <div className="mb-2 flex items-center justify-between text-[10px] text-zinc-400 border-b border-zinc-800 pb-1">
              <span className="flex items-center gap-1 text-pink-400 font-bold">
                <Terminal className="h-3 w-3" />
                {snippetTitle}
              </span>
              <span>Verified ✓</span>
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap text-emerald-400">
              {snippetCode}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

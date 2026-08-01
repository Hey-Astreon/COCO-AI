type SectionTagProps = {
  label: string;
  className?: string;
};

export function SectionTag({ label, className = "" }: SectionTagProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-lavender/25 bg-lavender/10 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.25em] text-lavender uppercase ${className}`}
    >
      <span aria-hidden="true" className="bg-gradient-brand h-1.5 w-1.5 rounded-full" />
      {label}
    </span>
  );
}

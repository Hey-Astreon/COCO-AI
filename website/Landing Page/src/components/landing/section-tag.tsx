type SectionTagProps = {
  label: string;
  className?: string;
};

export function SectionTag({ label, className = "" }: SectionTagProps) {
  return (
    <span
      className={`inline-block text-xs font-semibold tracking-[0.3em] text-faint uppercase ${className}`}
    >
      {label}
    </span>
  );
}

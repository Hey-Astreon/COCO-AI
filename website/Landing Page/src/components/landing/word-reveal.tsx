import { useEffect, useRef, useState } from "react";

export type WordRevealWord = {
  text: string;
  className?: string;
};

type WordRevealProps = {
  words: WordRevealWord[];
  className?: string;
  /** Base delay in milliseconds before the first word animates */
  delay?: number;
  /** Stagger between words in milliseconds */
  stagger?: number;
};

/**
 * Minimal word-by-word fade-up animation, fired once when scrolled into view.
 * Fully disabled under prefers-reduced-motion (see the media query in styles.css).
 */
export function WordReveal({ words, className = "", delay = 0, stagger = 60 }: WordRevealProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={ref} className={`word-reveal ${visible ? "is-visible" : ""} ${className}`}>
      {words.map((word, index) => (
        <span
          key={`${word.text}-${index}`}
          className={`word ${word.className ?? ""}`}
          style={{ transitionDelay: `${delay + index * stagger}ms` }}
        >
          {word.text}
          {index < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}

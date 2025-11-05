import React, { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type SplitType = "chars" | "words" | "lines";

interface SplitTextProps {
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "div" | "span";
  text: string;
  className?: string;
  splitType?: SplitType;
  delay?: number; // seconds between token animations
  duration?: number; // seconds for each token animation
  ease?: string;
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  textAlign?: "left" | "center" | "right" | "justify";
}

const SplitText: React.FC<SplitTextProps> = ({
  tag = "p",
  text,
  className,
  splitType = "lines",
  delay = 0.07,
  duration = 0.6,
  ease = "power3.out",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  textAlign = "left",
}) => {
  const containerRef = useRef<HTMLElement | null>(null);

  const tokens = useMemo(() => {
    if (splitType === "lines") {
      return text.split(/\n+/).filter((s) => s.trim().length > 0);
    }
    if (splitType === "words") {
      // Keep punctuation attached to words; split by whitespace
      return text.split(/\s+/).filter((s) => s.length > 0);
    }
    // chars
    return Array.from(text);
  }, [text, splitType]);

  useEffect(() => {
    const el = containerRef.current as HTMLElement | null;
    if (!el) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>("[data-split-token]"));
    if (!items.length) return;

    gsap.set(items, from);
    gsap.to(items, {
      ...(to || {}),
      ease,
      duration,
      stagger: delay,
      scrollTrigger: {
        trigger: el,
        start: "top+=50 bottom",
        toggleActions: "play none none reverse",
      },
    });
  }, [text, splitType, delay, duration, ease, from, to]);

  const Tag = tag as any;

  return (
    <Tag className={className} style={{ textAlign }} ref={containerRef}>
      {splitType === "lines" &&
        tokens.map((t, i) => (
          <span key={i} data-split-token className="block">
            {t}
          </span>
        ))}

      {splitType === "words" &&
        tokens.map((t, i) => (
          <span key={i} data-split-token className="inline-block">
            {t}
            {i !== tokens.length - 1 ? " " : ""}
          </span>
        ))}

      {splitType === "chars" &&
        tokens.map((t, i) => (
          <span key={i} data-split-token className="inline-block">
            {t === " " ? "\u00A0" : t}
          </span>
        ))}
    </Tag>
  );
};

export default SplitText;
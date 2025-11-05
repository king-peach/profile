import React, { useEffect, useRef, useState } from "react";

type AnimationType = "rotate" | "hover" | "3drotate";

export type PrismBackgroundProps = {
  height?: number; // apex height (not used in simplified render, kept for API parity)
  baseWidth?: number; // base width (not used in simplified render, kept for API parity)
  animationType?: AnimationType;
  glow?: number; // glow multiplier
  offset?: { x?: number; y?: number };
  noise?: number; // film grain noise
  transparent?: boolean;
  scale?: number; // overall scale
  hueShift?: number; // radians (phase shift)
  colorFrequency?: number; // sine bands frequency
  hoverStrength?: number; // tilt sensitivity
  inertia?: number; // tilt easing
  bloom?: number; // extra bloom factor
  suspendWhenOffscreen?: boolean;
  timeScale?: number; // global time multiplier
  className?: string;
  // Color tuning
  baseHue?: number; // 0..360, e.g., 0 for red
  hueRange?: number; // +/- range around base hue
  satBase?: number; // 0..100
  satRange?: number; // amplitude
  lumBase?: number; // 0..100
  lumRange?: number; // amplitude
};

// Utility: HSL to CSS color
function hsl(h: number, s: number, l: number, a = 1) {
  return `hsla(${h}, ${s}%, ${l}%, ${a})`;
}

// A lightweight, dependency-free approximation of React Bits Prism background.
// Renders an animated canvas gradient with optional tilt and rotation modes.
export function PrismBackground({
  height = 3.5,
  baseWidth = 5.5,
  animationType = "rotate",
  glow = 1,
  offset = { x: 0, y: 0 },
  noise = 0.5,
  transparent = true,
  scale = 3.6,
  hueShift = 0,
  colorFrequency = 1,
  hoverStrength = 2,
  inertia = 0.05,
  bloom = 1,
  suspendWhenOffscreen = false,
  timeScale = 0.5,
  className = "",
  baseHue = 0,
  hueRange = 40,
  satBase = 70,
  satRange = 20,
  lumBase = 60,
  lumRange = 20,
}: PrismBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [visible, setVisible] = useState(true);
  const tiltRef = useRef({ tx: 0, ty: 0, vx: 0, vy: 0 });

  // Resize canvas to container size
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const resize = () => {
      const rect = wrapper.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * window.devicePixelRatio));
      canvas.height = Math.max(1, Math.floor(rect.height * window.devicePixelRatio));
      const style = canvas.style;
      style.width = `${rect.width}px`;
      style.height = `${rect.height}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrapper);
    return () => {
      ro.disconnect();
    };
  }, []);

  // Visibility observer for suspendWhenOffscreen (avoid rapid toggle near viewport edge)
  useEffect(() => {
    if (!suspendWhenOffscreen) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const io = new IntersectionObserver(
      (entries) => {
        setVisible(entries[0]?.isIntersecting ?? true);
      },
      { threshold: 0.05, root: null, rootMargin: "150px" }
    );
    io.observe(wrapper);
    return () => io.disconnect();
  }, [suspendWhenOffscreen]);

  // Pointer tilt for hover mode
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const onMove = (e: PointerEvent) => {
      const rect = wrapper.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      tiltRef.current.tx = Math.max(-1, Math.min(1, dx)) * hoverStrength;
      tiltRef.current.ty = Math.max(-1, Math.min(1, dy)) * hoverStrength;
    };
    const onLeave = () => {
      tiltRef.current.tx = 0;
      tiltRef.current.ty = 0;
    };
    wrapper.addEventListener("pointermove", onMove);
    wrapper.addEventListener("pointerleave", onLeave);
    return () => {
      wrapper.removeEventListener("pointermove", onMove);
      wrapper.removeEventListener("pointerleave", onLeave);
    };
  }, [hoverStrength]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    const ctx = canvas.getContext("2d", { alpha: transparent });
    if (!ctx) return;

    let t = 0;
    const draw = () => {
      if (suspendWhenOffscreen && !visible) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }
      const w = canvas.width;
      const h = canvas.height;

      // Clear background
      if (transparent) {
        ctx.clearRect(0, 0, w, h);
      } else {
        ctx.fillStyle = "#0b0b0f";
        ctx.fillRect(0, 0, w, h);
      }

      // Build animated gradient
      const gradient = ctx.createLinearGradient(0, 0, w, h);
      const stops = 12;
      // Deterministic hash to stabilize noise per stop
      const hash = (i: number) => {
        let x = i * 12345 + 67890;
        x = (x ^ (x << 13)) >>> 0;
        x = (x ^ (x >> 17)) >>> 0;
        x = (x ^ (x << 5)) >>> 0;
        return (x % 1000) / 1000; // 0..1
      };
      for (let i = 0; i <= stops; i++) {
        const p = i / stops;
        // Sine-based colour modulation
        const phase = t * timeScale + p * colorFrequency * Math.PI * 2 + hueShift;
        const v = Math.sin(phase);
        // Hue centered around baseHue, limited by hueRange
        const hue = (baseHue + v * hueRange + 360) % 360;
        // Saturation & luminance tunable for "lighter" look
        const sat = satBase + v * satRange;
        const lum = lumBase + v * lumRange;

        // Optional deterministic noise (prevents per-frame flicker)
        const n = noise > 0 ? ((hash(i) - 0.5) * noise * 20) : 0;
        gradient.addColorStop(p, hsl(hue, Math.max(0, Math.min(100, sat + n)), Math.max(0, Math.min(100, lum + n))));
      }

      // Glow pass: draw multiple rectangles with slight offsets and alpha
      const passes = Math.max(1, Math.floor(glow * bloom));
      for (let k = 0; k < passes; k++) {
        ctx.globalAlpha = 0.6 / (k + 1);
        ctx.fillStyle = gradient as unknown as CanvasGradient;
        const ox = (offset.x ?? 0) * k * scale * 0.5;
        const oy = (offset.y ?? 0) * k * scale * 0.5;
        ctx.fillRect(ox, oy, w, h);
      }

      ctx.globalAlpha = 1;

      // Update transform for hover / 3drotate
      if (animationType === "hover") {
        const { tx, ty } = tiltRef.current;
        tiltRef.current.vx += (tx - tiltRef.current.vx) * inertia;
        tiltRef.current.vy += (ty - tiltRef.current.vy) * inertia;
        wrapper.style.transform = `perspective(1000px) rotateY(${tiltRef.current.vx}deg) rotateX(${tiltRef.current.vy}deg)`;
      } else if (animationType === "3drotate") {
        const rx = Math.sin(t * timeScale * 0.5) * 8;
        const ry = Math.cos(t * timeScale * 0.7) * 8;
        wrapper.style.transform = `perspective(1000px) rotateY(${ry}deg) rotateX(${rx}deg)`;
      } else {
        // rotate wobble via gradient phase only
        wrapper.style.transform = "translateZ(0)";
      }

      t += 0.008 * (timeScale <= 0 ? 0 : timeScale);
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [transparent, glow, bloom, colorFrequency, hueShift, offset.x, offset.y, scale, animationType, inertia, timeScale, noise, suspendWhenOffscreen, visible]);

      return (
    <div
      ref={wrapperRef}
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{ willChange: "transform", transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}

export default PrismBackground;
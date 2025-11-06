import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

type SpotlightCardProps = {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string; // rgba color used for radial gradient
};

// A lightweight Spotlight hover effect: renders a radial gradient that follows the cursor.
// Defaults match React Bits docs: spotlightColor="rgba(255, 255, 255, 0.25)".
const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className,
  spotlightColor = "rgba(255, 255, 255, 0.25)",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gradientStyle, setGradientStyle] = useState<{ background?: string; opacity?: number }>({ opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const background = `radial-gradient(240px circle at ${x}px ${y}px, ${spotlightColor}, transparent 60%)`;
    setGradientStyle({ background, opacity: 1 });
  };

  const handleMouseLeave = () => {
    setGradientStyle({ opacity: 0 });
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative rounded-xl overflow-hidden", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Spotlight overlay layer */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={gradientStyle}
      />
      {children}
    </div>
  );
};

export default SpotlightCard;
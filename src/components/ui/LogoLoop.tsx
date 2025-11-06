import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useState } from "react";

export type LogoItem = string | React.ReactNode;

export interface LogoLoopProps {
  logos: LogoItem[];
  speed?: number; // px/s
  direction?: "left" | "right";
  logoHeight?: number;
  gap?: number;
  pauseOnHover?: boolean;
  fadeOut?: boolean;
  fadeOutColor?: string;
  scaleOnHover?: boolean;
  /** 重复倍数：用于延长单次循环路径长度，保持无缝 */
  repeatCount?: number; // default 2
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

const LogoLoop: React.FC<LogoLoopProps> = ({
  logos,
  speed = 120,
  direction = "left",
  logoHeight = 28,
  gap = 32,
  pauseOnHover = true,
  fadeOut = false,
  fadeOutColor = "#000000",
  scaleOnHover = false,
  repeatCount = 2,
  ariaLabel = "Tech logos",
  className = "",
  style,
}) => {
  const [duplicated, setDuplicated] = useState<LogoItem[]>([]);
  const controls = useAnimationControls();

  useEffect(() => {
    // 根据 repeatCount 复制多份，用于延长循环路径
    const arr: LogoItem[] = [];
    for (let i = 0; i < Math.max(2, repeatCount); i += 1) {
      arr.push(...logos);
    }
    setDuplicated(arr);
  }, [logos, repeatCount]);

  // 计算总宽度（简化：每个 logo 宽度等于 height，加上 gap）
  const itemWidth = logoHeight + gap;
  const totalWidth = duplicated.length * itemWidth;

  // 每次循环移动半个容器宽度，确保无缝（起点与终点视觉一致）
  const travel = totalWidth / 2;
  const fromX = direction === "left" ? -travel : 0;
  const toX = direction === "left" ? 0 : -travel;

  // 启动动画
  useEffect(() => {
    controls.start({
      x: [fromX, toX],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: totalWidth / Math.max(1, speed),
          ease: "linear",
        },
      },
    });
  }, [controls, fromX, toX, totalWidth, speed]);

  return (
    <div
      aria-label={ariaLabel}
      className={`relative overflow-hidden ${className}`}
      style={style}
    >
      {/* 可选渐变遮罩 */}
      {fadeOut && (
        <>
          <div
            className="pointer-events-none absolute left-0 top-0 h-full w-16 z-10"
            style={{
              background: `linear-gradient(to right, ${fadeOutColor}, transparent)`,
            }}
          />
          <div
            className="pointer-events-none absolute right-0 top-0 h-full w-16 z-10"
            style={{
              background: `linear-gradient(to left, ${fadeOutColor}, transparent)`,
            }}
          />
        </>
      )}

      <motion.div
        className="flex items-center"
        animate={controls}
        style={{ width: totalWidth }}
        onMouseEnter={pauseOnHover ? () => controls.stop() : undefined}
        onMouseLeave={pauseOnHover ? () => controls.start({ x: [fromX, toX], transition: { x: { repeat: Infinity, repeatType: "loop", duration: totalWidth / Math.max(1, speed), ease: "linear" } } }) : undefined}
        onTouchStart={pauseOnHover ? () => controls.stop() : undefined}
        onTouchEnd={pauseOnHover ? () => controls.start({ x: [fromX, toX], transition: { x: { repeat: Infinity, repeatType: "loop", duration: totalWidth / Math.max(1, speed), ease: "linear" } } }) : undefined}
      >
        {duplicated.map((logo, idx) => (
          <div
            key={idx}
            className={`flex-shrink-0 flex items-center justify-center`}
            style={{
              height: logoHeight,
              width: logoHeight,
              marginRight: gap,
            }}
          >
            {typeof logo === "string" ? (
              <img
                src={logo}
                alt="logo"
                className={`h-full w-auto object-contain ${
                  scaleOnHover ? "hover:scale-110" : ""
                } transition-transform duration-200`}
              />
            ) : (
              <div
                className={`h-full w-auto ${
                  scaleOnHover ? "hover:scale-110" : ""
                } transition-transform duration-200`}
              >
                {logo}
              </div>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default LogoLoop;
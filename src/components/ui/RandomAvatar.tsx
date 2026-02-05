/**
 * 随机头像生成组件
 * 基于用户 ID 或名称生成唯一的 SVG 头像
 */

import React, { useMemo } from "react";

interface RandomAvatarProps {
  seed: string; // 用于生成头像的种子（如用户 ID 或名称）
  size?: number;
  className?: string;
}

// 头像背景颜色
const bgColors = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
  "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9",
  "#F8B500", "#00CED1", "#FF7F50", "#9370DB", "#20B2AA",
  "#FF69B4", "#00FA9A", "#FFD700", "#8A2BE2", "#00BFFF",
];

// 前景颜色（深色用于对比）
const fgColors = [
  "#FFFFFF", "#1A1A2E", "#16213E", "#0F3460", "#533483",
];

// 简单的哈希函数
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// 基于种子获取稳定的随机数
function seededRandom(seed: number, index: number): number {
  const x = Math.sin(seed + index * 9999) * 10000;
  return x - Math.floor(x);
}

// 头像样式类型
type AvatarStyle = "geometric" | "abstract" | "face" | "initials" | "pixels";

export default function RandomAvatar({ seed, size = 40, className = "" }: RandomAvatarProps) {
  const avatar = useMemo(() => {
    const hash = hashCode(seed);
    const bgColor = bgColors[hash % bgColors.length];
    const fgColor = fgColors[hash % fgColors.length];
    const style: AvatarStyle = ["geometric", "abstract", "face", "initials", "pixels"][hash % 5] as AvatarStyle;

    return { hash, bgColor, fgColor, style };
  }, [seed]);

  const renderContent = () => {
    const { hash, bgColor, fgColor, style } = avatar;

    switch (style) {
      case "geometric":
        return <GeometricAvatar hash={hash} bgColor={bgColor} fgColor={fgColor} />;
      case "abstract":
        return <AbstractAvatar hash={hash} bgColor={bgColor} fgColor={fgColor} />;
      case "face":
        return <FaceAvatar hash={hash} bgColor={bgColor} fgColor={fgColor} />;
      case "initials":
        return <InitialsAvatar seed={seed} bgColor={bgColor} fgColor={fgColor} />;
      case "pixels":
        return <PixelAvatar hash={hash} bgColor={bgColor} />;
      default:
        return <GeometricAvatar hash={hash} bgColor={bgColor} fgColor={fgColor} />;
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`rounded-full ${className}`}
      style={{ backgroundColor: avatar.bgColor }}
    >
      {renderContent()}
    </svg>
  );
}

// 几何图形头像
function GeometricAvatar({ hash, bgColor, fgColor }: { hash: number; bgColor: string; fgColor: string }) {
  const shapes = [];
  const numShapes = 3 + (hash % 4);

  for (let i = 0; i < numShapes; i++) {
    const x = seededRandom(hash, i * 3) * 80 + 10;
    const y = seededRandom(hash, i * 3 + 1) * 80 + 10;
    const size = seededRandom(hash, i * 3 + 2) * 30 + 15;
    const shapeType = Math.floor(seededRandom(hash, i * 5) * 3);
    const opacity = 0.3 + seededRandom(hash, i * 7) * 0.5;

    if (shapeType === 0) {
      shapes.push(
        <circle key={i} cx={x} cy={y} r={size / 2} fill={fgColor} opacity={opacity} />
      );
    } else if (shapeType === 1) {
      shapes.push(
        <rect key={i} x={x - size / 2} y={y - size / 2} width={size} height={size} fill={fgColor} opacity={opacity} rx={4} />
      );
    } else {
      const points = `${x},${y - size / 2} ${x + size / 2},${y + size / 2} ${x - size / 2},${y + size / 2}`;
      shapes.push(
        <polygon key={i} points={points} fill={fgColor} opacity={opacity} />
      );
    }
  }

  return <>{shapes}</>;
}

// 抽象线条头像
function AbstractAvatar({ hash, bgColor, fgColor }: { hash: number; bgColor: string; fgColor: string }) {
  const paths = [];
  const numPaths = 2 + (hash % 3);

  for (let i = 0; i < numPaths; i++) {
    const startX = seededRandom(hash, i * 6) * 60 + 20;
    const startY = seededRandom(hash, i * 6 + 1) * 60 + 20;
    const cp1X = seededRandom(hash, i * 6 + 2) * 100;
    const cp1Y = seededRandom(hash, i * 6 + 3) * 100;
    const endX = seededRandom(hash, i * 6 + 4) * 60 + 20;
    const endY = seededRandom(hash, i * 6 + 5) * 60 + 20;
    const strokeWidth = 3 + seededRandom(hash, i * 8) * 6;

    paths.push(
      <path
        key={i}
        d={`M ${startX} ${startY} Q ${cp1X} ${cp1Y} ${endX} ${endY}`}
        stroke={fgColor}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        opacity={0.6 + seededRandom(hash, i * 9) * 0.4}
      />
    );
  }

  // 添加一个装饰圆点
  const dotX = seededRandom(hash, 100) * 60 + 20;
  const dotY = seededRandom(hash, 101) * 60 + 20;
  paths.push(
    <circle key="dot" cx={dotX} cy={dotY} r={8} fill={fgColor} opacity={0.8} />
  );

  return <>{paths}</>;
}

// 简笔脸头像
function FaceAvatar({ hash, bgColor, fgColor }: { hash: number; bgColor: string; fgColor: string }) {
  const eyeStyle = hash % 4;
  const mouthStyle = hash % 5;
  const hasBlush = hash % 2 === 0;

  // 眼睛
  const renderEyes = () => {
    const eyeY = 38;
    switch (eyeStyle) {
      case 0: // 圆眼
        return (
          <>
            <circle cx={35} cy={eyeY} r={6} fill={fgColor} />
            <circle cx={65} cy={eyeY} r={6} fill={fgColor} />
          </>
        );
      case 1: // 线眼
        return (
          <>
            <line x1={28} y1={eyeY} x2={42} y2={eyeY} stroke={fgColor} strokeWidth={3} strokeLinecap="round" />
            <line x1={58} y1={eyeY} x2={72} y2={eyeY} stroke={fgColor} strokeWidth={3} strokeLinecap="round" />
          </>
        );
      case 2: // 眯眼
        return (
          <>
            <path d="M 28 40 Q 35 34 42 40" stroke={fgColor} strokeWidth={3} fill="none" strokeLinecap="round" />
            <path d="M 58 40 Q 65 34 72 40" stroke={fgColor} strokeWidth={3} fill="none" strokeLinecap="round" />
          </>
        );
      default: // 点眼
        return (
          <>
            <circle cx={35} cy={eyeY} r={4} fill={fgColor} />
            <circle cx={65} cy={eyeY} r={4} fill={fgColor} />
          </>
        );
    }
  };

  // 嘴巴
  const renderMouth = () => {
    const mouthY = 62;
    switch (mouthStyle) {
      case 0: // 微笑
        return <path d="M 35 60 Q 50 75 65 60" stroke={fgColor} strokeWidth={3} fill="none" strokeLinecap="round" />;
      case 1: // 大笑
        return <path d="M 35 58 Q 50 78 65 58" stroke={fgColor} strokeWidth={3} fill="none" strokeLinecap="round" />;
      case 2: // 小嘴
        return <circle cx={50} cy={mouthY} r={5} fill={fgColor} />;
      case 3: // 直线
        return <line x1={40} y1={mouthY} x2={60} y2={mouthY} stroke={fgColor} strokeWidth={3} strokeLinecap="round" />;
      default: // 歪嘴
        return <path d="M 38 60 Q 50 68 62 62" stroke={fgColor} strokeWidth={3} fill="none" strokeLinecap="round" />;
    }
  };

  return (
    <>
      {renderEyes()}
      {renderMouth()}
      {hasBlush && (
        <>
          <circle cx={25} cy={50} r={6} fill="#FFB6C1" opacity={0.6} />
          <circle cx={75} cy={50} r={6} fill="#FFB6C1" opacity={0.6} />
        </>
      )}
    </>
  );
}

// 首字母头像
function InitialsAvatar({ seed, bgColor, fgColor }: { seed: string; bgColor: string; fgColor: string }) {
  // 提取首字母或首个字符
  const getInitials = (str: string): string => {
    const cleaned = str.replace(/[0-9-_]/g, " ").trim();
    if (!cleaned) return "?";
    
    const words = cleaned.split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return cleaned.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(seed);

  return (
    <text
      x="50"
      y="50"
      textAnchor="middle"
      dominantBaseline="central"
      fill={fgColor}
      fontSize={initials.length > 1 ? "32" : "40"}
      fontWeight="600"
      fontFamily="system-ui, -apple-system, sans-serif"
    >
      {initials}
    </text>
  );
}

// 像素风格头像
function PixelAvatar({ hash, bgColor }: { hash: number; bgColor: string }) {
  const pixels = [];
  const gridSize = 5;
  const pixelSize = 100 / gridSize;
  
  // 生成对称的像素图案
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x <= Math.floor(gridSize / 2); x++) {
      const shouldFill = seededRandom(hash, y * gridSize + x) > 0.5;
      if (shouldFill) {
        const hue = (hash + y * 30 + x * 50) % 360;
        const color = `hsl(${hue}, 70%, 60%)`;
        
        // 左侧像素
        pixels.push(
          <rect
            key={`${x}-${y}`}
            x={x * pixelSize}
            y={y * pixelSize}
            width={pixelSize}
            height={pixelSize}
            fill={color}
          />
        );
        
        // 右侧对称像素
        if (x !== Math.floor(gridSize / 2)) {
          pixels.push(
            <rect
              key={`${gridSize - 1 - x}-${y}`}
              x={(gridSize - 1 - x) * pixelSize}
              y={y * pixelSize}
              width={pixelSize}
              height={pixelSize}
              fill={color}
            />
          );
        }
      }
    }
  }

  return <>{pixels}</>;
}

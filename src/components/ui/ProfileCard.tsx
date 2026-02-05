import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../ThemeContext";

type ProfileCardProps = {
  avatarUrl: string;
  iconUrl?: string;
  grainUrl?: string;
  behindGradient?: string;
  innerGradient?: string;
  showBehindGradient?: boolean;
  className?: string;
  enableTilt?: boolean;
  enableMobileTilt?: boolean;
  mobileTiltSensitivity?: number;
  miniAvatarUrl?: string;
  name?: string;
  title?: string;
  handle?: string;
  status?: string;
  contactText?: string;
  showUserInfo?: boolean;
  onContactClick?: () => void;
  /** 技术栈 LogoLoop 节点 */
  techStack?: React.ReactNode;
  /** 技术栈标题 */
  techStackTitle?: string;
};

export const ProfileCard: React.FC<ProfileCardProps> = ({
  avatarUrl,
  iconUrl,
  grainUrl,
  behindGradient,
  innerGradient,
  showBehindGradient = true,
  className = "",
  enableTilt = true,
  enableMobileTilt = false,
  mobileTiltSensitivity = 5,
  miniAvatarUrl,
  name = "Eric Wang",
  title = "Web Developer",
  handle,
  status,
  contactText,
  showUserInfo = true,
  onContactClick,
  techStack,
  techStackTitle,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const { dark, accent, accentHover, isOrange } = useTheme();
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language?.toLowerCase().startsWith("en");
  
  // 国际化默认值
  const finalStatus = status ?? t('hero.status');
  const finalContactText = contactText ?? t('hero.cta');
  const finalTechStackTitle = techStackTitle ?? t('hero.techStack');

  // 根据主题色生成渐变背景
  const bgBehind = useMemo(() => {
    if (behindGradient) return behindGradient;
    if (dark) {
      // 暗色模式：使用主题色的低透明度渐变
      const accentRgb = isOrange ? "217, 63, 49" : "147, 51, 234";
      return `radial-gradient(1200px 700px at 25% 25%, rgba(${accentRgb}, 0.15) 0%, rgba(${accentRgb}, 0.05) 40%, rgba(0,0,0,0.0) 100%)`;
    }
    return "radial-gradient(1000px 600px at 20% 20%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 40%, rgba(0,0,0,0.0) 100%)";
  }, [behindGradient, dark, accent, isOrange]);

  const bgInner = useMemo(() => {
    if (innerGradient) return innerGradient;
    if (dark) {
      const accentRgb = isOrange ? "217, 63, 49" : "147, 51, 234";
      return `linear-gradient(135deg, rgba(${accentRgb}, 0.12) 0%, rgba(${accentRgb}, 0.03) 100%)`;
    }
    return "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)";
  }, [innerGradient, dark, accent, isOrange]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // 移动端默认不启用 3D tilt，除非显式开启 enableMobileTilt
    const isMobile = typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(max-width: 767px)").matches
      : false;

    if (isMobile && !enableMobileTilt) {
      return;
    }

    let raf = 0;
    let tx = 0;
    let ty = 0;

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!enableTilt) return;
      const rect = el.getBoundingClientRect();
      let clientX = 0;
      let clientY = 0;
      if (e instanceof MouseEvent) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else if (e instanceof TouchEvent && e.touches[0]) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const pctX = (x / rect.width) * 2 - 1; // -1..1
      const pctY = (y / rect.height) * 2 - 1; // -1..1
      const maxRotate = 10;
      tx = -pctX * maxRotate;
      ty = pctY * maxRotate;

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(900px) rotateX(${ty}deg) rotateY(${tx}deg)`;
      });
    };

    const onLeave = () => {
      setIsHovering(false);
      cancelAnimationFrame(raf);
      el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
    };

    const onEnter = () => setIsHovering(true);

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);

    if (enableMobileTilt) {
      el.addEventListener("touchstart", onEnter, { passive: true });
      el.addEventListener("touchmove", onMove, { passive: true });
      el.addEventListener("touchend", onLeave, { passive: true });
    }

    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      if (enableMobileTilt) {
        el.removeEventListener("touchstart", onEnter as EventListener);
        el.removeEventListener("touchmove", onMove as EventListener);
        el.removeEventListener("touchend", onLeave as EventListener);
      }
      cancelAnimationFrame(raf);
    };
  }, [enableTilt, enableMobileTilt, mobileTiltSensitivity]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl md:rounded-3xl shadow-2xl ${className}`}
      style={{
        transformStyle: "preserve-3d",
        transition: isHovering ? "transform 80ms ease" : "transform 300ms ease",
        backdropFilter: "blur(24px) saturate(200%)",
        WebkitBackdropFilter: "blur(24px) saturate(200%)",
        backgroundColor: dark 
          ? "rgba(24, 24, 48, 0.5)" 
          : "rgba(255, 255, 255, 0.15)",
        border: `1px solid ${dark ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.25)"}`,
        boxShadow: dark
          ? "0 20px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)"
          : "0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.2)",
      }}
      ref={containerRef}
    >
      {showBehindGradient && (
        <div
          className="absolute inset-0"
          style={{ 
            background: bgBehind,
            opacity: 0.8,
          }}
          aria-hidden
        />
      )}

      {/* Optional icon/grain overlays */}
      {iconUrl && (
        <img
          src={iconUrl}
          alt="bg-icon"
          className="absolute inset-0 w-full h-full object-cover opacity-15"
          aria-hidden
        />
      )}
      {grainUrl && (
        <img
          src={grainUrl}
          alt="grain"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-15"
          aria-hidden
        />
      )}

      {/* 上半：个人介绍 */}
      <div
        className="relative z-10 p-4 md:p-5 lg:p-6 flex items-center gap-4 md:gap-5 lg:gap-6 flex-shrink-0"
        style={{ 
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          background: bgInner,
        }}
      >
        <img
          src={avatarUrl}
          alt="avatar"
          className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-xl object-cover border-2 flex-shrink-0"
          style={{
            borderColor: dark ? "rgba(255, 255, 255, 0.25)" : "rgba(255, 255, 255, 0.4)",
            boxShadow: dark
              ? "0 8px 24px rgba(0, 0, 0, 0.3)"
              : "0 8px 24px rgba(0, 0, 0, 0.1)",
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.background = "#eee";
          }}
        />

        {showUserInfo && (
          <div className="flex-1 min-w-0">
            <div className={`flex items-center gap-2 md:gap-3 ${isEnglish ? "flex-wrap" : ""}`}>
              {miniAvatarUrl && (
                <img
                  src={miniAvatarUrl}
                  alt="mini-avatar"
                  className="w-5 h-5 md:w-6 md:h-6 rounded-lg object-cover border flex-shrink-0"
                  style={{
                    borderColor: dark ? "rgba(255, 255, 255, 0.25)" : "rgba(255, 255, 255, 0.4)",
                  }}
                />
              )}
              <h3
                className={`text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold ${dark ? "text-white" : "text-gray-800"} ${
                  isEnglish ? "basis-full md:basis-auto" : "truncate"
                }`}
                style={{
                  textShadow: dark ? "0 2px 8px rgba(0, 0, 0, 0.3)" : "0 2px 8px rgba(255, 255, 255, 0.5)",
                }}
              >
                {name}
              </h3>
              <span
                className={`text-sm sm:text-base md:text-lg ${dark ? "text-white/85" : "text-gray-600"} ${
                  isEnglish ? "basis-full md:basis-auto" : "truncate ml-2 md:ml-3"
                }`}
              >
                {title}
              </span>
            </div>
            <div
              className={`mt-2 md:mt-2.5 flex items-center gap-3 md:gap-4 text-xs sm:text-sm md:text-base ${dark ? "text-white/75" : "text-gray-600"}`}
            >
              {handle && <span>@{handle}</span>}
              {finalStatus && (
                <span className="flex items-center gap-1.5 md:gap-2">
                  <span 
                    className="inline-block w-2 h-2 md:w-2.5 md:h-2.5 rounded-full"
                    style={{
                      backgroundColor: '#22c55e',
                      boxShadow: '0 0 8px rgba(34, 197, 94, 0.4)',
                    }}
                  />
                  {finalStatus}
                </span>
              )}
            </div>
            {/* 联系我按钮 */}
            {onContactClick && (
              <button
                className="mt-3 md:mt-4 px-5 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl font-semibold text-xs sm:text-sm md:text-base transition-all duration-300 hover:scale-105 hover:brightness-110 active:scale-95"
                style={{
                  backgroundColor: accent,
                  color: '#ffffff',
                  boxShadow: `0 4px 16px ${accent}40`,
                }}
                onClick={onContactClick}
              >
                {finalContactText}
              </button>
            )}
          </div>
        )}
      </div>

      {/* 下半：技术栈 */}
      {techStack && (
        <div className="relative z-10 w-full">
          {/* 技术栈标题 */}
          {finalTechStackTitle && (
            <div
              className={`text-xs font-medium tracking-widest text-center py-2 ${
                dark ? "text-white/50" : "text-gray-500"
              }`}
              style={{
                borderTop: `1px solid ${dark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.06)"}`,
              }}
            >
              {finalTechStackTitle}
            </div>
          )}
          {/* 技术栈展示区域 */}
          <div
            className={`relative w-full flex items-center justify-center ${
              dark ? "text-white" : "text-gray-700"
            }`}
            style={{
              backdropFilter: "blur(16px) saturate(180%)",
              WebkitBackdropFilter: "blur(16px) saturate(180%)",
              backgroundColor: dark 
                ? "rgba(24, 24, 48, 0.3)" 
                : "rgba(255, 255, 255, 0.08)",
              paddingTop: "0.5rem",
              paddingBottom: "0.625rem",
              paddingLeft: "0.75rem",
              paddingRight: "0.75rem",
            }}
          >
            {techStack}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
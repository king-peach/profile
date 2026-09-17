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
  const { dark, accent, accentHover } = useTheme();
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language?.toLowerCase().startsWith("en");

  // 国际化默认值
  const finalStatus = status ?? t("hero.status");
  const finalContactText = contactText ?? t("hero.cta");
  const finalTechStackTitle = techStackTitle ?? t("hero.techStack");
  const profileLabel = isEnglish ? "PROFILE SNAPSHOT" : "个人信息";

  const shellBackground = useMemo(() => {
    if (behindGradient) return behindGradient;
    if (!showBehindGradient) {
      return dark ? "rgba(24, 24, 48, 0.44)" : "rgba(255, 255, 255, 0.68)";
    }
    if (dark) {
      return `radial-gradient(120% 90% at 0% 0%, ${accent}22 0%, transparent 58%),
        rgba(24, 24, 48, 0.44)`;
    }
    return `radial-gradient(120% 90% at 0% 0%, ${accent}16 0%, transparent 58%),
      rgba(255, 255, 255, 0.68)`;
  }, [behindGradient, showBehindGradient, dark, accent]);

  const panelBackground = useMemo(() => {
    if (innerGradient) return innerGradient;
    if (dark) {
      return "rgba(18, 18, 36, 0.54)";
    }
    return "rgba(255, 255, 255, 0.82)";
  }, [innerGradient, dark, accent]);

  const panelBorderColor = dark ? "rgba(255, 255, 255, 0.12)" : `${accent}22`;
  const mutedTextColor = dark ? "rgba(255, 255, 255, 0.68)" : "rgba(39, 48, 64, 0.68)";
  const cardTitleColor = dark ? "#f8fafc" : "#1f2937";

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !enableTilt) return;

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
      const maxRotate = e instanceof TouchEvent ? mobileTiltSensitivity : 4.2;
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
      className={`relative overflow-hidden rounded-[26px] border ${className}`}
      style={{
        transformStyle: "preserve-3d",
        transition: isHovering ? "transform 120ms ease" : "transform 260ms ease",
        backdropFilter: "blur(12px) saturate(140%)",
        WebkitBackdropFilter: "blur(12px) saturate(140%)",
        background: shellBackground,
        borderColor: dark ? `${accent}2e` : `${accent}24`,
        boxShadow: dark
          ? "0 18px 42px -24px rgba(0, 0, 0, 0.64), 0 0 0 1px rgba(255, 255, 255, 0.03)"
          : "0 18px 44px -26px rgba(15, 23, 42, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.45)",
      }}
      ref={containerRef}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-1.5"
        style={{
          background: `linear-gradient(180deg, ${accent}d9 0%, ${accent}20 78%, transparent 100%)`,
        }}
        aria-hidden
      />

      {/* Optional icon/grain overlays */}
      {iconUrl && (
        <img
          src={iconUrl}
          alt="bg-icon"
          className="absolute inset-0 z-[1] h-full w-full object-cover opacity-10"
          aria-hidden
        />
      )}
      {grainUrl && (
        <img
          src={grainUrl}
          alt="grain"
          className="absolute inset-0 z-[1] h-full w-full object-cover mix-blend-overlay opacity-10"
          aria-hidden
        />
      )}

      <div className="relative z-10 grid gap-3 p-4 md:gap-4 md:p-5">
        <div
          className="rounded-[22px] border p-4 md:p-5"
          style={{
            borderColor: panelBorderColor,
            background: panelBackground,
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div
              className="text-[10px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: mutedTextColor }}
            >
              {profileLabel}
            </div>
            {finalStatus && (
              <span
                className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium md:text-xs"
                style={{
                  borderColor: panelBorderColor,
                  color: mutedTextColor,
                  backgroundColor: dark ? "rgba(255, 255, 255, 0.04)" : "rgba(255, 255, 255, 0.72)",
                }}
              >
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: "#22c55e",
                    boxShadow: "0 0 8px rgba(34, 197, 94, 0.44)",
                  }}
                />
                {finalStatus}
              </span>
            )}
          </div>

          <div className="mt-4 flex items-start gap-4 md:gap-5">
            <img
              src={avatarUrl}
              alt="avatar"
              className="h-20 w-20 flex-shrink-0 rounded-2xl border object-cover md:h-24 md:w-24"
              style={{
                borderColor: dark ? "rgba(255, 255, 255, 0.26)" : `${accent}40`,
                boxShadow: dark
                  ? "0 10px 24px rgba(0, 0, 0, 0.34)"
                  : "0 10px 22px rgba(15, 23, 42, 0.12)",
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.background = "#eee";
              }}
            />

            {showUserInfo && (
              <div className="min-w-0 flex-1">
                <h3
                  className={`text-xl font-bold md:text-2xl ${dark ? "text-white" : "text-gray-800"} ${
                    isEnglish ? "leading-tight" : "truncate"
                  }`}
                  style={{
                    color: cardTitleColor,
                    textShadow: dark ? "0 2px 8px rgba(0, 0, 0, 0.34)" : "0 2px 8px rgba(255, 255, 255, 0.5)",
                  }}
                >
                  {name}
                </h3>
                <div className={`mt-1.5 text-sm md:text-base ${dark ? "text-white/82" : "text-gray-600"}`}>{title}</div>

                <div className="mt-3 flex flex-wrap items-center gap-2.5 text-xs md:text-sm" style={{ color: mutedTextColor }}>
                  {miniAvatarUrl && (
                    <img
                      src={miniAvatarUrl}
                      alt="mini-avatar"
                      className="h-5 w-5 rounded-lg border object-cover md:h-6 md:w-6"
                      style={{
                        borderColor: dark ? "rgba(255, 255, 255, 0.25)" : `${accent}3d`,
                      }}
                    />
                  )}
                  {handle && <span>@{handle}</span>}
                </div>

                {onContactClick && (
                  <button
                    className="mt-4 inline-flex rounded-full px-5 py-2.5 text-xs font-semibold transition-all duration-300 hover:translate-y-[-1px] active:translate-y-0 md:px-6 md:text-sm"
                    style={{
                      backgroundColor: accent,
                      color: "#ffffff",
                      boxShadow: `0 8px 20px ${accent}38`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = accentHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = accent;
                    }}
                    onClick={onContactClick}
                  >
                    {finalContactText}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {techStack && (
          <div
            className="rounded-[22px] border p-4 md:p-5"
            style={{
              borderColor: panelBorderColor,
              backgroundColor: dark ? "rgba(14, 14, 30, 0.5)" : "rgba(255, 255, 255, 0.8)",
            }}
          >
            {finalTechStackTitle && (
              <div className="flex items-center gap-3">
                <div
                  className="text-[10px] font-semibold uppercase tracking-[0.22em]"
                  style={{ color: mutedTextColor }}
                >
                  {finalTechStackTitle}
                </div>
              <div
                className="h-px flex-1"
                style={{
                  backgroundColor: dark ? "rgba(255, 255, 255, 0.14)" : `${accent}23`,
                }}
              />
            </div>
          )}
          <div
            className={`mt-3 rounded-2xl border px-2 py-2 ${dark ? "text-white" : "text-gray-700"}`}
            style={{
              borderColor: panelBorderColor,
              backgroundColor: dark ? "rgba(255, 255, 255, 0.02)" : "rgba(247, 248, 250, 0.9)",
            }}
          >
            {techStack}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;

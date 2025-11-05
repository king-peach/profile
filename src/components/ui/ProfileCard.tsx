import { t } from "i18next";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

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
};

const defaultBehindGradient =
  "radial-gradient(1000px 600px at 20% 20%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 40%, rgba(0,0,0,0.0) 100%)";
const defaultInnerGradient =
  "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)";

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
  status = t('hero.status'),
  contactText = "Contact",
  showUserInfo = true,
  onContactClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  const bgBehind = useMemo(
    () => behindGradient ?? defaultBehindGradient,
    [behindGradient]
  );
  const bgInner = useMemo(
    () => innerGradient ?? defaultInnerGradient,
    [innerGradient]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

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
      className={`relative rounded-xl overflow-hidden shadow-lg ${className}`}
      style={{
        transformStyle: "preserve-3d",
        transition: isHovering ? "transform 80ms ease" : "transform 300ms ease",
      }}
      ref={containerRef}
    >
      {showBehindGradient && (
        <div
          className="absolute inset-0"
          style={{ background: bgBehind }}
          aria-hidden
        />
      )}

      {/* Optional icon/grain overlays */}
      {iconUrl && (
        <img
          src={iconUrl}
          alt="bg-icon"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          aria-hidden
        />
      )}
      {grainUrl && (
        <img
          src={grainUrl}
          alt="grain"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-20"
          aria-hidden
        />
      )}

      {/* Inner card */}
      <div
        className="relative z-10 p-4 md:p-6 flex items-center gap-4 md:gap-6 backdrop-blur-sm"
        style={{ background: bgInner }}
      >
        <img
          src={avatarUrl}
          alt="avatar"
          className="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover border border-white/20"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.background = "#eee";
          }}
        />

        {showUserInfo && (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {miniAvatarUrl && (
                <img
                  src={miniAvatarUrl}
                  alt="mini-avatar"
                  className="w-6 h-6 rounded-md object-cover border border-white/20"
                />
              )}
              <h3 className="text-xl md:text-2xl font-semibold truncate">{name}</h3>
            </div>
            <p className="text-sm md:text-base text-white/80 mt-1 truncate">{title}</p>
            <div className="mt-2 flex items-center gap-3 text-xs md:text-sm text-white/70">
              {handle && <span>@{handle}</span>}
              {status && (
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
                  {status}
                </span>
              )}
            </div>
            <button
              className="mt-3 md:mt-4 px-3 md:px-4 py-1.5 md:py-2 rounded-md border border-white/30 text-white/90 hover:bg-white hover:text-black transition-colors"
              onClick={onContactClick}
            >
              {contactText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
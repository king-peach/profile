import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../ThemeContext";
import { cn } from "@/lib/utils";

export type FloatingAction = {
  id: string;
  ariaLabel: string;
  onClick: () => void;
  icon: React.ReactNode;
  show?: boolean;
};

type FloatingActionsProps = {
  extraActions?: FloatingAction[];
  showBackToTop?: boolean;
  backToTopThreshold?: number;
};

const FloatingActions: React.FC<FloatingActionsProps> = ({
  extraActions,
  showBackToTop = true,
  backToTopThreshold = 260,
}) => {
  const { t } = useTranslation();
  const { dark, accentText } = useTheme();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowTop(window.scrollY > backToTopThreshold);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [backToTopThreshold]);

  const actions = useMemo<FloatingAction[]>(() => {
    const base: FloatingAction[] = [];

    if (showBackToTop) {
      base.push({
        id: "backToTop",
        ariaLabel: t("floatingActions.backToTop"),
        onClick: () => {
          try {
            window.scrollTo({ top: 0, behavior: "smooth" });
          } catch {
            window.scrollTo(0, 0);
          }
        },
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12l7-7 7 7" />
          </svg>
        ),
        show: showTop,
      });
    }

    return [...base, ...(extraActions || [])];
  }, [extraActions, showBackToTop, showTop, t]);

  const visibleActions = actions.filter((a) => a.show !== false);
  if (visibleActions.length === 0) return null;

  return (
    <div
      className="fixed z-50 flex flex-col gap-3"
      style={{
        right: "1rem",
        bottom: "calc(1.25rem + env(safe-area-inset-bottom))",
      }}
      data-component="FloatingActions"
    >
      {visibleActions.map((action) => (
        <button
          key={action.id}
          type="button"
          aria-label={action.ariaLabel}
          onClick={action.onClick}
          className={cn(
            "w-11 h-11 rounded-full flex items-center justify-center",
            "shadow-lg border",
            "transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            dark
              ? "bg-zinc-800/90 border-zinc-700 text-zinc-100 focus-visible:ring-offset-zinc-900"
              : "bg-white/90 border-gray-200 text-gray-900 focus-visible:ring-offset-white",
          )}
          style={{ color: accentText }}
        >
          {action.icon}
        </button>
      ))}
    </div>
  );
};

export default FloatingActions;

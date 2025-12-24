import type React from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "./ThemeContext";

const ContentMap: React.FC = () => {
  const { t } = useTranslation();
  const { dark, accent, baseCard } = useTheme();

  const categories = [
    {
      key: "engineering",
      titleKey: "contentMap.engineering.title",
      descKey: "contentMap.engineering.description",
      ctaKey: "contentMap.engineering.cta",
      tag: "FrontEndEngineering",
    },
    {
      key: "patterns",
      titleKey: "contentMap.patterns.title",
      descKey: "contentMap.patterns.description",
      ctaKey: "contentMap.patterns.cta",
      tag: "DesignPattern",
    },
    {
      key: "retros",
      titleKey: "contentMap.retros.title",
      descKey: "contentMap.retros.description",
      ctaKey: "contentMap.retros.cta",
      tag: "ProblemsReview",
    },
    {
      key: "js",
      titleKey: "contentMap.js.title",
      descKey: "contentMap.js.description",
      ctaKey: "contentMap.js.cta",
      tag: "JavaScript",
    },
    {
      key: "essay",
      titleKey: "contentMap.essay.title",
      descKey: "contentMap.essay.description",
      ctaKey: "contentMap.essay.cta",
      tag: "Notes",
    },
  ];

  const handleCardClick = (tag: string) => {
    const target = `/articles?tag=${encodeURIComponent(tag)}`;
    if ((window as any).navigateTo) {
      (window as any).navigateTo(target);
    } else {
      window.location.href = target;
    }
  };

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, tag: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCardClick(tag);
    }
  };

  return (
    <section
      id="content-map"
      className="py-20 px-4 md:px-8"
      data-component="ContentMap"
    >
      <div className="container mx-auto max-w-6xl">
        {/* 标题区域 */}
        <div className="text-center mb-12">
          <h2
            className={`text-3xl md:text-4xl font-bold mb-4 ${
              dark ? "text-white" : "text-gray-900"
            }`}
          >
            {t("contentMap.title")}
          </h2>
          <p
            className={`text-base md:text-lg max-w-2xl mx-auto ${
              dark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {t("contentMap.subtitle")}
          </p>
        </div>

        {/* 卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <div
              key={category.key}
              className={`rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border ${
                dark ? "border-gray-700" : "border-gray-200"
              } ${index === 4 ? "md:col-span-2 lg:col-span-1" : ""} cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900`}
              data-tag={category.tag}
              role="button"
              tabIndex={0}
              onClick={() => handleCardClick(category.tag)}
              onKeyDown={(event) => handleCardKeyDown(event, category.tag)}
              style={{
                backgroundColor: dark ? "#1f2937" : "#ffffff", // gray-800 : white
              }}
            >
              <div
                className={`font-semibold text-lg mb-3 ${
                  dark ? "text-white" : "text-gray-900"
                }`}
              >
                {t(category.titleKey)}
              </div>
              <p
                className={`text-sm leading-relaxed mb-4 ${
                  dark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {t(category.descKey)}
              </p>
              <span
                className="text-sm font-medium transition-opacity hover:opacity-80 underline-offset-2 hover:underline"
                style={{ color: accent }}
              >
                {t(category.ctaKey)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContentMap;

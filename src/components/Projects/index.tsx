import type React from "react";
import { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../ThemeContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import datagradientScreenshot from "../../assets/datagradient-screenshot.jpg";

gsap.registerPlugin(ScrollTrigger);

interface ProjectItem {
    name: string;
    description: string;
    tools: string[];
    link?: string;
    linkText?: string;
    image: string;
}

const Projects: React.FC = () => {
    const { t } = useTranslation();
    const { baseCard, baseText, accentText, accent, dark } = useTheme();

    const sectionRef = useRef<HTMLElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const projectRefs = useRef<HTMLDivElement[]>([]);

    // 项目数据映射图片
    const projectImages: Record<string, string> = {
        datagradient: datagradientScreenshot,
    };

    const projects = t("projects.items", { returnObjects: true }) as ProjectItem[];

    useEffect(() => {
        // 标题动画
        gsap.fromTo(
            titleRef.current,
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                scrollTrigger: {
                    trigger: titleRef.current,
                    start: "top bottom-=100",
                    toggleActions: "play none none reverse",
                },
            }
        );

        // 项目卡片动画
        projectRefs.current.forEach((ref, index) => {
            if (ref) {
                gsap.fromTo(
                    ref,
                    { y: 60, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.8,
                        delay: index * 0.2,
                        scrollTrigger: {
                            trigger: ref,
                            start: "top bottom-=50",
                            toggleActions: "play none none reverse",
                        },
                    }
                );
            }
        });
    }, []);

    return (
        <section
            ref={sectionRef}
            className="py-16 md:py-24 px-4 md:px-6 max-w-7xl mx-auto"
            id="projects"
            data-component="Projects"
            style={{ color: baseText }}
        >
            <h2
                ref={titleRef}
                className="font-bold text-xl md:text-2xl mb-12"
                style={{ color: accentText }}
            >
                {t("projects.header")}
            </h2>

            <div className="space-y-24">
                {projects.map((project, index) => (
                    <div
                        key={project.name}
                        ref={(el) => {
                            if (el) projectRefs.current[index] = el;
                        }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
                        style={{
                            flexDirection: index % 2 === 1 ? "row-reverse" : "row",
                        }}
                    >
                        {/* 左侧：项目信息 */}
                        <div className={`space-y-6 ${index % 2 === 1 ? "lg:order-2" : ""}`}>
                            <h3
                                className="text-2xl md:text-3xl font-bold tracking-wide"
                                style={{ color: accentText }}
                            >
                                {project.name}
                            </h3>

                            <p
                                className="text-sm md:text-base leading-relaxed opacity-90"
                                style={{ color: baseText }}
                            >
                                {project.description}
                            </p>

                            {/* 开发工具列表 */}
                            <div>
                                <h4
                                    className="text-xs font-semibold tracking-widest mb-4 uppercase"
                                    style={{ color: accent }}
                                >
                                    {t("projects.toolsLabel")}
                                </h4>
                                <ul className="space-y-2">
                                    {project.tools.map((tool) => (
                                        <li
                                            key={tool}
                                            className="flex items-center gap-2 text-sm"
                                            style={{ color: baseText }}
                                        >
                                            <span style={{ color: accent }}>+</span>
                                            <span>{tool}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* 查看项目按钮 */}
                            {project.link && (
                                <a
                                    href={project.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block px-6 py-3 text-sm font-semibold tracking-wider border-2 transition-all duration-300 hover:scale-105"
                                    style={{
                                        borderColor: baseText,
                                        color: baseText,
                                        backgroundColor: "transparent",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = accent;
                                        e.currentTarget.style.borderColor = accent;
                                        e.currentTarget.style.color = "#fff";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = "transparent";
                                        e.currentTarget.style.borderColor = baseText;
                                        e.currentTarget.style.color = baseText;
                                    }}
                                >
                                    {project.linkText || t("projects.viewProject")}
                                </a>
                            )}
                        </div>

                        {/* 右侧：项目截图 */}
                        <div
                            className={`relative ${index % 2 === 1 ? "lg:order-1" : ""}`}
                        >
                            <div
                                className="relative rounded-lg overflow-hidden shadow-2xl"
                                style={{
                                    boxShadow: dark
                                        ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                                        : "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                                }}
                            >
                                {/* 笔记本电脑边框效果 */}
                                <div
                                    className="p-2 rounded-t-lg"
                                    style={{
                                        backgroundColor: dark ? "#1a1a2e" : "#e5e7eb",
                                    }}
                                >
                                    <div className="flex gap-1.5 mb-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                                    </div>
                                </div>
                                <img
                                    src={projectImages[project.image] || project.image}
                                    alt={project.name}
                                    className="w-full h-auto object-cover"
                                />
                                {/* 底部边框 */}
                                <div
                                    className="h-4 rounded-b-lg"
                                    style={{
                                        backgroundColor: dark ? "#1a1a2e" : "#e5e7eb",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Projects;

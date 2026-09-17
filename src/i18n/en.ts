const en = {
  translation: {
    nav: {
      about: "About",
      experience: "Experience",
      projects: "Projects",
      blog: "Blog",
      contact: "Contact",
      worldcup: "World Cup"
    },
    hero: {
      hi: "Hi, my name is",
      name: "Eric Wang",
      title: "AI Application Developer · Frontend Architecture Background",
      cta: "Get in Touch",
      status: 'Online',
      techStack: 'TECH STACK',
      greeting: "From 7 Years of Frontend to\nAI Application Development",
      tagline: "AI Application Delivery · Engineering Foundation · End-to-End Product Execution",
      subtitle: "I build AI-powered applications at the intersection of LLM capabilities and frontend engineering. With 7 years of engineering experience, I turn AI potential into shipped products — from Prompt Engineering and Agent design to API integration and production delivery.",
      primaryCta: "View Featured Project",
      secondaryCta: "View Experience",
      tertiaryCta: "Read Technical Posts",
      promise: "Designed for technical leaders seeking AI delivery capability, and for peers exploring AI application development and engineering practice.",
      proofs: [
        {
          value: "7+",
          label: "Years in Tech",
          detail: "Frontend architecture × AI application development"
        },
        {
          value: "5+",
          label: "AI Apps Shipped",
          detail: "AI Agents, Prompt Engineering, intelligent toolchains"
        },
        {
          value: "10+",
          label: "AI-augmented Projects",
          detail: "AI-assisted dev 50%+ faster, Rules & Skills system"
        },
        {
          value: "100+",
          label: "Pages Delivered",
          detail: "Frontend engineering foundation for rapid product iteration"
        }
      ]
    },
    contentMap: {
      title: "Core Topics",
      subtitle: "Building a systematic frontend knowledge system around five major themes, from basics to advanced, theory to practice.",
      engineering: {
        title: "Frontend Engineering",
        description: "From build, deploy to monitoring, managing frontend complexity with engineering thinking.",
        cta: "View Engineering Articles →"
      },
      patterns: {
        title: "Design Patterns",
        description: "Understanding and applying common frontend design patterns in real business scenarios.",
        cta: "View Design Patterns Series →"
      },
      retros: {
        title: "Troubleshooting Retros",
        description: "Documenting difficult problems and online incidents, from phenomenon to root cause to solution.",
        cta: "View Retrospective Cases →"
      },
      js: {
        title: "JS Basics",
        description: "Returning to the language itself, laying the foundation for all engineering and architectural capabilities.",
        cta: "View JS Basic Articles →"
      },
      essay: {
        title: "Essays / Thoughts",
        description: "Notes and reflections on learning methods, career development, and personal efficiency.",
        cta: "View Essays →"
      }
    },
    about: {
      header: "About",
      lead: "I turn AI capabilities into shipped products, solving real business problems with engineering discipline.",
      para1: "My name is Eric Wang. I am an AI application developer with 7 years of frontend architecture experience, based in Changsha. I am passionate about using AI to solve real problems and build intelligent tools that serve business needs.",
      para2: "I am currently focused on AI application development, continuously exploring how LLMs, Agents, and Prompt Engineering can be applied to real-world business scenarios.",
      para3: "Whether you are a technical leader looking for someone to ship AI-powered products, or a fellow developer interested in AI application development, feel free to reach out!",
      cards: [
        {
          title: "AI-first delivery",
          description: "Not demo-grade AI toys — I build production-ready, maintainable, and iterable AI products."
        },
        {
          title: "Engineering foundation",
          description: "7 years of frontend architecture experience providing a solid engineering base for AI applications."
        },
        {
          title: "End-to-end execution",
          description: "From requirement analysis to Prompt design, API integration to frontend delivery — shipping AI products end-to-end."
        }
      ],
      facts: [
        "Based in Changsha, focused on AI application development and frontend engineering",
        "Background in digital marketing and SEO, with sensitivity to traffic and conversion",
        "Writing about AI application development, Agent building, and engineering practices"
      ]
    },
    experience: {
      header: "Experience",
      responsibilitiesLabel: "Key Responsibilities",
      achievementsLabel: "Key Achievements",
      stats: [
        {
          value: "2",
          label: "Core career stages"
        },
        {
          value: "5+",
          label: "Micro-frontend apps governed"
        },
        {
          value: "100+",
          label: "Business and landing pages shipped"
        },
        {
          value: "80%",
          label: "Iteration reduction in some projects"
        }
      ],
      companies: [
        {
          company: "Gradient Technology Co., Ltd.",
          role: "Senior Frontend Developer",
          period: "May 2022 - Jul 2025",
          desc: "Led frontend development for Big Data Platform and pioneered AI-assisted programming workflow. Established AI Rules & Skills system, driving team-wide AI engineering adoption.",
          responsibilities: [
            "Introduced AI-assisted programming workflow for page development, component encapsulation, and complex logic implementation",
            "Developed AI Rules & Skills based on historical projects, enabling direct deployment of AI-generated code",
            "Led frontend development for Big Data Platform and O&M Management Platform",
            "Integrated 5+ sub-applications using qiankun micro-frontend, solving style isolation, communication, and permission issues",
            "Participated in frontend infrastructure and component library development",
            "Mentored junior developers, conducted regular Code Reviews and technical sharing sessions"
          ],
          achievements: [
            "Developed AI Rules & Skills system, enabling AI-generated code to be directly deployed to production",
            "Introduced AI-assisted programming, improving component development efficiency by 50%+",
            "Independently responsible for O&M product line frontend architecture and core feature development",
            "Encapsulated 10+ reusable business components, reducing development time by ~200 hours",
            "Rebuilt official website using Gatsby + Strapi, significantly improving UX and operational efficiency"
          ],
          tech: ["Vue2/3（Vuex & TypeScript）", "Node (Koa)", "SSG (Gatsby, Nuxt)", "React (Redux & Hooks)", "Docker", "Micro Front-end (qiankun & wujie)"]
        },
        {
          company: "Hunan QiFeng Network Technology Co., Ltd.",
          role: "Frontend Developer",
          period: "Jul 2018 - May 2022",
          desc: "Built multiple admin systems from scratch, managed SEM landing page ecosystem and monitoring systems, drove team engineering standardization.",
          responsibilities: [
            "Built multiple admin systems from scratch (Gaming, OA, QA)",
            "Managed SEM landing page system and monitoring infrastructure",
            "Introduced ESLint, Commitlint, Lint-staged to standardize team engineering workflow",
            "Built automated regression testing with Selenium, reducing production incidents"
          ],
          achievements: [
            "Supported 100+ landing page development, contributing to ~20% revenue growth",
            "Established unified landing page templates and analytics solutions, improving conversion rate and SEO",
            "Admin systems significantly improved operational and development efficiency, reducing iteration cycle by 80%"
          ],
          tech: ["Vue", "Webpack", "jQuery", "Tailwindcss", "Mini Program（Taro）"]
        }
      ]
    },
    projects: {
      header: "Featured Projects",
      toolsLabel: "Development Stack",
      viewProject: "View Project",
      items: [
        {
          name: "Enterprise AI Training & Distributed Inference Platform",
          description: "Built core modules for an enterprise AI platform managing datasets, model registries, and training/inference workloads. Engineered intuitive React/TypeScript dashboards to streamline asset versioning, task execution, and real-time job tracking. Containerized application services using Docker and coordinated deployment pipelines across Kubernetes clusters. Unified fragmented dataset and checkpoint workflows into a single interface, standardizing Docker-based packaging for zero-drift deployments from staging to cluster execution.",
          role: "Senior Full-Stack Engineer / Core Platform Developer",
          summary: "Core modules and dashboards for an enterprise AI platform — from data asset management to K8s deployment pipelines.",
          highlights: [
            "Dataset versioning and metadata pipelines linking training corpora to model checkpoints",
            "React/TypeScript dashboards for task execution and real-time job tracking (status polling, logs, metrics)",
            "Docker containerization + K8s deployment pipelines: zero-drift from staging to cluster"
          ],
          metrics: ["Enterprise AI platform", "Docker + K8s deployment", "Real-time job tracking"],
          tools: ["TypeScript", "React", "Docker", "Kubernetes", "Python"],
          image: "/projects/ai-platform-architecture-en.jpg",
          imageZh: "/projects/ai-platform-architecture-zh.png",
          link: "https://www.upwork.com/freelancers/~014b9123cf6c2a2244?p=2098313970974490624",
          linkText: "View on Upwork"
        },
        {
          name: "Long CoT (Chain-of-Thought) Data Annotation & Synthesis Platform",
          description: "Extended open-source easy-dataset for enterprise Long-CoT curation: tree-structured reasoning chains with step-by-step verification, branch exploration, error localization, and human-in-the-loop critique. Integrated OAuth2 SSO with the host platform and rebuilt dataset search for multi-dimensional filtering. Implemented high-throughput MinIO chunked uploads (presigned URLs, MD5 checks, resume) and an automated sync pipeline converting curated data to ShareGPT/JSONL flowing back into SFT/RL training. Cut curation overhead by 3x.",
          role: "Lead Full-Stack Developer",
          summary: "Enterprise extension of open-source easy-dataset: a closed loop from Long-CoT curation to annotation and back into training.",
          highlights: [
            "Step-level tree-structured CoT annotation: branch exploration, verification, error localization, critique arbitration",
            "OAuth2 SSO with org-structure inheritance and project-level permission isolation",
            "MinIO presigned chunked uploads for 10GB+ files; curated data auto-converts to ShareGPT/JSONL back into SFT/RL"
          ],
          metrics: ["3x lower curation overhead", "10GB+ chunked uploads", "Closed-loop SFT/RL data ecosystem"],
          tools: ["Next.js", "Python", "PostgreSQL", "MinIO", "OAuth2"],
          image: "/projects/long-cot-architecture-en.png",
          imageZh: "/projects/long-cot-architecture-zh.png",
          link: "https://www.upwork.com/freelancers/~014b9123cf6c2a2244?p=2098322775645335552",
          linkText: "View on Upwork"
        },
        {
          name: "ForgeC — AI-Powered Python to C/C++ Transpilation Engine",
          description: "Built ForgeC, a production-grade AI transpiler converting multi-file Python codebases into compilable, standards-compliant C/C++. Engineered an automated compile-verify-repair loop using isolated, zero-network Docker containers (clang -Werror) with a project-wide symbol graph and cross-file link audits that auto-resolve dependency and symbol conflicts. Delivered a React/TypeScript control plane, FastAPI/PostgreSQL/Redis backend, and a 400MB air-gapped Linux deployment bundle. Verified by 480+ automated tests.",
          role: "Full-Stack & Systems Developer",
          summary: "A production-grade engine that transpiles Python codebases into compilable C/C++ with a fully automated compile-verify-repair loop.",
          highlights: [
            "Project-wide symbol graph: nested directories ingested with classes, functions, and dependency call graphs kept in global context",
            "Closed-loop compile & repair: disposable zero-network Docker sandboxes (clang -Werror), parsed diagnostics routed back for iterative auto-repair",
            "Whole-project link audit kills the classic \"green per-file, broken on build\" failure; 400MB air-gapped bundle ships 6 Docker images"
          ],
          metrics: ["480+ automated tests", "400MB air-gapped bundle", "Compile-verify-repair loop"],
          tools: ["Python", "FastAPI", "Redis", "Docker", "React"],
          image: "/projects/forgec-architecture-en.png",
          imageZh: "/projects/forgec-architecture-zh.png",
          link: "https://www.upwork.com/freelancers/~014b9123cf6c2a2244?p=2098328766776393728",
          linkText: "View on Upwork"
        }
      ]
    },
    blog: {
      header: "Recent Posts",
      lead: "I keep writing about project decisions, engineering practice, and troubleshooting so the site shows not only shipped work, but also how I think.",
      featuredLabel: "Featured Post",
      recentLabel: "Latest Updates",
      viewMore: "View More",
      readMore: "Read More",
      readMoreAria: "Read more",
      readMoreAriaWithTitle: "Read more: {{title}}"
    },
    articles: {
      title: "Explore Articles",
      subtitle: "Curated content synced from Notion database, documenting technical exploration and thoughts",
      home: "Home",
      loading: "Loading...",
      loadingMore: "Loading more...",
      noArticles: "No articles yet",
      loadedAll: "All loaded",
      articlesCount: "articles",
      readMore: "Read More",
      noSummary: "No summary available",
      errorConfig: "Data source not configured",
      errorLoad: "Failed to load",
      all: "All",
      filterByType: "Filter by type",
    },
    tags: {
      JavaScript: "JavaScript",
      Notes: "Notes",
      ProblemsReview: "Problem Review",
      FrontEndEngineering: "Frontend Engineering",
      DesignPattern: "Design Pattern",
      Essay: "Essay",
      JSBasics: "JS Basics",
      TypeScript: "TypeScript",
      React: "React",
      Vue: "Vue",
      NodeJS: "Node.js",
      CSS: "CSS",
      HTML: "HTML",
      Performance: "Performance",
      Security: "Security",
      Testing: "Testing",
      DevOps: "DevOps",
      Other: "Other",
    },
    articleDetail: {
      toc: "Table of Contents",
      minRead: "min read",
      views: "views",
      like: "Like",
      share: "Share",
      copied: "Link copied",
      lastEdited: "Last edited on",
      relatedArticles: "Related Articles",
      readMore: "Learn more",
      notFound: "Article not found",
      comments: "Comments",
      commentPlaceholder: "Share your thoughts...",
      postComment: "Post Comment",
      posting: "Posting...",
      reply: "Reply",
      replies: "replies",
      replyPlaceholder: "Reply to {{name}}...",
      edit: "Edit",
      edited: "edited",
      delete: "Delete",
      confirmDelete: "Are you sure you want to delete this comment?",
      save: "Save",
      cancel: "Cancel",
      you: "You",
      noComments: "No comments yet, be the first to share!",
      editProfile: "Edit Profile",
      userName: "Nickname",
      userNamePlaceholder: "Enter nickname (max 20 chars)",
      localStorageNote: "Comments are stored in your browser locally. Clearing browser data may result in data loss.",
      localStorageInfo: "Comments are stored in IndexedDB locally. Clearing browser data may result in data loss.",
      loadingComments: "Comments will load when you scroll near this section.",
      imageNotAvailable: "Image not available",
      imageLoadFailed: "Failed to load image",
      viewOriginalImage: "View original",
    },
    contact: {
      header: "Need an AI Application Developer? Let's Talk!",
      lead: "If you need someone to ship AI-powered products, or an AI application developer with deep frontend architecture experience, reach out directly.",
      cta: "Get in Touch",
      secondaryCta: "View GitHub",
      resumeCta: "Download Resume",
      links: {
        github: "GITHUB",
        yuque: "YUQUE",
        email: "EMAIL"
      },
      availability: [
        "Open to full-time opportunities",
        "Also happy to discuss freelance work or technical collaboration",
        "Usually replies within 1-2 days"
      ]
    },
    floatingActions: {
      backToTop: "Back to top"
    },
    footer: {
      copyright: "© Copyright 2025 Eric Wang"
    },
    seo: {
      home: {
        title: "Eric Wang | AI Application Developer · Frontend Architecture",
        description: "AI application developer with 7 years of frontend architecture experience. Focused on AI Agents, Prompt Engineering, and LLM application delivery with engineering discipline.",
        keywords: "AI application development,AI Agent,Prompt Engineering,LLM applications,AI-assisted development,frontend architecture,frontend engineering,JavaScript,TypeScript,React,Vite,Eric Wang",
      },
      articles: {
        title: "Explore Articles | Eric Wang",
        description: "Curated technical articles synced from Notion database, covering frontend engineering, design patterns, troubleshooting retrospectives, JS basics, and essays. Explore frontend technologies and document technical decisions.",
        keywords: "frontend articles,tech blog,frontend engineering,design patterns,JavaScript,React,Vue,frontend development",
      },
      articleDetail: {
        titleSuffix: " | Eric Wang",
        descriptionPrefix: "",
        keywordsBase: "frontend development,JavaScript,tech article",
      },
    }
  }
};
export default en;

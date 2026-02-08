const en = {
  translation: {
    nav: {
      about: "About",
      experience: "Experience",
      projects: "Projects",
      blog: "Blog",
      contact: "Contact"
    },
    hero: {
      hi: "Hi, my name is",
      name: "Eric Wang",
      title: "Web Developer in ChangeSha",
      cta: "Get in Touch",
      status: 'Online',
      techStack: 'TECH STACK',
      greeting: "From Business to Advanced\nSystematic Learning & Engineering",
      tagline: "Systematic Learning · Retrospective Driven · Advanced Frontend & Engineering",
      subtitle: "Focusing on design patterns, frontend engineering, troubleshooting retrospectives, JS basics, and essays. Documenting real-world technical decisions and systematic learning paths to help frontend developers build reusable knowledge systems and show employers the value of engineering.",
      primaryCta: "Start with Advanced Path →",
      secondaryCta: "About Me & Collaboration →",
      downloadResume: "Download Resume",
      promise: "Advanced frontend & engineering notes driven by systematic learning and retrospectives.",
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
      para1: "My name is Eric Wang. I'm a frontend software engineer & freelance web developer in Changsha—with roots in digital marketing & SEO. I'm passionate about music, technology, and basically everything that makes the internet tick.",
      para2: "My work currently consists of a full-time engineering role at The BigData Project (working on Tiduyun). I'm learning as a web developer and for keeping up with new tools, libraries, and frameworks.",
      para3: "Whether you're a business owner looking to get started on an app or web development project, a developer looking to collaborate on something cool, or just wanting to say hi, shoot me a message and let's work together."
    },
    experience: {
      header: "Experience",
      responsibilitiesLabel: "Key Responsibilities",
      achievementsLabel: "Key Achievements",
      companies: [
        {
          company: "Gradient Technology Co., Ltd.",
          role: "Senior Frontend Developer",
          period: "May 2022 - Jul 2025",
          desc: "Responsible for frontend development of core systems including Big Data Platform and O&M Management Platform. Led micro-frontend architecture implementation and AI-assisted programming workflow.",
          responsibilities: [
            "Led frontend development for Big Data Platform and O&M Management Platform",
            "Integrated 5+ sub-applications using qiankun micro-frontend, solving style isolation, communication, and permission issues",
            "Participated in frontend infrastructure and component library development",
            "Introduced AI-assisted programming workflow for page development, component encapsulation, and complex logic implementation",
            "Mentored junior developers, conducted regular Code Reviews and technical sharing sessions"
          ],
          achievements: [
            "Independently responsible for O&M product line frontend architecture and core feature development",
            "Encapsulated 10+ reusable business components, reducing development time by ~200 hours",
            "Developed AI Rules & Skills based on historical projects, enabling direct deployment of AI-generated code",
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
      toolsLabel: "DEVELOPMENT TOOLS",
      viewProject: "VIEW PROJECT",
      items: [
        {
          name: "Datagradient Platform",
          description: "A one-stop cloud-native data intelligence R&D and asset management platform. Covers offline development, real-time development, algorithm development, data assets, data quality, smart tags, data services, data sharing, and visual analysis to support the full lifecycle management of enterprise data assets.",
          tools: ["Vue3", "TypeScript", "qiankun Micro-frontend", "Vuex", "Element Plus", "ECharts", "Node.js"],
          image: "datagradient",
          link: "https://www.tiduyun.com",
          linkText: "VIEW PROJECT"
        }
      ]
    },
    blog: {
      header: "Recent Posts",
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
      imageNotAvailable: "Image not available",
      imageLoadFailed: "Failed to load image",
      viewOriginalImage: "View original",
    },
    contact: {
      header: "Need a Changsha Web Developer? Let's build something.",
      cta: "Get in Touch",
      links: {
        github: "GITHUB",
        yuque: "YUQUE",
        email: "EMAIL"
      }
    },
    floatingActions: {
      backToTop: "Back to top"
    },
    footer: {
      copyright: "© Copyright 2025 Eric Wang"
    },
    seo: {
      home: {
        title: "Eric Wang | Advanced Frontend & Engineering",
        description: "Advanced frontend and engineering practice: systematic learning, design patterns, troubleshooting retrospectives, frontend engineering, and JS basic notes. Documenting real-world technical decisions and systematic learning paths.",
        keywords: "frontend,advanced frontend,frontend engineering,design patterns,troubleshooting retrospectives,JavaScript,TypeScript,React,Vite,performance optimization,architecture,Eric Wang",
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

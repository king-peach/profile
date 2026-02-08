const zh = {
  translation: {
    nav: {
      about: "关于",
      experience: "工作经验",
      projects: "项目经历",
      blog: "博文",
      contact: "联系我"
    },
    hero: {
      hi: "你好，我叫",
      name: "王涛",
      title: "网站全栈开发者",
      cta: "联系我",
      status: '在线',
      techStack: '技术栈',
      greeting: "从业务前端到高级前端\n系统化学习与工程化复盘",
      tagline: "系统化学习 · 复盘驱动 · 高级前端与工程化实践",
      subtitle: "围绕设计模式、前端工程化、疑难问题复盘、JS 基础与随笔，记录真实项目中的技术决策和系统化学习路径，帮在职前端构建可复用的知识体系，也让雇主看见高级前端的工程化价值。",
      primaryCta: "从进阶路线开始阅读 →",
      secondaryCta: "关于我与合作 →",
      downloadResume: "下载简历",
      promise: "以系统化学习和复盘为核心，持续更新的高级前端与工程化笔记。",
    },
    contentMap: {
      title: "核心主题",
      subtitle: "围绕五大主题构建系统化的前端知识体系，从基础到进阶，从理论到实践。",
      engineering: {
        title: "前端工程化",
        description: "从构建、部署到监控，用工程化思维管理前端复杂度。",
        cta: "查看工程化文章 →"
      },
      patterns: {
        title: "设计模式",
        description: "结合真实业务场景理解和应用前端常用设计模式。",
        cta: "查看设计模式系列 →"
      },
      retros: {
        title: "疑难问题复盘",
        description: "记录疑难问题与线上事故，从现象到根因再到方案的完整复盘。",
        cta: "查看复盘案例 →"
      },
      js: {
        title: "JS 基础",
        description: "回到语言本身，打牢一切工程化与架构能力的地基。",
        cta: "查看 JS 基础文章 →"
      },
      essay: {
        title: "随笔 / 思考",
        description: "关于学习方法、职业发展与个人效率的记录与反思。",
        cta: "查看随笔 →"
      }
    },
    about: {
      header: "关于",
      para1: "我是王涛，是一名前端工程师和独立网站开发者，现居长沙，拥有数字营销与SEO背景。热爱运动、技术及让互联网充满活力的一切。",
      para2: "目前我在梯度科技做全职工程师，我不断学习并跟上新工具、库和框架的发展。",
      para3: "无论你是企业主、有开发需求，还是开发者希望交流合作，欢迎与我联系！"
    },
    experience: {
      header: "工作经验",
      responsibilitiesLabel: "主要职责",
      achievementsLabel: "关键成果",
      companies: [
        {
          company: "梯度科技股份有限公司",
          role: "高级前端开发工程师",
          period: "2022年5月 - 2025年7月",
          desc: "负责大数据中台、运维管理平台等核心系统前端开发，主导微前端架构落地与 AI 辅助编程流程引入。",
          responsibilities: [
            "负责大数据中台、运维管理平台等核心系统前端开发",
            "使用 qiankun 微前端集成 5+ 子应用，解决样式隔离、通信、权限等问题",
            "参与前端基础设施与组件库建设",
            "引入 AI 辅助编程流程，用于页面开发、组件封装与复杂逻辑实现",
            "带教初中级前端，定期 Code Review 与技术分享"
          ],
          achievements: [
            "独立负责运维产品线前端架构与核心功能开发",
            "封装 10+ 通用业务组件，减少重复开发工时约 200 小时",
            "基于历史项目沉淀 AI Rules & Skills，使 AI 生成代码可直接落地",
            "使用 Gatsby + Strapi 重构官网，显著提升用户体验与运营效率"
          ],
          tech: ["Vue2/3（Vuex & TypeScript）", "Node (Koa)", "静态站点生成 (Gatsby, Nuxt)", "React (Redux & Hooks)", "Docker", "微前端（qiankun & wujie）"]
        },
        {
          company: "湖南七风网络科技有限公司",
          role: "前端开发工程师",
          period: "2018年7月 - 2022年5月",
          desc: "从 0-1 开发多套后台管理系统，负责 SEM 落地页体系与配套监控系统，推动团队工程化规范落地。",
          responsibilities: [
            "从 0-1 开发多套后台管理系统（游戏、OA、QA）",
            "负责 SEM 落地页体系与配套监控系统",
            "引入 ESLint、Commitlint、Lint-staged，规范团队工程流程",
            "基于 Selenium 构建自动化回归测试，减少线上事故"
          ],
          achievements: [
            "支撑 100+ 落地页开发，协助业务营收提升约 20%",
            "搭建统一落地页模板与埋点方案，提升转化率与 SEO 效果",
            "后台系统显著提升运营与开发效率，版本迭代周期缩短 80%"
          ],
          tech: ["Vue", "Webpack", "jQuery", "Tailwindcss", "小程序开发（Taro）"]
        }
      ]
    },
    projects: {
      header: "项目经历",
      toolsLabel: "技术栈",
      viewProject: "查看项目",
      items: [
        {
          name: "数度大数据平台",
          description: "一站式云原生数据智能研发与资产管理平台。涵盖离线开发、实时开发、算法开发、数据资产、数据质量、智能标签、数据服务、共享开放、可视化分析等完整数据链路，支撑企业数据资产的全生命周期管理。",
          tools: ["Vue3", "TypeScript", "qiankun 微前端", "Vuex", "Element Plus", "ECharts", "Node.js"],
          image: "datagradient",
          link: "https://www.tiduyun.com",
          linkText: "访问官网"
        }
      ]
    },
    blog: {
      header: "近期博文",
      viewMore: "查看更多",
      readMore: "阅读更多",
      readMoreAria: "阅读更多",
      readMoreAriaWithTitle: "阅读更多：{{title}}"
    },
    articles: {
      title: "探索文章",
      subtitle: "从 Notion 数据库同步的精选内容，记录技术探索与思考",
      home: "首页",
      loading: "加载中...",
      loadingMore: "加载更多...",
      noArticles: "暂无文章",
      loadedAll: "已加载全部",
      articlesCount: "篇文章",
      readMore: "阅读全文",
      noSummary: "暂无摘要",
      errorConfig: "未配置数据源",
      errorLoad: "加载失败",
      all: "全部",
      filterByType: "按类型筛选",
    },
    tags: {
      JavaScript: "JavaScript",
      Notes: "随笔",
      ProblemsReview: "问题复盘",
      FrontEndEngineering: "前端工程化",
      DesignPattern: "设计模式",
      Essay: "随笔",
      JSBasics: "JS基础",
      TypeScript: "TypeScript",
      React: "React",
      Vue: "Vue",
      NodeJS: "Node.js",
      CSS: "CSS",
      HTML: "HTML",
      Performance: "性能优化",
      Security: "安全",
      Testing: "测试",
      DevOps: "DevOps",
      Other: "其他",
    },
    articleDetail: {
      toc: "文章目录",
      minRead: "分钟阅读",
      views: "次浏览",
      like: "赞同",
      share: "分享",
      copied: "链接已复制",
      lastEdited: "最后编辑于",
      relatedArticles: "推荐阅读",
      readMore: "了解更多",
      notFound: "未找到文章",
      comments: "评论",
      commentPlaceholder: "分享你的想法...",
      postComment: "发表评论",
      posting: "发布中...",
      reply: "回复",
      replies: "条回复",
      replyPlaceholder: "回复 {{name}}...",
      edit: "编辑",
      edited: "已编辑",
      delete: "删除",
      confirmDelete: "确定要删除这条评论吗？",
      save: "保存",
      cancel: "取消",
      you: "我",
      noComments: "还没有评论，来说点什么吧~",
      editProfile: "编辑资料",
      userName: "昵称",
      userNamePlaceholder: "输入昵称（最多20字）",
      localStorageNote: "评论数据存储在本地浏览器中，清除浏览器数据后将丢失。",
      localStorageInfo: "评论使用 IndexedDB 存储在本地浏览器中。清除浏览器数据可能导致评论丢失。",
      imageNotAvailable: "图片不可用",
      imageLoadFailed: "图片加载失败",
      viewOriginalImage: "查看原图",
    },
    contact: {
      header: "需要长沙的前端开发者？欢迎合作！",
      cta: "联系我",
      links: {
        github: "GitHub",
        yuque: "语雀",
        email: "邮箱"
      }
    },
    floatingActions: {
      backToTop: "返回顶部"
    },
    footer: {
      copyright: "版权所有 2025 王涛"
    },
    seo: {
      home: {
        title: "王涛 | 高级前端 · 工程化 · 复盘驱动",
        description: "高级前端与工程化实践：系统化学习、设计模式、疑难问题复盘、前端工程化与 JS 基础笔记。围绕设计模式、前端工程化、疑难问题复盘、JS 基础与随笔，记录真实项目中的技术决策和系统化学习路径。",
        keywords: "前端,高级前端,前端工程化,设计模式,疑难问题复盘,JavaScript,TypeScript,React,Vite,性能优化,架构,王涛,Eric Wang",
      },
      articles: {
        title: "探索文章 | 王涛",
        description: "从 Notion 数据库同步的精选技术文章，涵盖前端工程化、设计模式、疑难问题复盘、JS 基础与随笔。探索前端技术，记录真实项目中的技术决策和系统化学习路径。",
        keywords: "前端文章,技术博客,前端工程化,设计模式,JavaScript,React,Vue,前端开发",
      },
      articleDetail: {
        titleSuffix: " | 王涛",
        descriptionPrefix: "",
        keywordsBase: "前端开发,JavaScript,技术文章",
      },
    }
  }
};
export default zh;

/**
 * 站点参数：把原先写死在组件、样式与脚本里的站点专属取值收成一份配置。
 *
 * 这里只收「站点身份」——站名、标语、首页四条索引、页脚署名与链接、
 * 目录约定、页面 class。版式、令牌与交互不属于参数，改它们应该直接改主题。
 *
 * 所有默认值都等于 fluxixix 本站的现值，所以本站只需传差异项。
 */

/** 首页刊头的一条索引行 */
export interface HomeRow {
  /** 行首编号，例如 '01' */
  num: string
  /** 索引名，例如 '文章' */
  label: string
  /** 一句话说明，可省 */
  meta?: string
  /** 目标地址，同时用作 key */
  href: string
}

/** 页脚右下角的一个链接 */
export interface FooterLink {
  text: string
  link: string
}

export interface FluxixixOptions {
  /** 站点身份：出现在首页刊头眉题与页脚署名里 */
  site?: {
    /** 站名 */
    name?: string
    /** 标语，紧随站名 */
    tagline?: string
  }
  /** 品牌渐变两端。只改这两个变量即可整体换色（见 styles/tokens.css） */
  brand?: {
    a?: string
    b?: string
  }
  /** 首页刊头：陈述句与四条索引 */
  home?: {
    /** 大号衬线陈述句 */
    statement?: string
    /** 四条索引行 */
    rows?: HomeRow[]
  }
  /** 全站页脚 */
  footer?: {
    /** 左侧署名行。缺省为「站名 · 标语 · 年份」 */
    meta?: string
    /** 右侧链接 */
    links?: FooterLink[]
  }
  /** 目录与页面 class 约定 */
  pages?: {
    /** 文章所在路径前缀，决定阅读进度条/进度环在哪出现，默认 '/posts/' */
    postsDir?: string
    /** frontmatter 的 pageClass 取值，用于页面专属样式 */
    pageClasses?: {
      about?: string
      works?: string
      nowIndex?: string
      nowMonth?: string
    }
  }
  /** 界面文案 */
  i18n?: {
    /** 作品墙展开键在展开态的文案；收起态文案从按钮现有文本缓存 */
    collapse?: string
    /** Now 页页头的副标题 */
    nowTag?: string
  }
}

/** 解析后的参数：每个字段都必有值，供组件与脚本直接消费 */
export interface ResolvedFluxixixOptions {
  site: { name: string; tagline: string }
  brand: { a: string; b: string }
  home: {
    statement: string
    rows: HomeRow[]
  }
  footer: {
    meta: string
    links: FooterLink[]
  }
  pages: {
    postsDir: string
    pageClasses: {
      about: string
      works: string
      nowIndex: string
      nowMonth: string
    }
  }
  i18n: {
    collapse: string
    nowTag: string
  }
}

export const defaultOptions: ResolvedFluxixixOptions = {
  site: { name: 'fluxixix', tagline: 'less is more' },
  brand: { a: '#bd34fe', b: '#41d1ff' },
  home: {
    statement: 'harder / better / faster / stronger',
    rows: [
      { num: '01', label: '文章', meta: '技术笔记与零散思考', href: '/posts/' },
      { num: '02', label: '作品', meta: '平台 · 工具链 · 个人项目', href: '/works' },
      { num: '03', label: 'Now', meta: '最近在做、在学、在玩的', href: '/now' },
      { num: '04', label: '归档', meta: '按时间倒序，适合顺着翻', href: '/archive' }
    ]
  },
  footer: {
    meta: 'fluxixix · less is more',
    links: [
      { text: 'RSS', link: '/feed.xml' },
      { text: 'GitHub', link: 'https://github.com/fluxixix/fluxixix.github.io' }
    ]
  },
  pages: {
    postsDir: '/posts/',
    pageClasses: {
      about: 'about',
      works: 'works',
      nowIndex: 'now-index',
      nowMonth: 'now-month'
    }
  },
  i18n: {
    collapse: '收起',
    nowTag: 'NOW · 当下快照'
  }
}

/** app.provide 的键，组件用它 inject 站点参数 */
export const OPTIONS_KEY = 'fluxixix-options' as const

/**
 * 把使用者传入的参数并到默认值上。
 *
 * 逐层浅合并：数组与元组整体替换（传了 rows 就用传的，不追加），
 * 因为它们是「这块内容长什么样」的完整描述，部分合并只会得到奇怪的中间态。
 */
export function resolveOptions(options: FluxixixOptions = {}): ResolvedFluxixixOptions {
  const site = {
    name: options.site?.name ?? defaultOptions.site.name,
    tagline: options.site?.tagline ?? defaultOptions.site.tagline
  }

  return {
    site,
    brand: {
      a: options.brand?.a ?? defaultOptions.brand.a,
      b: options.brand?.b ?? defaultOptions.brand.b
    },
    home: {
      statement: options.home?.statement ?? defaultOptions.home.statement,
      rows: options.home?.rows ?? defaultOptions.home.rows
    },
    footer: {
      meta: options.footer?.meta ?? `${site.name} · ${site.tagline}`,
      links: options.footer?.links ?? defaultOptions.footer.links
    },
    pages: {
      postsDir: options.pages?.postsDir ?? defaultOptions.pages.postsDir,
      pageClasses: {
        about: options.pages?.pageClasses?.about ?? defaultOptions.pages.pageClasses.about,
        works: options.pages?.pageClasses?.works ?? defaultOptions.pages.pageClasses.works,
        nowIndex:
          options.pages?.pageClasses?.nowIndex ?? defaultOptions.pages.pageClasses.nowIndex,
        nowMonth:
          options.pages?.pageClasses?.nowMonth ?? defaultOptions.pages.pageClasses.nowMonth
      }
    },
    i18n: {
      collapse: options.i18n?.collapse ?? defaultOptions.i18n.collapse,
      nowTag: options.i18n?.nowTag ?? defaultOptions.i18n.nowTag
    }
  }
}

/**
 * 品牌色同时写进 --fx-brand-a/b 供组件内 SVG、光标粒子使用。
 * 只是一段内联样式，不新增样式文件，也不影响样式的先后顺序。
 */
export function brandStyle(options: ResolvedFluxixixOptions): string {
  return `--fx-brand-a:${options.brand.a};--fx-brand-b:${options.brand.b}`
}

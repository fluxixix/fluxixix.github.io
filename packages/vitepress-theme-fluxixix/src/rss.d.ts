import type { SiteConfig } from 'vitepress'

/** 生成 RSS 需要的站点信息。除 siteUrl 外都给了与 fluxixix 本站一致的默认值 */
export interface RssOptions {
  /** 站点线上地址（RSS 规范要求绝对 URL），必填 */
  siteUrl: string
  /** feed 文件名，默认 feed.xml */
  feedFile?: string
  /** 文章目录（相对 srcDir），默认 posts */
  postDir?: string
  /** 频道标题，默认取 VitePress 的 site.title */
  title?: string
  /** 频道描述，默认取 VitePress 的 site.description */
  description?: string
  /** 站点语言，默认 zh-CN */
  language?: string
  /** 最多收录几篇，默认 20 */
  maxItems?: number
}

/**
 * 生成 buildEnd 钩子：构建结束后把 RSS feed 写进产物目录。
 *
 *   buildEnd: rss({ siteUrl: 'https://example.com' })
 */
export declare function rss(options: RssOptions): (siteConfig: SiteConfig) => Promise<void>

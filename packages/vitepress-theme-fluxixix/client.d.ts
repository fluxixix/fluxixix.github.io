import type { Theme } from 'vitepress'

/** 首页刊头的一条索引行 */
export interface HomeRow {
  num: string
  label: string
  meta?: string
  href: string
}

/** 页脚右下角的一个链接 */
export interface FooterLink {
  text: string
  link: string
}

export interface FluxixixOptions {
  site?: { name?: string; tagline?: string }
  brand?: { a?: string; b?: string }
  home?: { statement?: string; rows?: HomeRow[] }
  footer?: { meta?: string; links?: FooterLink[] }
  pages?: {
    postsDir?: string
    pageClasses?: {
      about?: string
      works?: string
      nowIndex?: string
      nowMonth?: string
    }
  }
  i18n?: { collapse?: string; nowTag?: string }
}

export interface ResolvedFluxixixOptions {
  site: { name: string; tagline: string }
  brand: { a: string; b: string }
  home: { statement: string; rows: HomeRow[] }
  footer: { meta: string; links: FooterLink[] }
  pages: {
    postsDir: string
    pageClasses: { about: string; works: string; nowIndex: string; nowMonth: string }
  }
  i18n: { collapse: string; nowTag: string }
}

/** app.provide 的键 */
export declare const OPTIONS_KEY: 'fluxixix-options'

/** 默认参数（等于 fluxixix 本站现值） */
export declare const defaultOptions: ResolvedFluxixixOptions

export declare function resolveOptions(options?: FluxixixOptions): ResolvedFluxixixOptions

/** 在默认主题上叠一层编辑部式版式与交互 */
export declare function fluxixixTheme(options?: FluxixixOptions): Theme

declare const theme: Theme
export default theme

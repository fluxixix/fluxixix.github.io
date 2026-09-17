import type { UserConfig } from 'vitepress'

/** 主题自带的默认界面文案与本地搜索翻译 */
export declare const defaultThemeConfig: Record<string, unknown>

/**
 * 把站点自己的 themeConfig 与主题默认文案合并。
 *
 *   themeConfig: fluxixixSite({ nav: [...], sidebar: {...} })
 */
export declare function fluxixixSite<T extends UserConfig['themeConfig']>(config: T): T

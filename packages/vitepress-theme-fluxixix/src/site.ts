/**
 * 站点的 VitePress 配置助手：把主题自带的界面文案与本地搜索翻译补齐。
 *
 * 这里只给「文案」——nav / sidebar / socialLinks 属于内容，永远由站点自己写；
 * 传进来的同名字段优先，缺省项才由本函数补上。
 */

/** 主题自带的默认界面文案（默认主题的界面文案是写死的英文，这几处会显示给读者） */
export const defaultThemeConfig = {
  outline: { label: '本页目录' },
  returnToTopLabel: '回到顶部',
  // 窄屏下打开侧边栏的那个按钮
  sidebarMenuLabel: '菜单',
  // 窄屏菜单里的亮暗主题切换
  darkModeSwitchLabel: '外观',
  docFooter: { prev: '上一篇', next: '下一篇' },
  search: {
    provider: 'local',
    options: {
      translations: {
        button: { buttonText: '搜索', buttonAriaLabel: '搜索' },
        modal: {
          displayDetails: '显示详情',
          resetButtonTitle: '清除搜索',
          backButtonTitle: '返回',
          noResultsText: '没有找到结果',
          footer: {
            selectText: '选择',
            navigateText: '切换',
            closeText: '关闭'
          }
        }
      }
    }
  }
} as const

/**
 * 把站点自己的 themeConfig 与主题默认文案合并。
 *
 *   themeConfig: fluxixixSite({ nav: [...], sidebar: {...} })
 *
 * 站点的整段配置被原样保留，返回类型也跟它一致，所以 VitePress 的类型检查
 * 仍然按站点写的内容来。
 */
export function fluxixixSite<T extends Record<string, unknown>>(config: T): T {
  return {
    ...defaultThemeConfig,
    ...config
  } as T
}

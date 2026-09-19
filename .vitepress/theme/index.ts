import theme from 'vitepress-theme-fluxixix/theme'

// 字体自托管：思源宋体（中文 + 拉丁展示字）与 IBM Plex Mono。
// 宋体按 unicode-range 切片，浏览器只下载页面用字的切片。
// 放在主题之前引入——字体只是 @font-face 声明，不参与覆盖关系。
import '@fontsource/noto-serif-sc/700.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'

// 主题本体与样式总表都在包里，顺序由包自己保证（见包内 src/theme/index.ts）。
// 本站要覆盖主题样式时，只能在下面再引一个自己的 css：主题与默认主题都未分层，
// 而未分层胜过任何命名层，所以覆盖只能靠"后写者胜出"，写成 @layer 反而会被反压。
import './works.css'

import { setupWorksScene } from './works-scene'

export default {
  ...theme,
  enhanceApp(ctx: Parameters<NonNullable<typeof theme.enhanceApp>>[0]) {
    theme.enhanceApp?.(ctx)
    // 作品页的版画走廊。能力检测与清理都在里面，别的页面进来什么也不做
    setupWorksScene()
  }
}

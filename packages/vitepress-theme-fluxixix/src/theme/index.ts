/**
 * 推荐入口：把「主题本体 + 样式总表」打包成一次导入，顺序由包自己保证。
 *
 * 为什么需要这一层：主题样式必须排在 VitePress 默认主题之后。VitePress 的
 * vars.css 与组件样式都是未分层的（未分层胜过任何命名层），主题靠「排在后面」
 * 才压得住它。而 CSS 在产物里的先后由模块遍历顺序决定——写成两次 import 时
 * 使用者很容易把顺序写反，一旦写反，品牌色、悬浮导航胶囊、阅读进度环、作品卡
 * 尺寸会同时失守，而且不报任何错。
 *
 * 这里先引主题本体（它内部会引默认主题），再引样式总表，顺序在包内固定：
 *
 *   import theme from 'vitepress-theme-fluxixix/theme'
 *   export default theme
 *
 * 等价的显式写法（两行顺序不能反）：
 *
 *   import { fluxixixTheme } from 'vitepress-theme-fluxixix'
 *   import 'vitepress-theme-fluxixix/styles/index.css'
 *   export default fluxixixTheme()
 */
import '../index'
import '../styles/index.css'

export { default } from '../index'

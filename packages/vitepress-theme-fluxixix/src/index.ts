import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { brandStyle, OPTIONS_KEY, resolveOptions, type FluxixixOptions } from './options'
import { setupCursorFx } from './cursor'
import { setupReadingProgress } from './reading-progress'
import { setupReveal } from './reveal'
import { setupThemeTransition } from './theme-transition'
import { setupWorkPosters } from './work-posters'
import Layout from './Layout.vue'
import WorkPlate from './components/WorkPlate.vue'
// 样式**不在这里引**。主题样式必须排在 VitePress 默认主题之后才压得住它
// （默认主题的 vars.css 与组件 <style scoped> 都未分层，而未分层胜过任何命名层）。
// 而 CSS 在产物里的先后由模块遍历顺序决定，所以顺序交给 src/theme/index.ts
// 统一固定：那里先引本模块（链上默认主题），再引 styles/index.css。
// 详见包内 README 的「样式与层」一节。

export { default as WorkPlate } from './components/WorkPlate.vue'
export { defaultOptions, resolveOptions, OPTIONS_KEY } from './options'
export type {
  FluxixixOptions,
  FooterLink,
  HomeRow,
  ResolvedFluxixixOptions
} from './options'

/**
 * fluxixix 主题：在默认主题上叠一层编辑部式的版式与几处交互。
 *
 * 样式刻意不进 @layer（未分层的默认主题会反压命名层），靠"排在默认主题之后"
 * 取胜。推荐经包入口使用，顺序由包保证：
 *
 *   // .vitepress/theme/index.ts
 *   import theme from 'vitepress-theme-fluxixix/theme'
 *   export default theme
 *
 * 需要传参数时用下面这种写法（两行顺序不能反）：
 *
 *   import { fluxixixTheme } from 'vitepress-theme-fluxixix'
 *   import 'vitepress-theme-fluxixix/styles/index.css'
 *   export default fluxixixTheme({ site: { name: '例子', tagline: 'less is more' } })
 */
export function fluxixixTheme(options: FluxixixOptions = {}): Theme {
  const resolved = resolveOptions(options)

  return {
    extends: DefaultTheme,
    Layout,
    enhanceApp({ app }) {
      app.provide(OPTIONS_KEY, resolved)

      // 品牌色写成一段内联样式：组件内 SVG 渐变与光标粒子都读这两个变量。
      // 只有站点真的传了 brand 才注入——默认值已经在 palette.css 里，
      // 内联样式的优先级高于任何层，不该无端盖住使用者的 CSS 覆盖。
      const hasCustomBrand = options.brand?.a !== undefined || options.brand?.b !== undefined
      if (hasCustomBrand && typeof document !== 'undefined') {
        const style = document.createElement('style')
        style.setAttribute('data-fluxixix-brand', '')
        style.textContent = `:root{${brandStyle(resolved)}}`
        document.head.appendChild(style)
      }

      // 作品页的版画：Markdown 里写一个 <WorkPlate /> 标签就够了
      app.component('WorkPlate', WorkPlate)
      setupCursorFx()
      setupThemeTransition(app)
      setupReveal(resolved)
      setupWorkPosters(resolved)
      setupReadingProgress(resolved)
    }
  }
}

export default fluxixixTheme()

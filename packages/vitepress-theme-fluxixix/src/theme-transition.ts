import { nextTick, type App, type Ref } from 'vue'
import { useData } from 'vitepress'

/** 主题切换按钮（导航栏和移动端菜单里是同一个组件） */
const APPEARANCE_SWITCH_SELECTOR = '.VPSwitchAppearance'

/** startViewTransition 目前还没进部分 TS 版本的 lib.dom，单独描一个最小签名 */
type ViewTransitionDocument = Document & {
  startViewTransition: (callback: () => void | Promise<void>) => unknown
}

/**
 * 明暗切换时，让新主题从切换按钮处扩散成圆、铺满整屏。
 *
 * 做法是用 View Transitions API 把「切换主题」这一帧整个包起来：浏览器会为新旧
 * 两个状态各拍一张整页快照，我们在 CSS 里给新快照加一个以按钮为圆心的 clip-path
 * 圆，从 0 扩到能盖住视口的最远角，就得到扩散效果。
 *
 * 切换动作本身来自组件里 inject('toggle-appearance')（默认实现是 isDark 取反）。
 * 这里 provide 一个同名实现来接管：仍然调用 VueUse 的 setter，所以 isDark、
 * localStorage、<html class> 三者照旧同步，只是外面多包了一层过渡。
 */
export function setupThemeTransition(app: App) {
  if (typeof window === 'undefined') return
  const doc = document as ViewTransitionDocument
  // 不支持的浏览器（如部分版本的 Firefox）直接退回原生即时切换
  if (typeof doc.startViewTransition !== 'function') return

  // 圆心和半径得在过渡开始前就写好，浏览器是在点击处理里同步取用的。
  // 捕获阶段监听 document，早于按钮自身的 click 处理器。
  document.addEventListener(
    'click',
    (event) => {
      if (!(event.target instanceof Element)) return
      const button = event.target.closest(APPEARANCE_SWITCH_SELECTOR)
      if (!(button instanceof HTMLElement)) return

      const { left, top, width, height } = button.getBoundingClientRect()
      const x = left + width / 2
      const y = top + height / 2
      // 圆心到视口最远角的距离：圆扩到这么大就肯定盖满整屏
      const radius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      )

      const root = document.documentElement.style
      root.setProperty('--vp-theme-x', `${x}px`)
      root.setProperty('--vp-theme-y', `${y}px`)
      root.setProperty('--vp-theme-r', `${radius}px`)
    },
    true
  )

  let isDark: Ref<boolean> | undefined

  app.provide('toggle-appearance', () => {
    // inject 依赖应用的 provide 上下文，用 runWithContext 才能在这里取到 useData
    const dark = (isDark ??= app.runWithContext(() => useData().isDark))
    const next = !dark.value

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      dark.value = next
      return
    }

    doc.startViewTransition(async () => {
      dark.value = next
      // VueUse 是在 post flush 里写 <html class> 的，必须等它写完，
      // 浏览器才拍得到「切换后」的快照
      await nextTick()
    })
  })
}

import { nextTick, type App, type Ref } from 'vue'
import { onContentUpdated, useData, type EnhanceAppContext, type Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { setupCursorFx } from './cursor'
import Layout from './Layout.vue'
import './custom.css'

/** 光晕跟随鼠标的最大位移（px） */
const GLOW_SHIFT = 40

/**
 * 首页 hero 的渐变光晕跟随鼠标做轻微视差移动。
 * 只写入 CSS 变量，平滑过渡交给 custom.css 的 transition 处理。
 */
function setupHeroGlow() {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  let frame = 0
  let pointerX = 0
  let pointerY = 0

  // hero 的盒子只在滚动 / 改窗口大小 / 路由切换后才会变。
  // 曾经这里是每帧 getBoundingClientRect()——那是一次强制同步布局，
  // 鼠标一动整个首页的布局就要重算一遍，表现出来就是「首页整页都迟钝」；
  // 内页因为查不到 .VPHero 会提前 return，所以只有首页卡。改成按需重测。
  let hero: HTMLElement | null = null
  let rect: DOMRect | null = null

  const measure = () => {
    hero = document.querySelector<HTMLElement>('.VPHero .container')
    rect = hero ? hero.getBoundingClientRect() : null
  }

  window.addEventListener('resize', measure)
  window.addEventListener('scroll', measure, { passive: true })

  const clamp = (value: number) => Math.max(-1, Math.min(1, value))

  // 0.7s 的过渡本来就把移动抹平了，偏移没有实际变化时不必写，
  // 省掉一次会波及 hero 子树的样式重算
  let wroteX = Number.NaN
  let wroteY = Number.NaN

  const update = () => {
    frame = 0

    // 首次进来时 DOM 已挂载；客户端路由切换后元素会换掉，靠 isConnected 兜住
    if (!hero || !hero.isConnected) measure()
    if (!hero || !rect) return

    const inRange =
      pointerX > rect.left - rect.width / 2 &&
      pointerX < rect.right + rect.width / 2 &&
      pointerY > rect.top - rect.height &&
      pointerY < rect.bottom + rect.height

    // 鼠标离开 hero 附近时让光晕平滑归位
    const offsetX = inRange
      ? clamp((pointerX - (rect.left + rect.width / 2)) / (rect.width / 2)) * GLOW_SHIFT
      : 0
    const offsetY = inRange
      ? clamp((pointerY - (rect.top + rect.height / 2)) / (rect.height / 2)) * GLOW_SHIFT
      : 0

    if (Math.abs(offsetX - wroteX) < 0.5 && Math.abs(offsetY - wroteY) < 0.5) return
    wroteX = offsetX
    wroteY = offsetY

    hero.style.setProperty('--vp-hero-glow-x', `${offsetX.toFixed(1)}px`)
    hero.style.setProperty('--vp-hero-glow-y', `${offsetY.toFixed(1)}px`)
  }

  // 移动端没有 pointermove，此处只影响桌面端体验
  window.addEventListener(
    'pointermove',
    (event) => {
      pointerX = event.clientX
      pointerY = event.clientY
      if (!frame) frame = requestAnimationFrame(update)
    },
    { passive: true }
  )
}

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
function setupThemeTransition(app: App) {
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

/** 做滚动揭示的元素。都是列表项——正文段落不参与，否则阅读时视线总在动 */
const REVEAL_SELECTOR = [
  '.vp-doc .post-list .post-item',
  '.VPFeatures.VPHomeFeatures .item',
  '.archive-timeline .timeline-year .timeline-item'
].join(',')

/** 同一批里相邻两项的揭示间隔，形成自上而下的阶梯 */
const REVEAL_STAGGER_MS = 45

/** 阶梯最多累计到第几档。列表很长时最后一项也不至于要等一秒 */
const REVEAL_STAGGER_CAP = 6

/** 同一个父容器里的兄弟按顺序排队，跨容器不互相累积 */
function revealDelay(el: HTMLElement): number {
  const parent = el.parentElement
  if (!parent) return 0
  const index = Array.prototype.indexOf.call(parent.children, el)
  return Math.min(Math.max(index, 0), REVEAL_STAGGER_CAP) * REVEAL_STAGGER_MS
}

/**
 * 列表进入视口时淡入并轻微上移。
 *
 * 隐藏态写在 custom.css 的 html.fx-reveal-ready 下，由这里决定何时打开：
 * 脚本没跑（禁用 JS、老浏览器、reduced-motion）时页面就是普通内容，不会白屏。
 * 过渡只声明在被放出来的 .fx-in 上，所以"隐藏"这一步是瞬时的，不会先闪一下再淡出。
 *
 * 注意第 9 节里还配了 :focus-within —— 键盘 Tab 进来时立刻显示，
 * 不然用键盘的人会聚焦到看不见的链接上。
 */
function setupReveal() {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (!('IntersectionObserver' in window)) return

  let observer: IntersectionObserver | undefined

  const collect = () => {
    observer?.disconnect()
    observer = undefined

    const targets = Array.from(document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR))
    if (!targets.length) return

    document.documentElement.classList.add('fx-reveal-ready')

    const delays = new Map<Element, number>()

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const el = entry.target as HTMLElement
          el.style.setProperty('--fx-reveal-delay', `${delays.get(el) ?? 0}ms`)
          el.classList.add('fx-in')
          // 揭示过就不再观察：往回滚动时不该重演一遍
          observer?.unobserve(el)
        }
      },
      // 下边界收 8%：元素要真的进到视野里才算数，不至于刚露个头就触发
      { rootMargin: '0px 0px -8% 0px' }
    )

    for (const el of targets) {
      delays.set(el, revealDelay(el))
      observer.observe(el)
    }
  }

  // Content 组件在 vnode mount / update / unmount 时都会回调，
  // 一次路由切换可能来好几趟。推到下一帧再收集，拿到的才是最终的 DOM
  onContentUpdated(() => requestAnimationFrame(collect))
}

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }: EnhanceAppContext) {
    setupHeroGlow()
    setupCursorFx()
    setupThemeTransition(app)
    setupReveal()
  }
} satisfies Theme

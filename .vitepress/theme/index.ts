import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { setupCursorFx } from './cursor'
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

export default {
  extends: DefaultTheme,
  enhanceApp() {
    setupHeroGlow()
    setupCursorFx()
  }
} satisfies Theme

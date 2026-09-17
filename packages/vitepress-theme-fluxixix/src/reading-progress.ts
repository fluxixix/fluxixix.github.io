import { onContentUpdated } from 'vitepress'
import type { ResolvedFluxixixOptions } from './options'

/* --------------------------------------------------------------------------
   文章阅读进度：窄屏顶部细线 + 胶囊外圈的进度环
   -------------------------------------------------------------------------- */

const SVG_NS = 'http://www.w3.org/2000/svg'

/**
 * 读到哪，进度就画到哪；两个形态共用同一个进度值。
 *
 * - 窄屏（<60rem）顶栏跟着页面滚走，用 body 下一根 2px 横向细线表达：
 *   宽度写死、只动 transform: scaleX()，滚动时不触发布局。
 * - ≥60rem 顶栏收成悬浮胶囊（见 styles/nav.css），细线退场，换成套在
 *   胶囊外圈的一圈 SVG 描边，颜色是品牌紫→青的渐变，读到哪画到哪。
 *
 * 环的几何尺寸由 ResizeObserver 从元素实际像素读出来喂给 viewBox，圆角在
 * 任意宽度下都不会被拉成椭圆；进度用 pathLength="1" 归一化，stroke-dashoffset
 * 直接就是「还剩多少没读」，不必自己算周长。只在文章区出现——首页、列表、
 * 关于这些短页面不挂；判定用的是 options.pages.postsDir（默认 /posts/）。
 */
export function setupReadingProgress(options: ResolvedFluxixixOptions) {
  if (typeof window === 'undefined') return

  const postsDir = options.pages.postsDir

  /* --- 窄屏那根细线 --- */
  const bar = document.createElement('div')
  bar.className = 'fx-reading-progress'
  bar.setAttribute('aria-hidden', 'true')
  document.body.appendChild(bar)

  /* --- 套在胶囊外圈的进度环 --- */
  const ring = document.createElementNS(SVG_NS, 'svg')
  ring.setAttribute('class', 'fx-nav-ring')
  ring.setAttribute('aria-hidden', 'true')

  const defs = document.createElementNS(SVG_NS, 'defs')
  const gradient = document.createElementNS(SVG_NS, 'linearGradient')
  gradient.setAttribute('id', 'fx-nav-ring-grad')
  // 默认 objectBoundingBox：渐变按描边盒子的横向宽度铺开，宽度变了也不用重算
  gradient.setAttribute('x1', '0')
  gradient.setAttribute('y1', '0')
  gradient.setAttribute('x2', '1')
  gradient.setAttribute('y2', '0')
  for (const [offset, color] of [
    ['0', 'var(--fx-brand-a)'],
    ['1', 'var(--fx-brand-b)']
  ]) {
    const stop = document.createElementNS(SVG_NS, 'stop')
    stop.setAttribute('offset', offset)
    // stop-color 是 CSS 属性，能直接吃变量，明暗两套主题自动跟随
    stop.style.setProperty('stop-color', color)
    gradient.appendChild(stop)
  }
  defs.appendChild(gradient)

  const track = document.createElementNS(SVG_NS, 'rect')
  track.setAttribute('class', 'fx-nav-ring-track')
  const ringBar = document.createElementNS(SVG_NS, 'rect')
  ringBar.setAttribute('class', 'fx-nav-ring-bar')
  // 周长归一化成 1，dashoffset 就等于「还剩的比例」
  ringBar.setAttribute('pathLength', '1')
  ringBar.setAttribute('stroke-dasharray', '1')
  ringBar.setAttribute('stroke-dashoffset', '1')

  ring.appendChild(defs)
  ring.appendChild(track)
  ring.appendChild(ringBar)

  /** 挂进顶栏；水合或路由切换把顶栏换掉时重新挂回去 */
  const mount = () => {
    const nav = document.querySelector('.VPNavBar')
    if (nav && ring.parentElement !== nav) nav.appendChild(ring)
  }
  mount()
  if (ring.parentElement !== document.querySelector('.VPNavBar')) {
    // enhanceApp 阶段顶栏可能还没就位，等一帧再试
    requestAnimationFrame(mount)
  }

  const STROKE = 1.5 // 与 CSS 里的 stroke-width 保持一致
  let lastW = 0
  let lastH = 0

  /** 把元素的实际像素尺寸同步给 viewBox 和两个 rect，圆角才不会变形 */
  const sync = () => {
    const box = ring.getBoundingClientRect()
    const w = Math.round(box.width)
    const h = Math.round(box.height)
    // 窄屏 display: none 期间读不到尺寸，直接跳过
    if (!w || !h) return
    if (w === lastW && h === lastH) return
    lastW = w
    lastH = h

    // 宽高由 CSS 定（见 .fx-nav-ring），这里只喂 viewBox，让内部单位与像素 1:1
    ring.setAttribute('viewBox', `0 0 ${w} ${h}`)

    // 描边是以路径为中心向两侧各画一半的，路径要从盒子里缩进半个描边宽
    const radius = (h - STROKE) / 2
    for (const rect of [track, ringBar]) {
      rect.setAttribute('x', String(STROKE / 2))
      rect.setAttribute('y', String(STROKE / 2))
      rect.setAttribute('width', String(w - STROKE))
      rect.setAttribute('height', String(h - STROKE))
      rect.setAttribute('rx', String(radius))
      rect.setAttribute('ry', String(radius))
    }
  }

  let shown = false

  const paint = () => {
    const onPost = window.location.pathname.startsWith(postsDir)
    const doc = document.documentElement
    const max = doc.scrollHeight - window.innerHeight
    const progress = onPost && max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0

    if (progress > 0 && !shown) {
      bar.classList.add('is-on')
      ring.classList.add('is-on')
      shown = true
    } else if (progress === 0 && shown) {
      bar.classList.remove('is-on')
      ring.classList.remove('is-on')
      shown = false
    }

    bar.style.transform = `scaleX(${progress.toFixed(4)})`
    ringBar.setAttribute('stroke-dashoffset', (1 - progress).toFixed(4))
  }

  // 胶囊的宽度随视口变，环的 viewBox 得跟着重算
  const observer = new ResizeObserver(sync)
  observer.observe(ring)

  window.addEventListener('scroll', paint, { passive: true })
  window.addEventListener('resize', sync, { passive: true })

  // 路由切换后文章高度变了，进度要重算（切换瞬间 scaleX 保留旧值也无妨，下一帧即纠正）
  onContentUpdated(() => {
    mount()
    sync()
    requestAnimationFrame(paint)
  })

  sync()
  paint()
}

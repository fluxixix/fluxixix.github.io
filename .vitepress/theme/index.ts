import { nextTick, type App, type Ref } from 'vue'
import { onContentUpdated, useData, type EnhanceAppContext, type Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
// 字体全部自托管：中文宋体按 unicode-range 切片，浏览器只下载页面用字的切片
import '@fontsource/noto-serif-sc/700.css'
import '@fontsource-variable/fraunces'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import { setupCursorFx } from './cursor'
import Layout from './Layout.vue'
import WorkPlate from './works/WorkPlate.vue'
import './custom.css'

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
  '.archive-timeline .timeline-year .timeline-item',
  // 关于页与项目页的章节标题：标题淡入的同时，它上面那条发丝线从左画出来
  '.about .vp-doc h2',
  '.projects .vp-doc h2'
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
          // 已经在视口上方的不等它"进入"，直接放出来：锚点跳转、带 hash 刷新、
          // 或是快速滚动，都会一次跨过好几屏，跨过的块如果一直藏着就永远不出现
          const passed = entry.boundingClientRect.bottom < 0
          if (!entry.isIntersecting && !passed) continue
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
  // 一次路由切换可能来好几趟。推到下一帧再收集，拿到的才是最终的 DOM。
  // 同步那一趟也要：水合可能把容器整个换掉，只观察旧节点的话揭示永远不会发生
  // （与 setupWorksIndex 同一个时机、同一个原因）
  onContentUpdated(() => {
    collect()
    requestAnimationFrame(collect)
  })
}

/* --------------------------------------------------------------------------
   文章阅读进度：窄屏顶部细线 + 胶囊外圈的进度环
   -------------------------------------------------------------------------- */

const SVG_NS = 'http://www.w3.org/2000/svg'

/**
 * 读到哪，进度就画到哪；两个形态共用同一个进度值。
 *
 * - 窄屏（<60rem）顶栏跟着页面滚走，用 body 下一根 2px 横向细线表达：
 *   宽度写死、只动 transform: scaleX()，滚动时不触发布局。
 * - ≥60rem 顶栏收成悬浮胶囊（见 custom.css 第 2 节），细线退场，换成套在
 *   胶囊外圈的一圈 SVG 描边，颜色是品牌紫→青的渐变，读到哪画到哪。
 *
 * 环的几何尺寸由 ResizeObserver 从元素实际像素读出来喂给 viewBox，圆角在
 * 任意宽度下都不会被拉成椭圆；进度用 pathLength="1" 归一化，stroke-dashoffset
 * 直接就是「还剩多少没读」，不必自己算周长。只在文章区出现——首页、列表、
 * 关于这些短页面不挂。
 */
function setupReadingProgress() {
  if (typeof window === 'undefined') return

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
    const onPost = window.location.pathname.startsWith('/posts/')
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

/* --------------------------------------------------------------------------
   作品墙的展开：卡面尺寸固定，点一下就地摊开
   -------------------------------------------------------------------------- */

/**
 * 可折叠卡片：卡面尺寸固定，正文裁在卡里，点展开键就地摊开看全部详情。
 * 作品页的九张海报卡与关于页的两张经历卡共用这一套（都是 .work-poster + .poster-toggle）。
 *
 * 高度要从具体值过渡到 auto，而 auto 不能插值，所以展开前先量一次「完全摊开」
 * 的高度——临时摘掉所有过渡、把卡面放开，量完立刻还原——再拿它当过渡终点；
 * 过渡结束后把内联高度交还给 auto，窗口缩放时卡片还能自己适应。收起的终点从
 * --fx-poster-h 读，不写第二份常量。
 *
 * dataset 挡一道重复绑定：onContentUpdated 在水合前后各跑一次，卡片可能是同一批 DOM。
 */
function setupWorkPosters() {
  if (typeof window === 'undefined') return

  const bind = () => {
    const cards = document.querySelectorAll<HTMLElement>('.work-poster')

    for (const card of cards) {
      if (card.dataset.fxBound === '1') continue
      const toggle = card.querySelector<HTMLButtonElement>('.poster-toggle')
      if (!toggle) continue
      card.dataset.fxBound = '1'

      // 收起态的文案存在 dataset 里，展开时换成「收起」，收回来再贴回去
      const label = toggle.querySelector('span')
      if (label && !label.dataset.fxClosed) {
        label.dataset.fxClosed = label.textContent ?? ''
      }

      toggle.addEventListener('click', () => {
        const opening = !card.classList.contains('is-open')
        const from = card.offsetHeight
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
        // 收起前记下展开键的视口位置，收起来时要把它按回原处（见下面 pin）
        const anchor = toggle.getBoundingClientRect().top

        // 起点先钉住：从 auto 起跳浏览器不过渡
        card.style.height = `${from}px`

        if (opening) {
          card.classList.add('is-measuring', 'is-open')
          card.style.height = 'auto'
          const full = card.offsetHeight
          card.classList.remove('is-measuring', 'is-open')
          card.style.height = `${from}px`
          void card.offsetHeight
          card.classList.add('is-open')
          card.style.height = `${full}px`
        } else {
          const fixed =
            parseFloat(getComputedStyle(card).getPropertyValue('--fx-poster-h')) || 33
          void card.offsetHeight
          card.style.height = `${fixed * rem}px`
          card.classList.remove('is-open')

          // 卡片一口气矮掉上千像素，浏览器不会替你保住参照物：视口不动的话，
          // 指头底下那个键会瞬间飞出屏幕，整页像被拽去看下面一段。
          // 于是过渡期间每帧把它按回原处——看着就是卡片向上收、键留在原处。
          // 逐帧量的是当前误差，不预设时长，所以和缓动曲线天然同步
          const until = performance.now() + 480
          const pin = () => {
            const delta = toggle.getBoundingClientRect().top - anchor
            if (delta) window.scrollBy(0, delta)
            if (performance.now() < until) requestAnimationFrame(pin)
          }
          requestAnimationFrame(pin)
        }

        if (label) {
          label.textContent = opening ? '收起' : label.dataset.fxClosed ?? ''
        }
        toggle.setAttribute('aria-expanded', String(opening))

        const settle = (event: TransitionEvent) => {
          if (event.propertyName !== 'height') return
          card.style.height = ''
          card.removeEventListener('transitionend', settle)
        }
        card.addEventListener('transitionend', settle)
      })
    }
  }

  onContentUpdated(() => {
    bind()
    requestAnimationFrame(bind)
  })
}

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }: EnhanceAppContext) {
    // 作品页的版画：Markdown 里写一个 <WorkPlate /> 标签就够了
    app.component('WorkPlate', WorkPlate)
    setupCursorFx()
    setupThemeTransition(app)
    setupReveal()
    setupWorkPosters()
    setupReadingProgress()
  }
} satisfies Theme

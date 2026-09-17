import { onContentUpdated } from 'vitepress'
import type { ResolvedFluxixixOptions } from './options'

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
 * 隐藏态写在 styles/reveal.css 的 html.fx-reveal-ready 下，由这里决定何时打开：
 * 脚本没跑（禁用 JS、老浏览器、reduced-motion）时页面就是普通内容，不会白屏。
 * 过渡只声明在被放出来的 .fx-in 上，所以"隐藏"这一步是瞬时的，不会先闪一下再淡出。
 *
 * 注意 reveal.css 里还配了 :focus-within —— 键盘 Tab 进来时立刻显示，
 * 不然用键盘的人会聚焦到看不见的链接上。
 *
 * 做滚动揭示的元素：
 *   - 文章列表项与归档时间轴条目（主题内置结构，永远命中）
 *   - 关于页与作品页的章节标题（由 pageClasses 配置，页面没这两块时不命中）
 * 正文段落不参与，否则阅读时视线总在动。
 */
export function setupReveal(options: ResolvedFluxixixOptions) {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (!('IntersectionObserver' in window)) return

  const { about, works } = options.pages.pageClasses
  const REVEAL_SELECTOR = [
    '.vp-doc .post-list .post-item',
    '.archive-timeline .timeline-year .timeline-item',
    // 关于页与作品页的章节标题：标题淡入的同时，它上面那条发丝线从左画出来
    `.${about} .vp-doc h2`,
    `.${works} .vp-doc h2`
  ].join(',')

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
  // （与 setupWorkPosters 同一个时机、同一个原因）
  onContentUpdated(() => {
    collect()
    requestAnimationFrame(collect)
  })
}

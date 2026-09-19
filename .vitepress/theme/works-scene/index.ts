/**
 * 作品页「太阳系」的挂载层。
 *
 * 这一层只做四件事：判断这台设备该不该跑、把画布与两片浮层挂上去、
 * 把滚动位置换算成「第几颗」、离开页面时收干净。真正的绘制在 scene.ts，
 * 数据读取在 bodies.ts。
 *
 * 降级是分级的，任何一级不满足就退回静态内容（十节普通文档 + 主题给的静态版画）：
 *   无 JS → 什么都不会发生，页面本来就是普通长页
 *   减弱动效 / 窄屏 / 无 WebGL → 不跑
 *   跑起来但掉帧 → 停掉动画循环，把静态版画放回来
 */
import { onContentUpdated } from 'vitepress'
import { readBodies, type SolarBody } from './bodies'
import type { WorksScene } from './scene'

/** 窄于此宽度不跑：正文列会被挤得太窄，太阳系也没地方站 */
const MIN_WIDTH = 1024

/** 首帧之后的平均帧耗时超过这个值就认定带不动（约合 42fps） */
const FRAME_BUDGET_MS = 24

/** 跑起来的标记类。隐藏静态版画、收窄正文列的样式都挂在它下面 */
const READY_CLASS = 'fx-plate-ready'

/** 程序化滚动最多锁这么久，到点无条件交还控制权 */
const SCROLL_LOCK_MS = 1400

let teardown: (() => void) | null = null

function canRun(): boolean {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  if (window.innerWidth < MIN_WIDTH) return false
  try {
    const probe = document.createElement('canvas')
    return !!(probe.getContext('webgl2') ?? probe.getContext('webgl'))
  } catch {
    return false
  }
}

export function setupWorksScene() {
  if (typeof window === 'undefined') return

  const mount = () => {
    teardown?.()
    teardown = null

    const root = document.querySelector<HTMLElement>('.works')
    if (!root) return
    const sections = Array.from(root.querySelectorAll<HTMLElement>('.plate-scene'))
    if (!sections.length) return
    if (!canRun()) return

    const canvas = document.createElement('canvas')
    canvas.className = 'plate-canvas'
    canvas.setAttribute('aria-hidden', 'true')
    document.body.appendChild(canvas)

    // 右侧那片看不见的点击区。画布本身 pointer-events: none——不然整页的
    // 文字选择与滚动都会被挡住；点行星只靠这一层透明浮层接
    const stage = document.createElement('div')
    stage.className = 'system-stage'
    stage.setAttribute('aria-hidden', 'true')
    document.body.appendChild(stage)

    // 早一点亮出来：正文列要趁早收窄，不然等 three.js 那 150KB 到位，
    // 整页会在众目睽睽下重排一次
    document.documentElement.classList.add(READY_CLASS)

    let scene: WorksScene | null = null
    /** pick() 命中恒星时的返回值，在动态 import 到位后才知道具体是多少 */
    let sunIndex = Number.NaN
    /** 十件作品，供悬停名牌取名字；与正文同源 */
    let bodies: SolarBody[] = []
    let raf = 0
    let disposed = false
    let scrollDirty = true
    let tops: number[] = []
    let current = 0
    /** 程序化滚动期间锁住反推，否则滚动过程会被逐帧读成「当前第几张」 */
    let lock: number | null = null
    let lockUntil = 0

    const measure = () => {
      tops = sections.map((s) => s.getBoundingClientRect().top + window.scrollY)
      scrollDirty = true
    }

    /**
     * 滚动位置 → 第几张。十节各占一屏、内容在其中垂直居中，所以
     * 「这一节的顶边贴到视口顶边」正好等于「这一节的内容落在视口正中」，
     * 也就是这颗行星该转到近点的那一刻；过半就交给下一颗。
     */
    const indexFromScroll = () => {
      const probe = window.scrollY
      if (probe <= tops[0]) return 0
      for (let i = 0; i < tops.length - 1; i++) {
        if (probe < tops[i + 1]) {
          const span = tops[i + 1] - tops[i]
          const p = span > 0 ? (probe - tops[i]) / span : 0
          return p < 0.5 ? i : i + 1
        }
      }
      return tops.length - 1
    }

    const setCurrent = (i: number) => {
      if (i === current) return
      current = i
      scene?.setCurrent(i)
    }

    /** 平滑滚动在「减少动态效果」下要退成瞬移，瞬移不会晃到人 */
    const scrollBehavior = (): ScrollBehavior =>
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'

    /** 点行星：把正文滚过去，系统同时转过去 */
    const goTo = (i: number) => {
      if (i < 0 || i >= sections.length || i === current) return
      setCurrent(i)
      lock = i
      lockUntil = performance.now() + SCROLL_LOCK_MS
      window.scrollTo({ top: tops[i], behavior: scrollBehavior() })
    }

    // 用户自己一动滚轮/手指/键盘就立刻交还控制权：锁只是用来挡自己制造的那串滚动事件
    const release = () => {
      lock = null
    }

    let px = 0
    let py = 0
    const onPointer = (e: PointerEvent) => {
      px = (e.clientX / window.innerWidth) * 2 - 1
      py = -((e.clientY / window.innerHeight) * 2 - 1)
    }

    const onResize = () => {
      // 拖窄到门槛以下就地退回静态版画。不这么做的话牌环会继续跑，
      // 而正文此时已经铺满整列，牌会压在字上。
      // 拖宽回来不自动重挂——降级就是降级，等下一次路由切换
      if (window.innerWidth < MIN_WIDTH) {
        teardown?.()
        return
      }
      scene?.resize()
      measure()
    }

    const onVisibility = () => {
      if (document.hidden) scene?.stop()
      else scene?.start()
    }

    // 明暗切换后纸色与墨色都变了，整副牌重画一遍
    const themeWatcher = new MutationObserver(() => scene?.refreshColors())
    themeWatcher.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    // 字号、字体、窗口滚动条都会改变十节的高度，量到的顶边得跟着更新
    const sizeWatcher = new ResizeObserver(() => measure())
    sizeWatcher.observe(root)

    // 悬停在哪颗行星上：光标是唯一能说明「这颗可以点」的东西
    let hoverRaf = 0
    const onStageMove = (e: PointerEvent) => {
      if (hoverRaf) return
      const x = e.clientX
      const y = e.clientY
      hoverRaf = requestAnimationFrame(() => {
        hoverRaf = 0
        const i = scene?.pick(x, y) ?? null
        // 恒星永远可点（回顶部）；行星只有不是当前那颗时才可点
        stage.classList.toggle('is-over', i !== null && (i === sunIndex || i !== current))
      })
    }

    const onStageClick = (e: MouseEvent) => {
      const i = scene?.pick(e.clientX, e.clientY)
      if (i == null) return
      // 恒星是回顶部的出口：这一页九千多像素，读到底总得有个一键回去的地方
      if (i === sunIndex) {
        window.scrollTo({ top: 0, behavior: scrollBehavior() })
        return
      }
      goTo(i)
    }

    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (!scene) return
      // 视差每帧都要推一次：scene 那边做的是朝目标值缓动，不是直接落位
      scene.setPointer(px, py)
      if (!scrollDirty) return
      scrollDirty = false
      if (lock !== null) {
        const arrived = Math.abs(window.scrollY - tops[lock]) < 2
        if (arrived || performance.now() > lockUntil) lock = null
        else return
      }
      setCurrent(indexFromScroll())
    }

    window.addEventListener('scroll', () => {
      scrollDirty = true
    }, { passive: true })
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('wheel', release, { passive: true })
    window.addEventListener('touchstart', release, { passive: true })
    window.addEventListener('keydown', release)
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVisibility)
    stage.addEventListener('pointermove', onStageMove, { passive: true })
    stage.addEventListener('click', onStageClick)

    teardown = () => {
      if (disposed) return
      disposed = true
      cancelAnimationFrame(raf)
      cancelAnimationFrame(hoverRaf)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('wheel', release)
      window.removeEventListener('touchstart', release)
      window.removeEventListener('keydown', release)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
      stage.removeEventListener('pointermove', onStageMove)
      stage.removeEventListener('click', onStageClick)
      themeWatcher.disconnect()
      sizeWatcher.disconnect()
      scene?.dispose()
      scene = null
      canvas.remove()
      stage.remove()
      document.documentElement.classList.remove(READY_CLASS)
    }

    // three.js 有一百多 KB，等确认要跑再拉进来
    import('./scene')
      .then(async ({ createWorksScene, SUN_INDEX }) => {
        if (disposed) return
        sunIndex = SUN_INDEX
        bodies = readBodies(root)
        if (!bodies.length) return teardown?.()

        // 编号是用 canvas 画成贴图的，字体没就位就会把回退字形烤进去、再也换不回来。
        // 只等数字这一小撮，不等整页字体
        try {
          await document.fonts?.load('700 42px "IBM Plex Mono"', '0123456789')
        } catch {
          // 字体没到就用回退字体画，不挡正事
        }
        if (disposed) return

        scene = createWorksScene(canvas, bodies)
        measure()
        scene.setCurrent(indexFromScroll())
        scene.start()
        tick()

        // 跑满 60 帧再看平均帧耗时。带不动的机器退回静态版画，
        // 比留一个卡顿的 3D 好——内容本来就在 DOM 里，撤掉画布什么都不少
        setTimeout(() => {
          if (disposed || !scene) return
          if (scene.frameCost() > FRAME_BUDGET_MS) teardown?.()
        }, 1600)
      })
      .catch(() => teardown?.())
  }

  // Content 组件在 mount / update / unmount 时都会回调，一次路由切换可能来好几趟。
  // 推到下一帧再挂，拿到的才是最终的 DOM（与主题的 setupReveal / setupWorkPosters 同一时机）
  onContentUpdated(() => {
    mount()
    requestAnimationFrame(mount)
  })
}

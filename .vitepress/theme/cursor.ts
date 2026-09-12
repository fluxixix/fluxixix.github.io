/**
 * 光标特效：玻璃圆环 + 粒子拖尾 + 点击波纹。
 *
 * 圆环是一个纯 CSS 的 DOM 元素，质感全部来自 custom.css 的渐变，不使用任何滤镜——
 * 移动时只有一次 transform 合成。粒子与波纹逐帧绘制，没法用 CSS transition 表达，
 * 所以留在 canvas 上。整站只挂一个 canvas、一个圆环、一个 rAF 循环，空闲时会把循环彻底停掉。
 * 原生光标已在 custom.css 里隐藏，圆环就是光标本体。
 */

/**
 * 光标外形：一个纯 CSS 的玻璃圆环。
 * 这里只负责建元素和搬位置，质感全部在 custom.css 里。
 */
interface Ring {
  moveTo(x: number, y: number): void
  show(): void
  hide(): void
}

function createRing(): Ring {
  const element = document.createElement('div')
  element.className = 'vp-cursor-ring'
  element.setAttribute('aria-hidden', 'true')
  document.body.appendChild(element)

  return {
    moveTo(x, y) {
      element.style.transform = `translate3d(${x}px, ${y}px, 0)`
    },
    show() {
      element.classList.add('is-visible')
    },
    hide() {
      element.classList.remove('is-visible')
    }
  }
}

const CONSTANTS = {
  /** 粒子池上限，超出时丢弃最旧的 */
  MAX_PARTICLES: 140,
  /** 指针移动超过这个距离才生成拖尾，避免原地抖动时狂刷粒子 */
  TRAIL_MIN_DIST: 7,
  /** 每次生成几个拖尾粒子 */
  TRAIL_PER_STEP: 2,
  /** 点击爆发的粒子数 */
  BURST_PER_CLICK: 16,
  /** 粒子寿命（ms） */
  LIFE_MS: 620,
  /** 点击波纹扩散时长（ms） */
  RIPPLE_MS: 520,
  /** 点击波纹最大半径 */
  RIPPLE_MAX_R: 62
} as const

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  born: number
  seed: number
}

interface Ripple {
  x: number
  y: number
  born: number
}

export function setupCursorFx() {
  if (typeof window === 'undefined') return
  if (!document.body) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  // 触屏没有悬停指针，画了也看不见
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.className = 'vp-cursor-canvas'
  canvas.setAttribute('aria-hidden', 'true')
  document.body.appendChild(canvas)

  let dpr = 1
  const resize = () => {
    // 封顶 2，避免高分屏下像素量翻四倍
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(window.innerWidth * dpr)
    canvas.height = Math.round(window.innerHeight * dpr)
    // canvas 是替换元素，position: fixed + inset: 0 并不会把它拉伸到视口大小，
    // width: auto 会取上面的固有尺寸，导致位图被铺开、绘制坐标整体偏移。
    // 必须显式给出 CSS 尺寸，保证 1 位图像素对应 1 CSS 像素。
    canvas.style.width = `${window.innerWidth}px`
    canvas.style.height = `${window.innerHeight}px`
  }
  resize()

  // 圆环挂在 canvas 之后，DOM 顺序保证它画在粒子之上
  const ring = createRing()

  // 颜色留在 CSS 里，这里只读取
  const readColors = () => {
    const style = getComputedStyle(document.documentElement)
    return {
      a: style.getPropertyValue('--vp-cursor-glow').trim() || '#bd34fe',
      b: style.getPropertyValue('--vp-cursor-glow-2').trim() || '#41d1ff'
    }
  }
  let colors = readColors()

  // 明暗切换只改 <html> 上的 class，颜色变量跟着变时要重新读
  new MutationObserver(() => {
    colors = readColors()
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

  const particles: Particle[] = []
  const ripples: Ripple[] = []
  const pointer = { x: 0, y: 0 }
  const lastTrail = { x: 0, y: 0 }
  let hasPointer = false
  let rafId = 0
  let last = 0

  // 圆环位置的写入按帧合并。pointermove 在高刷新率指针设备上每秒可触发上千次，
  // 逐个事件写 style 会造成大量无谓的样式重算。合并到每帧一次后再交给 CSS 合成。
  let ringX = 0
  let ringY = 0
  let ringFrame = 0

  const flushRing = () => {
    ringFrame = 0
    ring.moveTo(ringX, ringY)
  }

  const queueRing = (x: number, y: number) => {
    ringX = x
    ringY = y
    if (!ringFrame) ringFrame = requestAnimationFrame(flushRing)
  }

  const spawn = (x: number, y: number, vx: number, vy: number, r: number) => {
    if (particles.length >= CONSTANTS.MAX_PARTICLES) particles.shift()
    particles.push({ x, y, vx, vy, r, born: performance.now(), seed: Math.random() })
  }

  /**
   * rAF 回调拿到的是「帧开始时刻」，可能早于事件里调用的 performance.now()，
   * 于是 now - born 会是负数。生命周期的进度必须夹到 0..1，否则缓动曲线会算出
   * 负半径，ctx.arc 直接抛 IndexSizeError。
   */
  const progress = (now: number, born: number, life: number) =>
    Math.min(1, Math.max(0, (now - born) / life))

  const update = (dt: number, now: number) => {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      if (now - p.born >= CONSTANTS.LIFE_MS) {
        particles.splice(i, 1)
        continue
      }
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vx *= 0.94
      // 带一点下沉，拖尾才有重量感
      p.vy = p.vy * 0.94 + 0.04
    }

    for (let i = ripples.length - 1; i >= 0; i--) {
      if (now - ripples[i].born >= CONSTANTS.RIPPLE_MS) ripples.splice(i, 1)
    }
  }

  const draw = (now: number) => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

    // 点击波纹：三次方缓出，起手快、收尾慢
    for (const ripple of ripples) {
      const t = progress(now, ripple.born, CONSTANTS.RIPPLE_MS)
      const radius = CONSTANTS.RIPPLE_MAX_R * (1 - Math.pow(1 - t, 3))
      ctx.beginPath()
      ctx.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2)
      ctx.strokeStyle = colors.b
      ctx.globalAlpha = (1 - t) * 0.6
      ctx.lineWidth = 1.5
      ctx.stroke()
    }

    // 粒子：小尺寸下每帧新建渐变不划算，靠 seed 混用 a/b 两色做出渐变感
    for (const p of particles) {
      const t = progress(now, p.born, CONSTANTS.LIFE_MS)
      ctx.globalAlpha = (1 - t) * 0.85
      ctx.fillStyle = p.seed < 0.5 ? colors.a : colors.b
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r * (1 - t * 0.6), 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.globalAlpha = 1
  }

  const tick = (now: number) => {
    rafId = 0
    // 归一化到 ~60fps 的帧步长。首帧的 now 可能早于 start() 里取的 performance.now()，
    // 下限夹到 0；切回标签页时 now 会跳很大，上限夹到 48ms 避免粒子瞬移。
    const dt = Math.max(0, Math.min(now - last, 48)) / 16.67
    last = now

    update(dt, now)
    draw(now)

    // 透镜是 DOM 元素，位置由 pointermove 直接写入，不参与这个循环，
    // 所以停止条件只剩「粒子池空且波纹池空」
    if (particles.length || ripples.length) {
      rafId = requestAnimationFrame(tick)
      return
    }

    // 补一帧把残留擦干净后彻底停下，不再占用主线程
    draw(now)
  }

  const start = () => {
    if (rafId) return
    last = performance.now()
    rafId = requestAnimationFrame(tick)
  }

  const stop = () => {
    if (!rafId) return
    cancelAnimationFrame(rafId)
    rafId = 0
  }

  window.addEventListener('resize', () => {
    resize()
    draw(performance.now())
  })

  window.addEventListener(
    'pointermove',
    (event) => {
      pointer.x = event.clientX
      pointer.y = event.clientY

      if (!hasPointer) {
        hasPointer = true
        lastTrail.x = pointer.x
        lastTrail.y = pointer.y
        ring.show()
      }

      // 圆环是光标本体，不能有缓动，否则可见指针与实际热点错位。
      // 但写入要按帧合并，见 queueRing 的说明。
      queueRing(pointer.x, pointer.y)

      const dx = pointer.x - lastTrail.x
      const dy = pointer.y - lastTrail.y
      if (dx * dx + dy * dy >= CONSTANTS.TRAIL_MIN_DIST * CONSTANTS.TRAIL_MIN_DIST) {
        lastTrail.x = pointer.x
        lastTrail.y = pointer.y
        for (let i = 0; i < CONSTANTS.TRAIL_PER_STEP; i++) {
          spawn(
            pointer.x + (Math.random() - 0.5) * 6,
            pointer.y + (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 0.8,
            (Math.random() - 0.5) * 0.8 - 0.2,
            1.4 + Math.random() * 1.8
          )
        }
      }

      start()
    },
    { passive: true }
  )

  // 用 mousedown 而不是 pointerdown：本特效已被 (hover: hover) and (pointer: fine)
  // 限定为鼠标设备，两者等价；而 pointerdown 在部分自动化/内嵌 WebView 里不会被合成，
  // mousedown 一定能收到，行为可被验证。
  window.addEventListener('mousedown', (event) => {
    pointer.x = event.clientX
    pointer.y = event.clientY

    // 未经 pointermove 就点击时兜底，否则圆环还是 opacity: 0
    if (!hasPointer) {
      hasPointer = true
      ring.show()
    }
    // 点击时要求立即对齐，否则点击处的爆发粒子与圆环会差一帧。
    // 先撤掉挂起的合并帧，避免这一帧稍后又用旧坐标写一次。
    if (ringFrame) {
      cancelAnimationFrame(ringFrame)
      ringFrame = 0
    }
    ring.moveTo(pointer.x, pointer.y)

    // 均匀铺开一圈再加随机扰动，比纯随机更像一次爆发
    for (let i = 0; i < CONSTANTS.BURST_PER_CLICK; i++) {
      const angle = (Math.PI * 2 * i) / CONSTANTS.BURST_PER_CLICK + Math.random() * 0.4
      const speed = 1.6 + Math.random() * 2.4
      spawn(
        pointer.x,
        pointer.y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        1.6 + Math.random() * 1.6
      )
    }
    ripples.push({ x: pointer.x, y: pointer.y, born: performance.now() })
    start()
  })

  // 指针移出窗口时收掉圆环，不留一个冻结的圆停在屏幕边缘
  document.documentElement.addEventListener('pointerleave', () => {
    hasPointer = false
    ring.hide()
  })

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop()
  })
}

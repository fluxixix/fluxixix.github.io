/**
 * 光标特效：粒子拖尾 + 点击波纹。
 *
 * 光标本身用的是 custom.css 里的自定义光标图片（原生 cursor 换皮），所以这里
 * 只负责画拖尾：整站挂一个 canvas、一个 rAF 循环，空闲时会把循环彻底停掉。
 */

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

    // 两池都空就说明这一轮动画结束了
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

      // 首帧把拖尾锚点定在指针上，否则第一次移动会被算成一大段位移、一次性喷一堆粒子
      if (!hasPointer) {
        hasPointer = true
        lastTrail.x = pointer.x
        lastTrail.y = pointer.y
      }

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

    // 未经 pointermove 就点击时兜底，避免拖尾锚点还停在 0,0
    if (!hasPointer) {
      hasPointer = true
      lastTrail.x = pointer.x
      lastTrail.y = pointer.y
    }

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

  // 指针移出窗口时丢掉锚点，再进来时不会从旧位置拉出一条长线
  document.documentElement.addEventListener('pointerleave', () => {
    hasPointer = false
  })

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop()
  })
}

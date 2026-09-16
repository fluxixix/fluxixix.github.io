/**
 * 光标特效：点击迸发的粒子。
 *
 * 点下去的一瞬间，从落点均匀迸出一圈粒子（均匀铺开再叠一点随机扰动，
 * 比纯随机更像一次爆发），受阻力与重力边飘边缩小、淡出。颜色在品牌紫和青
 * 之间按粒子随机混用——小尺寸下每帧新建渐变不划算，靠随机取色就有渐变观感。
 *
 * 早先那圈扩散的圆环涟漪已经去掉：粒子本身已经把「点到了」这件事说清楚，
 * 再叠一圈同心圆反而吵。整站挂一个 canvas、一个 rAF 循环，粒子池空了循环
 * 彻底停掉。
 */

/** 点击迸发的粒子数 */
const BURST_PER_CLICK = 16
/** 粒子寿命（ms） */
const LIFE_MS = 620
/** 粒子池上限，超出时丢弃最旧的 */
const MAX_PARTICLES = 140

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  born: number
  /** 决定这颗粒子走哪个品牌色，随机一次定终身 */
  seed: number
}

export function setupCursorFx() {
  if (typeof window === 'undefined') return
  if (!document.body) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  // 触屏没有悬停指针，点击粒子也没有意义
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

  // 颜色留在 CSS 里，这里只读取。两色都要：粒子按 seed 混用
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
  let rafId = 0
  let last = 0

  const spawn = (x: number, y: number, vx: number, vy: number, r: number) => {
    if (particles.length >= MAX_PARTICLES) particles.shift()
    particles.push({ x, y, vx, vy, r, born: performance.now(), seed: Math.random() })
  }

  /**
   * rAF 回调拿到的是「帧开始时刻」，可能早于事件里调用的 performance.now()，
   * 于是 now - born 会是负数。生命周期的进度必须夹到 0..1。
   */
  const progress = (now: number, born: number) =>
    Math.min(1, Math.max(0, (now - born) / LIFE_MS))

  const update = (dt: number, now: number) => {
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i]
      if (now - particle.born >= LIFE_MS) {
        particles.splice(i, 1)
        continue
      }
      particle.x += particle.vx * dt
      particle.y += particle.vy * dt
      particle.vx *= 0.94
      // 带一点下沉，粒子才有重量感，不然像往四面弹开的塑料球
      particle.vy = particle.vy * 0.94 + 0.04
    }
  }

  const draw = (now: number) => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

    for (const particle of particles) {
      const t = progress(now, particle.born)
      ctx.globalAlpha = (1 - t) * 0.85
      ctx.fillStyle = particle.seed < 0.5 ? colors.a : colors.b
      ctx.beginPath()
      // 边飘边收，尾段细下去
      ctx.arc(particle.x, particle.y, particle.r * (1 - t * 0.6), 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  const tick = (now: number) => {
    rafId = 0
    // 归一化到 ~60fps 的帧步长。首帧的 now 可能早于 start() 里取的 performance.now()，
    // 下限夹到 0；切回标签页时 now 会跳很大，上限夹到 48ms 避免粒子瞬移
    const dt = Math.max(0, Math.min(now - last, 48)) / 16.67
    last = now

    update(dt, now)
    draw(now)

    if (!particles.length) {
      // 最后一帧已经在 draw 里擦干净，循环可以彻底停下
      return
    }
    rafId = requestAnimationFrame(tick)
  }

  const start = () => {
    if (rafId) return
    last = performance.now()
    rafId = requestAnimationFrame(tick)
  }

  // 用 mousedown 而不是 pointerdown：本特效已被 (hover: hover) and (pointer: fine)
  // 限定为鼠标设备，两者等价；而 pointerdown 在部分自动化/内嵌 WebView 里不会被合成，
  // mousedown 一定能收到，行为可被验证。
  window.addEventListener('mousedown', (event) => {
    const x = event.clientX
    const y = event.clientY
    for (let i = 0; i < BURST_PER_CLICK; i++) {
      const angle = (Math.PI * 2 * i) / BURST_PER_CLICK + Math.random() * 0.4
      const speed = 1.6 + Math.random() * 2.4
      spawn(
        x,
        y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        1.6 + Math.random() * 1.6
      )
    }
    start()
  })

  window.addEventListener('resize', () => {
    resize()
    if (particles.length) draw(performance.now())
  })

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && rafId) {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
  })
}

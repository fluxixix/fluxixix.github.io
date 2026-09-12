/**
 * 液态玻璃透镜：内部对身后的网页内容做磨砂 + 增饱和 + 提亮，边缘做径向折射，
 * 并叠加三通道色散（红蓝彩边）。
 *
 * 关键约束：`backdrop-filter` 里的 `url()` 只有 Chromium 支持，Safari / Firefox
 * 遇到这种写法是**整条声明失效**（不是降级，是效果彻底消失）。所以真折射只作为
 * 渐进增强——引擎判定通过才加 `vp-cursor-lens--refract` 类，否则用 custom.css 里
 * 那条不含 url() 的声明打底。
 */

const SVG_NS = 'http://www.w3.org/2000/svg'
const FILTER_ID = 'vp-cursor-lens-filter'

/** 中心多大范围内完全不变形（归一化半径）。调大 = 中间更通透，弯曲更贴边 */
const MAP_INNER = 0.55
/** 位移随半径增长的指数，越大弯曲越贴着边缘 */
const MAP_CURVE = 1.6
/** feDisplacementMap 的 scale。实际最大位移是它的一半（贴图编码范围所限） */
const MAP_SCALE = 14
/** 三通道 scale 的插值差，决定彩边宽度 */
const CHROMA = 3

/** 逐个通道保留自身颜色、丢弃另外两个，最后一行保留 alpha */
const KEEP_CHANNEL = {
  R: '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0',
  G: '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0',
  B: '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0'
} as const

export interface LiquidLens {
  element: HTMLDivElement
  /** 是否拿到了真折射（Chromium 且贴图生成成功） */
  refracting: boolean
  moveTo(x: number, y: number): void
  show(): void
  hide(): void
}

function svgNode(tag: string, attrs: Record<string, string>) {
  const node = document.createElementNS(SVG_NS, tag)
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value)
  return node
}

/** 只有 Chromium 系在 backdrop-filter 里支持 url() */
function supportsRefraction() {
  const ua = navigator.userAgent
  // Chrome 的 UA 里也含 "Safari"，必须先排除 Chromium 系再判断 Safari
  const isSafari = /Safari\//.test(ua) && !/Chrome|Chromium|Edg\//.test(ua)
  const isFirefox = /Firefox\//.test(ua)
  return !isSafari && !isFirefox && CSS.supports('backdrop-filter', `url("#${FILTER_ID}")`)
}

/**
 * 生成径向位移贴图：R/G 两通道编码 x/y 位移（128 表示不偏移），B 通道本方案不用。
 * 返回 PNG data URL；环境不支持时返回空串。
 */
function createDisplacementMap(size: number) {
  // 用两倍分辨率生成，feImage 再缩回透镜尺寸，边缘更平滑
  const res = Math.round(size * 2)
  const canvas = document.createElement('canvas')
  canvas.width = res
  canvas.height = res
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  const image = ctx.createImageData(res, res)
  const center = res / 2
  const radius = res / 2

  for (let y = 0; y < res; y++) {
    for (let x = 0; x < res; x++) {
      const dx = x + 0.5 - center
      const dy = y + 0.5 - center
      const dist = Math.hypot(dx, dy)
      const r = dist / radius

      let shiftX = 0
      let shiftY = 0
      if (dist > 0 && r <= 1) {
        const ramp = Math.min(1, Math.max(0, (r - MAP_INNER) / (1 - MAP_INNER)))
        const magnitude = Math.pow(ramp, MAP_CURVE)
        // 方向指向圆心：采样点被拉向内侧，视觉上就是边缘放大 —— 对齐真实透镜的斜面
        shiftX = (-dx / dist) * magnitude
        shiftY = (-dy / dist) * magnitude
      }

      const i = (y * res + x) * 4
      image.data[i] = Math.round(128 + shiftX * 127)
      image.data[i + 1] = Math.round(128 + shiftY * 127)
      image.data[i + 2] = 0
      image.data[i + 3] = 255
    }
  }

  ctx.putImageData(image, 0, 0)
  return canvas.toDataURL('image/png')
}

/**
 * 构建隐藏的 SVG 滤镜：位移跑三遍，每遍抽一个颜色通道，再用 screen 合成出彩边。
 *
 * 必须挂在 body 上且**不能**用 `display: none`，否则 url(#id) 引用会失效。
 */
function createFilterSvg(href: string, size: number) {
  const svg = svgNode('svg', { class: 'vp-cursor-lens-filter', 'aria-hidden': 'true' })

  const filter = svgNode('filter', {
    id: FILTER_ID,
    x: '-30%',
    y: '-30%',
    width: '160%',
    height: '160%',
    'color-interpolation-filters': 'sRGB'
  })

  const displace = (channel: keyof typeof KEEP_CHANNEL, scale: number) => {
    const displaced = `d${channel}`
    filter.append(
      svgNode('feDisplacementMap', {
        in: 'SourceGraphic',
        in2: 'map',
        scale: String(scale),
        xChannelSelector: 'R',
        yChannelSelector: 'G',
        result: displaced
      }),
      svgNode('feColorMatrix', {
        in: displaced,
        type: 'matrix',
        values: KEEP_CHANNEL[channel],
        result: `c${channel}`
      })
    )
  }

  filter.append(
    svgNode('feImage', {
      href,
      x: '0',
      y: '0',
      width: String(size),
      height: String(size),
      result: 'map'
    })
  )

  // 红移最少、绿居中、蓝移最多，三者的差值就是边缘的色散
  displace('R', MAP_SCALE - CHROMA)
  displace('G', MAP_SCALE)
  displace('B', MAP_SCALE + CHROMA)

  // 三遍各自只有单通道有值，逐通道 screen 叠加即可无损还原，
  // 重叠处也不会出现暗边。注意最后一步必须吃 cB，不能吃 dB：
  // dB 是全彩副本，混进来会让 R/G 被重复叠加、蓝色只加一次，整体偏黄。
  filter.append(
    svgNode('feBlend', { in: 'cR', in2: 'cG', mode: 'screen', result: 'rg' }),
    svgNode('feBlend', { in: 'rg', in2: 'cB', mode: 'screen' })
  )

  const defs = svgNode('defs', {})
  defs.appendChild(filter)
  svg.appendChild(defs)
  return svg
}

export function createLiquidLens(): LiquidLens {
  // 尺寸留在 CSS 里，方便不改逻辑就调大小
  const declared = getComputedStyle(document.documentElement).getPropertyValue(
    '--vp-cursor-lens-size'
  )
  const size = parseFloat(declared) || 34

  const element = document.createElement('div')
  element.className = 'vp-cursor-lens'
  element.setAttribute('aria-hidden', 'true')

  // 贴图生成失败时退回纯磨砂，不留一个空滤镜
  const href = supportsRefraction() ? createDisplacementMap(size) : ''
  const refracting = Boolean(href)
  if (refracting) {
    element.classList.add('vp-cursor-lens--refract')
    document.body.appendChild(createFilterSvg(href, size))
  }

  document.body.appendChild(element)

  return {
    element,
    refracting,
    moveTo(x: number, y: number) {
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

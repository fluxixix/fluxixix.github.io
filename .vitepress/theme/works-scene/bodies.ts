/**
 * 作品页「太阳系」的数据层。
 *
 * 十件作品从 DOM 里读——.plate-scene 里的那些元素就是无 JS 时的降级内容，
 * 一定在页面里；读它等于让画面与正文共用同一份数据，改一件作品只改 markdown。
 *
 * 球面不再画贴图：颜色交给材质、明暗交给中心那盏灯，所以这个文件里没有任何
 * canvas 绘制代码。颜色一律从 CSS 变量取，明暗切换后重新调一次 readColors()。
 */

export interface SolarBody {
  /** 角落编号，取自十节在正文里的次序 */
  code: string
  /** 作品名，h2 里去掉副题那一段 */
  name: string
  /** 落在哪一圈：0 内 / 1 中 / 2 外 */
  ring: number
  /** 高饱和色锚点，与那张静态版画一致 */
  accent: 'violet' | 'cyan'
}

export interface SolarColors {
  /** 轨道线 */
  frame: string
  /** 编号这类中性小字 */
  muted: string
  accentA: string
  accentB: string
}

/** 三圈轨道半径（世界单位）。见 spec 3.1，实机可微调 */
export const RING_R = [0.4, 0.73, 1.04] as const

/**
 * 三圈的行星半径。纯视觉分档，不承载信息。
 * 实机放大看过：屏幕上直径小于 40px 时，球面的色带和明暗都糊成一块，
 * 看着就是个彩色圆片，所以外圈给到了近 46px
 */
export const BODY_R = [0.05, 0.066, 0.086] as const

/**
 * 恒星半径。
 * 原来是 0.057，比内圈那颗行星（0.05）才大一点点——恒星不该跟行星一个量级，
 * 放大到内圈球的两倍左右。
 */
export const SUN_R = 0.1

/** 太阳系中心落在右半边的正中（屏幕中线对应世界 x = 0，右半就是 [0, HALF_W]） */
export const CENTER_X = 1.34

/**
 * 眉题 → 轨道圈。三个分类名是稳定的，用包含匹配——不依赖 `·` 的位置，
 * 也不依赖「平台 · PLATFORM」里那一半英文。都匹配不上落中圈。
 */
const KIND_RING: [string, number][] = [
  ['平台', 0],
  ['工具链', 1],
  ['个人项目', 2]
]

export function kindToRing(kind: string): number {
  for (const [key, ring] of KIND_RING) {
    if (kind.includes(key)) return ring
  }
  return 1
}

/** 读当前主题下需要的那几个颜色。明暗切换后要重新调一次 */
export function readColors(): SolarColors {
  const cs = getComputedStyle(document.documentElement)
  const get = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback
  return {
    // 轨道线得看得见。原来取 --vp-c-divider 太淡，浅色主题下几乎是一条白线，
    // 整页看不出「这是太阳系」
    frame: get('--vp-c-text-3', '#8a8a8a'),
    muted: get('--vp-c-text-2', '#5a5a62'),
    accentA: get('--fx-brand-a', '#bd34fe'),
    accentB: get('--fx-brand-b', '#41d1ff')
  }
}

/**
 * 从正文里把十件作品读回来。
 * 一件作品要的东西全在它那一节里，缺了哪一项就退回空串——画面画得出来比画得准重要。
 */
export function readBodies(root: HTMLElement): SolarBody[] {
  return Array.from(root.querySelectorAll<HTMLElement>('.plate-scene')).map((section, i) => {
    const title = section.querySelector<HTMLElement>('.scene-title')
    const name = (() => {
      if (!title) return ''
      const clone = title.cloneNode(true) as HTMLElement
      clone.querySelector('.poster-sub')?.remove()
      clone.querySelector('.header-anchor')?.remove()
      return clone.textContent?.trim() ?? ''
    })()

    return {
      code: String(i + 1).padStart(2, '0'),
      name,
      ring: kindToRing(section.querySelector('.scene-kind')?.textContent?.trim() ?? ''),
      accent: section.querySelector('.work-plate')?.classList.contains('is-cyan') ? 'cyan' : 'violet'
    }
  })
}

/**
 * 作品页的太阳系。
 *
 * 中心是本站，十件作品是绕它运行的行星：内圈一件平台、中圈五件工具链、
 * 外圈四件个人项目。光从中心来——每颗球的亮面自动朝向太阳，不需要为光照
 * 做任何朝向处理，也不需要把明暗烤进贴图。
 *
 * 只有一个状态：current。滚动、点某颗行星、随机三路输入都只改它，
 * 系统的转动由它推出来，系统不会反过来驱动滚动。
 *
 * 只依赖 three.js，不碰 VitePress —— 挂载、能力检测、路由清理都在 index.ts。
 */
import {
  AdditiveBlending,
  AmbientLight,
  BufferGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  DoubleSide,
  EllipseCurve,
  Group,
  LineBasicMaterial,
  LineLoop,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PerspectiveCamera,
  Raycaster,
  RingGeometry,
  Scene,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer
} from 'three'
import {
  BODY_R,
  CENTER_X,
  RING_R,
  SUN_R,
  readColors,
  type SolarBody
} from './bodies'

/* ---------- 构图 ---------- */

/**
 * 相机略高于系统平面俯看。30° 俯角把圆轨道在屏幕上压成约 2:1 的扁椭圆——
 * 这既是「一眼看出是太阳系」要的样子，也顺带把纵向占用压下来。
 */
const CAM = new Vector3(0, 3.0, 5.2)
const LOOK = new Vector3(0, 0.05, 0)

/**
 * 焦点处的横向半宽（世界单位）。钉死它，视口比例变了也只改 fov，不改构图——
 * 太阳系在屏幕上的落点才不会随窗口变形。
 * 屏幕中线对应世界 x = 0，所以右半边就是 [0, HALF_W]，太阳系中心取其中点。
 */
const HALF_W = 2.68

/** 当前那颗放大到多少 */
const GROW = 1.7

/** 当前那颗沿半径向外移多少（离开轨道线，一眼看出它被单独拎出来） */
const PULL = 0.09

/** 其余九颗压到多少 */
const DIM = 0.5

/** 太阳光晕的直径 */
const GLOW = 0.62

/**
 * 球缘落在光晕贴图上的位置（0 是中心、1 是光晕外缘）。
 * 遮罩的最亮点就钉在这儿——这样它恰好压着球缘一圈，
 * 而不是压到球面上（那会把太阳整个盖住）。
 * 跟着 SUN_R / GLOW 自动算，改哪个尺寸都不用重新手算这个数。
 */
const CORE_RATIO = SUN_R / (GLOW / 2)

/**
 * 行星环：两道。半径以球半径为单位，第三个数是它自己的不透明度。
 * 单圈实色边太平，两道并排就有了层次——而且都是锐利的环。
 */
const HALO_RINGS: [number, number, number][] = [
  [1.36, 1.58, 0.9],
  [1.66, 1.72, 0.38]
]

/**
 * pick() 命中恒星时返回这个值。
 * 恒星不是十件作品之一，用 -1 把「点到了中心」和「点到了 0..9 某件」分开——
 * 调用方拿它去回顶部。
 */
export const SUN_INDEX = -1

export interface WorksScene {
  /** 把系统转到第 index 颗 */
  setCurrent(index: number): void
  /** 归一化到 [-1, 1] 的指针位置，用来做一点点视差 */
  setPointer(x: number, y: number): void
  /** 点在某处命中的是第几颗行星、还是恒星（SUN_INDEX）；什么都没命中返回 null */
  pick(clientX: number, clientY: number): number | null
  /** 明暗主题切换后重上一遍颜色 */
  refreshColors(): void
  resize(): void
  start(): void
  stop(): void
  dispose(): void
  /** 首帧之后每帧的耗时均值（毫秒），掉帧时由调用方决定要不要停 */
  frameCost(): number
}

interface Body {
  mesh: Mesh
  mat: MeshLambertMaterial
  /** 朝外的水平单位向量 */
  out: Vector3
  /** 0 → 在轨道上，1 → 被拎到焦点 */
  focus: number
  ring: number
}

/**
 * 太阳光晕：先铺一层实色，再用一层径向遮罩把边缘吃掉。
 *
 * 最亮的一段停在 coreRatio——那正是太阳球缘在纹理上的位置。
 * 再往里的部分本来就压在球底下看不见；往外则一路衰减。
 * 早先中心给到 1 是不对的：这一层画在球上面，中心太实就把太阳整个盖住了。
 */
function glowTexture(color: string, coreRatio: number): CanvasTexture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const g = canvas.getContext('2d')!

  g.fillStyle = color
  g.fillRect(0, 0, size, size)

  const mask = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  mask.addColorStop(0, 'rgba(255,255,255,0.9)')
  mask.addColorStop(coreRatio, 'rgba(255,255,255,0.62)')
  mask.addColorStop(coreRatio + (1 - coreRatio) * 0.3, 'rgba(255,255,255,0.2)')
  mask.addColorStop(1, 'rgba(255,255,255,0)')

  g.globalCompositeOperation = 'destination-in'
  g.fillStyle = mask
  g.fillRect(0, 0, size, size)

  return new CanvasTexture(canvas)
}

/** 小型确定性随机：同一个种子永远给出同一颗星球，换主题重画也不会变样 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 色值的 sRGB 十六进制 → rgba() 字符串。直接用 Color 的分量会拿到线性值，颜色会偏 */
function rgba(color: string, dl: number, alpha = 1): string {
  const hex = new Color(color).offsetHSL(0, 0, dl).getHexString()
  const n = parseInt(hex, 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

/**
 * 球面纹理：底色 + 几道横向色带 + 一层颗粒。
 *
 * 十颗球共用同一套画法，但种子取各自的编号，所以每颗的带子宽窄、明暗、
 * 斑点都不一样——「一个作品一个星球」这件事得看得出来。
 * 只画 albedo：明暗交给中心那盏灯，烤进贴图就跟光照打架了。
 */
function bodyTexture(color: string, seed: number): CanvasTexture {
  const W = 512
  const H = 256
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const g = canvas.getContext('2d')!
  const rnd = mulberry32(seed)

  // 底色略压暗：铺满纯色会让亮面那半边整块发白、看不出是个球
  g.fillStyle = rgba(color, -0.07)
  g.fillRect(0, 0, W, H)

  // 横向色带。宽度按球在屏幕上的像素反推——三四十像素的球上，
  // 十来个像素宽的带子正好看得见，再细就糊成一片了
  let y = 0
  while (y < H) {
    const h = 16 + rnd() * 54
    const dl = rnd() < 0.5 ? -0.06 - rnd() * 0.3 : 0.07 + rnd() * 0.24
    g.fillStyle = rgba(color, dl, 0.85 + rnd() * 0.15)
    g.fillRect(0, y, W, h)
    y += h
  }

  // 颗粒：让带子的边缘不是一条条干净直线
  for (let i = 0; i < 340; i++) {
    g.fillStyle = rgba(color, rnd() < 0.5 ? -0.22 : 0.16, 0.25 + rnd() * 0.3)
    g.beginPath()
    g.arc(rnd() * W, rnd() * H, 1.4 + rnd() * 4.6, 0, Math.PI * 2)
    g.fill()
  }

  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

/** 编号用的等宽栈。和站点的 --vp-font-family-mono 同一副 */
const MONO_STACK = "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace"

/**
 * 编号贴图：给每颗球一个读得出身份的记号。
 *
 * 用 sprite 而不是把数字画进球面纹理——sprite 永远正对相机，转到哪儿都清晰；
 * 画在球面上会随球转到背面去，而且球在屏上只有三四十像素，贴图上再小的字也糊。
 * 数字画成白色，颜色交给 SpriteMaterial.color 去乘，明暗主题共用一张图。
 */
function codeTexture(code: string): CanvasTexture {
  const W = 128
  const H = 64
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const g = canvas.getContext('2d')!
  g.font = `700 42px ${MONO_STACK}`
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillStyle = '#ffffff'
  g.fillText(code, W / 2, H / 2 + 1)

  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  return tex
}

/**
 * 恒星表面：比行星细密得多的一层对流斑，再撒几处活动亮斑。
 *
 * 太阳用的是 MeshBasicMaterial——它自己就是光源，不该再被照，
 * 所以它没有别的球那种明暗，质感只能全部画进这张贴图里。
 * 只画一层浅浅的底色 + 元胞：底色太满会糊成一块死板的圆。
 */
function starTexture(color: string): CanvasTexture {
  const W = 512
  const H = 256
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const g = canvas.getContext('2d')!
  const rnd = mulberry32(7)

  // 底子略微提亮：恒星该比行星亮一档
  g.fillStyle = rgba(color, 0.08)
  g.fillRect(0, 0, W, H)

  // 对流元胞：数量多、个头小。行星那层是「色带」，恒星是「颗粒」。
  // 半径压到 1~5px：球面贴图在正对相机的那半球上水平方向会被拉伸约四倍，
  // 画大了就成了花椰菜
  for (let i = 0; i < 2200; i++) {
    g.fillStyle = rgba(color, rnd() < 0.55 ? -0.12 - rnd() * 0.16 : 0.1 + rnd() * 0.18, 0.3 + rnd() * 0.32)
    g.beginPath()
    g.arc(rnd() * W, rnd() * H, 1 + rnd() * 4, 0, Math.PI * 2)
    g.fill()
  }

  // 活动区：二十几处更亮的斑，让表面有起伏
  for (let i = 0; i < 26; i++) {
    g.fillStyle = rgba(color, 0.26 + rnd() * 0.18, 0.45)
    g.beginPath()
    g.arc(rnd() * W, rnd() * H, 3 + rnd() * 9, 0, Math.PI * 2)
    g.fill()
  }

  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

/** 一圈轨道。EllipseCurve 画在 XY 平面，这里映射到 XZ */
function orbitLine(radius: number, color: Color): LineLoop {
  const pts = new EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2).getPoints(64)
  const geo = new BufferGeometry().setFromPoints(pts.map((p) => new Vector3(p.x, 0, p.y)))
  const mat = new LineBasicMaterial({ color, transparent: true, opacity: 0.8 })
  return new LineLoop(geo, mat)
}

export function createWorksScene(canvas: HTMLCanvasElement, bodies: SolarBody[]): WorksScene {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setClearAlpha(0)

  const scene = new Scene()
  const camera = new PerspectiveCamera(30, 1, 0.1, 40)
  camera.position.copy(CAM)
  camera.lookAt(LOOK)

  let colors = readColors()

  const group = new Group()
  group.position.set(CENTER_X, 0, 0)
  scene.add(group)

  /* ---------- 光 ----------
     从观众侧上方来的主光，不是从中心——这是看图之后改的。

     按「光在中心」打，从系统外面看，每颗球朝向观众的那一面必然是背光的：
     朝中心的那半个球永远在球的内侧，看不见。只有轨道远侧的球碰巧把亮面
     转向观众，其余八颗全是暗的，靠环境光勉强托着——整片看着就是一排扁色块，
     球面的色带和颗粒全被压没了。
     所以照明交给两束方向光，太阳只负责当视觉中心，它自己不参与照明。
  */

  const keyLight = new DirectionalLight(0xffffff, 1.4)
  keyLight.position.set(1.6, 2.4, 2.0)
  scene.add(keyLight)

  const fillLight = new DirectionalLight(0xffffff, 0.3)
  fillLight.position.set(0, 0.6, 5)
  scene.add(fillLight)

  // 暗面不完全压死：0.42 是「看得见是个球、又没把明暗分界冲掉」的位置
  scene.add(new AmbientLight(0xffffff, 0.42))

  /* ---------- 太阳 ---------- */

  const sunGeo = new SphereGeometry(SUN_R, 48, 32)
  let sunTex = starTexture(colors.accentA)
  const sunMat = new MeshBasicMaterial({ map: sunTex })
  group.add(new Mesh(sunGeo, sunMat))

  let glowTex = glowTexture(colors.accentA, CORE_RATIO)
  const glowMat = new SpriteMaterial({
    map: glowTex,
    blending: AdditiveBlending,
    depthWrite: false,
    transparent: true
  })
  const glow = new Sprite(glowMat)
  glow.scale.setScalar(GLOW)
  group.add(glow)

  /* ---------- 三圈轨道 ---------- */

  const orbits = RING_R.map((r) => {
    const line = orbitLine(r, new Color(colors.frame))
    group.add(line)
    return line
  })

  /* ---------- 十颗行星 ----------
     圈内均分角度，圈内第一颗都落在近点（a = 0，位置是 (0, 0, R)） */

  const counts = [0, 0, 0]
  for (const b of bodies) counts[b.ring]++
  const seen = [0, 0, 0]
  const angles = bodies.map((b) => (seen[b.ring]++ / counts[b.ring]) * Math.PI * 2)

  // 十颗共用一份几何，大小差别全交给 scale
  const bodyGeo = new SphereGeometry(1, 32, 24)
  // 拾取代理：行星在屏幕上只有二三十像素，热区得放大
  const pickGeo = new SphereGeometry(1, 12, 8)
  const pickMat = new MeshBasicMaterial({ visible: false })

  const list: Body[] = bodies.map((b, i) => {
    const a = angles[i]
    const out = new Vector3(Math.sin(a), 0, Math.cos(a))
    const base = b.accent === 'cyan' ? colors.accentB : colors.accentA
    // 种子取编号：01..10 各一颗，同一个编号永远长成同一颗
    const tex = bodyTexture(base, i + 1)
    const mat = new MeshLambertMaterial({
      map: tex,
      // 自发光平时是 0，只有当前那颗按 focus 点起来——见 apply()。
      // emissive 给白、emissiveMap 用同一张图，点起来的是这颗星球自己的地貌，
      // 而不是一块纯色——否则当前那颗会褪成一个发光的圆饼
      emissive: 0xffffff,
      emissiveMap: tex,
      emissiveIntensity: 0,
      transparent: true,
      opacity: 1
    })
    const mesh = new Mesh(bodyGeo, mat)
    mesh.position.copy(out).multiplyScalar(RING_R[b.ring])
    mesh.scale.setScalar(BODY_R[b.ring])

    // 代理挂在行星底下，位置和缩放自动跟着走
    const pick = new Mesh(pickGeo, pickMat)
    pick.scale.setScalar(2.2)
    mesh.add(pick)

    group.add(mesh)
    return { mesh, mat, out, focus: 0, ring: b.ring }
  })

  const picks = list.map((b) => b.mesh.children[0] as Mesh)

  // 恒星也挂一个拾取代理，比它自己大一圈——「点恒星回顶部」是这一页
  // 除了滚动之外的唯一出口，目标太小就不好点
  const sunPickGeo = new SphereGeometry(SUN_R * 1.7, 12, 8)
  const sunPick = new Mesh(sunPickGeo, pickMat)
  sunPick.visible = false
  group.add(sunPick)

  /* ---------- 编号 ----------
     球上不了字，身份就靠这一枚小号数字浮在每颗球上方。

     它刻意不跟着其余九颗一起压暗（其余球降到 DIM，编号只降到 0.55）：
     「这里有几件、每件是哪个」这件事得始终读得出来，而不是只有当前那件才可见。
     当前那颗的编号同时换成它的 accent 色。 */

  const codes = bodies.map((b) => {
    const tex = codeTexture(b.code)
    const mat = new SpriteMaterial({
      map: tex,
      color: new Color(colors.muted),
      transparent: true,
      opacity: 0.55,
      depthWrite: false
    })
    const sp = new Sprite(mat)
    sp.scale.set(0.115, 0.058, 1)
    group.add(sp)
    return { sp, mat, tex }
  })

  /* ---------- 当前那颗的行星环 ----------
     两道环躺平后再倾斜 20°，所以它是「绕着球转的一圈」，
     而不是正对观众的一个光圈——后者看着像球背后糊了团光 */

  const haloGroup = new Group()
  const halos = HALO_RINGS.map(([inner, outer, alpha]) => {
    const geo = new RingGeometry(inner, outer, 64)
    const mat = new MeshBasicMaterial({
      color: new Color(colors.accentA),
      transparent: true,
      opacity: 0,
      side: DoubleSide,
      depthWrite: false
    })
    haloGroup.add(new Mesh(geo, mat))
    return { geo, mat, alpha }
  })
  haloGroup.rotation.x = -Math.PI / 2 + Math.PI / 9
  haloGroup.visible = false
  group.add(haloGroup)

  /* ---------- 状态 ---------- */

  const state = {
    /** 当前是第几颗 */
    current: 0,
    /** 目标角度与缓动中的角度（弧度，都是「转了多少」） */
    targetA: 0,
    curA: 0,
    pointerX: 0,
    pointerY: 0,
    running: false
  }

  const viewDir = LOOK.clone().sub(CAM).normalize()
  /** 相机到最外圈近点所在平面的距离（沿视轴），fov 由它反算 */
  const frontDist = new Vector3(CENTER_X, 0, RING_R[2]).sub(CAM).dot(viewDir)

  /** 角度差归一到 (-π, π]，转系统走近路而不是绕一圈 */
  function shortest(from: number, to: number): number {
    const d = ((to - from) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI
    return d
  }

  function rotateTo(index: number) {
    if (index < 0 || index >= list.length) return
    state.targetA += shortest(state.targetA, angles[index])
    state.current = index
    if (!state.running) apply()
  }

  /* ---------- 每帧 ---------- */

  function apply(dt = 1 / 60) {
    // 转系统。缓动而不是直接落位，滚动快了也不会甩
    state.curA += shortest(state.curA, state.targetA) * Math.min(1, dt * 7)
    group.rotation.y = -state.curA

    for (let i = 0; i < list.length; i++) {
      const b = list[i]
      b.focus += ((i === state.current ? 1 : 0) - b.focus) * Math.min(1, dt * 6)
      const f = b.focus

      // 位置：沿轨道，当前那颗再沿半径向外挪一点，离开轨道线
      const radial = RING_R[b.ring] + f * PULL
      b.mesh.position.set(b.out.x * radial, 0, b.out.z * radial)
      b.mesh.scale.setScalar(BODY_R[b.ring] * (1 + f * (GROW - 1)))
      // 当前那颗最亮，其余压到 DIM。写反了这一页就不存在「当前」可言
      b.mat.opacity = DIM + f * (1 - DIM)
      /**
       * 当前那颗再亮一档。它已经被主光照到了，这里只是让它在九颗里跳出来，
       * 不是拿来补光的。
       */
      b.mat.emissiveIntensity = f * 0.45
    }

    // 行星环跟着当前那颗。环的半径以球半径为单位，所以缩放直接跟球走
    const cur = list[state.current]
    const cf = cur.focus
    haloGroup.visible = cf > 0.01
    haloGroup.position.copy(cur.mesh.position)
    haloGroup.scale.setScalar(BODY_R[cur.ring] * (1 + cf * (GROW - 1)))
    const accent = bodies[state.current].accent === 'cyan' ? colors.accentB : colors.accentA
    for (const h of halos) {
      h.mat.opacity = h.alpha * cf
      h.mat.color.set(accent)
    }

    // 编号浮在每颗球的外上方——沿离心方向再偏出去一点。
    // 只往上抬是不够的：内圈那颗在近点，正上方就是太阳，编号会落进光晕里读不出来。
    // 高度跟着球的**实际**半径走：当前那颗放大到 1.7 倍，编号不跟着抬就会被球吞掉
    for (let i = 0; i < codes.length; i++) {
      const b = list[i]
      const isCur = i === state.current
      const r = BODY_R[b.ring] * (1 + b.focus * (GROW - 1))
      codes[i].sp.position.set(
        b.mesh.position.x + b.out.x * r * 1.6,
        r * 2.6,
        b.mesh.position.z + b.out.z * r * 1.6
      )
      codes[i].mat.opacity = isCur ? 1 : 0.55
      codes[i].mat.color.set(
        isCur ? (bodies[i].accent === 'cyan' ? colors.accentB : colors.accentA) : colors.muted
      )
    }

    camera.position.set(CAM.x + state.pointerX * 0.1, CAM.y + state.pointerY * 0.08, CAM.z)
    camera.lookAt(LOOK)
  }

  let raf = 0
  let frameCost = 0
  let frames = 0
  let costSum = 0
  let last = performance.now()

  function loop() {
    raf = requestAnimationFrame(loop)
    const t0 = performance.now()
    const dt = Math.min((t0 - last) / 1000, 0.05)
    last = t0
    apply(dt)
    renderer.render(scene, camera)
    const cost = performance.now() - t0
    frames++
    costSum += cost
    if (frames === 60) frameCost = costSum / 60
  }

  /**
   * 按视口宽高比反算垂直 fov，让焦点处的横向半宽钉死在 HALF_W：
   *   tan(fov / 2) = HALF_W / (aspect × frontDist)
   * clamp 到 [28, 46]。若新数值顶到这个区间，说明该同时调 HALF_W 与相机距离，
   * 而不是放宽 clamp——放宽就等于放弃「构图不随窗口变形」这条。
   */
  function applyFov() {
    const half = HALF_W / (camera.aspect * frontDist)
    camera.fov = Math.min(46, Math.max(28, (2 * Math.atan(half) * 180) / Math.PI))
    camera.updateProjectionMatrix()
  }

  function resize() {
    const w = canvas.clientWidth || window.innerWidth
    const h = canvas.clientHeight || window.innerHeight
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    applyFov()
    if (!state.running) apply()
  }

  resize()

  /* ---------- 拾取 ---------- */

  const raycaster = new Raycaster()
  const ndc = new Vector2()

  return {
    setCurrent: rotateTo,

    setPointer(x, y) {
      state.pointerX = x
      state.pointerY = y
    },

    pick(clientX, clientY) {
      const rect = canvas.getBoundingClientRect()
      if (!rect.width || !rect.height) return null
      ndc.set(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1
      )
      raycaster.setFromCamera(ndc, camera)
      // 恒星先测。它的代理球比行星大，两者在屏幕上挨得近时按恒星算——
      // 「回顶部」这个出口不该被旁边那颗行星抢走
      if (raycaster.intersectObject(sunPick, false).length) return SUN_INDEX
      const hit = raycaster.intersectObjects(picks, false)[0]
      return hit ? picks.indexOf(hit.object as Mesh) : null
    },

    refreshColors() {
      colors = readColors()
      const nextSun = starTexture(colors.accentA)
      sunTex.dispose()
      sunMat.map = nextSun
      sunMat.needsUpdate = true
      sunTex = nextSun
      for (const line of orbits) {
        ;(line.material as LineBasicMaterial).color.set(colors.frame)
      }
      // 编号的颜色只有中性色跟着主题走，当前那颗的 accent 由 apply 每帧刷
      for (const c of codes) c.mat.color.set(colors.muted)
      // 球面纹理是按色值在 canvas 上画出来的，换主题只能重画一遍
      for (let i = 0; i < list.length; i++) {
        const c = bodies[i].accent === 'cyan' ? colors.accentB : colors.accentA
        const next = bodyTexture(c, i + 1)
        const old = list[i].mat.map
        list[i].mat.map = next
        list[i].mat.emissiveMap = next
        list[i].mat.needsUpdate = true
        old?.dispose()
      }
      // 光晕是在 canvas 上按色值画出来的，换色只能重画一张
      const next = glowTexture(colors.accentA, CORE_RATIO)
      glowMat.map?.dispose()
      glowMat.map = next
      glowMat.needsUpdate = true
      glowTex = next
      if (!state.running) apply()
    },

    resize,

    start() {
      if (state.running) return
      state.running = true
      last = performance.now()
      loop()
    },

    stop() {
      state.running = false
      cancelAnimationFrame(raf)
    },

    dispose() {
      this.stop()
      sunGeo.dispose()
      sunPickGeo.dispose()
      sunTex.dispose()
      sunMat.dispose()
      glowTex.dispose()
      glowMat.dispose()
      bodyGeo.dispose()
      pickGeo.dispose()
      pickMat.dispose()
      for (const h of halos) {
        h.geo.dispose()
        h.mat.dispose()
      }
      for (const c of codes) {
        c.tex.dispose()
        c.mat.dispose()
      }
      for (const line of orbits) {
        line.geometry.dispose()
        ;(line.material as LineBasicMaterial).dispose()
      }
      for (const b of list) b.mat.dispose()
      renderer.dispose()
    },

    frameCost: () => frameCost
  }
}

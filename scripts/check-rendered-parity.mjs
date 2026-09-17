/**
 * 用无头 Chromium（CDP 直连）对比"改造前 / 改造后"两套产物的渲染结果：
 * 关键元素的位置尺寸 + 关键属性的计算值。这是"还原度"唯一可信的判据。
 */
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { existsSync } from 'node:fs'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { homedir } from 'node:os'

const CHROME = join(
  homedir(),
  'Library/Caches/ms-playwright/chromium_headless_shell-1217/chrome-headless-shell-mac-arm64/chrome-headless-shell'
)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8'
}

function serve(dir, port) {
  const server = createServer(async (req, res) => {
    try {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname)
      if (p.endsWith('/')) p += 'index.html'
      const candidates = [p]
      // 站点没开 cleanUrls，产物是 works.html；允许用 /works 这种写法探测
      if (!extname(p)) candidates.push(`${p}.html`, `${p}/index.html`)
      let file = null
      for (const candidate of candidates) {
        const resolved = normalize(join(dir, candidate))
        if (!resolved.startsWith(dir)) break
        const info = await stat(resolved).catch(() => null)
        if (info?.isFile()) {
          file = resolved
          break
        }
      }
      if (!file) return res.writeHead(404).end('not found')
      res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' })
      res.end(await readFile(file))
    } catch (e) {
      res.writeHead(500).end(String(e))
    }
  })
  return new Promise((resolve) => server.listen(port, () => resolve(server)))
}

const PAGES = process.argv.slice(2)
if (!PAGES.length) PAGES.push('/', '/works', '/about', '/archive', '/now', '/posts/')

/**
 * 每个探测点各自该在哪些页面出现。探测点不存在时 pick() 会返回 null，
 * 两边都 null 就成了"一致"——那等于没测。所以这里把预期写死：
 * 该有的页面缺了就是失败，不存在的页面两边都该是 null。
 */
const EXPECTED = {
  navBar: () => true,
  // 进度环与进度条由脚本插入，全站都在；环在窄屏 display:none 但仍在 DOM 里
  navRing: () => true,
  navRingBar: () => true,
  readingBar: () => true,
  siteFooter: () => true,
  container: () => true,
  contentContainer: (page) => page !== '/',
  vpDoc: () => true,
  vpDocInner: () => true,
  homeCover: (page) => page === '/',
  postEntry: (page) => page === '/' || page === '/posts/',
  sidebar: (page) => page.startsWith('/posts/'),
  workPoster: (page) => page === '/works' || page === '/about',
  workPlate: (page) => page === '/works',
  posterBody: (page) => page === '/works',
  masthead: (page) => page === '/works' || page === '/about',
  nowHead: (page) => page.startsWith('/now/'),
  nowLead: (page) => page === '/now',
  timeline: (page) => page === '/archive'
}

/* ---------- CDP 最小客户端 ---------- */
class Cdp {
  constructor(ws) {
    this.ws = ws
    this.id = 0
    this.pending = new Map()
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data)
      const p = this.pending.get(msg.id)
      if (!p) return
      this.pending.delete(msg.id)
      msg.error ? p.reject(new Error(JSON.stringify(msg.error))) : p.resolve(msg.result)
    })
  }
  send(method, params = {}) {
    const id = ++this.id
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }
}

async function connect(port) {
  const deadline = Date.now() + 15000
  while (Date.now() < deadline) {
    try {
      // /json/version 给的是浏览器级目标，没有 Page 域；取一个 page 目标的 ws 地址
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
      const pageTarget = list.find((t) => t.type === 'page') ?? list[0]
      const ws = new WebSocket(pageTarget.webSocketDebuggerUrl)
      await new Promise((resolve, reject) => {
        ws.addEventListener('open', resolve, { once: true })
        ws.addEventListener('error', reject, { once: true })
      })
      return new Cdp(ws)
    } catch {
      await new Promise((r) => setTimeout(r, 200))
    }
  }
  throw new Error('CDP 连接超时')
}

/** 在页面里跑一段表达式，取回 JSON 结果 */
async function evaluate(cdp, expression) {
  const { result, exceptionDetails } = await cdp.send('Runtime.evaluate', {
    expression: `(() => { ${expression} })()`,
    returnByValue: true,
    awaitPromise: true
  })
  if (exceptionDetails) throw new Error(JSON.stringify(exceptionDetails))
  return result.value
}

const PROBE = `
  const out = { url: location.pathname, docWidth: document.documentElement.scrollWidth };
  // 兜底：路由写错会渲染成 404 页，而 404 页上所有探测点都是 null——
  // 两边都 null 就会被判成"一致"，等于白测。这里显式把 404 标出来。
  out.is404 = /404/.test(document.title) || !!document.querySelector('[class*="NotFound"]');
  const pick = (el, props) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    // 几何取整到整像素：字体抗锯齿会让子像素级的位置随机漂 0.1~2px，
    // 那是同一套样式下的重绘噪声，不是"还原度"问题。布局量级的变化
    // （胶囊宽度、卡片尺寸、网格列数）都在整数像素以上，取整不会漏掉。
    const o = { rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] };
    for (const p of props) o[p] = cs.getPropertyValue(p).trim();
    return o;
  };
  const box = ['display','position','width','height','max-width','min-width','margin','padding','border-radius','overflow','transform','float','grid-template-columns','flex-direction','gap','background-color','background-image','background-size','background-position','color','font-size','font-family','font-weight','letter-spacing','line-height','text-decoration-line','text-decoration-color','top','left','right','bottom','z-index','box-shadow','opacity','stroke-width','fill','clip-path','transition'];
  out.navBar = pick(document.querySelector('.VPNavBar'), box);
  out.navRing = pick(document.querySelector('.fx-nav-ring'), box);
  out.navRingBar = pick(document.querySelector('.fx-nav-ring-bar'), box);
  out.readingBar = pick(document.querySelector('.fx-reading-progress'), box);
  out.workPoster = pick(document.querySelector('.work-poster'), box);
  out.workPlate = pick(document.querySelector('.work-plate'), box);
  out.posterBody = pick(document.querySelector('.poster-body'), box);
  out.vpDoc = pick(document.querySelector('.vp-doc'), box);
  out.vpDocInner = pick(document.querySelector('.vp-doc > div'), box);
  out.contentContainer = pick(document.querySelector('.content-container'), box);
  out.container = pick(document.querySelector('.container'), box);
  out.sidebar = pick(document.querySelector('.VPSidebar'), box);
  out.siteFooter = pick(document.querySelector('.site-footer'), box);
  out.masthead = pick(document.querySelector('.masthead'), box);
  out.nowHead = pick(document.querySelector('.now-head'), box);
  out.nowLead = pick(document.querySelector('.now-lead'), box);
  out.postEntry = pick(document.querySelector('.post-entry'), box);
  out.homeCover = pick(document.querySelector('.home-cover'), box);
  out.timeline = pick(document.querySelector('.archive-timeline'), box);
  // 关键元素清单：pick() 对不存在的元素返回 null，两边都 null 会被判成"一致"，
  // 于是"元素根本没渲染出来"就漏过去了。这里把所有探测点记下来，
  // 由 compare 阶段断言"该有的都有"，缺失算失败。
  out.present = {};
  for (const key of ['navBar','navRing','navRingBar','readingBar','workPoster','workPlate',
    'posterBody','vpDoc','vpDocInner','contentContainer','container','sidebar','siteFooter',
    'masthead','nowHead','nowLead','postEntry','homeCover','timeline']) {
    out.present[key] = out[key] !== null;
  }
  // 计数：结构差异
  out.counts = {
    workPoster: document.querySelectorAll('.work-poster').length,
    postItem: document.querySelectorAll('.post-list .post-item').length,
    timelineItem: document.querySelectorAll('.archive-timeline .timeline-item').length
  };
  return out;
`

async function capture(cdp, base) {
  const result = {}
  for (const page of PAGES) {
    await cdp.send('Page.navigate', { url: base + page })
    // 等三件事都就绪再量，否则会量到水合中途的状态、报出假差异：
    //   1. 文档加载完成
    //   2. enhanceApp 里 createElement 出来的进度条 / 进度环已经挂上
    //      （它们是 JS 产物，早于此刻两边都探到 null，等于没测）
    //   3. 字体加载完（字体不同会改变文本换行，进而改变高度）
    await evaluate(cdp, `
      const waitFrames = (n) => new Promise((res) => {
        const step = () => (n-- <= 0 ? res() : requestAnimationFrame(step));
        requestAnimationFrame(step);
      });
      const until = (test, ms) => new Promise((res) => {
        if (test()) return res(true);
        const t0 = performance.now();
        const tick = () => {
          if (test()) return res(true);
          if (performance.now() - t0 > ms) return res(false);
          setTimeout(tick, 50);
        };
        setTimeout(tick, 50);
      });
      return (async () => {
        await until(() => document.readyState === 'complete', 10000);
        const hydrated = await until(
          () => document.querySelector('.fx-nav-ring') && document.querySelector('.fx-reading-progress'),
          10000
        );
        // 字体就绪后还要给排版一点时间落定：思源宋体是分片加载的，
        // 每片到位都可能让某个列表项的换行/行高微调，进而让后面的元素整块位移 1~3px。
        // 不等这段时间，量到的就是"还差一片字体"的中间态——两边各差一点就报出假差异。
        if (document.fonts?.ready) await document.fonts.ready;
        await new Promise((r) => setTimeout(r, 300));
        await waitFrames(2);
        await waitFrames(3);
        return hydrated;
      })();
    `)
    try {
      result[page] = await evaluate(cdp, PROBE)
    } catch (e) {
      result[page] = { error: String(e) }
    }
  }
  return result
}

function diff(a, b, path = '', out = []) {
  if (a === b) return out
  const both = a && b && typeof a === 'object' && typeof b === 'object'
  if (!both || Array.isArray(a) !== Array.isArray(b)) {
    out.push(`${path}: ${JSON.stringify(a)} → ${JSON.stringify(b)}`)
    return out
  }
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const k of keys) diff(a[k], b[k], path ? `${path}.${k}` : k, out)
  return out
}

const BASELINE_DIST = process.env.FX_BASELINE_DIST ?? '/tmp/fx-baseline-site/.vitepress/dist'
if (!existsSync(BASELINE_DIST)) {
  console.error(
    `✗ 找不到基线产物 ${BASELINE_DIST}\n` +
    '  先造一份「改造前」的产物，例如：\n' +
    '    rm -rf /tmp/fx-baseline-site && mkdir -p /tmp/fx-baseline-site\n' +
    '    git --git-dir=$PWD/.git --work-tree=/tmp/fx-baseline-site checkout -f HEAD -- .\n' +
    '    ln -s $PWD/node_modules /tmp/fx-baseline-site/node_modules\n' +
    '    (cd /tmp/fx-baseline-site && npx vitepress build)'
  )
  process.exit(1)
}
const baselineServer = await serve(BASELINE_DIST, 8801)
const currentServer = await serve(join(process.cwd(), '.vitepress/dist'), 8802)

const chrome = spawn(CHROME, [
  '--headless',
  // 沙箱在这个环境里初始化不了：Chrome 会直接 FATAL 退出
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--remote-debugging-port=9333',
  '--user-data-dir=/tmp/fx-chrome-profile',
  '--no-first-run',
  '--disable-gpu',
  // 关掉字体抗锯齿 / 子像素定位：同一个元素在不同次加载里会因字体的
  // 子像素舍入漂 ±1px，那是渲染噪声而不是还原度问题。关掉后两次测量稳定。
  '--disable-lcd-text',
  '--disable-font-subpixel-positioning',
  '--disable-partial-raster',
  '--force-device-scale-factor=1',
  // 断网：/now 页的一言来自 https://v1.hitokoto.cn，每次取到的句子长度不同，
  // 会把 .now-lead 与整页高度改掉——那是内容差异，不是主题差异。
  // 用「指向不可路由地址的代理 + 本机直连」来断，比 host-resolver-rules 可靠
  // （后者拦不住已经建立的连接，实测仍然会取到不同句子）。
  '--proxy-server=127.0.0.1:9',
  '--proxy-bypass-list=127.0.0.1;localhost',
  '--disable-background-networking',
  '--disable-component-update',
  '--window-size=1440,900',
  'about:blank'
], { stdio: 'ignore' })

try {
  const cdp = await connect(9333)
  await cdp.send('Page.enable')
  await cdp.send('Runtime.enable')

  // 三个宽度各测一遍：宽屏看悬浮胶囊与卡片网格，60rem 以下胶囊退场、
  // 进度条换成窄屏细线，40rem 以下网格退成单列
  const VIEWPORTS = [
    { name: '1440×900', width: 1440, height: 900 },
    { name: '1024×768', width: 1024, height: 768 },
    { name: '390×844', width: 390, height: 844 }
  ]

  let total = 0
  for (const vp of VIEWPORTS) {
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: vp.width, height: vp.height, deviceScaleFactor: 1, mobile: vp.width < 600
    })
    const before = await capture(cdp, 'http://127.0.0.1:8801')
    const after = await capture(cdp, 'http://127.0.0.1:8802')

    console.log(`\n########## 视口 ${vp.name} ##########`)
    for (const page of PAGES) {
      const diffs = []

      // 1) 该有的探测点必须真的存在。缺了就报，不能让"两边都 null"混成一致。
      for (const [key, wanted] of Object.entries(EXPECTED)) {
        const expected = wanted(page)
        for (const [label, snap] of [['基线', before[page]], ['改造后', after[page]]]) {
          const present = snap?.present?.[key]
          if (expected && present === false) diffs.push(`缺少关键元素 .${key}（${label}）`)
          if (!expected && present === true) diffs.push(`多出关键元素 .${key}（${label}）`)
        }
      }

      // 2) 路由本身不能落成 404（否则后面全是 null，白测一场）
      for (const [label, snap] of [['基线', before[page]], ['改造后', after[page]]]) {
        if (snap?.is404) diffs.push(`页面渲染成了 404（${label}）：检查探测用的 URL 是否与产物一致`)
      }

      // 3) 计算样式与几何逐项对比（present / is404 是断言用的辅助字段，不参与对比）
      const strip = (o) =>
        o && typeof o === 'object' ? { ...o, present: undefined, is404: undefined } : o
      diffs.push(...diff(strip(before[page]), strip(after[page]), page))

      total += diffs.length
      if (diffs.length) {
        console.log(`\n### ${page} —— ${diffs.length} 处差异`)
        for (const line of diffs.slice(0, 40)) console.log('   ', line)
      } else {
        console.log(`### ${page} —— 一致`)
      }
    }
  }
  console.log(`\n合计差异：${total}`)
  if (total > 0) process.exitCode = 1
} finally {
  chrome.kill()
  baselineServer.close()
  currentServer.close()
}

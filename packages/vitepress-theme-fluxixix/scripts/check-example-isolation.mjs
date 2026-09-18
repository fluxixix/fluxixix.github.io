#!/usr/bin/env node
/**
 * A/B 隔离检查：证明"装了这个主题，宿主站的原生样式不受影响"。
 *
 * 做法是对同一个最小站点做两次构建：
 *
 *   把 .vitepress/theme 摘掉再构建  →  基线（纯默认主题）
 *   装回 fluxixix 主题再构建        →  对照
 *
 * 这个站点只装主题、什么都不配（没有 pageClass、没有 works / now / archive），
 * 所以除了主题有意增强的那两处（首页刊头 / 全站页脚），页面的 DOM 必须逐字
 * 一致。任何多出来的类名、属性、包装元素都是主题在"污染"宿主页面。
 *
 * 同时核对主题的通用外壳确实渲染了、主题样式确实在产物里且排在默认主题之后。
 *
 * 脚本随主题包走，两种布局都能跑：
 *   主题独立仓库（包在仓库根）  → 演示站就在包的 examples/native-demo
 *   主站 monorepo（包在 packages/ 下）→ 演示站在仓库根的 examples/native-demo
 *
 *   node scripts/check-example-isolation.mjs
 */
import { existsSync, readFileSync, readdirSync, renameSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
// 两种布局下演示站都是 <repo>/examples/native-demo，只是 repo 的层级不同
const exampleDir = existsSync(join(pkgRoot, 'examples', 'native-demo'))
  ? join(pkgRoot, 'examples', 'native-demo')
  : join(pkgRoot, '..', '..', 'examples', 'native-demo')
const distDir = join(exampleDir, '.vitepress', 'dist')
const themeDir = join(exampleDir, '.vitepress', 'theme')
const themeOffDir = join(exampleDir, '.vitepress', 'theme-off')

const errors = []

function build(quiet) {
  rmSync(distDir, { recursive: true, force: true })
  rmSync(join(exampleDir, '.vitepress', 'cache'), { recursive: true, force: true })
  execFileSync('npx', ['vitepress', 'build'], {
    cwd: exampleDir,
    stdio: quiet ? 'ignore' : 'inherit'
  })
  if (!existsSync(distDir)) throw new Error(`构建没有产出 ${distDir}`)
}

/** 收成 { 页面路径: HTML }，忽略带内容哈希的 <link>/<script> 行 */
function snapshot() {
  const pages = {}
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) walk(path)
      else if (entry.name.endsWith('.html')) {
        pages[relative(distDir, path)] = readFileSync(path, 'utf8')
          .split('\n')
          .filter((line) => !/^\s*<(link|script)\b/.test(line))
          .join('\n')
      }
    }
  }
  walk(distDir)
  return pages
}

/** 主题唯一被允许改动的范围是 <body> 内部 */
function bodyOf(html) {
  const start = html.indexOf('<body')
  const end = html.indexOf('</body>')
  return start === -1 || end === -1 ? html : html.slice(start, end)
}

/**
 * 摘掉主题有意插入的节点后，剩下的部分应当与默认主题逐字一致。
 *
 * 主题只被允许加这四处（都由页面/frontmatter 主动触发，或属于全站外壳）：
 *   - 全站页脚（layout-bottom 插槽，总是渲染）
 *   - 首页刊头（home-hero-before 插槽，仅 layout: home）
 *   - 编辑体页头（doc-before 插槽，仅 frontmatter masthead: true）
 *   - Now 页头（doc-before 插槽，仅 frontmatter now: true）
 *
 * 同时抹掉 Vue 的水合片段标记 `<!--[--><!--]-->`：使用插槽后 VPHome 里会多出
 * 几对，它们是跨端比对所需的注释节点，不参与布局、不参与 CSS 匹配，不属于
 * "结构改动"。抹掉后若仍有差异，那就是真的多了节点、类名或属性。
 */
function stripInjected(body) {
  return body
    // 页脚：footer > div.site-footer-inner > p + nav（nav 里是文本，无嵌套）
    .replace(/<footer class="site-footer">[\s\S]*?<\/div><\/footer>/g, '')
    // 首页刊头：section.home-cover > p + h1 + nav（无嵌套 div）
    .replace(/<section class="home-cover">[\s\S]*?<\/nav><\/section>/g, '')
    // 页头：外层 div.masthead > h1 + p + div.masthead-rule + p —— 收在第二个 </div>
    .replace(/<div class="masthead">[\s\S]*?<\/p><\/div>/g, '')
    // Now 页头：结构同上
    .replace(/<div class="now-head">[\s\S]*?<\/p><\/div>/g, '')
    .replace(/<div class="now-head">[\s\S]*?<\/div><\/div>/g, '')
    // Vue 在插槽里留下的注释节点，全部抹掉再比：
    //   <!--[--> <!--]-->  片段包裹标记
    //   <!---->            v-if 未命中时的占位符
    // 它们不参与布局、不参与 CSS 匹配，也不是"结构改动"。抹掉后若仍有差异，
    // 那就是真的多了节点、类名或属性。
    .replace(/<!--[\s\S]*?-->/g, '')
}

console.log('· 基线构建：摘掉 .vitepress/theme（纯默认主题）')
if (!existsSync(themeDir)) throw new Error(`找不到 ${themeDir}`)
renameSync(themeDir, themeOffDir)
let baselinePages
try {
  build(true)
  baselinePages = snapshot()
} finally {
  renameSync(themeOffDir, themeDir)
}

console.log('· 对照构建：装上 fluxixix 主题')
build(false)
const themedPages = snapshot()

/* ---------- 1. 页面 DOM 对比 ---------- */

for (const [page, baselineHtml] of Object.entries(baselinePages)) {
  const themedHtml = themedPages[page]
  if (!themedHtml) {
    errors.push(`${page}：装上主题之后这个页面没有了`)
    continue
  }
  const a = stripInjected(bodyOf(baselineHtml))
  const b = stripInjected(bodyOf(themedHtml))
  if (a === b) continue

  let i = 0
  while (i < Math.min(a.length, b.length) && a[i] === b[i]) i += 1
  errors.push(
    `${page}：装主题后页面结构被改动了（第 ${i} 个字符起不同）\n` +
      `        基线：${JSON.stringify(a.slice(Math.max(0, i - 70), i + 70))}\n` +
      `        对照：${JSON.stringify(b.slice(Math.max(0, i - 70), i + 70))}`
  )
}

/* ---------- 2. 只有主题的通用外壳能出现在页面上 ---------- */

const baselineAll = Object.values(baselinePages).join('\n')
const themedAll = Object.values(themedPages).join('\n')

/**
 * 站点专属结构：这些**不应该**出现在一个纯 Markdown 站点里。
 * 注意页面形态类不在此列——示例站真的用了文章列表（.post-list）与归档页
 * （.archive-timeline），那是照着主题的 class 约定自己写的，不算"被塞进来"。
 * 主题的通用外壳（home-cover / site-footer / masthead）同样不在此列：
 * 前两个是全站部件，第三个由 frontmatter `masthead: true` 主动触发。
 */
for (const marker of [
  'class="about"',
  'class="about ',
  'class="works"',
  'class="works ',
  'class="now-index',
  'class="now-month',
  'class="work-poster',
  'class="work-plate',
  'fx-nav-ring',
  'fx-reading-progress'
]) {
  if (themedAll.includes(marker) && !baselineAll.includes(marker)) {
    errors.push(`主题往纯 Markdown 站点里塞了站点专属结构 ${marker}`)
  }
}

/* ---------- 3. 主题的通用外壳必须真的生效 ---------- */

if (!themedAll.includes('class="home-cover"')) errors.push('首页没有渲染 .home-cover 刊头')
if (!themedAll.includes('class="site-footer"')) errors.push('页面没有渲染 .site-footer 页脚')
if (baselineAll.includes('class="home-cover"') || baselineAll.includes('class="site-footer"')) {
  errors.push('基线（无主题）里就出现了刊头/页脚：隔离检查流程本身有问题')
}
for (const runtimeNode of ['fx-reading-progress', 'fx-nav-ring', 'vp-cursor-canvas']) {
  if (themedAll.includes(runtimeNode)) {
    errors.push(`SSR 产物里出现了运行期才创建的节点 ${runtimeNode}`)
  }
}

/* ---------- 4. 主题样式必须真的在产物里，且压得住默认主题 ---------- */

const assetsDir = join(distDir, 'assets')
const cssFiles = readdirSync(assetsDir).filter((name) => name.endsWith('.css'))
const css = cssFiles.map((name) => readFileSync(join(assetsDir, name), 'utf8')).join('\n')

// 主题的招牌规则必须在
for (const marker of ['.home-cover', '.site-footer', '--fx-brand-a', '.fx-nav-ring']) {
  if (!css.includes(marker)) {
    errors.push(`产物 CSS 里找不到主题的标志 ${marker}：主题样式看起来没被引进产物`)
  }
}

/**
 * 覆盖关系：主题要压住 VitePress 默认主题，靠的是「未分层 + 排在后面」。
 * 这里**不能**用 @layer 相关断言——主题刻意不进层；一旦有人把它塞进层里，
 * VitePress 未分层的 vars.css 会反压主题（这正是被改坏过一次的原因）。
 * 所以断言两件事：主题的标志规则排在 VitePress 的 :root 变量之后；
 * 产物里不出现包住主题的 fluxixix-* 命名层。
 */
if (/@layer\s+fluxixix-/.test(css)) {
  errors.push(
    '产物 CSS 里出现了 @layer fluxixix-*：主题必须保持未分层，' +
      '否则 VitePress 未分层的默认主题会反压主题'
  )
}
const themeBrandAt = css.indexOf('--fx-brand-a')
const vpVarsAt = css.indexOf('--vp-c-indigo-1')
if (vpVarsAt !== -1 && themeBrandAt !== -1 && themeBrandAt < vpVarsAt) {
  errors.push('主题样式排在 VitePress 默认变量之前：同特异性下会被默认主题压住')
}

if (errors.length) {
  console.error('\n✗ 示例站隔离检查未通过：\n')
  for (const message of errors) console.error(`  - ${message}`)
  process.exit(1)
}

console.log(
  `\n✓ 示例站隔离检查通过：${Object.keys(themedPages).length} 个页面装上主题后` +
    ' DOM 与纯默认主题逐字一致（仅多出刊头/页脚挂载点），' +
    '主题样式未分层且排在默认主题之后'
)

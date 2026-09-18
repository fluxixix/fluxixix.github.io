#!/usr/bin/env node
/**
 * 主题样式的"层"约定检查。
 *
 * 背景（这条曾经真的把站点改坏过，所以留一道闸）：
 *
 *   VitePress 默认主题的 vars.css 与各组件 <style scoped> 都是**未分层**的，
 *   而没有进 @layer 的规则永远胜过任何命名层。早先的版本把主题样式收进了
 *   @layer，结果默认主题反过来盖住主题——品牌色、悬浮导航胶囊、阅读进度环、
 *   作品卡尺寸全部失守。
 *
 * 所以约定是：主题样式保持未分层，靠"排在默认主题之后"取胜。具体两条：
 *
 *   1. 主题包里的样式文件不得出现 @layer。
 *   2. styles/index.css 必须把每个分册都引进来（不许有孤儿文件），
 *      且这个总表要由使用方的样式文件引进去、写在使用方自己的规则之前。
 *
 * 构建产物的真实层叠顺序由站点仓库的 scripts/check-rendered-parity.mjs 用无头
 * 浏览器实测（比读源码可靠得多），这里只挡住源码层面的退化。
 *
 * 脚本随主题包走，两种布局都能跑，而且**能找到几个宿主站就检查几个**：
 *   主题独立仓库（包在仓库根）  → 宿主站只有 examples/native-demo
 *   主站 monorepo（包在 packages/ 下）→ 宿主站是仓库根的主站 + 包里的演示站
 *
 *   node scripts/check-theme-layers.mjs
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const stylesDir = join(pkgRoot, 'src', 'styles')
const indexFile = join(stylesDir, 'index.css')

/** 注释与字符串字面量不参与判断，但保留内容（要校验 @import 的目标路径） */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, ' ')
}

const errors = []
const allFiles = readdirSync(stylesDir).filter((n) => n.endsWith('.css')).sort()
const indexCss = stripComments(readFileSync(indexFile, 'utf8'))

/* ---------- 1. 分包文件里不许出现 @layer ---------- */

for (const file of allFiles) {
  const css = stripComments(readFileSync(join(stylesDir, file), 'utf8'))
  const at = css.search(/@layer\b/)
  if (at !== -1) {
    const line = css.slice(0, at).split('\n').length
    errors.push(
      `styles/${file}:${line} 出现了 @layer。主题样式必须保持未分层——` +
        '分层会让 VitePress 未分层的默认主题反压主题（品牌色、导航胶囊、进度环都会失效）'
    )
  }
}

/* ---------- 2. 总表（index.css）必须恰好覆盖所有分册，且只做 @import ---------- */

const imported = new Set(['index.css'])
for (const line of indexCss.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('@import')) {
    if (trimmed.startsWith('@import')) {
      const m = trimmed.match(/^@import\s+(?:url\(\s*)?['"]?\.\/([\w.-]+\.css)['"]?/)
      if (!m) {
        errors.push(`styles/index.css 里这条 @import 写法不认识：${trimmed}`)
      } else {
        imported.add(m[1])
        if (!allFiles.includes(m[1])) {
          errors.push(`styles/index.css 引用了不存在的样式文件 ${m[1]}`)
        }
      }
    }
    continue
  }
  errors.push(
    `styles/index.css 里除了 @import 不该有别的内容（这样使用方才能决定它排在哪）：${trimmed.slice(0, 60)}`
  )
}

for (const file of allFiles) {
  if (!imported.has(file)) {
    errors.push(
      `styles/${file} 没有被 index.css 引用：它不会进产物。` +
        '（若确实弃用，请删除文件而不是留着不管）'
    )
  }
}

/* ---------- 3. 宿主站侧：主题样式要排在默认主题之后 ---------- */

/**
 * 宿主站候选：包里的演示站，以及 monorepo 里仓库根的主站。
 * 谁存在就检查谁——主站是"主题被用到极致"的样子，演示站是"普通博客"的样子，
 * 两者的入口写法不同（一次导入 / 两次导入），都值得盯。
 */
const siteRoots = [join(pkgRoot, 'examples', 'native-demo'), join(pkgRoot, '..', '..')].filter(
  (dir) => existsSync(join(dir, '.vitepress', 'theme', 'index.ts'))
)

if (!siteRoots.length) {
  errors.push('找不到任何宿主站：既没有 examples/native-demo，也没有仓库根的 .vitepress')
}

const checked = []

for (const siteRoot of siteRoots) {
  const siteLabel = relative(process.cwd(), siteRoot) || '.'
  const entrySrc = readFileSync(join(siteRoot, '.vitepress', 'theme', 'index.ts'), 'utf8')
  const importsPackageEntry = /from\s+['"]vitepress-theme-fluxixix\/theme['"]/.test(entrySrc)
  const importsCssDirectly = /vitepress-theme-fluxixix\/styles\/index\.css/.test(entrySrc)

  if (!importsPackageEntry && !importsCssDirectly) {
    errors.push(`${siteLabel}/.vitepress/theme/index.ts 没有引主题样式：站点页面上不会有主题样式`)
  }

  /**
   * 最硬的证据：产物里主题的令牌必须排在 VitePress 的默认变量之后。
   * 顺序反了就是被默认主题反压（品牌色 / 导航胶囊 / 进度环 / 作品卡同时失效），
   * 而且这种情况不报任何错，只能靠断言挡。
   */
  const distAssets = join(siteRoot, '.vitepress', 'dist', 'assets')
  let productChecked = false

  if (existsSync(distAssets)) {
    for (const bundle of readdirSync(distAssets).filter((n) => n.endsWith('.css'))) {
      const css = readFileSync(join(distAssets, bundle), 'utf8')
      const themeAt = css.indexOf('--fx-brand-a:')
      const vpAt = css.indexOf('--vp-c-indigo-1')
      if (themeAt === -1 || vpAt === -1) continue
      productChecked = true
      if (themeAt < vpAt) {
        errors.push(
          `${siteLabel}/.vitepress/dist/assets/${bundle}：主题令牌排在第 ${themeAt} 字节、` +
            `VitePress 默认变量在第 ${vpAt} 字节 —— 主题在前就会被默认主题反压。` +
            '检查主题入口里主题样式与主题本体的引入顺序'
        )
      }
      if (/@layer\s+fluxixix-/.test(css)) {
        errors.push(
          `${siteLabel}/.vitepress/dist/assets/${bundle}：出现 @layer fluxixix-*，` +
            '主题必须保持未分层（未分层的默认主题会反压命名层里的主题）'
        )
      }
    }
  }

  checked.push({ siteLabel, importsPackageEntry, productChecked })
}

if (errors.length) {
  console.error('✗ 主题样式层约定检查未通过：\n')
  for (const m of errors) console.error(`  - ${m}`)
  process.exit(1)
}

const summary = checked
  .map(
    (site) =>
      `${site.siteLabel}（${site.importsPackageEntry ? '经 /theme 引入，顺序由包保证' : '直接引入样式总表'}` +
      `${site.productChecked ? '，产物顺序正确' : '，产物还没构建'}）`
  )
  .join('；')

console.log(
  `✓ 层约定检查通过：${allFiles.length} 个样式文件都未分层；总表覆盖全部文件；` +
    `宿主站 ${checked.length} 个：${summary}`
)

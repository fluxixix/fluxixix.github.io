#!/usr/bin/env node
/**
 * 打包冒烟：证明"把这个包从 GitHub 装下来"真的能建站。
 *
 * 为什么必须单独测这一条 —— 仓库里的演示站是 workspace / file: 链接，走的是
 * **符号链接**；而外部用户装下来是 node_modules 里的**真目录**，两者差别恰恰
 * 决定成不成：
 *
 *   · Vite 的配置加载器（bundleConfigFile 里的 externalize-deps）把裸导入一律
 *     标成 external，于是 .vitepress/config.mts 里的 `vitepress-theme-fluxixix/site`
 *     被留到运行时交给 Node 加载；
 *   · 而 Node 的类型剥离明确跳过 node_modules 里的文件 —— 只要入口指向 .ts，
 *     真实安装下就抛 ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING。
 *
 * 这条规则曾经让"包在自己仓库里好好的、别人装上就构建失败"。所以本脚本用
 * npm pack 出的 tgz 解成一个真目录来构建，任何指向 .ts 的 config 侧入口都会
 * 在这里当场炸掉。
 *
 * 做四件事：
 *   1. npm pack（独立缓存目录，绕开本机 ~/.npm 可能存在的属主问题）
 *   2. 把 tgz 解到临时站点 node_modules/vitepress-theme-fluxixix（真目录，不是链接）
 *   3. 其余依赖（vitepress / vue 及传递依赖）从本仓库 node_modules 符号链接过去
 *      —— 只有被测包必须是真目录，其余用什么形式都测不出差别，这样不用联网
 *   4. 写一个最小站点（config 引 /site 与 /rss，theme 引 /theme），跑构建并断言：
 *      退出码 0、产物里有 `--fx-brand-a:` 且排在 `--vp-c-indigo-1` 之后、
 *      feed.xml 生成、页面上有主题外壳
 *
 *   node scripts/check-pack-smoke.mjs
 *   FX_KEEP_SMOKE=1 node scripts/check-pack-smoke.mjs   # 保留临时目录以便排查
 */
import { existsSync, readFileSync, readdirSync, symlinkSync } from 'node:fs'
import { mkdir, mkdtemp, rename, rm, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const THEME = 'vitepress-theme-fluxixix'
const PKG_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

function fail(message, detail = '') {
  console.error(`\n✗ 打包冒烟失败：${message}\n`)
  if (detail) console.error(detail.trimEnd() + '\n')
  process.exit(1)
}

/** 从包目录往上找 node_modules：monorepo 里在仓库根，独立仓库里就在包旁边 */
function findNodeModules(start) {
  let dir = start
  while (true) {
    const candidate = path.join(dir, 'node_modules')
    if (existsSync(candidate)) return candidate
    const parent = path.dirname(dir)
    if (parent === dir) return null
    dir = parent
  }
}

function run(command, args, options) {
  return spawnSync(command, args, { encoding: 'utf8', ...options })
}

const MINIMAL_CONFIG = `import { defineConfig } from 'vitepress'
import { fluxixixSite } from 'vitepress-theme-fluxixix/site'
import { rss } from 'vitepress-theme-fluxixix/rss'

// 这两个入口由 Vite 的配置加载器打包、由 Node 在运行时加载：
// 指向 .ts 的实现会在真实安装下抛 ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING
export default defineConfig({
  title: 'smoke',
  themeConfig: fluxixixSite({ nav: [{ text: '首页', link: '/' }] }),
  buildEnd: rss({ siteUrl: 'https://example.com' })
})
`

const MINIMAL_THEME = `import theme from 'vitepress-theme-fluxixix/theme'

export default theme
`

async function main() {
  const repoNodeModules = findNodeModules(PKG_ROOT)
  if (!repoNodeModules) fail(`找不到 node_modules（从 ${PKG_ROOT} 往上找）`, '先在仓库根跑一次 npm install')

  const work = await mkdtemp(path.join(tmpdir(), 'fx-pack-smoke-'))
  const packDir = path.join(work, 'pack')
  const cacheDir = path.join(work, 'npm-cache')
  const siteDir = path.join(work, 'site')
  const siteModules = path.join(siteDir, 'node_modules')
  const extractDir = path.join(work, 'extract')

  try {
    await mkdir(packDir, { recursive: true })
    await mkdir(cacheDir, { recursive: true })
    await mkdir(siteModules, { recursive: true })
    await mkdir(extractDir, { recursive: true })

    /* ---------- 1. 打包 ---------- */

    console.log('· npm pack')
    const packed = run(
      'npm',
      ['pack', '--json', '--pack-destination', packDir, '--cache', cacheDir],
      { cwd: PKG_ROOT }
    )
    if (packed.status !== 0) fail('npm pack 没跑成功', packed.stderr)

    const report = JSON.parse(packed.stdout)
    const result = Array.isArray(report) ? report[0] : Object.values(report)[0]
    const tgz = path.join(packDir, result.filename)

    /* ---------- 2. tgz 解成真目录：这是本脚本的全部意义 ---------- */

    const untar = run('tar', ['-xzf', tgz, '-C', extractDir])
    if (untar.status !== 0) fail('tar 解包失败', untar.stderr)
    await rename(path.join(extractDir, 'package'), path.join(siteModules, THEME))

    /* ---------- 3. 其余依赖符号链接过去 ---------- */

    for (const entry of readdirSync(repoNodeModules)) {
      if (entry === THEME) continue
      symlinkSync(path.join(repoNodeModules, entry), path.join(siteModules, entry), 'dir')
    }

    /* ---------- 4. 最小站点 ---------- */

    await writeFile(
      path.join(siteDir, 'package.json'),
      `${JSON.stringify({ name: 'smoke-site', private: true, type: 'module' }, null, 2)}\n`
    )
    await writeFile(path.join(siteDir, 'index.md'), '# 冒烟站\n\n主题装得上，站建得出来。\n')
    await mkdir(path.join(siteDir, '.vitepress', 'theme'), { recursive: true })
    await writeFile(path.join(siteDir, '.vitepress', 'config.mts'), MINIMAL_CONFIG)
    await writeFile(path.join(siteDir, '.vitepress', 'theme', 'index.ts'), MINIMAL_THEME)

    /* ---------- 5. 构建与断言 ---------- */

    console.log('· vitepress build（用解出来的真目录）')
    const vitepressBin = path.join(repoNodeModules, 'vitepress', 'bin', 'vitepress.js')
    if (!existsSync(vitepressBin)) fail(`找不到 ${vitepressBin}`)

    const build = run(process.execPath, [vitepressBin, 'build'], { cwd: siteDir })
    if (build.status !== 0) {
      fail('真实安装下构建失败（多半又是某个入口指向了 .ts）', `${build.stdout}\n${build.stderr}`)
    }

    const dist = path.join(siteDir, '.vitepress', 'dist')
    if (!existsSync(path.join(dist, 'feed.xml'))) {
      fail('产物里没有 feed.xml：buildEnd 的 rss() 入口没跑起来')
    }

    const assets = path.join(dist, 'assets')
    const bundles = readdirSync(assets).filter((name) => name.endsWith('.css'))
    const css = bundles.map((name) => readFileSync(path.join(assets, name), 'utf8')).join('\n')
    const themeAt = css.indexOf('--fx-brand-a:')
    const vpAt = css.indexOf('--vp-c-indigo-1')
    if (themeAt === -1) fail('产物 CSS 里没有主题令牌 --fx-brand-a：主题样式没被引进产物')
    if (vpAt !== -1 && themeAt < vpAt) {
      fail('主题令牌排在 VitePress 默认变量之前：会被默认主题反压')
    }

    const html = readFileSync(path.join(dist, 'index.html'), 'utf8')
    if (!html.includes('site-footer')) fail('页面上没有主题外壳 .site-footer：主题没生效')

    console.log(
      `\n✓ 打包冒烟通过：${result.filename} 解成真目录后能建站 —— ` +
        'config 侧两个入口（/site、/rss）与主题入口（/theme）在真实安装下都可用，' +
        '主题样式进了产物且排在默认主题之后'
    )
  } finally {
    if (process.env.FX_KEEP_SMOKE) console.log(`\n· 保留临时目录：${work}`)
    else await rm(work, { recursive: true, force: true })
  }
}

main().catch((error) => fail(error?.stack ?? String(error)))

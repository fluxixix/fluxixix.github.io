#!/usr/bin/env node
/**
 * fluxixix-theme —— 主题自带的脚手架，只有一个 init 命令：把 template/ 拷到目标
 * 目录，按参数把站点信息写进去，可选地跑一遍 npm install。
 *
 * 为什么把它塞在主题包里而不是单独发一个 create-* 包：
 * 包是从 GitHub 装的（不走 npm registry），`npx github:<repo>` 要求包里自带 bin。
 * 放在一个包里就只维护一条发布链路，也省掉第二个包名。
 *
 *   npx github:fluxixix/vitepress-theme-fluxixix init my-blog
 *
 * 零运行时依赖：只用 node: 内置模块。
 */
import { cp, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const PKG_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const TEMPLATE_DIR = path.join(PKG_ROOT, 'template')
const REPO = 'fluxixix/vitepress-theme-fluxixix'

/** 只有这些扩展名的文件里会做占位符替换，其余按字节原样拷贝 */
const TEXT_EXTENSIONS = new Set(['.md', '.ts', '.mts', '.mjs', '.js', '.json', '.css', '.yml', '.yaml'])

/** 模板里不参与拷贝的目录：装出来的东西和构建产物 */
const SKIP_DIRS = new Set(['node_modules', 'cache', 'dist'])

/**
 * 拷贝时改回真名。npm 打包永远排除 .gitignore（npm-packlist 的固定规则），
 * 所以模板里只能叫 gitignore，装到用户目录时再改回 .gitignore。
 */
const RENAME = { gitignore: '.gitignore' }

const HELP = `fluxixix-theme —— vitepress-theme-fluxixix 的起站脚手架

用法
  fluxixix-theme init [目录] [选项]

选项
  --name <站名>       写进主题参数的站点名，默认取目录名
  --tagline <标语>    首页刊头右上角的标语，默认留一个占位文案
  --statement <短句>  首页刊头那行大号衬线短句，默认与 --tagline 相同
  --url <站点地址>    RSS 需要的绝对地址，默认 https://example.com
  --ref <git ref>     主题依赖钉在哪个 tag/分支/commit，默认本包版本对应的 vX.Y.Z
  --no-install        只生成文件，不跑 npm install
  --force             目标目录非空时也照样写入
  -h, --help          看这段
  -v, --version       看版本

例子
  npx github:${REPO} init my-blog
  npx github:${REPO} init my-blog --name 我的博客 --url https://example.com --no-install
`

function parseArgs(argv) {
  const options = { install: true, force: false, ref: '' }
  const rest = []

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    const take = (key) => {
      const inline = arg.startsWith(`${key}=`)
      const value = inline ? arg.slice(key.length + 1) : argv[++i]
      if (!value) fail(`选项 ${key} 缺一个值`)
      return value
    }
    if (arg === '-h' || arg === '--help') options.help = true
    else if (arg === '-v' || arg === '--version') options.version = true
    else if (arg === '--no-install') options.install = false
    else if (arg === '--install') options.install = true
    else if (arg === '--force') options.force = true
    else if (arg.startsWith('--name')) options.name = take('--name')
    else if (arg.startsWith('--tagline')) options.tagline = take('--tagline')
    else if (arg.startsWith('--statement')) options.statement = take('--statement')
    else if (arg.startsWith('--url')) options.url = take('--url')
    else if (arg.startsWith('--ref')) options.ref = take('--ref')
    else if (arg.startsWith('-')) fail(`不认识的选项 ${arg}（试试 --help）`)
    else rest.push(arg)
  }

  return { options, rest }
}

function fail(message) {
  console.error(`\n✗ ${message}\n`)
  process.exit(1)
}

async function readPackage() {
  return JSON.parse(await readFile(path.join(PKG_ROOT, 'package.json'), 'utf8'))
}

/**
 * 主题依赖写成 github: 形式 —— 这个包不在 npm registry 上，
 * 只有 git tag 能表达版本。ref 默认取本包版本，所以从 main 跑也不会写错版本。
 */
function themeSpec(pkg, ref) {
  return `github:${REPO}#${ref || `v${pkg.version}`}`
}

async function copyTemplate(from, to, values) {
  await mkdir(to, { recursive: true })

  for (const entry of await readdir(from, { withFileTypes: true })) {
    if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue
    const source = path.join(from, entry.name)
    const target = path.join(to, RENAME[entry.name] ?? entry.name)

    if (entry.isDirectory()) {
      await copyTemplate(source, target, values)
      continue
    }

    if (TEXT_EXTENSIONS.has(path.extname(entry.name))) {
      let text = await readFile(source, 'utf8')
      for (const [key, value] of Object.entries(values)) {
        text = text.split(key).join(value)
      }
      await writeFile(target, text)
    } else {
      await cp(source, target)
    }
  }
}

function run(command, args, cwd) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd, stdio: 'inherit' })
    child.on('error', () => resolve(false))
    child.on('close', (code) => resolve(code === 0))
  })
}

async function isEmptyDir(dir) {
  if (!existsSync(dir)) return true
  const info = await stat(dir)
  if (!info.isDirectory()) fail(`${dir} 已经存在，而且不是目录`)
  return (await readdir(dir)).length === 0
}

async function main() {
  const { options, rest } = parseArgs(process.argv.slice(2))
  const pkg = await readPackage()

  if (options.version) {
    console.log(pkg.version)
    return
  }
  if (options.help || rest[0] !== 'init') {
    console.log(HELP)
    // 没给命令是"看帮助"，给了别的命令是"用错了"
    if (rest.length && rest[0] !== 'help') process.exitCode = 1
    return
  }

  const targetArg = rest[1] ?? '.'
  const target = path.resolve(process.cwd(), targetArg)
  const name = options.name ?? path.basename(target)
  const tagline = options.tagline ?? '一句话标语'

  if (!options.force && !(await isEmptyDir(target))) {
    fail(`${target} 不是空目录。要么换个目录，要么加 --force`)
  }

  const values = {
    __SITE_NAME__: name,
    __SITE_TAGLINE__: tagline,
    __SITE_STATEMENT__: options.statement ?? tagline,
    __SITE_URL__: options.url ?? 'https://example.com',
    __THEME_SPEC__: themeSpec(pkg, options.ref)
  }

  // 目标不在当前目录下时，相对路径会是一长串 ../../，直接给绝对路径更好读
  const rel = path.relative(process.cwd(), target)
  const cdTarget = rel.startsWith('..') ? target : rel || '.'

  await copyTemplate(TEMPLATE_DIR, target, values)
  console.log(`\n✓ 已生成站点骨架：${target}`)
  console.log(`  主题依赖：${values.__THEME_SPEC__}`)

  if (!options.install) {
    console.log('\n下一步（已跳过安装）：')
    console.log(`  cd ${cdTarget} && npm install && npm run dev`)
    return
  }

  console.log('\n· 正在安装依赖（npm install）…')
  const ok = await run('npm', ['install'], target)
  console.log(
    ok
      ? `\n✓ 装好了。下一步：\n  cd ${cdTarget} && npm run dev`
      : '\n! npm install 没跑成功，进目录自己跑一次：npm install'
  )
  if (!ok) process.exitCode = 1
}

main().catch((error) => fail(error?.stack ?? String(error)))

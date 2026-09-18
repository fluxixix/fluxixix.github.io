/**
 * 构建期生成 RSS feed 的 buildEnd 钩子。
 *
 * 为什么这份实现是 .js 而不是 .ts（别顺手改回去）：
 * 这个入口由**站点的 .vitepress/config.mts** 引入，也就是由 Vite 的配置加载器
 * 打包，而它把裸导入一律标成 external（见 vite 的 bundleConfigFile /
 * externalize-deps），运行时由 Node 直接加载。Node 的类型剥离明确跳过
 * node_modules 里的文件，所以包一旦被真实安装（不是 workspace 符号链接），
 * 指向 .ts 的入口会直接抛 ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING。
 * 类型由旁边的 rss.d.ts 提供，与本文件一一对应。
 */
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const DEFAULT_FEED_FILE = 'feed.xml'
const DEFAULT_POST_DIR = 'posts'
const DEFAULT_LANGUAGE = 'zh-CN'
const DEFAULT_MAX_ITEMS = 20

/**
 * 只读取约定使用的 title / date / description 三个字段，
 * 避免为构建脚本额外引入 frontmatter 解析依赖。
 */
function readFrontmatter(source) {
  const block = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!block) return {}

  const fields = {}
  for (const line of block[1].split(/\r?\n/)) {
    const pair = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/)
    if (!pair || !pair[2]) continue
    fields[pair[1]] = pair[2].trim().replace(/^['"]|['"]$/g, '')
  }
  return fields
}

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** 递归收集 posts/ 下的文章，子目录同样计入；index.md 属于列表页，排除 */
async function collectMarkdownFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => [])
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await collectMarkdownFiles(fullPath)))
    } else if (entry.name.endsWith('.md') && entry.name !== 'index.md') {
      files.push(fullPath)
    }
  }

  return files
}

async function collectItems(srcDir, siteUrl, postDir, maxItems) {
  const files = await collectMarkdownFiles(path.join(srcDir, postDir))
  const items = []

  for (const file of files) {
    const fields = readFrontmatter(await readFile(file, 'utf-8'))
    const date = new Date(fields.date)
    if (Number.isNaN(date.getTime())) continue

    // 统一取当天中午，避免时区让日期前后跳一天
    date.setUTCHours(12)
    const slug = path.relative(srcDir, file).replace(/\.md$/, '')

    items.push({
      title: fields.title || slug,
      link: `${siteUrl}/${slug}.html`,
      date,
      description: fields.description || ''
    })
  }

  // 日期倒序；同一天时按链接升序，与文章列表页的排序保持一致
  return items
    .sort((a, b) => {
      const diff = b.date.getTime() - a.date.getTime()
      if (diff !== 0) return diff
      return a.link < b.link ? -1 : a.link > b.link ? 1 : 0
    })
    .slice(0, maxItems)
}

function renderFeed(items, channel) {
  const updated = items[0]?.date ?? new Date()
  const entries = items
    .map(
      (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.link}</link>
      <guid isPermaLink="true">${item.link}</guid>
      <pubDate>${item.date.toUTCString()}</pubDate>
      <description>${escapeXml(item.description)}</description>
    </item>`
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(channel.title)}</title>
    <link>${channel.siteUrl}/</link>
    <description>${escapeXml(channel.description)}</description>
    <language>${channel.language}</language>
    <lastBuildDate>${updated.toUTCString()}</lastBuildDate>
    <atom:link href="${channel.siteUrl}/${channel.feedFile}" rel="self" type="application/rss+xml" />
${entries}
  </channel>
</rss>
`
}

/**
 * 生成 buildEnd 钩子：构建结束后把 RSS feed 写进产物目录，随站点一起发布，
 * 无需额外插件。默认值等于 fluxixix 本站的约定，换站只需传 siteUrl。
 *
 *   buildEnd: rss({ siteUrl: 'https://example.com' })
 */
export function rss(options) {
  const feedFile = options.feedFile ?? DEFAULT_FEED_FILE
  const postDir = options.postDir ?? DEFAULT_POST_DIR
  const maxItems = options.maxItems ?? DEFAULT_MAX_ITEMS

  return async (siteConfig) => {
    const channel = {
      siteUrl: options.siteUrl.replace(/\/$/, ''),
      feedFile,
      title: options.title ?? siteConfig.site.title,
      description: options.description ?? siteConfig.site.description ?? '',
      language: options.language ?? DEFAULT_LANGUAGE
    }

    const items = await collectItems(
      siteConfig.srcDir,
      channel.siteUrl,
      postDir,
      maxItems
    )
    await writeFile(path.join(siteConfig.outDir, feedFile), renderFeed(items, channel), 'utf-8')
    siteConfig.logger.info(`generated ${feedFile} with ${items.length} item(s)`)
  }
}

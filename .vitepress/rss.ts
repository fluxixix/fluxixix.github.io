import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { SiteConfig } from 'vitepress'

/** 站点线上地址，用于生成绝对链接（RSS 规范要求绝对 URL） */
const SITE_URL = 'https://fluxixix.github.io'
const FEED_FILE = 'feed.xml'
const MAX_ITEMS = 20

interface FeedItem {
  title: string
  link: string
  date: Date
  description: string
}

/**
 * 只读取约定使用的 title / date / description 三个字段，
 * 避免为构建脚本额外引入 frontmatter 解析依赖。
 */
function readFrontmatter(source: string): Record<string, string> {
  const block = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!block) return {}

  const fields: Record<string, string> = {}
  for (const line of block[1].split(/\r?\n/)) {
    const pair = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/)
    if (!pair || !pair[2]) continue
    fields[pair[1]] = pair[2].trim().replace(/^['"]|['"]$/g, '')
  }
  return fields
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** 递归收集 posts/ 下的文章，子目录同样计入；index.md 属于列表页，排除 */
async function collectMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => [])
  const files: string[] = []

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

async function collectItems(srcDir: string): Promise<FeedItem[]> {
  const files = await collectMarkdownFiles(path.join(srcDir, 'posts'))
  const items: FeedItem[] = []

  for (const file of files) {
    const fields = readFrontmatter(await readFile(file, 'utf-8'))
    const date = new Date(fields.date)
    if (Number.isNaN(date.getTime())) continue

    // 统一取当天中午，避免时区让日期前后跳一天
    date.setUTCHours(12)
    const slug = path.relative(srcDir, file).replace(/\.md$/, '')

    items.push({
      title: fields.title || slug,
      link: `${SITE_URL}/${slug}.html`,
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
    .slice(0, MAX_ITEMS)
}

function renderFeed(items: FeedItem[]): string {
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
    <title>fluxixix</title>
    <link>${SITE_URL}/</link>
    <description>less is more</description>
    <language>zh-CN</language>
    <lastBuildDate>${updated.toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/${FEED_FILE}" rel="self" type="application/rss+xml" />
${entries}
  </channel>
</rss>
`
}

/** 构建结束后生成 RSS feed，产物直接随站点发布，无需额外插件 */
export async function generateRssFeed(siteConfig: SiteConfig): Promise<void> {
  const items = await collectItems(siteConfig.srcDir)
  await writeFile(path.join(siteConfig.outDir, FEED_FILE), renderFeed(items), 'utf-8')
  siteConfig.logger.info(`generated ${FEED_FILE} with ${items.length} item(s)`)
}

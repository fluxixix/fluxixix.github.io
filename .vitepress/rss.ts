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

async function collectItems(srcDir: string): Promise<FeedItem[]> {
  const postsDir = path.join(srcDir, 'posts')
  const entries = await readdir(postsDir).catch(() => [] as string[])
  const items: FeedItem[] = []

  for (const entry of entries) {
    if (!entry.endsWith('.md') || entry === 'index.md') continue

    const fields = readFrontmatter(await readFile(path.join(postsDir, entry), 'utf-8'))
    const date = new Date(fields.date)
    if (Number.isNaN(date.getTime())) continue

    // 统一取当天中午，避免时区让日期前后跳一天
    date.setUTCHours(12)
    const slug = entry.replace(/\.md$/, '')

    items.push({
      title: fields.title || slug,
      link: `${SITE_URL}/posts/${slug}.html`,
      date,
      description: fields.description || ''
    })
  }

  return items.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, MAX_ITEMS)
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

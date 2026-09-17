import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { SiteConfig } from 'vitepress'

/** 生成 RSS 需要的站点信息。除 siteUrl 外都给了与 fluxixix 本站一致的默认值 */
export interface RssOptions {
  /** 站点线上地址（RSS 规范要求绝对 URL），必填 */
  siteUrl: string
  /** feed 文件名，默认 feed.xml */
  feedFile?: string
  /** 文章目录（相对 srcDir），默认 posts */
  postDir?: string
  /** 频道标题，默认取 VitePress 的 site.title */
  title?: string
  /** 频道描述，默认取 VitePress 的 site.description */
  description?: string
  /** 站点语言，默认 zh-CN */
  language?: string
  /** 最多收录几篇，默认 20 */
  maxItems?: number
}

const DEFAULT_FEED_FILE = 'feed.xml'
const DEFAULT_POST_DIR = 'posts'
const DEFAULT_LANGUAGE = 'zh-CN'
const DEFAULT_MAX_ITEMS = 20

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

async function collectItems(
  srcDir: string,
  siteUrl: string,
  postDir: string,
  maxItems: number
): Promise<FeedItem[]> {
  const files = await collectMarkdownFiles(path.join(srcDir, postDir))
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

interface RssChannel {
  siteUrl: string
  feedFile: string
  title: string
  description: string
  language: string
}

function renderFeed(items: FeedItem[], channel: RssChannel): string {
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
export function rss(options: RssOptions) {
  const feedFile = options.feedFile ?? DEFAULT_FEED_FILE
  const postDir = options.postDir ?? DEFAULT_POST_DIR
  const maxItems = options.maxItems ?? DEFAULT_MAX_ITEMS

  return async (siteConfig: SiteConfig): Promise<void> => {
    const channel: RssChannel = {
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

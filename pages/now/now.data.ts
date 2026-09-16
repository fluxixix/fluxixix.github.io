import { createContentLoader } from 'vitepress'

export interface NowSection {
  /** h2 原文，例如「在做」「在读 / 在看」 */
  head: string
  /** 该板块的条目（已剥掉 markdown 修饰），索引页只取前两条 */
  items: string[]
}

export interface NowEntry {
  month: string
  title: string
  line: string
  url: string
  sections: NowSection[]
}

declare const data: NowEntry[]
export { data }

/** 合法月份：YYYY-MM。用它挡住手写的月份笔误 */
const MONTH_RE = /^\d{4}-\d{2}$/

/** 剥掉条目里的 markdown 修饰：粗体、行内代码、链接只留文字 */
function stripMd(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim()
}

/**
 * 从一期 Markdown 里抽出 h2 板块和每个板块的**顶层**条目。
 * 缩进的子条目不单独收：顶层条目带子项时（「今年在做的项目：」）自身只是个引子，
 * 预览里把它和子项混排会变成一句话拼接，宁可只展示独立条目。
 */
function parseSections(raw: string): NowSection[] {
  const sections: NowSection[] = []
  let current: NowSection | null = null

  for (const line of raw.split('\n')) {
    const h2 = line.match(/^##\s+(.+?)\s*$/)
    if (h2) {
      current = { head: h2[1].trim(), items: [] }
      sections.push(current)
      continue
    }
    const item = line.match(/^-\s+(.+)$/)
    if (item && current) {
      const text = stripMd(item[1])
      // 纯引子行（以冒号结尾、明细都在子项里）不进预览
      if (text && !/[：:]$/.test(text)) current.items.push(text)
    }
  }
  return sections
}

export default createContentLoader('pages/now/**/*.md', {
  // includeSrc 让 transform 拿到原始 Markdown（ContentData.src），
  // 才能自己解析 h2 板块；默认只给渲染后的 html 和 frontmatter
  includeSrc: true,
  transform(raw): NowEntry[] {
    return raw
      .map((page) => {
        const month = String(page.frontmatter.month ?? '')
        if (!MONTH_RE.test(month)) {
          // 手误不该炸掉整次构建：跳过这一期并留下线索
          console.warn(`[now] 跳过 ${page.url}：frontmatter 的 month 必须是 YYYY-MM`)
          return null
        }
        // 复制上一期改文件名时最容易忘记改 month，那会让索引里出现两行同月、
        // 「当前」标记落在哪一行还取决于扫描顺序——这里只提醒，仍以 frontmatter 为准
        // （loader 的返回数据里没有 relativePath，所以从 url 反推文件名里的月份）
        const fromUrl = page.url.match(/(\d{4}-\d{2})\.html$/)?.[1]
        if (fromUrl && fromUrl !== month) {
          console.warn(
            `[now] ${page.url}：month（${month}）与文件名（${fromUrl}）不一致，以 frontmatter 为准`
          )
        }
        return {
          month,
          title: page.frontmatter.title ?? `${month.slice(0, 4)} 年 ${Number(month.slice(5))} 月`,
          line: page.frontmatter.line ?? '',
          // createContentLoader 已经套用 rewrites，这里拿到的是 /now/2026-09.html
          url: page.url,
          sections: parseSections(page.src ?? '')
        }
      })
      .filter((entry): entry is NowEntry => entry !== null)
      // 月份倒序；YYYY-MM 是字符串可直接比较，也避开了解析成 Date 的时区问题
      .sort((a, b) => (a.month < b.month ? 1 : a.month > b.month ? -1 : 0))
  }
})

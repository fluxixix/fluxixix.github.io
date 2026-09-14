import { createContentLoader } from 'vitepress'

export interface NowEntry {
  month: string
  title: string
  line: string
  url: string
}

declare const data: NowEntry[]
export { data }

/** 合法月份：YYYY-MM。用它挡住手写的月份笔误 */
const MONTH_RE = /^\d{4}-\d{2}$/

export default createContentLoader('pages/now/**/*.md', {
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
          url: page.url
        }
      })
      .filter((entry): entry is NowEntry => entry !== null)
      // 月份倒序；YYYY-MM 是字符串可直接比较，也避开了解析成 Date 的时区问题
      .sort((a, b) => (a.month < b.month ? 1 : a.month > b.month ? -1 : 0))
  }
})

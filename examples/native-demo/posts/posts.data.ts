import { createContentLoader } from 'vitepress'

/**
 * 文章列表的数据源。跟本站（fluxixix.github.io）用的是同一套约定：
 * 帖子放在 posts/ 下，frontmatter 只认 title / date / description 三个字段。
 * 主题不要求这个结构——这是"内容侧"的约定，示例站只是照着摆一份给人看。
 */
export interface Post {
  title: string
  url: string
  date: string
  description: string
}

declare const data: Post[]
export { data }

export default createContentLoader('posts/**/*.md', {
  transform(raw): Post[] {
    return raw
      // 列表页自己不进列表
      .filter((page) => page.url.replace(/\.html$/, '') !== '/posts/')
      .map((page) => ({
        title: page.frontmatter.title ?? page.url,
        url: page.url,
        date: formatDate(page.frontmatter.date),
        description: page.frontmatter.description ?? ''
      }))
      .sort(comparePosts)
  }
})

/** 日期倒序；同一天按 URL 升序，免得顺序跟着文件扫描顺序变 */
function comparePosts(a: Post, b: Post): number {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1
  return a.url < b.url ? -1 : a.url > b.url ? 1 : 0
}

function formatDate(raw: unknown): string {
  if (!raw) return ''
  const date = new Date(raw as string)
  date.setUTCHours(12)
  return date.toISOString().slice(0, 10)
}

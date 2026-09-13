import { createContentLoader } from 'vitepress'

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
      // 排除文章列表页自身
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

/** 日期倒序；同一天时按 URL 升序，避免顺序取决于构建时的文件扫描顺序 */
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

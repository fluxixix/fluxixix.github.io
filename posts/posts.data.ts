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
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  }
})

function formatDate(raw: unknown): string {
  if (!raw) return ''
  const date = new Date(raw as string)
  date.setUTCHours(12)
  return date.toISOString().slice(0, 10)
}

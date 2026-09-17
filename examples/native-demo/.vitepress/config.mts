import { defineConfig } from 'vitepress'
import { fluxixixSite } from 'vitepress-theme-fluxixix/site'

/**
 * 示例站：装好主题之后的"最小可用博客"。
 *
 * 这里有两条互不相同的约定，别混起来看：
 *
 *   主题侧的约定（由 vitepress-theme-fluxixix 提供）
 *     - 首页 frontmatter 用 layout: home → 渲染首页刊头
 *     - 页面 pageClass 决定吃哪套页面样式（archive / about / works / now-index…）
 *     - frontmatter 写 masthead: true + name/tag/meta → 渲染编辑体页头
 *     - 列表要写成 .post-list / .archive-timeline 那几套 class
 *
 *   内容侧的约定（本仓库自己定的，主题不关心）
 *     - 文章放 posts/ 下，frontmatter 认 title / date / description
 *     - 文章列表页是 posts/index.md，数据由 posts/posts.data.ts 在构建期扫出来
 *     - 独立页面放根目录（about.md / archive.md）
 *
 * 内容全是编的，只为了让访问者看出主题大概长什么样。
 */
export default defineConfig({
  title: 'Flux Demo',
  description: '主题示例站：一份虚构内容的 VitePress 博客',

  themeConfig: fluxixixSite({
    nav: [
      { text: '首页', link: '/' },
      { text: '文章', link: '/posts/' },
      { text: '归档', link: '/archive' },
      { text: '关于', link: '/about' }
    ],

    // 侧边栏只在文章区出现，按目录分组
    sidebar: {
      '/posts/': [
        {
          text: '技术',
          base: '/posts/tech/',
          items: [{ text: 'Markdown 全格式总览', link: 'markdown-showcase' }]
        },
        {
          text: '随笔',
          base: '/posts/notes/',
          items: [{ text: '笔记写给三个月后的自己', link: 'notes-for-future-me' }]
        }
      ]
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/vuejs/vitepress' }]
  })
})

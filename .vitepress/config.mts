import { defineConfig, type HeadConfig } from 'vitepress'
import { fluxixixSite } from 'vitepress-theme-fluxixix/site'
import { rss } from 'vitepress-theme-fluxixix/rss'

// 本地 dev 请求 /_vercel/insights/script.js 会被 SPA 兜底成 HTML 返回，浏览器按 JS
// 解析就会报 "SyntaxError: Unexpected token '<'"。这个脚本只有 Vercel 上有，所以只在
// 构建时注入——VitePress 构建会先把 NODE_ENV 置为 production 再读配置。
// （项目没装 @types/node，process 只能从 globalThis 上取）
const isBuild =
  (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV ===
  'production'

// 站点线上地址：RSS 的绝对链接要用，也是站点身份的单一来源
const SITE_URL = 'https://fluxixix.github.io'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "fluxixix",
  description: "less is more",
  // README 是仓库文档，别当成页面渲染（主题源码已拆到独立仓库，不在本仓库里）
  srcExclude: ['**/README.md'],
  // 独立页面统一放在 pages/ 下，通过 rewrite 去掉 URL 里的目录前缀
  rewrites: {
    'pages/:page': ':page',
    // 月度留档是嵌套目录，上面那条只匹配一段路径，这里单独写一条
    'pages/now/:month': 'now/:month'
  },
  head: [
    // 让阅读器和浏览器能发现 RSS
    ['link', { rel: 'alternate', type: 'application/rss+xml', title: 'fluxixix', href: '/feed.xml' }],
    // Vercel Web Analytics：先声明队列函数，再异步加载统计脚本
    ['script', {}, 'window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); }'],
    ...(isBuild
      ? ([['script', { defer: '', src: '/_vercel/insights/script.js' }]] as HeadConfig[])
      : [])
  ],
  // 构建结束后生成 feed.xml，产物随站点一起发布
  buildEnd: rss({
    siteUrl: SITE_URL,
    title: 'fluxixix',
    description: 'less is more'
  }),
  // fluxixixSite 补上主题自带的界面文案与本地搜索翻译，nav / sidebar 这类内容仍写在下面
  themeConfig: fluxixixSite({
    nav: [
      { text: '首页', link: '/' },
      { text: '文章', link: '/posts/' },
      { text: '作品', link: '/works' },
      { text: '归档', link: '/archive' },
      { text: 'Now', link: '/now' },
      { text: '关于', link: '/about' }
    ],

    // 只在文章区显示侧边栏，按目录分主题；base 用来省掉组内链接的重复前缀
    sidebar: {
      '/posts/': [
        {
          text: '技术',
          base: '/posts/tech/',
          items: [
            { text: '从零搭建个人站', link: 'vitepress-blog-experience' },
            { text: 'dotfiles 操作指南', link: 'dotfiles-setup-guide' },
            // 本站最早的一篇，按日期倒序排在组内末尾
            { text: 'Markdown 全格式总览', link: 'markdown-showcase' }
          ]
        },
        {
          text: '随笔',
          base: '/posts/notes/',
          items: [
            { text: '关于「less is more」', link: 'less-is-more' },
            { text: '笔记是写给未来的自己的', link: 'note-taking' },
            { text: '写下来才算想清楚', link: 'writing' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/fluxixix/fluxixix.github.io', ariaLabel: 'GitHub 仓库' }
    ]
  })
})

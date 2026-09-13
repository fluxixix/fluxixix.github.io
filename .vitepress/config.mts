import { defineConfig, type HeadConfig } from 'vitepress'
import { generateRssFeed } from './rss.ts'

// 本地 dev 请求 /_vercel/insights/script.js 会被 SPA 兜底成 HTML 返回，浏览器按 JS
// 解析就会报 "SyntaxError: Unexpected token '<'"。这个脚本只有 Vercel 上有，所以只在
// 构建时注入——VitePress 构建会先把 NODE_ENV 置为 production 再读配置。
// （项目没装 @types/node，process 只能从 globalThis 上取）
const isBuild =
  (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV ===
  'production'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "fluxixix",
  description: "less is more",
  srcExclude: ['**/README.md'],
  // 独立页面统一放在 pages/ 下，通过 rewrite 去掉 URL 里的目录前缀
  rewrites: {
    'pages/:page': ':page'
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
  buildEnd: generateRssFeed,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '文章', link: '/posts/' },
      { text: '项目', link: '/projects' },
      { text: '归档', link: '/archive' },
      { text: 'Now', link: '/now' },
      { text: '关于', link: '/about' }
    ],

    // 默认主题的界面文案是写死的英文，这几处会显示给读者，单独覆盖
    outline: { label: '本页目录' },
    returnToTopLabel: '回到顶部',
    // 窄屏下打开侧边栏的那个按钮
    sidebarMenuLabel: '菜单',
    // 窄屏菜单里的亮暗主题切换
    darkModeSwitchLabel: '外观',
    docFooter: { prev: '上一篇', next: '下一篇' },

    // 只在文章区显示侧边栏，按目录分主题；base 用来省掉组内链接的重复前缀
    sidebar: {
      '/posts/': [
        {
          text: '技术',
          base: '/posts/tech/',
          items: [
            { text: 'Markdown 全格式示例', link: 'markdown-guide' },
            { text: 'VitePress 使用笔记', link: 'vitepress-notes' },
            { text: 'Git 常用命令速查', link: 'git-cheatsheet' },
            { text: 'CSS 自定义属性入门', link: 'css-variables' },
            { text: '从零搭建个人站（Pages + Vercel）', link: 'vitepress-blog-experience' },
            { text: 'dotfiles 操作指南', link: 'dotfiles-setup-guide' }
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
    ],

    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索', buttonAriaLabel: '搜索' },
          modal: {
            displayDetails: '显示详情',
            resetButtonTitle: '清除搜索',
            backButtonTitle: '返回',
            noResultsText: '没有找到结果',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭'
            }
          }
        }
      }
    }
  }
})

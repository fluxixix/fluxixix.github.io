import { defineConfig } from 'vitepress'
import { generateRssFeed } from './rss.ts'

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
    ['link', { rel: 'alternate', type: 'application/rss+xml', title: 'fluxixix', href: '/feed.xml' }]
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

    // 只在文章区显示侧边栏，避免出现在独立页面上
    sidebar: {
      '/posts/': [
        {
          text: '博客',
          items: [
            { text: '文章列表', link: '/posts/' }
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

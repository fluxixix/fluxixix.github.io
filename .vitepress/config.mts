import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "fluxixix",
  description: "less is more",
  srcExclude: ['**/README.md'],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '文章', link: '/posts/' },
      { text: '演示', link: '/demo/markdown-examples' }
    ],

    sidebar: [
      {
        text: '博客',
        items: [
          { text: '文章列表', link: '/posts/' }
        ]
      },
      {
        text: '模板演示',
        items: [
          { text: 'Markdown 示例', link: '/demo/markdown-examples' },
          { text: 'Runtime API 示例', link: '/demo/api-examples' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'mdi:web', link: 'https://fluxixix.github.io', ariaLabel: 'fluxixix.github.io', target: '_self' },
      { icon: 'github', link: 'https://github.com/fluxixix/fluxixix.github.io', ariaLabel: 'GitHub 仓库' }
    ]
  }
})

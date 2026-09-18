import { defineConfig } from 'vitepress'
import { fluxixixSite } from 'vitepress-theme-fluxixix/site'
import { rss } from 'vitepress-theme-fluxixix/rss'

// RSS 规范要求绝对地址，换成你自己的域名
const SITE_URL = '__SITE_URL__'

export default defineConfig({
  title: '__SITE_NAME__',
  description: '__SITE_TAGLINE__',
  // 独立页面统一放在 pages/ 下，通过 rewrites 去掉 URL 里的前缀：
  // pages/archive.md 对应 /archive，不是 /pages/archive
  rewrites: {
    'pages/:page': ':page'
  },
  // fluxixixSite 补上主题自带的界面文案与本地搜索翻译；
  // nav / sidebar / socialLinks 属于内容，永远由站点自己写
  themeConfig: fluxixixSite({
    nav: [
      { text: '首页', link: '/' },
      { text: '文章', link: '/posts/' },
      { text: '归档', link: '/archive' },
      { text: '关于', link: '/about' }
    ],

    // 侧边栏只在文章区出现，按目录分主题；base 省掉组内链接的重复前缀
    sidebar: {
      '/posts/': [
        {
          text: '技术',
          base: '/posts/tech/',
          items: [{ text: '第一篇文章', link: 'hello' }]
        }
      ]
    }
  }),
  // 构建结束后生成 feed.xml，随站点一起发布
  buildEnd: rss({ siteUrl: SITE_URL })
})

---
title: VitePress 使用笔记
date: 2026-09-08
description: 搭这个站点时踩过的几个点：目录约定、路由重写、侧边栏作用域、本地搜索和构建期生成 RSS。
---

# VitePress 使用笔记

搭这个站点时攒下的一些做法，都是实际跑通之后记下来的。目标是把「写文章」这件事的成本压到最低：新增一篇文章只需要往 `posts/` 里丢一个 `.md`。

## 一、目录约定

```
.
├─ index.md               # 首页（layout: home）
├─ posts/                 # 文章
│  ├─ index.md            # 文章列表页
│  ├─ posts.data.ts       # 数据加载器
│  ├─ tech/               # 分组的文章
│  └─ notes/
├─ pages/                 # 独立页面
└─ .vitepress/
   ├─ config.mts
   └─ theme/
```

文章和独立页面分开放。`pages/` 里的文件用 `rewrites` 把 URL 前缀去掉：

```ts
rewrites: {
  'pages/:page': ':page'
}
```

这样 `pages/about.md` 最终是 `/about`，而不是 `/pages/about`。根目录因此只留 `index.md`、`posts/`、`pages/` 三样东西。

## 二、侧边栏按路径作用域

`themeConfig.sidebar` 传数组是「全局生效」，传对象则按路径前缀生效：

```ts
sidebar: {
  '/posts/': [
    {
      text: '技术',
      base: '/posts/tech/',
      items: [{ text: 'VitePress 使用笔记', link: 'vitepress-notes' }]
    }
  ]
}
```

两点容易忽略：

- 用数组形式写在顶层，侧边栏会出现在**所有**页面上，包括首页之外的独立页。用对象形式按目录切分才干净。
- `base` 可以为组内所有 `items` 自动补路径前缀，写链接时只写文件名。

另外，嵌套层级超过 6 层会被直接忽略不显示。

## 三、本地搜索

VitePress 内置了基于 minisearch 的本地搜索，纯静态、不需要任何外部服务：

```ts
search: {
  provider: 'local',
  options: {
    translations: {
      button: { buttonText: '搜索', buttonAriaLabel: '搜索' },
      modal: { noResultsText: '没有找到结果' }
    }
  }
}
```

默认文案是英文的，`translations` 可以逐项覆盖。索引在构建时生成，所以搜索到的内容始终和当前版本一致。

## 四、构建期生成 RSS

没有引入插件，直接在 `buildEnd` 里写文件。`buildEnd` 拿到的是 `SiteConfig`，里面有 `srcDir` 和 `outDir`：

```ts
export async function generateRssFeed(siteConfig) {
  const items = await collectItems(siteConfig.srcDir)
  await writeFile(path.join(siteConfig.outDir, 'feed.xml'), renderFeed(items), 'utf-8')
}
```

再在 `head` 里声明一次，阅读器就能自动发现订阅源：

```ts
head: [
  ['link', { rel: 'alternate', type: 'application/rss+xml', href: '/feed.xml' }]
]
```

注意 `buildEnd` 只在 `vitepress build` 时执行，`vitepress dev` 不会触发。

## 五、用数据加载器聚合文章

文章列表、归档页、首页「最新文章」都不需要手工维护，用 `createContentLoader` 在构建期扫出全部文章：

```ts
export default createContentLoader('posts/**/*.md', {
  transform(raw) {
    return raw
      .filter((page) => page.url.replace(/\.html$/, '') !== '/posts/')
      .map((page) => ({
        title: page.frontmatter.title ?? page.url,
        url: page.url,
        date: page.frontmatter.date
      }))
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  }
})
```

两个细节：glob 用 `**/*.md` 才能覆盖子目录；`transform` 返回的数据会被缓存，页面里直接 `import { data } from './posts.data.ts'` 就能拿到数组。

## 小结

这套组合下来，写一篇新文章的完整成本是：新建 `.md`、写上 `title` 和 `date`、在侧边栏配置里加一行。其余全自动。

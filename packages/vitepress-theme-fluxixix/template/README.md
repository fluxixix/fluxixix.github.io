# __SITE_NAME__

VitePress 站点，主题是 [vitepress-theme-fluxixix](https://github.com/fluxixix/vitepress-theme-fluxixix)。

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # 产物在 .vitepress/dist
npm run preview
```

## 目录

```
├── index.md                  首页（layout: home + 最新文章）
├── posts/
│   ├── index.md              文章列表页
│   ├── posts.data.ts         列表数据源（构建期读各篇 frontmatter）
│   └── tech/                 文章按主题分子目录
├── pages/                    独立页面（rewrites 去掉 URL 前缀）
│   ├── archive.md            归档
│   └── about.md              关于
└── .vitepress/
    ├── config.mts            站点配置
    └── theme/index.ts        主题入口与站点参数
```

## 写一篇新文章

在 `posts/` 下建 `.md`，frontmatter 只认三个字段：

```yaml
---
title: 标题
date: 2026-09-13
description: 一句话摘要，会出现在列表页与 RSS 里
---
```

文章列表、归档页与 `feed.xml` 都是构建期扫 `posts/` 生成的，不用手工维护目录；
加了新目录记得在 `.vitepress/config.mts` 的 `sidebar` 里补一条链接。

## 换成主题自带字体（可选）

```bash
npm i -D @fontsource/noto-serif-sc @fontsource/ibm-plex-mono
```

然后在 `.vitepress/theme/index.ts` 顶部加一行：

```ts
import 'vitepress-theme-fluxixix/fonts'
```

不装这两个包也能跑，只是展示字与代码字回落到系统字体。

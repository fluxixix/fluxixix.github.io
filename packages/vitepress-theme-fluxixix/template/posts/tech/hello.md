---
title: 第一篇文章
date: 2026-09-01
description: 这是一个占位文章，用来把列表页、归档页和 RSS 撑起来。删掉它，写你自己的。
---

# 第一篇文章

这是脚手架生成的占位文章。它存在的唯一目的是让**首页的最新文章列表、文章列表页、
归档页和 `feed.xml`** 一开始就有内容，好让你一眼看出各处的排版长什么样。

删掉这个文件，然后照它的 frontmatter 写你自己的第一篇：

```yaml
---
title: 标题
date: 2026-09-13
description: 一句话摘要，会出现在列表页与 RSS 里
---
```

## 正文能用什么

默认的 VitePress Markdown 配置加上主题的排版，下面这些都能直接用：

- **加粗**、*斜体*、~~删除线~~、`行内代码`
- 链接：[VitePress 官网](https://vitepress.dev)，裸链接 https://vitepress.dev 也会自动识别
- 列表、任务列表（`- [ ]` / `- [x]`）、表格、脚注、代码块（行高亮 / 差分 / 代码组）
- 七种提示容器：`::: tip` `info` `warning` `danger` `important` `caution` `details`

::: tip 加新文章记得改侧边栏
文章列表是构建期自动扫出来的，但**侧边栏条目是手写的**——
在 `.vitepress/config.mts` 的 `sidebar` 里补一条链接，不然新文章点不进去。
:::

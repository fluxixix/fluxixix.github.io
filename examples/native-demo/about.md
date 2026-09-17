---
title: 关于
# pageClass 决定吃哪套页面样式；masthead 那三行由主题的编辑体页头读取
pageClass: about
masthead: true
name: 关于这个示例
tag: 关于 · ABOUT
meta: 虚构内容 · 用来展示主题
---

这是一份**虚构内容**的博客，只为展示主题长什么样。这里的人、项目、数据都不存在。

## 为什么会有这个站

主题在自家站点里被用到极致：首页刊头、作品墙、Now 月度留档、杂志化的关于页。
但那样看不出「我只想搭个普通博客」会得到什么。

所以这里只保留最普通的三件事：**文章列表、文章页、归档页**。
没有作品墙，没有 Now，没有自定义组件——一个装了主题的 VitePress 博客本来的样子。

## 页面里演示了什么

| 位置 | 演示的东西 |
| --- | --- |
| 首页 | `layout: home` 触发的刊头 + 最新文章列表 |
| 文章列表 | `.post-list` 的日期列与摘要 |
| 文章页 | 标题、层级、代码块、表格、提示块、列表标记 |
| 归档页 | `.archive-timeline` 的年份分组与行首日期 |
| 本页 | `pageClass: about` + `masthead` 页头与章节编号 |

## 内容怎么组织的

- 文章放 `posts/` 下，按主题分子目录；
- 每篇的 frontmatter 只写 `title` / `date` / `description`；
- 列表页 `posts/index.md` 与归档页 `archive.md` 用同一个数据源，
  由 `posts/posts.data.ts` 在构建期扫出来，不用手工维护目录。

## 想自己试

```sh
# 在主题仓库根目录
npm install
npm run example:dev     # 就是你现在看的这个站
npm run docs:dev        # 主题作者自己的站点，样式用得最满
```

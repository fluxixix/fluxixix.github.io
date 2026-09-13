<div align="center">

<img src="public/fluxixix.svg" width="267" height="63" alt="fluxixix" />

<p>个人博客，VitePress 起底，主题是手搓的。</p>

<p>
  <a href="https://fluxixix.github.io"><img src="https://img.shields.io/badge/%E7%AB%99%E7%82%B9-fluxixix.github.io-BD34FE?style=flat-square&amp;logo=gitbook&amp;logoColor=white" alt="站点" /></a>
  <a href="https://fluxixix.github.io/feed.xml"><img src="https://img.shields.io/badge/RSS-%E8%AE%A2%E9%98%85-41D1FF?style=flat-square&amp;logo=rss&amp;logoColor=white" alt="RSS" /></a>
  <a href="https://github.com/fluxixix/fluxixix.github.io/actions/workflows/deploy.yml"><img src="https://img.shields.io/github/actions/workflow/status/fluxixix/fluxixix.github.io/deploy.yml?style=flat-square&amp;label=deploy&amp;color=BD34FE" alt="deploy" /></a>
  <img src="https://img.shields.io/badge/%E4%BE%9D%E8%B5%96-2_%E9%A1%B9-BD34FE?style=flat-square" alt="依赖 2 项" />
</p>

<p>
  <img src="https://img.shields.io/badge/VitePress-1B1B1F?style=flat-square&amp;logo=vite&amp;logoColor=BD34FE" alt="VitePress" />
  <img src="https://img.shields.io/badge/Vue_3-1B1B1F?style=flat-square&amp;logo=vue.js&amp;logoColor=4FC08D" alt="Vue 3" />
  <img src="https://img.shields.io/badge/TypeScript-1B1B1F?style=flat-square&amp;logo=typescript&amp;logoColor=3178C6" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node_24-1B1B1F?style=flat-square&amp;logo=node.js&amp;logoColor=5FA04E" alt="Node 24" />
  <img src="https://img.shields.io/badge/GitHub_Actions-1B1B1F?style=flat-square&amp;logo=githubactions&amp;logoColor=2088FF" alt="GitHub Actions" />
  <img src="https://img.shields.io/badge/Vercel-1B1B1F?style=flat-square&amp;logo=vercel&amp;logoColor=white" alt="Vercel" />
</p>

</div>

## 技术栈

| | |
| --- | --- |
| 框架 | [VitePress](https://vitepress.dev) `2.0.0-alpha.20` — 扩展默认主题，不另起一套 |
| 交互 | Vue 3 + TypeScript |
| 样式 | 原生 CSS，无预处理器；全部取值收敛在 `.vitepress/theme/custom.css` 的令牌层 |
| 图标 | `@iconify-json/mdi` |
| 部署 | GitHub Actions → GitHub Pages；Vercel 走同一份构建 |

依赖清单短到只有两项，是刻意的：构建链路越短，越不容易某天因为一个传递依赖而挂掉。

## 快速开始

```bash
npm install
npm run docs:dev      # 本地开发，默认 http://localhost:5173
npm run docs:build    # 构建到 .vitepress/dist
npm run docs:preview  # 预览构建产物
```

Node 24，与 CI 保持一致。

## 目录结构

```
├── index.md                  首页
├── posts/
│   ├── index.md              文章列表页
│   ├── posts.data.ts         列表数据源（构建期读取各篇 frontmatter）
│   ├── tech/                 技术
│   └── notes/                随笔
├── pages/                    独立页面：about / archive / now / projects
├── public/robots.txt
├── .vitepress/
│   ├── config.mts            站点配置
│   ├── rss.ts                构建结束后生成 feed.xml
│   └── theme/
│       ├── index.ts          主题扩展：hero 光晕、光标特效、明暗扩散、滚动揭示
│       ├── cursor.ts         光标粒子拖尾与点击波纹
│       └── custom.css        全站样式，按 10 个章节分层
├── vercel.json
└── .github/workflows/deploy.yml
```

`pages/` 下的页面通过 `rewrites` 去掉了 URL 前缀：`pages/about.md` 对应 `/about`，
不是 `/pages/about`。加新页面时不用管这一步。

## 写一篇新文章

1. 在 `posts/tech/` 或 `posts/notes/` 下建 `.md`，frontmatter 只认三个字段：

   ```yaml
   ---
   title: 标题
   date: 2026-09-13
   description: 一句话摘要，会出现在列表页和 RSS 里
   ---
   ```

2. 到 `.vitepress/config.mts` 的 `sidebar` 里补一条链接。

RSS 和文章列表都不用管，它们分别由 `rss.ts` 和 `posts.data.ts` 在构建期扫 `posts/` 自动生成。
日期会被统一归一到 UTC 中午，避免时区把「今天」推前一天。

## 主题里做了什么

`.vitepress/theme/index.ts` 里四个交互，都做了降级：

- **hero 光晕跟随指针** — 只写 CSS 变量，平滑交给 transition。盒子的位置按需重测，
  不是每帧 `getBoundingClientRect()`（那会强制同步布局，表现出来是整页迟钝）。
- **光标粒子拖尾 + 点击波纹** — 一个 canvas、一个 rAF 循环，两池都空了就彻底停掉。
  仅在 `(hover: hover) and (pointer: fine)` 下启用。
- **明暗切换从按钮扩散** — View Transitions API 把切换那一帧包起来，新主题以按钮为
  圆心做 clip-path 扩散。不支持的浏览器直接退回即时切换。
- **列表滚动揭示** — IntersectionObserver 分批淡入。隐藏态写在 JS 加的 class 下，
  所以禁用 JS 时页面就是普通内容，不会白屏。

另外两处不在这个文件里：

- **首页顶栏滚动后收成浮动胶囊** — 纯 CSS，搭在默认主题自己的 `.top` class 上，没有滚动监听。
- **全文搜索** — VitePress 本地搜索，界面文案已中文化。

## 部署

推送到 `main` 即触发 `.github/workflows/deploy.yml`，构建产物发布到 GitHub Pages。

Vercel 用同一份 `vercel.json`（`buildCommand: npm run docs:build`，
`outputDirectory: .vitepress/dist`）。Vercel Web Analytics 的脚本只在 production
构建时注入 —— 本地 dev 下 `/_vercel/insights/script.js` 会被 SPA 兜底成 HTML，
浏览器按 JS 解析就会报 `SyntaxError: Unexpected token '<'`。

## 两个容易踩的地方

- **这份 README 不会被发布**。`config.mts` 里 `srcExclude: ['**/README.md']`，
  它可以放心写面向开发者的话。
- **侧边栏是手写的，不跟文件系统同步**。新文章只建文件不补 `sidebar`，
  它不会出现在任何导航里。

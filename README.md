<div align="center">

<img src="public/fluxixix.svg" width="267" height="63" alt="fluxixix" />

<p>个人博客，基于 VitePress，主题是自定义的。</p>

<p>
  <a href="https://fluxixix.github.io"><img src="https://img.shields.io/badge/%E7%AB%99%E7%82%B9-fluxixix.github.io-BD34FE?style=flat-square&amp;logo=gitbook&amp;logoColor=white" alt="站点" /></a>
  <a href="https://fluxixix.github.io/feed.xml"><img src="https://img.shields.io/badge/RSS-%E8%AE%A2%E9%98%85-41D1FF?style=flat-square&amp;logo=rss&amp;logoColor=white" alt="RSS" /></a>
  <a href="https://github.com/fluxixix/fluxixix.github.io/actions/workflows/deploy.yml"><img src="https://img.shields.io/github/actions/workflow/status/fluxixix/fluxixix.github.io/deploy.yml?style=flat-square&amp;label=deploy&amp;color=BD34FE" alt="deploy" /></a>
  <img src="https://img.shields.io/badge/%E4%BE%9D%E8%B5%96-7_%E9%A1%B9-BD34FE?style=flat-square" alt="依赖 7 项" />
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
| 场景 | three.js — 只有作品页右侧那幅太阳系用它，动态 import，别的页面首屏碰不到 |
| 样式 | 原生 CSS，无预处理器；版式令牌在主题包的 `styles/tokens.css`，品牌色在 `styles/palette.css` |
| 字体 | Fontsource 自托管：Noto Serif SC 700（中文与拉丁展示字，unicode-range 切片按需下载）+ IBM Plex Mono（等宽） |
| 图标 | `@iconify-json/mdi` |
| 部署 | GitHub Actions → GitHub Pages；Vercel 走同一份构建 |

依赖刻意压在五项：两款字体、一套图标、框架本体，加上作品页画太阳系要的 three；构建链路越短，越不容易某天因为一个传递依赖而构建失败。
（早先还有第三款字体 Fraunces 专门撑拉丁展示字，每页 36 KB；去掉后拉丁字形交给思源宋体，
实测每页净省约 18 KB——思源宋体自己会多加载一片 18 KB 的拉丁切片。）
three 那一百多 KB 只落在作品页，而且是动态 import 的，别的页面首屏拿不到它。

## 快速开始

```bash
npm install

npm run docs:dev          # 默认 http://localhost:5173
npm run docs:build        # 构建到 .vitepress/dist
npm run docs:preview      # 预览构建产物
```

Node 24，与 CI 保持一致。

验证：

```bash
npm run verify           # 构建本站（CI 的部署路径就是它）
npm run verify:rendered  # 真实渲染对比（需要无头 Chromium）
npm run typecheck        # tsc --noEmit（没把 typescript 写进依赖，环境里有 tsc 才跑得起来）
```

`check:rendered` 是「主题还能不能保持原样」的验收标准。它用无头 Chromium（CDP 直连）把
「改造前 / 改造后」两套产物在 3 个视口宽度下逐页对比**计算样式与元素几何**，而不是只比
HTML——被默认主题反压时 HTML 可以逐字一致，页面却是坏的。用法：

```bash
npm run baseline:make    # 把某个 git ref（默认 HEAD）检出到 /tmp/fx-baseline-site 并构建
npm run docs:build
npm run check:rendered   # 8 个页面 × 3 个视口，差异数必须为 0
```

## 目录结构

```
├── index.md                  首页
├── posts/
│   ├── index.md              文章列表页
│   ├── posts.data.ts         列表数据源（构建期读取各篇 frontmatter）
│   ├── tech/                 技术
│   └── notes/                随笔
├── pages/                    独立页面：about / archive / works
│   ├── now.md                Now 索引页（按年分组，数据来自 now/）
│   └── now/
│       ├── now.data.ts       月度留档的数据源（构建期读取各期 frontmatter）
│       └── 2026-09.md        当月一页
├── scripts/                  站点专属脚本：真实渲染对比（主题侧检查在主题仓库里）
├── public/robots.txt
├── .npmrc                    allow-git=root：放行主题这条 git 依赖（npm 12 起必需）
├── tsconfig.json             只给编辑器做类型检查（noEmit，不参与构建）
├── .vitepress/
│   ├── config.mts            站点配置
│   └── theme/
│       ├── index.ts          引主题包入口 + 自托管字体
│       ├── works.css         作品页自己的版面：左右各半、点击浮层、页首索引
│       └── works-scene/      作品页右侧那幅太阳系（数据层 / 场景 / 挂载层）
├── vercel.json
└── .github/workflows/deploy.yml
```

`pages/` 下的页面通过 `rewrites` 去掉了 URL 前缀：`pages/about.md` 对应 `/about`，
不是 `/pages/about`；嵌套目录同理，`pages/now/2026-09.md` 对应 `/now/2026-09`。
加新页面时不用管这一步。

## 主题

样式、交互、组件、页面形态都在**独立仓库**
[fluxixix/vitepress-theme-fluxixix](https://github.com/fluxixix/vitepress-theme-fluxixix)，
本站是它的第一个使用者。它做了什么、各组件怎么用，看那边的 README。

本站按 git tag 依赖它：

```bash
npm i -D --allow-git=root "git+https://github.com/fluxixix/vitepress-theme-fluxixix.git#v0.4.0"
```

改主题要走主题仓库：在那边 `npm run demo:dev` 看演示站，改完发新 tag，本站把依赖里的
tag 往前挪一位。想在本地联调未发布的主题，把本站依赖临时换成
`file:../vitepress-theme-fluxixix`（npm 会做符号链接，改源码即热更新），提交前换回来。
站点差异（站名、首页索引、页脚、目录约定）走 `fluxixixTheme({...})` 的参数，默认值就是
本站现值，所以本站的 `.vitepress/theme/index.ts` 只引包入口 + 字体。

它**不在 npm registry 上**，三条实测出来的约束，改依赖时要记住：

| 约束 | 原因 |
| --- | --- |
| 用 `git+https://…`，不要 `github:` 简写 | 简写会解析成 `git+ssh://` 写进 lockfile，CI 没有 SSH 私钥会直接失败 |
| 项目根要有 `.npmrc` 写 `allow-git=root` | npm 12 起非 registry 来源的依赖默认被拦（`EALLOWGIT`） |
| lockfile 里别混 registry | 非默认 registry 的 URL 会被 npm 12 当成 remote 依赖拦下（`EALLOWREMOTE`） |

## 写一篇新文章

1. 在 `posts/tech/` 或 `posts/notes/` 下建 `.md`，frontmatter 只认三个字段：

   ```yaml
   ---
   title: 标题
   date: 2026-09-13
   description: 一句话摘要，会出现在列表页和 RSS 里
   ---
   ```

2. 到 `.vitepress/config.mts` 的 `sidebar` 里补一条链接。侧边栏是手动维护的，不跟文件
   系统同步——只建文件不补这一条，文章不会出现在任何导航里。

RSS 和文章列表都不用管，它们分别由主题包的 `rss()` 和站点的 `posts.data.ts` 在构建期扫
`posts/` 自动生成。日期会被统一归一到 UTC 中午，避免时区把「今天」推前一天。

## 写一页 Now

每月在 `pages/now/` 下新建 `YYYY-MM.md`：

```yaml
---
month: 2026-09        # 必填，排序与分组的唯一依据
title: 2026 年 9 月    # 建议填写，决定浏览器标签与搜索结果里的标题
now: true             # 必填，标记这是当月页（决定是否注入页头）
pageClass: now-month  # 必填，样式作用域
line: 这个月想说的话   # 可选，渲染在页头下方
---
```

正文只写板块与清单（`## 在做` / `## 在学` / `## 在读 / 在看` / `## 在玩`）。页头和 `/now`
的索引都由构建期生成，不用改导航或侧边栏。

三条硬约定（数据加载器只在构建期警告、不会报错，所以靠这里兜住）：

- `pages/now/` 下只放 `YYYY-MM.md`，别在这个目录里放别的 Markdown（比如 README）；
- 文件名与 `month` 必须一致 —— 复制上一期改文件名时最容易忘改 `month`，那会让索引里出现两行同月；
- `line` 写纯文本，它按原样渲染（写 Markdown 语法会原样显示出来）。

## 部署

推送到 `main` 即触发 `.github/workflows/deploy.yml`，构建产物发布到 GitHub Pages。

Vercel 用同一份 `vercel.json`（`buildCommand: npm run docs:build`，
`outputDirectory: .vitepress/dist`）。Vercel Web Analytics 的脚本只在 production
构建时注入 —— 本地 dev 下 `/_vercel/insights/script.js` 会被 SPA 兜底成 HTML，
浏览器按 JS 解析就会报 `SyntaxError: Unexpected token '<'`。

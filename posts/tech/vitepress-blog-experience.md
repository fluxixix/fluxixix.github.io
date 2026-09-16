---
title: 从零到上线：VitePress + GitHub Pages + Vercel 建站全记录
date: 2026-09-13
description: 从空仓库到双平台上线的完整记录——VitePress 站点搭建、目录与配置设计、主题增强、构建期生成 RSS，以及 GitHub Pages 与 Vercel 的部署方案和踩坑清单。
---

# 从零到上线：VitePress + GitHub Pages + Vercel 建站全记录

本文记录 `fluxixix` 这个站点从空仓库到「本地能写、推送即上线、双平台可访问」的完整过程，
包含技术选型、目录设计、配置要点、主题增强、RSS 生成，以及 GitHub Pages 和 Vercel 两套部署方案，
最后是踩过的坑与排查清单。目标是让后来的人（包括未来的自己）照着做一遍就能复现。

---

## 一、目标与选型

### 想做成什么

- 一个**以文字为主**的个人站：文章列表、按主题分组的侧边栏、归档、关于、Now 等独立页面。
- 写作成本尽可能低：**新增一篇文章 = 往 `posts/` 丢一个 `.md`**，别的不动。
- 部署要省心：推送 `main` 自动构建上线，最好还能有第二套托管兜底。

### 为什么是 VitePress

| 方案 | 结论 |
| --- | --- |
| Hexo / Hugo | 生态成熟，但主题定制要读懂整套模板，改一处牵扯很多 |
| 纯手写 HTML | 自由但重复劳动太多，写文章还要管样式和导航 |
| **VitePress** | Markdown 即内容，Vue 组件直接嵌进 Markdown，默认主题开箱好看，配置一个 `config.mts` 就够；构建产物是纯静态，任何静态托管都能放 |

VitePress 的定位正好卡在「文档站」和「博客」之间：默认主题的首页、导航、侧边栏、本地搜索都现成，
不够的地方再用自定义主题补，投入产出比最高。

### 版本与环境

- Node.js 24（CI 里也锁 24）
- 包管理用 npm（有 `package-lock.json`，CI 用 `npm ci` 保证可复现）
- `vitepress@^2.0.0-alpha.20`（devDependency 即可，构建产出是静态文件，不需要运行时依赖）

```json
{
  "type": "module",
  "devDependencies": {
    "@iconify-json/mdi": "^1.2.3",
    "vitepress": "^2.0.0-alpha.20"
  },
  "scripts": {
    "docs:dev": "vitepress dev",
    "docs:build": "vitepress build",
    "docs:preview": "vitepress preview"
  }
}
```

> 注：`"type": "module"` 必须加，否则 `.mts`/`.ts` 配置里的 ESM 语法会报错。
> `@iconify-json/mdi` 是早期尝试图标时装的，后来导航图标直接用 emoji、社交链接用内置图标，
> 它目前没被引用，属于可清理的冗余依赖。

---

## 二、目录结构设计

VitePress 的 `srcDir` 默认是项目根目录，所以**目录布局就是 URL 布局**，要一开始就想清楚：

```
.
├─ index.md                      # 首页（layout: home）
├─ posts/                        # 文章区
│  ├─ index.md                   # 文章列表页
│  ├─ posts.data.ts              # 构建期扫描文章，供列表/归档/首页读取
│  ├─ tech/                      # 按主题分子目录
│  └─ notes/
├─ pages/                        # 独立页面（关于/作品/归档/Now）
│  ├─ about.md
│  ├─ works.md
│  ├─ archive.md
│  └─ now.md
├─ public/                       # 原样拷贝的静态资源（robots.txt 等）
├─ .vitepress/
│  ├─ config.mts                 # 站点配置
│  ├─ rss.ts                     # 构建结束生成 RSS
│  └─ theme/                     # 自定义主题
│     ├─ index.ts
│     ├─ custom.css
│     └─ cursor.ts
├─ .github/workflows/deploy.yml  # GitHub Pages 自动部署
├─ vercel.json                   # Vercel 构建配置
└─ .gitignore
```

设计取舍：

- **`posts/` 与 `pages/` 分开**：文章有 frontmatter 约定、要进 RSS、要出现在列表里；独立页面是「关于我」这类，不参与文章聚合。分开后规则清晰。
- **`pages/` 通过 rewrite 掉前缀**：文件放在 `pages/` 下便于归类，但 URL 里不想出现 `/pages/`，用 `rewrites` 映射掉（见下文）。
- **文章按主题分子目录**（`tech/`、`notes/`）：侧边栏可以直接按目录分组，URL 也自带语义。
- **项目本身放在 Obsidian 仓库目录里**：`.obsidian/` 已在 `.gitignore` 中排除，写笔记和写文章共用一套 Markdown 环境。

---

## 三、站点配置要点（`.vitepress/config.mts`）

配置整体很短，值得拆开讲的只有几处。

### 3.1 排除不参与建站的文件

```ts
srcExclude: ['**/README.md'],
```

VitePress 会把根目录下所有 `.md` 都当成页面。README 不是站内内容，必须排除，
否则它会变成可通过 URL 访问的「孤儿页面」，还会进搜索索引。
（同理，若把草稿或说明文档放在根目录的其他文件夹里，也要按同样的方式排除。）

### 3.2 路由重写掉目录前缀

```ts
rewrites: {
  'pages/:page': ':page'
}
```

效果：`pages/about.md` → `/about.html`。既保留了源码目录的整洁，又让 URL 简短。

### 3.3 注入 `<head>`

```ts
head: [
  // 让阅读器和浏览器能发现 RSS
  ['link', { rel: 'alternate', type: 'application/rss+xml', title: 'fluxixix', href: '/feed.xml' }],
  // Vercel Web Analytics：先声明队列函数，再异步加载统计脚本
  ['script', {}, 'window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); }'],
  ...(isBuild
    ? ([['script', { defer: '', src: '/_vercel/insights/script.js' }]] as HeadConfig[])
    : [])
],
```

这里有个关键判断——**统计脚本只在构建时注入**：

```ts
const isBuild =
  (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV ===
  'production'
```

原因见「踩坑记录」第 1 条：本地 dev 下 `/_vercel/insights/script.js` 会被 SPA 兜底成 HTML 返回，
浏览器按 JS 解析就报 `SyntaxError: Unexpected token '<'`。该脚本只有部署到 Vercel 才存在，
所以只在生产构建时注入。

> 小技巧：项目没装 `@types/node`，又想用 `process.env`，可以从 `globalThis` 上取，避免为一个表达式引入类型依赖。

### 3.4 主题文案中文化

默认主题的部分界面文案是写死的英文，会直接显示给读者，逐项覆盖：

```ts
outline: { label: '本页目录' },
returnToTopLabel: '回到顶部',
sidebarMenuLabel: '菜单',
docFooter: { prev: '上一篇', next: '下一篇' },
```

### 3.5 侧边栏按主题分组

```ts
sidebar: {
  '/posts/': [
    {
      text: '技术',
      base: '/posts/tech/',
      items: [
        { text: 'Markdown 全格式示例', link: 'markdown-guide' },
        // ...
      ]
    },
    { text: '随笔', base: '/posts/notes/', items: [ /* ... */ ] }
  ]
}
```

- `sidebar` 用**路径前缀作为 key**，天然实现「只在文章区显示侧边栏，首页/独立页不显示」。
- `base` 用来省掉组内每个链接的重复前缀，新增文章时只写文件名。

### 3.6 本地搜索

```ts
search: {
  provider: 'local',
  options: {
    translations: {
      button: { buttonText: '搜索', buttonAriaLabel: '搜索' },
      modal: { /* ...按钮文案中文化... */ }
    }
  }
}
```

`local` 提供商在构建期生成静态索引，不需要任何后端或第三方服务，对纯静态托管最友好。

---

## 四、内容体系

### 4.1 Frontmatter 约定

每篇文章开头只需三个字段：

```yaml
---
title: VitePress 使用笔记
date: 2026-09-08
description: 搭这个站点时踩过的几个点……
---
```

`title` 用于列表与 RSS；`date` 用于排序、归档和 RSS 的 `pubDate`；`description` 进 RSS 摘要。
约定得越少，写作时越不容易出错。

### 4.2 构建期收集文章：`posts/posts.data.ts`

用 VitePress 的 `createContentLoader` 在**构建期**扫描 `posts/**/*.md`，把结果作为数据暴露给页面：

```ts
export default createContentLoader('posts/**/*.md', {
  transform(raw): Post[] {
    return raw
      // 排除文章列表页自身
      .filter((page) => page.url.replace(/\.html$/, '') !== '/posts/')
      .map((page) => ({
        title: page.frontmatter.title ?? page.url,
        url: page.url,
        date: formatDate(page.frontmatter.date)
      }))
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  }
})
```

好处：列表页、归档页、首页「最新文章」都从同一份数据渲染，**不需要任何服务端接口**，也不需要手动维护索引文件。

日期统一取 UTC 当天中午（`date.setUTCHours(12)`），避免时区把日期前后挪一天：

```ts
function formatDate(raw: unknown): string {
  if (!raw) return ''
  const date = new Date(raw as string)
  date.setUTCHours(12)
  return date.toISOString().slice(0, 10)
}
```

### 4.3 页面里直接渲染数据

Markdown 中嵌入 Vue 的 `<script setup>`，把数据渲染成列表：

```markdown
<script setup>
import { data as posts } from './posts.data.ts'
</script>

# 文章

<ul v-else>
  <li v-for="post in posts" :key="post.url">
    <a :href="post.url">{{ post.title }}</a>
    <span v-if="post.date"> · {{ post.date }}</span>
  </li>
</ul>
```

归档页（`pages/archive.md`）在此之上把数据按年份分组，渲染成时间线；首页只取 `posts.slice(0, 5)`。
**同一个数据源，三种视图**，这是 VitePress「文档 + Vue」组合最好用的地方。

---

## 五、首页与主题增强

### 5.1 首页

`index.md` 用 `layout: home` + `hero` + `features` 声明式搭出来，无需写组件：

```yaml
---
layout: home
hero:
  name: "fluxixix"
  text: "less is more"
  tagline: may the force be with u
  actions:
    - theme: brand
      text: 阅读文章
      link: /posts/
    - theme: alt
      text: GitHub
      link: https://github.com/fluxixix/fluxixix.github.io
features:
  - icon: '✍️'
    title: 文章
    details: 记录学习笔记与零散思考，持续更新。
    link: /posts/
---
```

### 5.2 自定义主题：只做「加料」，不做「重写」

`.vitepress/theme/index.ts` 继承默认主题，只在 `enhanceApp` 里挂三样特效：

```ts
export default {
  extends: DefaultTheme,
  enhanceApp({ app }: EnhanceAppContext) {
    setupHeroGlow()      // 首页光晕跟随鼠标
    setupCursorFx()      // 光标粒子拖尾 + 点击波纹
    setupThemeTransition(app)  // 明暗切换的圆形扩散
  }
} satisfies Theme
```

**核心原则**：`extends: DefaultTheme` 保证升级 VitePress 时不会跟默认主题脱节；
所有自定义都通过注入 CSS 变量、监听事件、`app.provide` 覆盖的方式实现，不改默认组件源码。

几处实现亮点：

- **渐变光晕用 CSS 变量驱动**：JS 只写 `--vp-hero-glow-x/y`，平滑过渡交给 CSS 的 `transition`，
  避免每帧直接改 `style` 造成重排。
- **明暗切换用 View Transitions API**：把切换那一帧包起来，给新快照加一个以切换按钮为圆心的
  `clip-path` 圆，从 0 扩到盖满视口。切换动作本身通过 `app.provide('toggle-appearance', ...)`
  接管，内部仍调用默认的 `isDark` setter，所以 `localStorage`、`<html class>` 三者照旧同步。
  不支持的浏览器（部分 Firefox）直接 `return`，退回原生即时切换。
- **光标特效与主题色解耦**：颜色写在 CSS 变量里，JS 只读取；用 `MutationObserver` 监听
  `<html class>` 变化，实现明暗切换时特效颜色跟着变。

### 5.3 性能上的三个决定

1. **光晕不每帧测布局**：早期版本每帧调 `getBoundingClientRect()`，触发强制同步布局，
   鼠标一动整页都要重算，表现为「首页整页都很迟钝」。改成只在 resize / scroll / 路由切换后按需重测，
   平时用缓存的 `rect`。
2. **rAF 空闲即停**：粒子池和波纹池都空了就 `stop()`，不再占用主线程；补画一帧清掉残留后彻底停下。
3. **尊重用户偏好**：所有动效开头都判断 `prefers-reduced-motion: reduce`，命中直接不启用；
   光标特效还额外要求 `(hover: hover) and (pointer: fine)`，触屏设备不画。

---

## 六、构建期生成 RSS

不想为 RSS 引第三方插件，直接用 `buildEnd` 钩子自己写（`.vitepress/rss.ts`）：

```ts
export default defineConfig({
  // ...
  buildEnd: generateRssFeed,
})
```

实现思路：

- 递归扫描 `posts/` 下所有 `.md`（排除 `index.md` 列表页），用正则读取 frontmatter 的
  `title`/`date`/`description` 三个字段——**够用就行，不为构建脚本引入 frontmatter 解析依赖**。
- RSS 规范要求绝对 URL，所以固定 `SITE_URL = 'https://fluxixix.github.io'`，链接拼成
  `${SITE_URL}/${slug}.html`。
- 按日期倒序取前 20 篇，`date` 统一设成 UTC 中午，避免时区跳天。
- 所有文本字段做 XML 转义（`&`/`<`/`>`/`"`），否则标题里有特殊字符就会产出非法 XML。
- 产物 `feed.xml` 直接写进 `outDir`，随站点一起发布，无需额外配置。
- 在 `<head>` 里加 `<link rel="alternate">` 声明，阅读器才能发现它。

```
siteConfig.logger.info(`generated ${FEED_FILE} with ${items.length} item(s)`)
```

---

## 七、部署一：GitHub Pages

### 7.1 仓库命名

仓库名为 `fluxixix.github.io`，属于 **用户站点（User Pages）**：
只要仓库是这个名字，GitHub 就会自动把 `main` 分支构建产物发布到 `https://fluxixix.github.io`，
不需要额外配置 `base`（项目站点才需要，否则资源路径会 404）。

### 7.2 仓库设置

在 GitHub 仓库的 **Settings → Pages** 里，把 **Source** 选为 **GitHub Actions**
（而不是「Deploy from a branch」）。这一步很容易漏，漏了工作流跑完也不会上线。

### 7.3 自动部署工作流

`.github/workflows/deploy.yml` 分 `build` 和 `deploy` 两个 job：

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:   # 支持在 Actions 页签手动触发

permissions:
  contents: read
  pages: write
  id-token: write      # 部署到 Pages 必需

concurrency:
  group: pages
  cancel-in-progress: false   # 不打断正在进行中的生产部署
```

要点说明：

- **`permissions` 必须显式声明**，`pages: write` + `id-token: write` 缺一不可，
  否则 `deploy-pages` 会因权限不足失败。
- **`fetch-depth: 0`**：如果之后启用 `lastUpdated` 需要完整 git 历史，这里先留着。
- **`cache: npm` + `npm ci`**：保证 CI 依赖可复现、构建更快。
- **`upload-pages-artifact` 的 `path`** 指向 `.vitepress/dist`，与 Vercel 的输出目录保持一致。
- **Action 版本统一升到 Node 24 运行时**：`checkout@v5`、`setup-node@v6`、`configure-pages@v6`、
  `upload-pages-artifact@v5`、`deploy-pages@v5`。GitHub 会持续淘汰旧 Node 运行时的 Action，
  这几个版本是当时能跑通的组合。
- **`deploy` job 绑定 `github-pages` environment**，部署地址由 `steps.deployment.outputs.page_url` 输出。

---

## 八、部署二：Vercel

GitHub Pages 已经够用，再挂一套 Vercel 是为了**多一个访问入口 + 拿到访问统计**。

### 8.1 项目配置 `vercel.json`

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": null,
  "buildCommand": "npm run docs:build",
  "outputDirectory": ".vitepress/dist"
}
```

- **`framework: null`**：告诉 Vercel「别自动探测框架」，完全按下面的命令构建。
  VitePress 不在 Vercel 内置框架列表里，不显式关掉探测容易走错默认行为。
- **`buildCommand` / `outputDirectory`**：与 GitHub Actions 里用的命令、产物目录完全一致，
  两套平台复用同一份构建逻辑，行为可预测。

### 8.2 部署流程

1. 在 Vercel 里 **Import Git Repository**，选择 `fluxixix/fluxixix.github.io`。
2. Vercel 会读取根目录的 `vercel.json`，按上面的配置构建。
3. 之后推送 `main` 即自动部署；每个 PR 还会生成 Preview 部署，方便改样式时预览。

### 8.3 接入 Web Analytics

Vercel 的 Web Analytics 需要在页面里加载它的统计脚本。做法是在 `<head>` 里：

1. 先声明队列函数 `window.va`（收集调用，等脚本加载后再真正发送）；
2. 生产构建时用 `defer` 异步加载 `/_vercel/insights/script.js`。

再强调一次：**这两个脚本只在构建产物里注入**，本地 dev 不注入（本地没有该路由，会报错）。

---

## 九、本地开发与构建

```bash
npm install        # 首次安装依赖
npm run docs:dev   # 本地开发，热更新，默认 http://localhost:5173
npm run docs:build # 生产构建，产物在 .vitepress/dist
npm run docs:preview # 本地预览构建产物（验证产物而不是源码）
```

日常写作流程：

1. 在 `posts/<主题>/` 下新建 `.md`，写好 frontmatter；
2. 在 `config.mts` 的 `sidebar` 对应分组里加一条 `{ text, link }`；
3. `npm run docs:dev` 本地看效果；
4. 提交并推送 `main` → GitHub Actions 构建并发布到 Pages，Vercel 同步部署。

---

## 十、踩坑记录与排查清单

### 坑 1：本地 dev 控制台报 `SyntaxError: Unexpected token '<'`

- **现象**：加载 `/_vercel/insights/script.js` 失败，返回的是 HTML。
- **原因**：VitePress dev server 对未匹配路由做 SPA 兜底，返回 `index.html`，浏览器按 JS 解析就炸。
- **解法**：用 `NODE_ENV === 'production'` 判断，只在构建时注入该脚本。

### 坑 2：首页鼠标一动就整页卡顿

- **原因**：光晕效果每帧 `getBoundingClientRect()`，触发强制同步布局。
- **解法**：测量结果缓存，只在 resize / scroll / 路由切换后重测；偏移没实际变化时不写 CSS 变量。

### 坑 3：粒子偶尔报 `IndexSizeError`

- **原因**：rAF 回调拿到的帧时间可能早于事件里 `performance.now()`，`now - born` 为负，
  缓动算出负半径，`ctx.arc` 直接抛错。
- **解法**：把生命周期进度夹到 `0..1`；跨标签页回来时把 `dt` 上限夹到 48ms，避免粒子瞬移。

### 坑 4：canvas 绘制坐标整体偏移

- **原因**：canvas 是替换元素，`position: fixed; inset: 0` 不会把它拉伸到视口大小，
  `width: auto` 取的是位图固有尺寸，导致被铺开。
- **解法**：显式设置 CSS 尺寸，保证 1 位图像素对应 1 CSS 像素；DPR 封顶 2，避免高分屏像素量翻四倍。

### 坑 5：RSS 日期差一天

- **原因**：时区导致 `new Date('2026-09-08')` 在本地时区解析后落到前一天。
- **解法**：统一 `date.setUTCHours(12)`，取当天中午作为锚点。

### 坑 6：搜索 / 页面里混进了不该发布的内容

- **原因**：VitePress 把根目录所有 `.md` 都当页面。
- **解法**：用 `srcExclude` 排除 `README.md` 等非站内内容。

### 通用排查清单

| 症状 | 先查 |
| --- | --- |
| Pages 工作流成功但站点没更新 | Settings → Pages 的 Source 是否选了 GitHub Actions |
| `deploy-pages` 权限报错 | workflow 的 `permissions` 是否有 `pages: write` 和 `id-token: write` |
| 静态资源 404、页面无样式 | 站点是否为项目站点（非 `<user>.github.io`）；若是，需要配 `base` |
| Vercel 构建失败 | `vercel.json` 的 `buildCommand` / `outputDirectory` 是否与本地一致 |
| 本地构建成功、CI 失败 | CI Node 版本是否与本地一致（本项目锁 24） |
| 新增文章没进列表 | 文件名是否以 `.md` 结尾、frontmatter 是否有合法 `date` |

---

## 十一、时间线复盘

按提交历史，整个过程大致分三段：

1. **搭骨架**：初始化仓库、加 README、创建 VitePress 站点与 GitHub Pages 部署工作流、
   把 Pages 相关 Action 升到 Node 24 运行时。
2. **做内容与视觉**：重做首页、加导航/独立页面/本地搜索/RSS、按主题分组文章、
   给 hero 加渐变光晕，填充示例内容。
3. **打磨体验**：做光标特效、归档时间线、明暗切换圆形扩散，并针对性能（强制布局、粒子、canvas DPI）
   逐项优化；最后接入 Vercel 并配置 `vercel.json` 与分析脚本。

一句总结：**先把「能上线」跑通，再补内容和视觉，最后才抠性能细节**——顺序颠倒的话，很容易在还没跑通部署时就陷进样式微调。

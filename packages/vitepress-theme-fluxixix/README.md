# vitepress-theme-fluxixix

编辑部式排版的 VitePress 主题：衬线字体栈、悬浮胶囊导航、滚动揭示、阅读进度环、
作品版画与杂志化的关于页/归档页。

**它扩展默认主题，不替换它**：未启用的页面形态不会产出任何节点，宿主站点自己的 CSS
天然覆盖主题——这是"不影响原生样式"的两条硬保证，仓库里的
`scripts/check-example-isolation.mjs` 会对产物做 A/B 校验。

- 要求 VitePress `>=2.0.0-alpha.20 <3.0.0`（主题用到 VitePress 2 的 client API）
- 纯 CSS + Vue，无预处理器；直接发布 TS/Vue 源码，由使用方的 Vite 编译
- 不内置字体；字体栈有系统回退，不装 `@fontsource/*` 也能跑

## 安装

```bash
npm i -D vitepress-theme-fluxixix
# 想要主题自带的那套排版（思源宋体 + IBM Plex Mono）再装字体
npm i -D @fontsource/ibm-plex-mono @fontsource/noto-serif-sc
```

## 接入

`.vitepress/theme/index.ts`：

```ts
// 主题本体 + 样式总表一次引完，顺序由包自己保证（推荐）
import theme from 'vitepress-theme-fluxixix/theme'

export default theme
```

要引字体就在上面加一行（字体放在主题前后都行，它不参与覆盖关系）：

```ts
import 'vitepress-theme-fluxixix/fonts'
import theme from 'vitepress-theme-fluxixix/theme'

export default theme
```

也可以写成两次导入，但**顺序不能反**——理由是 CSS 在产物里的先后由模块遍历顺序决定，
而主题靠"排在默认主题之后"才压得住它（见下面「样式与层」）：

```ts
import { fluxixixTheme } from 'vitepress-theme-fluxixix'
import 'vitepress-theme-fluxixix/styles/index.css' // 必须在主题本体之后
export default fluxixixTheme()
```

`.vitepress/config.ts`：想让界面文案（目录、回到顶部、菜单、外观、上一篇/下一篇）
与本地搜索都中文化，用 `fluxixixSite` 包一层 `themeConfig`：

```ts
import { defineConfig } from 'vitepress'
import { fluxixixSite } from 'vitepress-theme-fluxixix/site'
import { rss } from 'vitepress-theme-fluxixix/rss'

export default defineConfig({
  title: '站名',
  description: '一句话标语',
  themeConfig: fluxixixSite({
    nav: [{ text: '首页', link: '/' }]
  }),
  // 可选：构建结束后生成 feed.xml
  buildEnd: rss({ siteUrl: 'https://example.com' })
})
```

字体入口会 `import` 两个 `@fontsource` 包（思源宋体 + IBM Plex Mono）；没装就落到
系统衬线/等宽字体，不会构建失败。

## 字体

主题只声明字体栈，不主动引字体文件。自托管时是**两层**体系：

| 用途 | 字体 | 覆盖的元素 |
| --- | --- | --- |
| 展示衬线 | `Noto Serif SC` 700 | 文章 `h1`/`h2`、首页刊头口号、作品名与指标、Now 页年份、编辑体页头、经历机构名、AI 卡片名 |
| 注释等宽 | `IBM Plex Mono` 400/500 | 代码块、日期、编号、眉题、技术栈行、页脚 |
| 正文 | VitePress 默认（`Inter` + 系统黑体） | 段落、列表、引用 |

几点值得知道的：

- **思源宋体同时承接拉丁展示字**。它是唯一被引的衬线字体，栈里没有单独的拉丁展示
  字体，所以同一行里的中英混排由它一条栈完成；它缺的字（部分标点、生僻符号）再回退
  到系统宋体。
- **拉丁字形随系统而异**。没有自托管拉丁展示字体，macOS 上会落到系统宋体（Songti SC）
  的字形，Windows/Linux 各不相同。这是刻意的取舍：少一个字体依赖、每页少约 18 KB。
  早期版本自带 `Fraunces`（每页 36 KB）撑拉丁展示字，现已移除——中文标题观感不变，
  只有拉丁字形与行盒高度略有变化（思源宋体的固有度量比 Fraunces 高约 6%）。
- **宋体只引 700 一档**。给衬线元素写别的 `font-weight` 会得到浏览器合成的假字重，
  层级请靠字号拉开。
- **正文的 `Inter` 是 VitePress 自带的**，构建时已内联并本地化（产物里没有 Google
  Fonts 远程请求）；中文段落由 VitePress 的 `:lang(zh)` 栈落到系统黑体（PingFang SC 等）。
  主题不动这两条。

要在自己的站点上换字体，覆盖 `--fx-font-serif` / `--vp-font-family-mono` 即可
（写在你自己样式里、排在主题之后，见下面「样式与层」）。

## 站点参数

主题默认值是 fluxixix 本站的现值，第三方站点按需覆盖：

```ts
export default fluxixixTheme({
  site: { name: '站名', tagline: '一句话标语' },
  // 传了 brand 才会注入一段内联样式；不传就用 palette.css 里的默认色
  brand: { a: '#2dd4bf', b: '#38bdf8' },
  home: {
    statement: 'less is more',
    rows: [
      { num: '01', label: '文章', meta: '技术笔记', href: '/posts/' },
      { num: '02', label: '归档', href: '/archive' }
    ]
  },
  footer: {
    meta: '站名 · 标语',
    links: [{ text: 'RSS', link: '/feed.xml' }]
  },
  pages: {
    postsDir: '/posts/', // 阅读进度只在哪个路径前缀下出现
    pageClasses: {
      about: 'about',
      works: 'works',
      nowIndex: 'now-index',
      nowMonth: 'now-month'
    }
  },
  i18n: { collapse: '收起', nowTag: 'NOW · 当下快照' }
})
```

`footer.links` 会被拼成 HTML 注入（转义后）——它与 `nav`、`sidebar` 同属站点自己的
配置，信任级别一致。

## 样式与层：为什么主题不写 @layer

VitePress 默认主题的 `vars.css` 与各组件 `<style scoped>` 都是**未分层**的，而
CSS 规定「未分层的样式永远胜过任何命名层」。所以主题一旦把自己收进 `@layer`，
默认主题就会反过来盖住它——品牌色、悬浮导航胶囊、阅读进度环、作品卡尺寸会同时
失守，且**不报任何错**。

主题因此保持未分层，靠「排在默认主题之后」取胜。这条约束由
`scripts/check-theme-layers.mjs` 与真实渲染对比（`scripts/check-rendered-parity.mjs`）
双重把关。

于是覆盖主题的写法就是普通的"后写者胜出"：

```css
/* 写在你自己的样式文件里，引在主题样式之后即可，不必堆特异性 */
:root {
  --fx-text-display: 6rem;
  --fx-brand-a: #2dd4bf;
  --fx-brand-b: #38bdf8;
}
```

只想微调主题、不想碰默认主题未分层的规则时，可以把自己的覆盖放进命名层——
未分层的默认主题仍然压得住它：

```css
@layer my-overrides {
  :root { --fx-text-display: 6rem; }
}
```

换站最常改的是 `palette.css` 里的 `--fx-brand-a` / `--fx-brand-b` 与由它们推导的
功能色；使用方改不了包内文件，用上面的方式覆盖即可。

## 可选的页面形态

主题里的页面形态都由页面自己的 `pageClass` / frontmatter 触发，不写就不生效：

| 形态 | 触发方式 |
| --- | --- |
| 首页刊头 | 首页 frontmatter 用 `layout: home`（默认主题约定），正文写「最新文章」列表 |
| 归档时间轴 | 页面 `pageClass: archive` + 自己按年分组的 `.archive-timeline` 结构 |
| Now 索引 / 月度留档 | `pageClass: now-index` / `now-month`，月度页 frontmatter 写 `month: YYYY-MM`、`now: true` |
| 作品墙 | `pageClass: works`，卡片用 `.work-poster` + `.poster-toggle`，版画用 `<WorkPlate />` |
| 关于页杂志化排版 | `pageClass: about`，章节用 `.about-creed` / `.skill-list` / `.ai-list` / `.about-colophon` |
| 编辑体页头 | 页面 frontmatter 写 `masthead: true`、`name`、`tag`、`meta` |

`<WorkPlate>` 已全局注册，`variant` 取 `nodes | cloud | tracks | grid | stack | pulse | blocks | frame`，
`tone` 取 `violet | cyan`。

## 目录约定

主题不强制目录结构，只有阅读进度依赖 `pages.postsDir`（默认 `/posts/`）。仓库里的
示例实现把独立页面放在 `pages/`、文章放在 `posts/`，再用 VitePress 的 `rewrites`
去掉 URL 前缀：

```ts
rewrites: {
  'pages/:page': ':page',
  'pages/now/:month': 'now/:month'
},
srcExclude: ['**/README.md']
```

## 数据加载器

汇总文章列表这类构建期数据，用 VitePress 自己的 `createContentLoader`，放在站点侧
即可（`createContentLoader` 需要能解析到真实文件路径，且 `.data.ts` 由 VitePress
按路径约定识别，不适合放进包里）：

```ts
// posts/posts.data.ts
import { createContentLoader } from 'vitepress'

export default createContentLoader('posts/**/*.md', {
  transform: (raw) =>
    raw
      .filter((page) => page.url !== '/posts/')
      .map((page) => ({
        title: page.frontmatter.title ?? page.url,
        url: page.url,
        date: page.frontmatter.date ?? '',
        description: page.frontmatter.description ?? ''
      }))
      .sort((a, b) => (a.date === b.date ? a.url.localeCompare(b.url) : a.date < b.date ? 1 : -1))
})
```

## 已知边界

- **VitePress 2 alpha**：`peerDependencies` 只允许 2.x。主题用到 VitePress 2 的
  `onContentUpdated`、`useData` 与 layout 插槽，1.x 未验证。
- **默认主题继承**：`extends: vitepress/theme` 是刻意的——主题只覆盖版式与几处交互，
  组件样式尽量通过主题自己的 CSS 变量（`--vp-*`）调整，避免与默认主题的状态机打架。
- **样式必须排在默认主题之后**：这是主题不写 @layer 的代价（原因见上面「样式与层」）。
  用 `vitepress-theme-fluxixix/theme` 这个入口就不会踩到；自己拆成两次导入时顺序不能反。
- **不要给主题样式加 @layer**：同上。仓库里有 `check-theme-layers` 与真实渲染对比
  （`check-rendered`）两道闸挡这个退化。

<div align="center">

<img src="public/fluxixix.svg" width="267" height="63" alt="fluxixix" />

<p>个人博客，基于 VitePress，主题是自定义的。</p>

<p>
  <a href="https://fluxixix.github.io"><img src="https://img.shields.io/badge/%E7%AB%99%E7%82%B9-fluxixix.github.io-BD34FE?style=flat-square&amp;logo=gitbook&amp;logoColor=white" alt="站点" /></a>
  <a href="https://fluxixix.github.io/feed.xml"><img src="https://img.shields.io/badge/RSS-%E8%AE%A2%E9%98%85-41D1FF?style=flat-square&amp;logo=rss&amp;logoColor=white" alt="RSS" /></a>
  <a href="https://github.com/fluxixix/fluxixix.github.io/actions/workflows/deploy.yml"><img src="https://img.shields.io/github/actions/workflow/status/fluxixix/fluxixix.github.io/deploy.yml?style=flat-square&amp;label=deploy&amp;color=BD34FE" alt="deploy" /></a>
  <img src="https://img.shields.io/badge/%E4%BE%9D%E8%B5%96-5_%E9%A1%B9-BD34FE?style=flat-square" alt="依赖 5 项" />
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
| 样式 | 原生 CSS，无预处理器；版式令牌在主题包的 `styles/tokens.css`，品牌色在 `styles/palette.css` |
| 字体 | Fontsource 自托管：Noto Serif SC 700（中文与拉丁展示字，unicode-range 切片按需下载）+ IBM Plex Mono（等宽） |
| 图标 | `@iconify-json/mdi` |
| 部署 | GitHub Actions → GitHub Pages；Vercel 走同一份构建 |

依赖刻意压在四项：两款字体、一套图标、框架本体；构建链路越短，越不容易某天因为一个传递依赖而构建失败。
（早先还有第三款字体 Fraunces 专门撑拉丁展示字，每页 36 KB；去掉后拉丁字形交给思源宋体，
实测每页净省约 18 KB——思源宋体自己会多加载一片 18 KB 的拉丁切片。）

## 快速开始

```bash
npm install

# 本站（内容 + 主题的活体 demo）
npm run docs:dev          # 默认 http://localhost:5173
npm run docs:build        # 构建到 .vitepress/dist
npm run docs:preview      # 预览构建产物

# 主题的示例站（examples/native-demo：只装主题、什么都不配）
npm run example:dev       # http://localhost:5175
npm run example:build
npm run example:preview
```

**改了主题包（`packages/vitepress-theme-fluxixix`）后，dev server 会自动热更新**——
包是以符号链接装进 `node_modules` 的，改源码即生效，不用重启。改了
`.vitepress/config.mts` 才需要重启。

看两个站的区别：本站是"主题被用到极致"的样子（首页刊头、作品墙、Now 月度留档、
杂志化关于页），示例站是"一个普通博客装了这个主题"的样子——**只有文章列表、
文章页、归档页**，2 篇虚构文章，没有作品墙也没有 Now、没有自定义组件。
技术那篇《Markdown 全格式总览》把标题、列表、表格、代码块（行高亮 / 差分 / 代码组 /
行号）、七种提示容器、脚注、任务列表都演示了一遍，是"只写 Markdown 会得到什么"
最直接的答案；随笔那篇演示普通正文的排版。

Node 24，与 CI 保持一致。

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
├── packages/
│   └── vitepress-theme-fluxixix/   主题插件（本站通过 npm workspaces 消费它）
│       ├── README.md         安装 / 接入 / 参数 / 覆盖主题的说明
│       └── src/
│           ├── index.ts      主题入口：fluxixixTheme()、交互挂载、组件注册
│           ├── options.ts    站点参数与默认值（本站现值）
│           ├── site.ts       fluxixixSite()：补齐界面文案与搜索翻译
│           ├── rss.ts        rss()：buildEnd 钩子，生成 feed.xml
│           ├── Layout.vue    布局扩展：首页刊头、全站页脚，按 frontmatter 挂载页头
│           ├── components/   HomeCover / WorkPlate / NowHeader / PageMasthead / SiteFooter
│           ├── cursor.ts     点击迸发的粒子
│           ├── reveal.ts     滚动揭示
│           ├── theme-transition.ts  明暗切换扩散
│           ├── work-posters.ts      作品墙展开
│           ├── reading-progress.ts  阅读进度条与进度环
│           ├── theme/index.ts 推荐入口：主题本体 + 样式总表，顺序由包固定
│           └── styles/       17 册样式（不写 @layer，靠排在默认主题之后取胜）
├── examples/native-demo/     主题示例站（虚构内容）：装好主题的普通博客
│   ├── index.md              首页（layout: home + 最新文章）
│   ├── archive.md            归档页（archive-timeline 时间轴）
│   ├── about.md              关于页（pageClass: about + masthead 页头）
│   └── posts/
│       ├── posts.data.ts     列表数据源
│       ├── index.md          文章列表页
│       ├── tech/             技术 1 篇：《Markdown 全格式总览》
│       └── notes/            随笔 1 篇：《笔记写给三个月后的自己》
├── scripts/                  层约定检查、示例站隔离检查、真实渲染对比
├── public/robots.txt
├── tsconfig.json             只给编辑器做类型检查（noEmit，不参与构建）
├── .vitepress/
│   ├── config.mts            站点配置
│   └── theme/
│       └── index.ts          引主题包入口 + 自托管字体
├── vercel.json
└── .github/workflows/deploy.yml
```

`pages/` 下的页面通过 `rewrites` 去掉了 URL 前缀：`pages/about.md` 对应 `/about`，
不是 `/pages/about`；嵌套目录同理，`pages/now/2026-09.md` 对应 `/now/2026-09`。
加新页面时不用管这一步。

## 主题插件

主题（样式、交互、组件、页面形态）都在 `packages/vitepress-theme-fluxixix`，
本站是它的第一个使用者，通过 npm workspaces 依赖（`npm install` 后以符号链接
出现在 `node_modules` 下）。

- 换站要改的品牌色与功能色：包的 `src/styles/palette.css`；第三方站点在**主题样式之后**
  写自己的 CSS 覆盖即可（见包内 README 的「样式与层」）。
- 站点差异（站名、首页索引、页脚、目录约定）：`fluxixixTheme({...})` 的参数，
  默认值就是本站现值，所以本站的 `.vitepress/theme/index.ts` 只引包入口 + 字体。
- 加新样式时注意：**主题样式不能写 @layer**。VitePress 默认主题的 vars.css 与组件
  样式都是未分层的，而未分层胜过任何命名层——主题一进层就会被默认主题反压
  （品牌色、导航胶囊、进度环、作品卡会同时失效且不报错）。`npm run check:layers`
  会挡住这个退化。

验证：

```bash
npm run check:layers     # 样式层约定（构建前跑，含产物顺序断言）
npm run verify           # 层约定检查 + 构建本站 + 示例站 A/B 隔离检查
npm run verify:rendered  # 最强的一道：真实渲染对比（需要无头 Chromium）
npm run typecheck        # 需要 tsc 在 PATH 上（本仓库没装 typescript）
```

`check:isolation` 会对 `examples/native-demo` 做两次构建（摘掉主题 / 装上主题），
逐字比较页面 DOM。主题只被允许加四种节点，且都必须由页面主动触发或属于全站部件：
页脚（总在）、首页刊头（`layout: home`）、编辑体页头（`masthead: true`）、
Now 页头（`now: true`）。除此之外多一个类名都算失败——示例站现在有 10 个页面
（首页 / 文章列表 / 2 篇文章 / 归档 / 关于 / 404），覆盖面比只放两页时大得多。

`check:rendered` 才是抽包这件事的验收标准：它用无头 Chromium（CDP 直连）把
「改造前 / 改造后」两套产物在 3 个视口宽度下逐页对比**计算样式与元素几何**，
而不是只比 HTML。因为 HTML 逐字一致并不能说明还原度——被默认主题反压时 HTML
一模一样、页面却是坏的。这件事真的发生过：主题样式一旦进 `@layer`，悬浮导航胶囊、
阅读进度环、侧边栏卡片与作品卡尺寸会同时失守，而且不报任何错。用法：

```bash
npm run baseline:make    # 把某个 git ref（默认 HEAD）检出到 /tmp/fx-baseline-site 并构建
npm run docs:build
npm run check:rendered   # 8 个页面 × 3 个视口，差异数必须为 0
```

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

RSS 和文章列表都不用管，它们分别由主题包的 `rss()` 和站点的 `posts.data.ts` 在构建期扫 `posts/` 自动生成。
日期会被统一归一到 UTC 中午，避免时区把「今天」推前一天。

## 写一页 Now

每月在 `pages/now/` 下新建 `YYYY-MM.md`，frontmatter 只有这五个字段：

```yaml
---
month: 2026-09        # 必填，排序与分组的唯一依据
title: 2026 年 9 月    # 建议填写，决定浏览器标签与搜索结果里的标题
now: true             # 必填，标记这是当月页（决定是否注入页头）
pageClass: now-month  # 必填，样式作用域
line: 这个月想说的话   # 可选，渲染在页头下方
---
```

正文只写板块与清单（`## 在做` / `## 在学` / `## 在读 / 在看` / `## 在玩`）：
页头（大月份数字 + 每月一句话）由主题包的 `components/NowHeader.vue` 按 frontmatter 生成，
不用手写；`/now` 的索引（年份分组、期数、当前标记、当期四个板块各前两条的预览）由
`pages/now/now.data.ts` 在构建期扫各期生成（`includeSrc` 拿原文解析 h2 与顶层清单），
不用改导航或侧边栏。

三条硬约定（数据加载器只在构建期警告、不会报错，所以靠这里兜住）：

- `pages/now/` 下只放 `YYYY-MM.md`，别在这个目录里放别的 Markdown（比如 README）；
- 文件名与 `month` 必须一致 —— 复制上一期改文件名时最容易忘改 `month`，那会让索引里出现两行同月；
- `line` 写纯文本，它按原样渲染（写 Markdown 语法会原样显示出来）。

索引页的当期预览只收每个板块的**顶层**条目、每板块取前两条：缩进的子条目不收，
以冒号结尾的引自行（明细在子项里）也不收。这只影响 `/now` 的预览，当月页照常全文渲染。

## 主题里做了什么

首页没有用默认 hero，`home-hero-before` 插槽里挂的是 `home/HomeCover.vue` 刊头：
眉题一行、衬线英文口号、四条目次式索引；字体两层体系（思源宋体衬线 / IBM Plex Mono 等宽，
正文走 VitePress 默认栈）在主题包的 `styles/tokens.css`（字体栈）与 `styles/palette.css`（颜色）
里定义，全站 h1/h2 与刊名走衬线。

主题包的入口 `src/index.ts` 挂五个交互，都做了降级：

- **点击迸发的粒子** — 一个 canvas、一个 rAF 循环，粒子池空了循环彻底停掉。点下去从落点
  迸出 16 颗粒子：均匀铺开再叠随机扰动，紫青两色按颗粒随机取色，带阻力与一点重力，
  边飘边缩小淡出。早先那圈圆环涟漪和跟随指针的粒子拖尾都已经去掉。
  仅在 `(hover: hover) and (pointer: fine)` 下启用。
- **明暗切换从按钮扩散** — View Transitions API 把切换那一帧包起来，新主题以按钮为
  圆心做 clip-path 扩散。不支持的浏览器直接退回即时切换。
- **列表滚动揭示** — IntersectionObserver 分批淡入。隐藏态写在 JS 加的 class 下，
  所以禁用 JS 时页面就是普通内容，不会白屏。
- **作品墙的展开** — 卡面高度写死、正文裁在卡里，点一下就跨列摊开看全部详情（见下面
  「作品页」那节）。作品页的九张海报卡与关于页的两张经历卡共用同一套（`.work-poster`
  + `.poster-toggle`），展开键是真的 `<button aria-expanded>`，键盘可用；禁用 JS 时卡片
  照常显示，只是展开键不响应，内容一字不少。
- **文章阅读进度** — 两个形态共用同一个进度值：窄屏（<60rem）顶栏跟着页面滚走，用 body
  下一根 2px 渐变线，只动 `transform: scaleX()`；≥60rem 顶栏收成胶囊后细线退场，换成
  套在胶囊外圈的一圈 SVG 描边，颜色是品牌紫→青渐变、读到哪画到哪（尺寸由 ResizeObserver
  喂 viewBox，进度用 `pathLength="1"` 归一化，不必算周长）。只在 `/posts/` 下出现，回顶后淡出。

主题包的 `styles/editorial.css` 与 `styles/works.css` 是这两页的「作品集排版」：章节标题上方那条发丝线在标题进入视口时
从左画出，正文用满整列（VitePress 给的上限），页头下面那段按导语放大一档。

作品页还有几处自己的规矩：

- **不要右侧目录**（frontmatter `aside: false`），省下的宽度交给作品。VitePress 给「没有
  内容侧边栏」的页面留了 62rem（90rem 视口以上 69rem）、47rem 两道宽度，都挂在 scoped
  属性上（(0,4,0)），用重复类名压到 (0,5,0)，容器定在 66rem。
- **作品是一面墙**：九件作品统一是直接写的 `<article class="work-poster">`，网格直接铺在
  `.vp-doc` 的内容容器上——默认所有直接子元素通栏（章节标题、节导语、页首索引照旧），
  只有海报卡占一列，两列各 480px，卡面高度写死 `--fx-poster-h` 33rem。没有用瀑布流：
  规格统一才有墙的感觉，而且瀑布流按列填充，九件作品的阅读顺序会乱。
- 卡面内容是眉题 / 衬线标题 + 副标题 / 技术栈 / 版画 + 指标（数字从正文里提出来，都有
  出处）/ 导语，装不下的部分交给底部一条渐隐。渐隐下半段是实色——`overflow` 只裁到边框
  盒，溢出的文字会钻进 padding 区，光靠裁剪盖不住——展开键再用 z-index 压上去。
- 点「展开」就地铺满整行摊开看全部详情。高度要从固定值过渡到 auto，而 auto 不能插值，
  所以 `setupWorkPosters` 先临时摘掉过渡量一次完整高度当终点，过渡完再把内联高度交还给
  auto，窗口缩放时卡片还能自己适应。
- 作品名走衬线大字并挂一枚 mono 编号（CSS 计数器，增删作品不用改数字）。页面上现在只有
  卡片：章节标题、节导语、页首索引、原来的「技术栈」那节都已撤掉，分类信息留在卡片眉题
  里（`平台 · PLATFORM` 这种）。
- 每件作品配一张**版画**（`works/WorkPlate.vue`，Markdown 里写
  `<WorkPlate variant="nodes" tone="violet" code="01" />`）——竖版 3:5 的内联 SVG 纸片，
  大面积留白、整幅只有一个高饱和色锚点、脚边一行等宽微文字，纸色与墨色都吃 CSS 变量，
  明暗主题各一套。八个母题按各件作品的性质挑：节点网络、点云、并行轨道、面板网格、层叠
  格式、诊断脉冲、积木、页面框架，紫青两色交替。

另外几处不在这个文件里：

- **关于页「经历」是两张卡片** —— 主题包 `styles/editorial.css` 第 13 节：卡片外壳复用作品页那套（`.work-poster` + `.poster-toggle`），里面是卡头（机构名在左，时间与地点在右）、导语、01–03 的阶段摘要行，点展开才摊开每段的正文、技术栈与五款工具。卡面高度按内容分别定（18.4rem / 11rem），底距按展开键的落位算（3.4rem），收起时展开键的视口位置由脚本逐帧回拉。早期那版由脚本量测的滚动轨道早已删除。
- **关于页其余各节各有一个形态** —— 主题包 `styles/colophon.css` 第 15 节：章节标题右侧自动编号；「关注」是编号格言格（编号在左，品牌色竖线起头），「技能」是分类标签表，「玩 AI」是两列小卡（衬线名字 + 一句评），教育与联系收成版权页式双栏页尾。正文里对应写成 `<dl>` / `<div>` / 直接写的卡片，没有新增组件。
- **全站页脚** — `head/SiteFooter.vue` 挂在 `layout-bottom` 插槽，一行等宽版权页小字。
- **顶栏滚动后收成浮动胶囊** — 全站通用（原先只挂在首页）。纯 CSS，搭在默认主题自己的
  `.top` class 上，没有滚动监听；未滚动时内页顶栏也统一透明、不画分隔线。标题列一律按
  自然宽度走，搜索框全站都紧贴着站点标题。
- **文章页侧边栏：一块悬浮卡片** — 主题让侧边栏从视口顶一直铺到页尾、顶栏让出左侧那一列
  （`--vp-nav-col-offset`），顶栏因此被切开，站点标题也被拉成与侧边栏同宽、看着像侧边栏的
  一部分。这里反过来：顶栏从最左铺到最右、自成一条；侧边栏收成一块悬浮的圆角卡片
  （主题包 `styles/nav.css`）——半透明底 + 发丝描边 + 顶边内高光 + 三层投影 + 左上角一抹品牌紫的
  反射光，与顶栏胶囊同一套玻璃语言；卡片里分组名收成小眉题，当前项点亮左侧指示条，
  悬停整行轻微右移。主题原本塞在侧边栏里的那块 sticky 幕布（挡滚上来内容的色块）已去掉——
  滚动交给卡片自己的圆角裁切。
- **划词选中色、日期等宽数字** — 都在主题令牌层（`palette.css` / `tokens.css`）里，一处定义全站生效。
- **全文搜索** — VitePress 本地搜索，界面文案由 `fluxixixSite()` 中文化（默认主题的界面文案是写死的英文）。

## 部署

推送到 `main` 即触发 `.github/workflows/deploy.yml`，构建产物发布到 GitHub Pages。

Vercel 用同一份 `vercel.json`（`buildCommand: npm run docs:build`，
`outputDirectory: .vitepress/dist`）。Vercel Web Analytics 的脚本只在 production
构建时注入 —— 本地 dev 下 `/_vercel/insights/script.js` 会被 SPA 兜底成 HTML，
浏览器按 JS 解析就会报 `SyntaxError: Unexpected token '<'`。

## 两个需要注意的地方

- **这份 README 不会被发布**。`config.mts` 里 `srcExclude: ['**/README.md']`，
  它可以放心写面向开发者的话。
- **侧边栏是手动维护的，不跟文件系统同步**。新文章只建文件不补 `sidebar`，
  它不会出现在任何导航里。

# 更新日志

## 0.3.0

主题拆成独立仓库 `fluxixix/vitepress-theme-fluxixix`，并且改为**只发 GitHub**。
公共 API（`fluxixixTheme` / `fluxixixSite` / `rss` / `<WorkPlate>` / `exports` 的
路径名）一个没动，变的是装法。

### 破坏性变更（安装方式）

- **不再从 npm registry 装**，也不打算发布上去。改成 git tag：

  ```jsonc
  "vitepress-theme-fluxixix": "github:fluxixix/vitepress-theme-fluxixix#v0.3.0"
  ```

  命令行等价写法 `npm i -D github:fluxixix/vitepress-theme-fluxixix#v0.3.0`；
  没装 git 的机器用每个 tag 挂出来的 Release tgz。
- 包必须放在仓库根（npm 不支持从 git 仓库的子目录装包），所以主题从主站仓库的
  `packages/` 下搬了出来，历史用 `git subtree split` 保留。

### 修复

- **真实安装下构建失败**：`/site` 与 `/rss` 的入口指向 `.ts`。Vite 的配置加载器
  把裸导入一律标成 external，运行时由 Node 加载，而 Node 的类型剥离明确跳过
  `node_modules` 里的文件，于是外部用户 `vitepress build` 第一步就抛
  `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`。两个入口改成 `.js`（类型仍由
  `site.d.ts` / `src/rss.d.ts` 提供）。
  在 workspace 符号链接布局里这个坑看不见——`node_modules/vitepress-theme-fluxixix`
  是链接，Node 解析到 `packages/...` 的 `.ts` 时类型剥离是生效的。
- 新增 `scripts/check-pack-smoke.mjs`：`npm pack` 出的 tgz 解成**真目录**再建一个
  最小站点，把这条规则钉成 CI 断言（用符号链接的演示站测不出来）。
- `peerDependenciesMeta` 里那两条 `@fontsource/*` 之前是空转（没有对应的
  `peerDependencies` 条目），现在补进 `peerDependencies` 并标 optional。
- README 里「没装字体就不会构建失败」的说法不准确：`/fonts` 入口 import 这两个包，
  引了它就必须装。已改成可选 peer 的准确说法。

### 新增

- `bin/cli.js` + `template/`：零依赖脚手架，`npx github:fluxixix/vitepress-theme-fluxixix
  init my-blog` 直接生成一份能跑的站点。
- `LICENSE`（MIT）。
- 仓库自带 CI 与 Release 工作流：tag `v*` 触发检查并把 tgz 挂进 Release。
- `scripts/check-theme-layers.mjs`、`scripts/check-example-isolation.mjs` 随包走
  （两种布局都能跑），演示站 `examples/native-demo` 一起搬进新仓库。

## 0.2.0

### 破坏性变更（仅样式层面）

- **移除 `@fontsource-variable/fraunces`**。展示衬线改由 `Noto Serif SC` 一条栈承接
  拉丁与中文，不再自托管独立的拉丁展示字体。公共 API、导出与 `options` 全部不变。

  影响面：吃到 `--fx-font-serif` 的 9 个选择器（文章 `h1`/`h2`、首页刊头口号、作品名与
  指标、Now 页年份、编辑体页头、经历机构名、AI 卡片名）。中文标题观感不变——它们原本
  就由思源宋体渲染；变化的是其中的拉丁字符，以及行盒高度（思源宋体的固有度量比
  Fraunces 高约 6%，实测作品名 49.98px → 52.98px）。

  收益：每页字体下载净省约 **18 KB**（首页 254.6 → 236.9 KB），依赖从 5 项降为 4 项。
  之所以不是完整的 36 KB：`Fraunces` 那 36 KB 出去后，思源宋体会为拉丁字符多加载一片
  18 KB 的 `-latin` 切片。

  如果使用方更看重拉丁展示字的跨平台一致性，可以自行在站点样式里覆盖
  `--fx-font-serif` 并引入自己选的字体。

### 其它

- `vitepress-theme-fluxixix/fonts` 入口少引一个包；`peerDependenciesMeta` 去掉 Fraunces。
- README 新增「字体」一节，说明两层字体体系、拉丁字形随系统而异的取舍，以及正文
  `Inter` 的来龙去脉（VitePress 自带、构建时已本地化，非远程请求）。

## 0.1.0

首个版本：把 fluxixix 博客的主题从站点里抽成可发布的插件。

### 主题本体

- `fluxixixTheme(options?)`：在默认主题上叠一层编辑部式版式与交互，并接收站点参数
  （站名 / 标语 / 首页索引 / 页脚 / 目录约定 / 界面文案）。
- `fluxixixSite(themeConfig)`：补齐界面文案与本地搜索翻译。
- `rss({ siteUrl, ... })`：返回 `buildEnd` 钩子，构建结束后生成 `feed.xml`。
- 全局注册 `<WorkPlate>` 组件（八种母题、两种色调）。
- 入口 `vitepress-theme-fluxixix/fonts`：可选引入 Fraunces / 思源宋体 / IBM Plex Mono。

### 样式组织

- 样式从单文件 3363 行的 `custom.css` 拆成 17 册（令牌、导航、首页、正文、列表、
  归档、Now、作品、关于、页脚…），规则逐条保持原样。
- **主题样式刻意不写 @layer**：VitePress 默认主题的 vars.css 与组件 <style scoped>
  都未分层，而未分层的样式永远胜过命名层——主题一旦进层就会被默认主题反压
  （品牌色、悬浮导航胶囊、阅读进度环、侧边栏卡片、作品卡尺寸会同时失守且不报错）。
  主题因此靠"排在默认主题之后"取胜。
- 新增入口 `vitepress-theme-fluxixix/theme`：把主题本体与样式总表打包成一次导入，
  由包内固定先后顺序，使用方不会把顺序写反。
- 未启用的页面形态不产出任何节点，也不影响默认主题。

### 交互

- 点击粒子、明暗切换扩散、滚动揭示、作品墙展开、阅读进度条与进度环，均由
  `enhanceApp` 挂载，全部保留 `prefers-reduced-motion` / 无 JS / 旧浏览器降级。

### 示例站

- `examples/native-demo` 从两页扩成 10 页：首页刊头 + 最新文章、文章列表、归档时间轴、
  关于页，以及 2 篇虚构文章：技术侧《Markdown 全格式总览》把标题层级、文本修饰、链接、
  各类列表、表格、代码块（行高亮 / 差分 / 代码组 / 行号）、七种提示容器、脚注、任务列表
  逐项演示并给出写法；随笔侧一篇演示普通正文排版。内容全是编的。

### 验证

- `scripts/check-theme-layers.mjs`：层约定检查。断言包内样式未分层、总表覆盖全部
  分册，并直接读产物断言主题令牌排在 VitePress 默认变量之后（顺序反了就是被反压）。
- `scripts/check-example-isolation.mjs`：对 `examples/native-demo` 做 A/B 构建，
  断言装上主题后宿主页面 DOM 与纯默认主题逐字一致——主题只允许加四种由页面主动
  触发的节点（页脚 / 首页刊头 / 编辑体页头 / Now 页头），其余多一个类名都算失败。
- `scripts/check-rendered-parity.mjs`：用无头 Chromium（CDP 直连）把改造前后两套产物
  在 3 个视口下逐页对比计算样式与元素几何——只比 HTML 抓不到"被默认主题反压"这类问题。
- 迁出前后本站 17 个页面 HTML、`feed.xml`、`hashmap.json` 逐字节一致；
  8 个页面 × 3 个视口的计算样式与几何差异数为 0。

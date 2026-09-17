# 更新日志

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

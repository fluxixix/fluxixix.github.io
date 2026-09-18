---
title: Markdown 全格式总览
date: 2026-06-12
description: 主题下 Markdown 能写成什么样：标题层级、文本修饰、链接、各种列表、表格、代码块、七种提示容器、图片、脚注与任务列表，每一项都给出写法。
---

# Markdown 全格式总览

这一页是"照着抄"用的：左边是怎么写，下面就是渲染出来的样子。
默认的 VitePress Markdown 配置加上主题的排版，下面这些都能直接生效。

- 标题：`#` 到 `#####`，本篇从二级标题开始往下排
- 文本：**加粗**、*斜体*、~~删除线~~、`行内代码`、上标[^1]
- 链接：站内相对链接、带标题的链接、裸链接
- 列表：无序、有序、嵌套、任务列表、定义式列表（用表格代替）
- 表格：对齐、行内代码、行内链接
- 代码：语言高亮、行高亮、聚焦、差分、代码组、行号
- 容器：tip / info / warning / danger / details / important / caution

[^1]: 脚注是默认开启的。点这一行的角标能跳到这里，再点 ↩ 跳回去。

## 标题层级

`##` 用于章节。主题会给二级标题上方画一条发丝线，滚动进入视口时从左画到右。

### 三级标题 `###`

三级标题用于小节，字号比正文大一档。

#### 四级标题 `####`

四级标题再小一档，用来分更细的点。

##### 五级标题 `#####`

五级标题接近正文字号加粗，一般够用了。

## 文本修饰

| 写法 | 效果 |
| --- | --- |
| `**加粗**` | **加粗** |
| `*斜体*` | *斜体* |
| `***粗斜体***` | ***粗斜体*** |
| `` `行内代码` `` | `inline code` |
| `~~删除线~~` | ~~删除线~~ |
| `==高亮==` | 默认不开，见下面的说明 |
| `<kbd>Ctrl</kbd>+<kbd>C</kbd>` | <kbd>Ctrl</kbd>+<kbd>C</kbd> |
| `<mark>标记</mark>` | 需要自己写 HTML |

中文排版里 **加粗** 已经足够表达强调，斜体在中文里不明显，
删除线多用于"改口"，行内代码用于标识符与命令。

## 链接

- 绝对路径最稳：本页在 `posts/tech/` 下，引用 [归档](/archive) 直接写 `/archive`
- 也可以写 `.md` 让 VitePress 解析，路径相对当前文件：
  [笔记那篇](../notes/notes-for-future-me.md)
- 当前页锚点：[跳到代码块](#代码块)
- 带标题的链接：[VitePress 官网](https://vitepress.dev "VitePress")
- 裸链接会自动识别：https://vitepress.dev

::: tip 相对链接可以写 .md
`../notes/notes-for-future-me.md` 会被解析成构建后的 `/posts/notes/notes-for-future-me.html`，
不用手写扩展名。链接写错时构建会直接报 `dead link` 并失败，不会静默生成坏链接。
:::

## 列表

### 无序列表

主题给列表项换成了一枚细圆环标记，悬停时被品牌色填满：

- 第一项：圆环会随行高自动对齐中线
- 第二项：包含 `行内代码` 的条目
- 第三项：
  - 嵌套一层，缩进两个空格即可
  - 再嵌套一层
    - 第三层会缩得更紧

### 有序列表

有序列表保持数字，适合步骤：

1. 先做这个
2. 再做这个
3. 最后做这个

### 任务列表

- [x] 已经做完的
- [x] 另一件做完的
- [ ] 还没做的
- [ ] 另一个待办

任务列表用 `- [ ]` 与 `- [x]` 写，渲染出可勾选的方框（静态站点里不可交互）。

## 表格

列对齐用冒号控制：`:---` 左对齐、`:---:` 居中、`---:` 右对齐。

| 参数 | 类型 | 默认值 | 说明 |
| :--- | :---: | ---: | :--- |
| `host` | `string` | `localhost` | 监听地址 |
| `port` | `number` | `5173` | 端口，0 表示随机 |
| `open` | `boolean` | `false` | 启动后自动打开浏览器 |
| `strictPort` | `boolean` | `false` | 端口被占用时是否直接失败 |

表格里的 `行内代码`、[链接](../notes/notes-for-future-me.md) 与 <kbd>键位</kbd> 都能正常用。

## 代码块

### 语言高亮

````md
```ts
interface SiteConfig {
  title: string
  base?: string
}
```
````

渲染出来：

```ts
interface SiteConfig {
  title: string
  base?: string
}

const config: SiteConfig = { title: 'Flux Demo', base: '/' }
```

### 行高亮

在语言后面写 `{行号}`，可以指定单行、区间或多个区间：

````md
```ts{2,5-6}
```
````

```ts{2,5-6}
export function resolveOptions(raw: Options) {
  const site = { name: raw.site?.name ?? 'fluxixix' }

  return {
    site,
    brand: { a: raw.brand?.a ?? '#bd34fe' }
  }
}
```

### 聚焦（一屏只讲一段）

````md
```ts{1,7-8}
```
````

```ts{1,7-8}
export function resolveOptions(raw: Options) {
  const site = { name: raw.site?.name ?? 'fluxixix' }

  return {
    site,
    brand: { a: raw.brand?.a ?? '#bd34fe' }
  }
}
```

### 差分

在语言后面写 `diff`，用 `+` / `-` 标出增删：

````md
```diff
- const isReady = false
+ const isReady = checkReady()
```
````

```diff
- const isReady = false
+ const isReady = checkReady()

  if (!isReady) return
- console.warn('not ready')
+ throw new Error('尚未就绪')
```

### 代码组（多个标签页）

````md
::: code-group

```sh [npm]
npm run docs:build
```

```sh [pnpm]
pnpm docs:build
```

:::
````

::: code-group

```sh [npm]
npm run docs:build
```

```sh [pnpm]
pnpm docs:build
```

```sh [yarn]
yarn docs:build
```

:::

### 行号

在语言后面加 `:line-numbers`：

````md
```ts:line-numbers
```
````

```ts:line-numbers
const layers = ['palette', 'tokens', 'base', 'pages']

function order() {
  return layers.join(' → ')
}

console.log(order())
```

### 显示空白字符

````md
```ts:no-whitespace
```
````

```ts
const path = 'src/theme/index.ts'
```

### 行内代码

用单反引号写：`--fx-brand-a`、`@layer`、`npm run docs:dev`。

如果想要一段代码内联展示且不被解析，用双反引号包住即可：`` `{{ page }}` ``。

## 提示容器

以下七种容器，主题都做了样式（左侧色条 + 柔和底色）：

::: tip 提示
`::: tip` 用于补充信息，颜色跟着品牌青。
:::

::: info 信息
`::: info` 用于背景说明，语气比 tip 更中性。
:::

::: warning 注意
`::: warning` 用于可能出问题的地方。
:::

::: danger 危险
`::: danger` 用于会造成数据丢失或不可逆后果的操作。
:::

::: important 要点
`::: important` 用于必须记住的结论。
:::

::: caution 小心
`::: caution` 用于容易被忽略的坑。
:::

::: details 点开看更多
`::: details` 默认收起，适合放长内容或可选信息。
:::

可以加自定义标题：`::: tip 自定义标题`。

## 引用与分割线

> 引用块用 `>` 写。
> 主题在左侧加一条品牌渐变的竖线。
>
> 引用可以有多段。

---

分割线用三个短横线写，主题把它画成一条发丝线。

## 图片

```md
![替代文字](/fluxixix.svg)
```

示例站不引入位图，图片的用法和别的 VitePress 站点一致：
放在 `public/` 下用绝对路径，或与 Markdown 同目录用相对路径。

## 无需配置就能用的扩展

- **脚注**：`[^1]` 与 `[^1]: 内容`，见本篇开头
- **任务列表**：`- [ ]` / `- [x]`
- **Emoji**：直接写字符就行 ✅ ⚠️ 🚀 —— 注意简写语法（`:check:`）默认**不解析**，
  要装 `markdown-it-emoji` 并在 `markdown.config` 里挂上（见下一节）
- **目录锚点**：标题会自动生成 `#anchors`，右侧目录栏跟着滚

## 需要改配置才有的

这几项默认关掉，想用要在 `.vitepress/config.mts` 里打开：

```ts
import { defineConfig } from 'vitepress'
import emoji from 'markdown-it-emoji'

export default defineConfig({
  markdown: {
    // 外部链接后面加一个小箭头图标
    externalLinkIcon: true,
    // 行内数学公式（需要额外装 markdown-it-mathjax3）
    math: true,
    // 行级代码块的行号（也可以逐块写 :line-numbers）
    lineNumbers: true,
    // Emoji 简写：装了 markdown-it-emoji 才有 :check: 这种写法
    config: (md) => md.use(emoji)
  }
})
```

::: warning 本站没开这些
示例站用的是默认配置，所以上面几项在本页看不到效果。
要确认某个特性是否开启，最快的办法是构建后在产物里搜对应 class——
比如 `externalLinkIcon` 开启后，外部链接会多出 `vpi-external-link`。
:::

## 小结

这一页能渲染成什么样，取决于三件事：Markdown 本身、VitePress 的扩展、
以及**主题有没有给对应的元素写样式**。第三件最容易忽略——
容器、列表标记、表格线、代码块底色都属于主题的排版决定，
换主题时同一份 Markdown 会得到完全不同的观感。

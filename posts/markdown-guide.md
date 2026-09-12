---
title: Markdown 全格式示例
date: 2026-09-12
---

# Markdown 全格式示例

这篇文章集中演示 Markdown 的常见语法，方便随时对照查阅。

## 一、标题

# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题

## 二、文本样式

**加粗**、*斜体*、***加粗斜体***、~~删除线~~、`行内代码`、<u>下划线</u>。

也可以组合使用，比如 **加粗中的 *斜体* 部分**。

## 三、段落与换行

这是第一个段落。段落之间用空行分隔即可。

这是第二个段落。  
行尾加两个空格可以强制换行。

也可以在行尾直接使用反斜杠\
来实现换行。

## 四、列表

### 无序列表

- 苹果
- 香蕉
  - 小米蕉
  - 皇帝蕉
- 橙子

### 有序列表

1. 第一步
2. 第二步
   1. 子步骤一
   2. 子步骤二
3. 第三步

### 任务列表

- [x] 已完成的任务
- [ ] 未完成的任务
- [ ] 待办事项

## 五、引用

> 这是一段引用。
>
> > 这是嵌套引用。
>
> 引用中可以包含 **其他格式**，也可以放列表：
>
> - 引用里的列表项
> - 另一项

## 六、代码

行内代码：`const answer = 42`。

行内代码包含反引号：`` `code` ``。

代码块（带语法高亮）：

```js
function greet(name) {
  console.log(`Hello, ${name}!`)
}

greet('world')
```

```python
def fib(n: int) -> int:
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a

print(fib(10))
```

```bash
npm install
npm run dev
```

缩进式代码块（四个空格）：

    plain text code block
    second line

## 七、链接

行内链接：[VitePress 官网](https://vitepress.dev 'VitePress')。

自动链接：<https://github.com/fluxixix>。

引用式链接：[Markdown 规范][spec]，文中可多处复用。

[spec]: https://spec.commonmark.org 'CommonMark 规范'

相对链接：[回到文章列表](/posts/)。

锚点链接：[跳转到代码章节](#六代码)。

## 八、图片

![占位图描述](https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimalist%20flat%20illustration%20of%20a%20notebook%20and%20coffee%20on%20a%20desk%2C%20soft%20colors&image_size=landscape_16_9 '示例图片')

带链接的图片：

[![点击图片跳转](https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=small%20minimal%20icon%20of%20a%20link%20chain%2C%20flat%20style&image_size=square '图标')](https://vitepress.dev)

## 九、表格

| 语法 | 说明 | 是否常用 |
| :--- | :---: | ---: |
| `**bold**` | 加粗 | 是 |
| `*italic*` | 斜体 | 是 |
| `` `code` `` | 行内代码 | 是 |

精简写法：

名称 | 数量
--- | ---
苹果 | 3
香蕉 | 5

## 十、分隔线

---

## 十一、脚注

这里引用一个脚注[^1]，还有另一个[^note]。

[^1]: 这是第一个脚注的内容。

[^note]: 脚注可以包含多行文本，
    也可以换行缩进。

## 十二、转义字符

需要显示原本的符号时，用反斜杠转义：

\*不是斜体\*、\`不是代码\`、\# 不是标题、\[不是链接\]。

## 十三、内嵌 HTML

可以使用 HTML 实现 Markdown 之外的样式：

<div style="padding: 8px 12px; border-left: 3px solid #42b883;">
  这是一段用 HTML 写的提示框。
</div>

<br />

使用 <kbd>Ctrl</kbd> + <kbd>S</kbd> 保存文件。

## 十四、定义与术语（HTML 模拟）

<dl>
  <dt>Markdown</dt>
  <dd>一种轻量级标记语言，用于格式化纯文本。</dd>
  <dt>Frontmatter</dt>
  <dd>文件开头的元数据区块，用三个短横线包裹。</dd>
</dl>

## 十五、特殊字符

版权 ©、注册商标 ®、商标 ™、破折号 —— 、省略号 ……、箭头 → ← ↔、数学 ± × ÷ ≠ ≤ ≥。

## 十六、Vue 表达式（VitePress 特性）

在 VitePress 中可以直接使用 Vue 插值，例如 1 + 1 = {{ 1 + 1 }}。

如果不希望被解析，可以使用 v-pre 容器：

::: v-pre
这段文字里的 {{ 花括号 }} 会原样显示。
:::

## 十七、自定义容器（VitePress 特性）

::: tip 提示
这是一个提示容器。
:::

::: info 信息
这是一个信息容器。
:::

::: warning 警告
这是一个警告容器。
:::

::: danger 危险
这是一个危险容器。
:::

::: details 点击展开详情
这里是折叠起来的内容。
:::

## 十八、其他

行内笔记与高亮：==高亮文本==、下标 H~2~O、上标 x^2^。

（注：高亮、上下标属于扩展语法，需渲染器支持。）

至此，Markdown 的常见格式都已覆盖。

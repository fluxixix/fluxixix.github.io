---
title: CSS 自定义属性入门
date: 2026-08-15
description: 从声明、继承到 JS 动态修改，讲清 CSS 变量能做什么、不能做什么，附本站首页光晕的实例。
---

# CSS 自定义属性入门

CSS 自定义属性（俗称 CSS 变量）解决的是一个很老的问题：同一个值在样式表里写了很多遍，想改的时候改不干净。它的机制本身不复杂，但有几条规则和直觉不一致，值得单独记一下。

## 声明与读取

自定义属性必须以 `--` 开头，用 `var()` 读取：

```css
:root {
  --brand: #bd34fe;
  --radius: 6px;
}

.button {
  background: var(--brand);
  border-radius: var(--radius);
}
```

`:root` 等同于 `<html>`，所以写在这里的变量全局可读。但变量**不是**必须写在 `:root`——写在哪个选择器里，就只在那个元素及其后代生效。

## 作用域与继承

自定义属性默认可继承，这一点和普通属性不同，也是它比预处理器变量强的地方：

```css
.card {
  --pad: 1rem;
}

.card .title {
  /* 就近继承到 1rem */
  padding: var(--pad);
}

.card.compact {
  --pad: 0.5rem; /* 只覆盖这一层，后代自动跟着变 */
}
```

改一个变量的值，所有用到它的地方一起变。主题切换就是这么做的——给 `<html>` 换一个 class，全套颜色跟着切。

## 回退值

`var()` 的第二个参数是回退值，在变量**未定义**时启用：

```css
color: var(--text-color, #333);
```

注意回退值只在变量没定义时生效。如果变量定义了但值本身非法（比如把 `--size: abc` 用在 `width` 上），整个声明会退化成「无效」，不会走回退值。

## 命名与大小写

自定义属性**区分大小写**。`--Brand` 和 `--brand` 是两个不同的变量，这个坑在手动敲变量名时很容易踩。

命名建议和普通属性保持一致的风格，用短横线分段：`--color-brand`、`--space-md`、`--radius-sm`。

## 用 JS 动态修改

变量可以在运行时改，这是它和 Sass/Less 变量最根本的区别：

```js
element.style.setProperty('--glow-x', '24px')
```

本站首页右侧那个光晕就是这么做的：JS 只负责写入 `--vp-hero-glow-x/y`，动画和过渡全部交给 CSS。好处是 JS 每帧只改一个字符串，重排重绘的调度交给浏览器，比直接改 `style.transform` 更省心。

再配合 `transition` 就有平滑效果：

```css
.glow {
  transform: translate3d(var(--glow-x, 0px), var(--glow-y, 0px), 0);
  transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}
```

这里过渡作用在 `transform` 上，而不是变量本身——`transform` 本来就支持过渡，所以不需要额外注册变量。

## 想对变量本身做动画，需要 @property

如果确实要让变量自身的值平滑变化（比如做一个数字滚动的计数器），就必须先用 `@property` 声明它的类型：

```css
@property --progress {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}
```

没有类型信息时，浏览器只能把变量的值当成字符串，无法在 `50%` 和 `80%` 之间插值。现代浏览器已普遍支持 `@property`（Safari 16.4+、Firefox 128+）。

## 两个做不到的事

- **不能用在媒体查询的条件里**。`@media (min-width: var(--bp))` 是无效的，断点只能写死。
- **不能参与选择器**。变量是值，不是标识符。

还有一点：变量在计算时机上属于「替换后再解析」，所以里层的变量可以引用外层的，但反过来不行——它不会向上查找。

## 小结

自定义属性最实用的三个场景：主题（换 class 切整套配色）、组件参数（父级传值给子组件样式）、以及需要 JS 参与的动态效果。用之前先想清楚这个值会不会变、在哪个层级变，大部分样式表里的重复都能消掉。

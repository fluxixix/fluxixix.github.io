---
title: 项目
---

# 项目

::: warning 示例内容
除 dotfiles 外，以下项目均为虚构，仅用于预览排版。替换成自己的真实项目后，把这段提示一并删掉。
:::

做过和在做的东西，末尾附上日常在用的技术栈。

## 精选项目

### dotfiles

macOS 个人配置仓库。手写配置进仓库，插件、主题和补全交给各自的包管理器恢复；部署时每个工具目录软链接到 `~/.config`，换新电脑两条命令搬完。

- 技术栈：Bash + Fish + Homebrew（Brewfile）+ GitHub Actions
- 状态：长期维护
- 链接：[github.com/fluxixix/dotfiles](https://github.com/fluxixix/dotfiles)

核心约束是「仓库只放手写配置」：Neovim 插件、Yazi 风味、Fish 补全这类由包管理器分发的东西一律不入库。代价是首次部署多几步，换来的是 `git log` 里只有自己的改动。CI 会在 arm64 macOS runner 上跑静态检查与一致性校验，并用假 `HOME` 把部署脚本完整演一遍。

### 本站

这个站点本身也算一个项目：VitePress + 自定义主题，文章全部是 Markdown，推送到 main 自动构建发布。

- 技术栈：VitePress + TypeScript + GitHub Actions
- 状态：长期维护
- 链接：[fluxixix.github.io](https://fluxixix.github.io)

## 技术栈

只记录当下真实的取舍，不追求大而全。

### 常用语言

- **C** ——嵌入式
- **Python** —— 主力
- **TypeScript** —— Web

### 框架与库

- **Vue 3**
- **React**
- **Vite**
- **Node.js**

### 开发工具

- **VS Code** —— 主力编辑器
- **PyCharm** —— 以前的 Python 主力 IDE，太重了
- **Git** —— 版本控制

### 正在了解

- **Rust** —— 想搞明白那些工具为什么快
- **Tauri** —— 用它替代 Electron 写桌面端


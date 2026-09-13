---
title: dotfiles 操作指南：换新 Mac 只要两条命令
date: 2026-09-13
description: 一份 macOS dotfiles 的落地流程：从裸机到可用环境的两条命令、必须手动收尾的三件事、日常维护的 u 与提交前的本地校验。
---

# dotfiles 操作指南：换新 Mac 只要两条命令

这个仓库想解决的问题只有一个：**换一台 Mac，两条命令把环境搬回来**。

- 仓库：`git@github.com:fluxixix/dotfiles.git`
- 面向 Apple Silicon macOS：终端 Ghostty、Shell Fish、编辑器 Neovim（AstroNvim v5）、提示符 Starship，软件统一由 Homebrew 管理。
- 组织方式：**一个工具一个目录**，手写配置进仓库，插件、主题、补全交给各自的包管理器。

## 两条命令

```sh
git clone git@github.com:fluxixix/dotfiles.git ~/dotfiles
bash ~/dotfiles/scripts/restore.sh
```

路径建议就用 `~/dotfiles`：`scripts/setup.sh` 是按这个固定路径克隆并调用 `restore.sh` 的。

只想手动链接、不跑完整脚本也可以，等价的 Fish 写法如下（清单与 `restore.sh` 逐项一致）：

```fish
mkdir -p ~/.config
for dir in aerospace bat btop eza fish ghostty git go-musicfox lazygit npm nvim starship tmux yazi
    ln -s ~/dotfiles/$dir ~/.config/$dir
end
```

链接完还差 Yazi 的插件与风味——它们不在仓库里，需要单独恢复：

```fish
ya pkg install
```

## 从裸机开始

前置条件三件：

- Homebrew 与 Git；
- GitHub 的 SSH 访问（首次要把公钥加到 GitHub）；
- 登录 Mac App Store 账户，`Brewfile` 里有 `mas` 应用。

如果这台机器上什么都没有，直接跑 `scripts/setup.sh`，它把前置步骤也一起做了：

```sh
bash ~/dotfiles/scripts/setup.sh
```

脚本按顺序执行：测 GitHub SSH 连接 → 没配就生成密钥、加入 ssh-agent、写入 `~/.ssh/config` → 把公钥复制到剪贴板并打开 GitHub 的 SSH Keys 页面，等你按回车 → 复查连接 → 安装 Homebrew 与 git → 克隆仓库到 `~/dotfiles` → 调用 `restore.sh`。整个过程需要你动手的只有「在 GitHub 粘贴公钥」那一下。

## restore.sh 做了什么

按脚本里的真实顺序：

1. **准备**：创建 `~/.config`，写入 `~/.hushlogin`（登录时不再打印那一大段提示）。
2. **软链接 14 个配置目录**：`aerospace`、`bat`、`btop`、`eza`、`fish`、`ghostty`、`git`、`go-musicfox`、`lazygit`、`npm`、`nvim`、`starship`、`tmux`、`yazi` 各自链到 `~/.config/<同名>`，工具直接读。
3. **`brew bundle --file=~/dotfiles/Brewfile`**：一次装齐 formula、Cask 应用、VS Code 扩展、Cargo 与 uv 工具。
4. **TPM**：克隆 tmux 插件管理器并执行 `install_plugins`。
5. **默认 Shell**：把 fish 写进 `/etc/shells`，再 `chsh` 切过去（这一步需要 sudo）。
6. **Cargo 工具**：安装 `cargo-cache` 与 `cargo-update`。
7. **Fisher**：引导 Fish 插件管理器，然后 `fisher update` 装齐插件。

脚本以 `set -Eeuo pipefail` 运行，**任一步失败就中止**。唯一的例外是第 2 步：如果目标位置已经被一个真实的文件或目录占着，它会警告并跳过这一项，继续执行后面的步骤，不会覆盖你原有的东西。

## 必须手动收尾的三件事

脚本能自动的部分都自动了，剩下三件事只能人来：

- **sudo 授权**：写 `/etc/shells` 和 `chsh` 换默认 Shell 时。
- **Mac App Store 登录**：`mas` 相关应用要先在 App Store 登录账户。
- **`ya pkg install`**：恢复 Yazi 的插件与风味，这一步不在 `restore.sh` 里。

## 哪些东西不在仓库里

仓库只放手写配置，下面这些由包管理器按需恢复（都在 `.gitignore` 里）：

| 路径 | 由谁恢复 |
| --- | --- |
| `yazi/plugins/`、`yazi/flavors/` | `ya pkg` |
| `fish/completions/`、`fish/conf.d/`、Fisher 与 fzf 生成的函数 | Fisher |
| `tmux/plugins/` | TPM |
| Neovim 插件（由 `lazy-lock.json` 锁定版本） | lazy.nvim |
| `scripts/privacy-*.sh` | privacy.sexy 生成的产物，不入库 |

换来的是仓库小且可读：`git log` 里只有你自己写的东西，插件升级不会被误提交成「配置变更」。

## 日常怎么用

**改配置就是改仓库文件。** 因为 `~/.config/<工具>` 是软链接，你编辑的本来就是仓库里的那份，`git status` 立刻能看到改动；反过来 `git pull` 之后也无需重新部署。

**更新用 `u`。** 它一把梭更新全局工具与应用：Homebrew（含 `--greedy` 的 Cask）、Neovim 插件、`GOPATH/bin` 里的 Go 工具、rustup 与 cargo 包、npm/pnpm 全局包、uv 工具、Fisher 插件、tmux 插件、Yazi 插件，以及 `mas`。每个步骤独立执行、分别计数，某一步网络超时不会让整轮白跑，结尾看 `✓ All updated` 或 `✗ Update finished with N failure(s)`。

注意 `u` **不会拉取这个仓库**，同步配置要自己 `git pull`。

顺带几个高频缩写与按键（定义在 `fish/config.fish`）：

| 命令 / 按键 | 功能 |
| --- | --- |
| `v` / `lg` | `nvim` / `lazygit` |
| `el` / `et` | eza 长列表 / 目录树 |
| `pon` / `poff` | 设置 / 清除 Clash 代理环境变量 |
| `Ctrl-G` | ripgrep + fzf 实时搜索，`Ctrl-O` 在编辑器中打开匹配位置 |
| `y` | 打开 Yazi，退出后切换到选中的目录 |

## 提交前自测

改完脚本或 Brewfile，本地两条命令就能复现 CI：

```bash
bash scripts/ci-check.sh               # 静态检查 + 仓库一致性检查
bash scripts/restore-sandbox-test.sh   # 假 HOME + PATH 桩，完整跑一遍 restore.sh
```

`ci-check.sh` 做两类阻断检查：静态检查覆盖被跟踪的 shell 脚本（`bash -n`、`shellcheck` 的 error 级）、`Brewfile` 的 Ruby 语法、fish 文件语法；一致性检查确认「`restore.sh` 的清单 ↔ 仓库实物 ↔ README 里的清单」三者逐项一致（顺序也算），并保证被忽略的文件没有被重新跟踪、`Brewfile` 里的 tap 没有死条目且都带 `trusted: true`。`.gitignore` 里的失效规则和失效软链接只报告、不阻断。

`restore-sandbox-test.sh` 用假 `HOME` 加桩命令跑完整流程，断言退出码、每个软链接都正确建立、无失效链接、重复执行幂等、拒绝覆盖已被真实目录占用的目标，并从桩命令日志确认没有真的装或卸任何软件。

CI 在 GitHub 托管的 arm64 macOS runner 上执行同样两条命令，push 到 `main`、开 PR 或手动触发都跑。它不覆盖的部分：不真的执行 `brew bundle` 装软件、不执行 `chsh` 与写 `/etc/shells`、不跑 `setup.sh` 里的 SSH 与 Homebrew 安装段。

## 几条容易踩的地方

- **别改克隆路径**。想跑 `setup.sh` 就老老实实放在 `~/dotfiles`，否则它会认为「还没克隆」而再克隆一份；放在别处的话，只用 `restore.sh` 即可。
- **软链接目标被占用会跳过**。想接管某个工具，先把 `~/.config/<工具>` 原来的真实目录挪走——脚本不会替你覆盖。
- **加新工具要改两个地方**。往 `restore.sh` 的 `for dir in ...` 清单里加名字，同时同步 README 里那份 fish 清单，否则 `ci-check.sh` 会直接报不一致。
- **`Brewfile` 是手工维护的**。`u` 不再自动重写它，新增或移除依赖得自己编辑，非官方 tap 要保留 `trusted: true`。

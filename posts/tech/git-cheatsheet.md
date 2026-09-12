---
title: Git 常用命令速查
date: 2026-08-30
description: 按场景整理的 Git 命令清单：提交、分支、撤销、排查历史，以及几条容易踩的坑。
---

# Git 常用命令速查

按使用场景整理，不追求全，只收录日常真正会敲的那些。

## 提交

```bash
git status -sb              # 简短的当前状态
git diff                    # 未暂存的改动
git diff --staged           # 已暂存的改动
git add path/to/file        # 暂存指定文件
git commit -m "message"     # 提交
git log --oneline -5        # 最近 5 条提交
```

建议用 `git add <具体文件>` 而不是 `git add -A`。后者会把 `.env`、本地配置、临时文件一并塞进提交里，这类事故一次就够了。

提交信息写「为什么」而不是「改了什么」——「改了什么」看 diff 就知道，「为什么」只能靠提交信息留住。需要多段说明时重复使用 `-m`：

```bash
git commit -m "标题" -m "详细说明的第一段" -m "第二段"
```

## 分支

```bash
git switch -c feature/x     # 新建并切换（Git 2.23+）
git switch main             # 切回主分支
git branch                  # 列出本地分支
git branch -d feature/x     # 删除已合并的分支
git merge feature/x         # 合并到当前分支
```

`switch` 和 `restore` 是为了把 `checkout` 的两种职责拆开而引入的，新项目建议直接用新命令。

## 撤销

```bash
git restore file            # 丢弃工作区改动
git restore --staged file   # 取消暂存，保留改动
git reset --soft HEAD~1     # 撤销最近一次提交，改动回到暂存区
git commit --amend          # 修改最近一次提交
```

关于 `--amend` 有一条硬规矩：**只对尚未推送的提交使用**。已经推上去的提交被 amend 之后，本地和远端的历史就分叉了，别人拉取时会很难受。

## 排查

```bash
git log --stat              # 每次提交带了哪些文件
git log -p -- path/to/file  # 某个文件的完整变更历史
git blame path/to/file      # 逐行看是谁、哪次提交改的
git reflog                  # 所有 HEAD 移动记录
git show <commit>           # 查看某次提交的内容
```

`git reflog` 是救命的：误删分支、误 reset 之后，只要 commit 还在 reflog 里就能捞回来。

## 暂存与远程

```bash
git stash                   # 把当前改动收起来
git stash pop               # 取回最近一次 stash
git fetch                   # 拉取远端信息，不改工作区
git pull --rebase           # 拉取并变基，历史更干净
git push -u origin main     # 首次推送并建立追踪关系
```

推送被拒时，先 `git pull --rebase` 再推，不要动 `--force`。强推会把别人的提交冲掉，除非你非常确定那个分支只有自己在用。

## 几条容易踩的坑

- **行尾符**：跨平台协作时用 `.gitattributes` 统一，否则 diff 里全是整行变更。
- **文件名大小写**：macOS 文件系统默认不区分大小写，`git mv a.md A.md` 可能没反应，需要 `git mv a.md tmp && git mv tmp A.md`。
- **`.gitignore` 对已跟踪文件无效**：已经提交过的文件再加进 `.gitignore` 不会生效，得先 `git rm --cached <file>`。

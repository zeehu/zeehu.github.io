---
title: Git 常用命令速查手册：从入门到进阶
date: 2025-11-28 11:00:00
tags: [Git, Version Control, Cheatsheet, CLI]
categories: [Tools]
description: 一份详尽的 Git 常用命令清单，涵盖全局配置、分支管理、远程同步、撤销操作及暂存区使用，助你高效管理代码版本。
---

Git 是现代软件开发中不可或缺的版本控制工具。无论你是初学者还是经验丰富的开发者，一份详细的命令速查手册都能在关键时刻通过查阅帮你解决问题。

本文整理了日常开发中使用频率最高的 Git 命令及其详细解释。

## 1. 初始化与配置 (Setup & Config)

在开始使用 Git 之前，或者在新的环境中，首先需要进行身份配置。

```bash
# 设置全局用户名
git config --global user.name "Your Name"

# 设置全局邮箱
git config --global user.email "your_email@example.com"

# 初始化当前目录为 Git 仓库
git init

# 克隆远程仓库
# format: git clone <url>
git clone https://github.com/username/repository.git
```

> **技巧**: 使用 `git config --list` 可以查看当前的配置信息。

## 2. 基础工作流 (Basic Snapshotting)

这是最日常的操作循环：修改代码 -> 添加到暂存区 -> 提交。

```bash
# 查看文件状态 (哪些修改了、哪些未追踪)
git status

# 将文件添加到暂存区 (Staging Area)
git add <filename>      # 添加指定文件
git add .               # 添加当前目录下所有变动 (包括新文件和修改，不包括被删除的)
git add -A              # 添加所有变动 (包括删除的文件)

# 提交暂存区的改动到本地仓库
git commit -m "你的提交信息"

# 修改上一次的提交信息 (如果还没有推送到远程)
git commit --amend
```

## 3. 分支管理 (Branching & Merging)

分支是 Git 的杀手级功能，允许你安全地隔离开发新功能。

```bash
# 列出所有本地分支 (* 号表示当前所在分支)
git branch

# 列出所有远程分支
git branch -r

# 创建新分支
git branch <branch-name>

# 切换分支
git checkout <branch-name>
# 或者使用新版命令 (推荐)
git switch <branch-name>

# 创建并立即切换到新分支
git checkout -b <branch-name>
# 或者新版命令
git switch -c <branch-name>

# 删除分支
git branch -d <branch-name>   # 删除已合并的分支 (安全)
git branch -D <branch-name>   # 强制删除未合并的分支

# 合并分支 (将 branch-name 合并到当前分支)
git merge <branch-name>
```

## 4. 远程同步 (Sharing & Updating)

与团队协作时，你需要频繁地与远程仓库 (Remote) 交互。

```bash
# 查看远程仓库地址
git remote -v

# 添加远程仓库
git remote add origin <url>

# 拉取远程代码并自动合并 (相当于 git fetch + git merge)
git pull origin <branch-name>

# 将本地代码推送到远程
git push origin <branch-name>

# 第一次推送并建立追踪关系 (之后只需 git push)
git push -u origin <branch-name>
```

## 5. 撤销与回滚 (Undo & Reset)

**注意**: 涉及回滚的操作通常比较危险，请谨慎使用。

### 撤销工作区的修改 (未 add)
```bash
# 丢弃某个文件的修改，恢复到最近一次 commit 的状态
git checkout -- <filename>
# 或者新版命令
git restore <filename>
```

### 撤销暂存区的修改 (已 add，未 commit)
```bash
# 将文件从暂存区移出，放回工作区
git reset HEAD <filename>
# 或者新版命令
git restore --staged <filename>
```

### 回退版本 (已 commit)
```bash
# 软重置：回退到指定版本，保留工作区和暂存区的修改 (Commit 消失，代码还在)
git reset --soft HEAD^

# 混合重置 (默认)：回退到指定版本，保留工作区修改，清空暂存区
git reset HEAD^ 
# 或者
git reset --mixed HEAD^

# 硬重置：彻底回退到指定版本，丢弃所有修改 (危险！代码会丢失)
git reset --hard HEAD^
# 也可以指定 commit id
git reset --hard <commit-id>
```

> `HEAD^` 表示上一个版本，`HEAD^^` 表示上上一个版本，也可以用 `HEAD~2`。

### 撤销某次提交 (Revert)
如果你已经推送到远程，不建议使用 `reset`，因为会修改历史。应该使用 `revert` 生成一个新的提交来“反转”之前的修改。

```bash
git revert <commit-id>
```

## 6. 临时保存 (Stashing)

当你正在开发功能 A，突然需要切换分支去修复 Bug，但功能 A 还没做完不想 commit 时，`stash` 非常有用。

```bash
# 将当前未提交的修改 (工作区和暂存区) 存入堆栈
git stash

# 给 stash 加个备注，方便查找
git stash save "正在开发登录功能"

# 查看 stash 列表
git stash list

# 恢复最近一次 stash 的内容，并从堆栈中删除
git stash pop

# 恢复最近一次 stash 的内容，但保留在堆栈中
git stash apply

# 清空所有 stash
git stash clear
```

## 7. 查看日志 (Inspection)

```bash
# 查看提交历史
git log

# 查看简洁的提交历史 (一行显示)
git log --oneline

# 查看最近几次的提交
git log -n 3

# 查看图形化的分支合并历史
git log --graph --oneline --all

# 查看某个文件的修改历史
git log -p <filename>

# 查看工作区与暂存区的差异
git diff

# 查看暂存区与最新 commit 的差异
git diff --cached
```

## 8. 常见问题速查

*   **`.gitignore` 不生效？**
    如果文件已经被 Git 追踪过（commit 过），后来才加入 `.gitignore`，它是不会被忽略的。你需要先从缓存中删除它：
    ```bash
    git rm -r --cached .
    git add .
    git commit -m "Fix .gitignore"
    ```

*   **合并冲突 (Conflict) 怎么办？**
    1.  运行 `git status` 查看冲突文件。
    2.  手动打开文件，搜索 `<<<<<<<`，`=======`，`>>>>>>>` 标记。
    3.  保留你想要的代码，删除标记符号。
    4.  `git add <file>` 标记为已解决。
    5.  `git commit` 完成合并。

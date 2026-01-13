---
title: 解锁 AI 编程新范式：Planning with Files (文件驱动规划)
date: 2026-01-08
description: 深入解析 planning-with-files 核心思想，并提供开箱即用的通用实现方案，让任何 LLM 都能拥有"三思而后行"的工程能力。
---

在 AI 辅助编程的领域，我们经常遇到一个问题：对于简单的任务，AI 表现完美；但一旦任务变得复杂（涉及多个文件、复杂的依赖关系或长链路的逻辑），AI 往往会"迷路"。它可能会忘记之前的改动，或者在修补一个 Bug 时引入三个新 Bug。

**[planning-with-files](https://github.com/OthmanAdi/planning-with-files)** 项目提供了一个优雅的解决方案。本文将深入解析其核心思想，并介绍我基于此开发的通用实现：**[planning-with-files-no-skill](https://github.com/zeehu/planning-with-files-no-skill)**。

---

## 1. 什么是 Planning with Files？

这个项目的核心思想非常简单但深刻：**强制 AI 使用文件系统作为其"长期记忆"和"思维锚点"。**

在传统的 Chat 模式中，AI 的上下文都在对话历史里。随着对话变长，早期的上下文会被截断或"遗忘"（注意力衰减）。而 `planning-with-files` 强制 AI 在执行任何复杂任务前，必须遵循以下工作流：

1. **创建计划 (`task_plan.md`)**：详细列出目标、步骤和当前状态
2. **记录发现 (`findings.md`)**：在阅读代码或调研时，将关键信息记录下来
3. **追踪进度 (`progress.md`)**：每完成一步，就更新操作日志和遇到的错误

这种模式模拟了人类高级工程师的工作方式——**先设计，再编码**。

### 为什么它有效？

| 机制 | 效果 |
| :--- | :--- |
| **注意力操控** | AI 每次行动前重新读取计划文件，注意力被强行拉回"当前任务"和"最终目标" |
| **上下文持久化** | 对话可能被截断，但文件是持久的，计划文件就是一个外部状态机 |
| **错误循环规避** | 通过强制记录 Error Log，防止 AI 在同一个问题上反复尝试 |
| **用户反馈循环** | 用户可以在 AI 写代码前先审查计划文件，从源头纠正错误路径 |

---

## 2. 通用实现：planning-with-files-no-skill

原始的 `planning-with-files` 项目是作为 Claude Code 的 Skill 实现的。但实际上，这种能力的本质**不是代码，而是一段精心设计的 System Prompt**。

我将这种"思维模型"抽取并通用化，开发了 **[planning-with-files-no-skill](https://github.com/zeehu/planning-with-files-no-skill)** 项目：

> 为**不支持 Skill 插件系统**的 Code Agent 量身定制的持久化规划工作流。
> 
> 通过简单的 **Prompt 注入**，让任何具有文件读写能力的 AI 代理（如 Gemini CLI、Open-webui、Cursor 等）都能拥有类似 [Manus AI](https://manus.ai/) 的"持久化规划"能力。

### 核心理念：Manus 风格工作流

项目采用三大核心文件来管理任务：

```
.planning/
├── task_plan.md    # 总计划：拆分阶段，实时更新
├── findings.md     # 知识库：存入调研细节，永不丢失  
└── progress.md     # 操作日志：记录每一步的操作和遇到的错误
```

---

## 3. 快速上手指南

### 方式一：完整版 (推荐)

**适合长期项目**，安装包含完整协议文档、模板和辅助脚本的目录。

```bash
# 克隆项目
git clone https://github.com/zeehu/planning-with-files-no-skill.git

# 安装到你的目标项目
bash install.sh ../my-awesome-project
```

然后将 `planning-with-files/SKILL.md` 的内容复制到你的 Agent System Prompt 中。对于 Gemini CLI 用户，直接复制到项目根目录的 `GEMINI.md` 文件即可。

### 方式二：简易版 (Lite)

**适合快速体验或临时任务**，无需安装任何文件，仅需一段 Prompt。

1. 复制项目中的 [SYSTEM_PROMPT_simple.md](https://github.com/zeehu/planning-with-files-no-skill/blob/main/SYSTEM_PROMPT_simple.md) 内容
2. 粘贴到你的 AI Agent 的 System Prompt 中
3. 向 Agent 下达复杂任务指令

Agent 会根据 Prompt 中的指令，自动在当前目录下创建 `.planning/` 目录并初始化所需的三大规划文件。

> **提示**：如需强制触发规划模式，可在任务 prompt 前加入 `使用 planning_with_files：`

---

## 4. 核心 Prompt 解析

要实现类似的功能，你只需要在 System Prompt 中注入以下核心指令：

### A. 核心强制命令 (Core Mandates)

```markdown
# Core Mandates
1. **Plan First:** Before writing any code, you MUST create or update `task_plan.md`.
2. **Step-by-Step:** Break down the task into small, verifiable steps.
3. **No Blind Coding:** Do not implement features without an approved plan.
4. **Error Logging:** Record all errors to prevent repeated failures.
```

### B. 工作流定义 (Workflows)

```markdown
# Primary Workflow
1. **Understand:** Read existing files and context.
2. **Plan:** Create `.planning/task_plan.md` with:
   - User Goal
   - Proposed Changes (File by File)
   - Verification Strategy
3. **Record:** Save key findings to `.planning/findings.md`
4. **Execute:** Implement changes strictly according to the plan.
5. **Update:** Mark steps as completed, log errors to `.planning/progress.md`
```

### C. 约束与禁止 (Constraints)

```markdown
# Absolute Prohibitions
- NEVER merge planning and execution phases
- NEVER modify a plan without updating task_plan.md
- NEVER execute multiple steps at once
- NEVER hide intermediate state
- NEVER repeat the same failed approach
```

---

## 5. 完整示例：GEMINI.md 模板

将上述理念整合，我们可以创建一个通用的 Prompt 文件。以下是简化版核心结构：

```markdown
# Gemini CLI System Prompt
# Purpose: Integrate planning-with-files as a native capability

You are running inside **Gemini CLI**.
Your behavior MUST strictly follow the rules below.

---

## Global Principles (Highest Priority)

1. All actions must be explicit, auditable, and file-based
2. Planning and execution MUST be separated
3. Intermediate reasoning MUST be persisted to files
4. Never rely on hidden chain-of-thought
5. Never skip steps for complex tasks

---

## Directory Convention (STRICT)

.planning/
├── task_plan.md      # Main plan with phases and steps
├── findings.md       # Research notes and discoveries
└── progress.md       # Execution log and error records

---

## Plan File Format (task_plan.md)

# Task Plan

## Goal
<clear goal>

## Phases
### Phase 1: <name>
- [ ] Step 1.1
- [ ] Step 1.2

### Phase 2: <name>
- [ ] Step 2.1

## Success Criteria
- criterion 1
- criterion 2

---

## Rules

1. **Before ANY code change**: Read and update task_plan.md
2. **When researching**: Save discoveries to findings.md
3. **After EACH step**: Update progress.md with status/errors
4. **On error**: Log to progress.md, analyze, propose new approach

---

## Skill Selection

- If task involves multi-step reasoning → Use Planning Mode
- If user mentions "规划", "step-by-step", "拆解" → Use Planning Mode
- Simple queries → Direct response
```

---

## 6. 总结

`planning-with-files` 不仅仅是一个工具，它是一种 **Prompt Engineering Pattern（提示词工程模式）**。

通过将这种模式显式地写在 `GEMINI.md` 或项目的配置文件中，我们实际上是在为 AI 编写"元程序"——即"指导 AI 如何编程的程序"。这使得我们能够用自然语言定义复杂的软件工程标准，并将 AI 从一个简单的"代码补全工具"提升为一个"能够自我管理的智能代理"。

### 相关资源

- **通用实现**：[zeehu/planning-with-files-no-skill](https://github.com/zeehu/planning-with-files-no-skill) — 开箱即用，支持任何 AI Agent
- **原始项目**：[OthmanAdi/planning-with-files](https://github.com/OthmanAdi/planning-with-files) — Claude Code Skill 版本
- **灵感来源**：[Manus AI](https://manus.ai/) — 持久化规划的先驱

无论你使用的是 Gemini CLI、Cursor、Windsurf 还是简单的 Web 版 Chat 界面，试着把这个 Prompt 注入给 AI，你会发现它的逻辑能力将得到质的飞跃。

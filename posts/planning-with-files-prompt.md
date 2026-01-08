---
title: 解锁 AI 编程新范式：Planning with Files (文件驱动规划)
date: 2026-01-08
description: 深入解析 planning-with-files 项目，并演示如何将这一核心思想抽取为通用的 Prompt (GEMINI.md)，让所有 LLM 都能拥有“三思而后行”的工程能力。
---

在 AI 辅助编程的领域，我们经常遇到一个问题：对于简单的任务，AI 表现完美；但一旦任务变得复杂（涉及多个文件、复杂的依赖关系或长链路的逻辑），AI 往往会“迷路”。它可能会忘记之前的改动，或者在修补一个 Bug 时引入了三个新 Bug。

最近，GitHub 上的一个热门项目 **[planning-with-files](https://github.com/OthmanAdi/planning-with-files)** 提供了一个优雅的解决方案。

## 1. 什么是 Planning with Files？

这个项目的核心思想非常简单但深刻：**强制 AI 使用文件系统作为其“长期记忆”和“思维锚点”。**

在传统的 Chat 模式中，AI 的上下文都在对话历史里。随着对话变长，早期的上下文会被截断或“遗忘”（注意力衰减）。而 `planning-with-files` 强制 AI 在执行任何复杂任务前，必须遵循以下工作流：

1.  **创建计划 (`task_plan.md` / `Implementation-Plan.md`)**：详细列出目标、步骤和当前状态。
2.  **记录笔记 (`notes.md` / `Scratchpad`)**：在阅读代码或调研时，将关键信息记录下来，而不是仅仅保留在“脑子”（对话上下文）里。
3.  **执行与更新**：每完成一步，就去更新计划文件的状态（打勾 ✅）。

这种模式模拟了人类高级工程师的工作方式——**先设计，再编码**。

### 为什么它有效？

*   **注意力操控 (Attention Manipulation)**：当 AI 每次行动前都重新读取计划文件时，它的注意力被强行拉回到“当前任务”和“最终目标”上，减少了幻觉。
*   **上下文持久化**：对话可以无限长，但文件是持久的。计划文件就像是一个外部的 State Machine（状态机）。
*   **用户反馈循环**：用户可以在 AI 写代码前先审查计划文件，从源头纠正错误路径。

---

## 2. 核心不在于工具，而在于 Prompt

`planning-with-files` 原项目是作为 Claude Code 的一个 Skill 实现的。但实际上，这种能力的本质**不是代码，而是一段精心设计的 System Prompt（系统提示词）。**

这意味着，我们完全可以将这种“思维模型”抽取出来，注入到 Gemini、ChatGPT 或任何其他强大的 LLM 中，让它们也具备同样的能力。

在本博客的构建过程中，我们就使用了完全相同的理念。我们将这些规则封装在了一个名为 `GEMINI.md` 的文件中（你可以将其视为项目的“宪法”）。

### 如何抽取核心 Prompt？

要实现类似的功能，你不需要复杂的 Python 脚本，只需要在你的 System Prompt 或 Custom Instructions 中加入以下**核心指令**：

#### A. 核心强制命令 (Core Mandates)

```markdown
# Core Mandates
1. **Plan First:** Before writing any code, you MUST create or update a file named `Implementation-Plan.md`.
2. **Step-by-Step:** Break down the task into small, verifiable steps.
3. **No Blind Coding:** Do not implement features without an approved plan.
```

#### B. 工作流定义 (Workflows)

```markdown
# Primary Workflow
1. **Understand:** Read existing files and context.
2. **Plan:** Create `Implementation-Plan.md` with:
    - User Goal
    - Proposed Changes (File by File)
    - Verification Strategy
3. **Review:** Ask the user to confirm the plan.
4. **Execute:** Implement the changes strictly according to the plan.
5. **Update:** Mark steps as completed in `Implementation-Plan.md`.
```

#### C. 工具使用规范

告诉 AI 如何使用它手中的工具（如 `write_file`, `read_file`）来维护这个计划。

---

## 3. 实战：打造你的 `GEMINI.md`

将上述理念整合，我们可以创建一个通用的 Prompt 文件。在本项目中，我们使用 `GEMINI.md` 作为上下文文件。当你开始一个新的会话时，只需将这个文件的内容投喂给模型，或者配置为 System Prompt。

**示例结构 (GEMINI.md):**

```markdown
# Gemini CLI System Prompt
# Purpose: Integrate planning-with-files as a native Skill

You are running inside **Gemini CLI**.
You have access to:
- The local file system
- Shell execution
- Python execution
- Reading and writing files

Your behavior MUST strictly follow the Skills definition below.

---

## Global Principles (Highest Priority)

1. All actions must be explicit, auditable, and file-based
2. Planning and execution MUST be separated
3. Intermediate reasoning MUST be persisted to files
4. Never rely on hidden chain-of-thought
5. Never skip steps for complex tasks
6. Prefer deterministic, reproducible outputs

---

# Available Skills

## Skill: FileBasedPlanner

### Concept Origin
Inspired by the planning-with-files approach:
- Plans are materialized as files
- Each step is explicit
- Execution is incremental and inspectable

### Responsibility
- Decompose complex tasks into executable steps
- Persist plans, states, and results to files
- Coordinate multi-step reasoning via file I/O

### Mandatory Workflow
For any non-trivial task, you MUST follow this sequence:

1. Plan
   - Generate a step-by-step plan
   - Save it to a file
2. Execute
   - Execute steps one by one
   - Persist outputs after each step
3. Verify
   - Validate results
   - Write a verification report

---

### Directory Convention (STRICT)

All planning-related files MUST follow this structure:

planning/
├── plan.md
├── steps/
│   ├── step_01.md
│   ├── step_02.md
│   └── ...
├── execution/
│   ├── step_01.log
│   ├── step_02.log
│   └── ...
├── artifacts/
│   ├── generated_code.py
│   ├── data_output.csv
│   └── ...
└── summary.md

Missing directories MUST be created automatically.

---

### Plan File Format (plan.md)

# Task Plan

## Goal
<clear goal>

## Assumptions
- assumption 1
- assumption 2

## Steps
1. Step name
2. Step name

## Success Criteria
- criterion 1
- criterion 2

---

### Step File Format (steps/step_xx.md)

# Step XX: <title>

## Objective
What this step achieves

## Input
Required files or data

## Action
Exact operation

## Output
Generated files

---

### Execution Log Format (execution/step_xx.log)

- Command outputs
- Execution results
- Errors if any
- No narrative text

---

### Summary File Format (summary.md)

# Execution Summary

## Completed Steps
- Step 01
- Step 02

## Generated Artifacts
- file1
- file2

## Validation Result
PASS / FAIL

## Notes
Caveats or follow-ups

---

### Constraints (STRICT)

- NEVER merge planning and execution
- NEVER modify a plan without rewriting plan.md
- NEVER execute multiple steps at once
- NEVER hide intermediate state
- NEVER assume unstated intent

---

### Output Rules

- Planning: write files, minimal console text
- Execution: commands and logs only
- Explanation: only in markdown files

---

## Skill: FileExecutor

### Responsibility
- Execute exactly what is defined in step files
- No improvisation

### Rules
- Execute ONE step at a time
- Stop immediately on error
- Persist all outputs

---

## Skill: FileVerifier

### Responsibility
- Validate outputs against success criteria
- Perform sanity checks
- Report inconsistencies

---

# Skill Selection Rules

- If the task involves multi-step reasoning, data processing, or code execution, ALWAYS use FileBasedPlanner
- If the user mentions planning, step-by-step execution, or拆解, ALWAYS use FileBasedPlanner

---

# Absolute Prohibitions

- Do NOT output hidden reasoning
- Do NOT skip file creation
- Do NOT overwrite files silently

Failure to follow these rules is a critical error.

```

## 4. 总结

`planning-with-files` 不仅仅是一个工具，它是一种**Prompt Engineering Pattern（提示词工程模式）**。

通过将这种模式显式地写在 `GEMINI.md` 或项目的 `rules` 文件中，我们实际上是在为 AI 编写“元程序”——即“指导 AI 如何编程的程序”。这使得我们能够用自然语言定义复杂的软件工程标准，并将 AI 从一个简单的“代码补全工具”提升为一个“能够自我管理的智能代理”。

无论你使用的是 Cursor、Windsurf 还是简单的 Web 版 Chat 界面，试着先把这个 Prompt 发送给 AI，你会发现它的逻辑能力将得到质的飞跃。

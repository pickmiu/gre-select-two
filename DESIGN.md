# GRE 6选2单页应用 - 设计与架构文档 (DESIGN.md)

## 1. 系统架构概述 (System Architecture)

本项目为单页应用（SPA），采用数据驱动与状态机架构：

```text
[ CSV 数据源 ] ──> [ PapaParse 解析 ] ──> [ Zustand Store (WordStore / QuizStore) ]
                                                        │
                                                        ▼
[ 视图层 (React + Tailwind) ] <── [ LocalStorage (Zustand Persist) ]
```

- **数据层**：`src/data/words.csv` (词库) 与 `src/data/questions.csv` (430+ 题库)。
- **状态层**：`useWordStore` (选词/检索/已掌握状态) 与 `useQuizStore` (练习会话/队列/判定)。
- **持久化**：`Zustand persist` 自动与 `localStorage` 同步。

---

## 2. 核心业务流程 (Core Workflows)

### 2.1 题目生成与校验 (`questionGenerator.ts`)
1. 用户在词库页面勾选需要练习的单词列表 `selectedWords`。
2. 系统针对每个勾选单词在题库中检索包含该词的 6选2 题目，并**随机挑选 1 道**。
3. 若存在单词在题库中缺失题目，中止练习并弹出弹窗列出缺失单词。
4. 使用 Fisher-Yates 算法打乱题目顺序，生成初始 `questionQueue`。

### 2.2 统一动态队列与连贯进度 (Unified Session Queue)
- **动态 +1 机制**：用户答错或点击“不认识”时，系统将当前题目追加到 `questionQueue` 末尾，总题数 (`questionQueue.length`) **实时 +1**。
- **连续序号显示**：进度条统一显示 `第 currentIndex + 1 / questionQueue.length 题`，在错题重做阶段不重置序号。
- **状态标记**：
  - 一次性答对：标记为 `green`（绿）。
  - 答错 / 不认识 / 重做中：标记为 `yellow/red`（红）。

### 2.3 6选2 判定与反馈 (Evaluation & Feedback)
- **判定逻辑**：用户选中 2 项后自动判定，要求选中的 2 个选项完全匹配 `answers` 集合。
- **全对反馈**：绿色高亮 + 脉冲动画 + 手机震动 (`navigator.vibrate`) + ~850ms 自动跳下一题。
- **错误/不认识反馈**：
  - 选项触发 Shake 摇晃动画。
  - 展开**单行极简背诵面板**：以 `主词 = 等价词1, 等价词2... [ 中文释义 ]` 格式整齐排布，去冗余、单行展示，便于记忆。
  - 需手动点击「下一题」推进。

---

## 3. 视觉与 UI 系统 (Design System)

- **风格规范**：参考**墨墨背单词**，采用大圆角 (`rounded-2xl` / `rounded-3xl`)、轻量阴影与高留白卡片。
- **选词卡片**：无 Hover 抖动与背景干扰；未选中为纯白底灰框，选中为 `bg-blue-50/80 border-2 border-blue-600` 单层深蓝边框。
- **进度条配色**：
  - 一次通过：Emerald 绿色 (`bg-emerald-500`)
  - 错题重做：Rose 红色 (`bg-rose-500`)
  - 当前题目：Blue 蓝色脉冲 (`bg-blue-600 animate-pulse`)

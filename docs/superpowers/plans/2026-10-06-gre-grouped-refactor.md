# GRE 6选2分组刷题与双词库重构实施计划 (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有选词刷题模式彻底重构为固定 30 词/对的分组刷题系统，兼容张巍等价词与 BBGRE 双词库，实现作答无打断秒切下题、中途断点恢复、首页三态与最近正确率展示，以及结算页全词对与错词复盘。

**Architecture:** 统一词条抽象契约 (`VocabPair`) + 双词库解析适配器 + 分组题库生成引擎（优先真题，无真题降级纯中文题干） + Zustand 分组持久化状态机 (`useGroupProgressStore`) + 分组卡片与结算复盘 UI。

**Tech Stack:** React 19, TypeScript 5, Vite 6, Zustand 5, Tailwind CSS, Vitest, Lucide React, Framer Motion, Canvas Confetti.

**Spec:** [`docs/superpowers/specs/2026-10-06-gre-grouped-refactor-design.md`](file:///Users/pickmiu/project/gre-select-two/docs/superpowers/specs/2026-10-06-gre-grouped-refactor-design.md)

## Global Constraints

- 严禁使用未声明的外部组件库；样式严格遵守 Tailwind CSS 与项目既有设计规范。
- 绝不在答错时将错题追加至队列末尾循环；答错后 600ms 必须直跳下一题。
- 无真题匹配时，题干必须直接展示中文释义文本（例如 `缓解、减轻`），绝对不能带任何前缀修饰。
- 首页对已完成的分组必须显式展示最近一次的正确率（例如 `最近正确率 86.7%`）。
- 结算页必须提供切换查看做错单词与本次全部 30 个单词对的交互选项。
- 不自动推送至远程仓库，所有操作仅限本地 Git 提交。

## Review Focus

1. **BBGRE 包含多词义与标点分号**：例如 `Word1="succumb to", Definition1="屈服于"`，中文释义包含分号、空格时，解析器应干净格式化，避免影响题干展示。
2. **末尾分组不足 30 词**：张巍 903 词最后一组（第 31 组）仅 3 词，BBGRE 1079 对最后一组（第 36 组）仅 29 词，题数与进度必须动态自适应，不发生除零或越界。
3. **断点恢复时选项顺序一致性**：中途退出后重新进入，题目和 6 个选项顺序必须保持退出前的一致状态，避免随机重排混淆作答。
4. **干扰项去重安全性**：生成 4 个干扰项时，必须排除当前题目的答案词及已知等价词，且干扰词相互不重复。
5. **已完成分组重新挑战**：点击已完成分组重新答题时，应重置做错记录与当前题号为 0，答完后正确覆盖并刷新最近一次的正确率。

---

### Task 1: 测试套件与数据契约定义

**Files:**
- Modify: `package.json`
- Create: `src/types/vocab.ts`
- Modify: `src/types/index.ts`
- Test: `src/types/vocab.test.ts`

**Interfaces:**
- Produces: `VocabPair`, `VocabGroup`, `GroupStatus`, `GroupProgress`, `DatasetKey`

- [ ] **Step 1: 安装 Vitest 并配置测试脚本**

在 `package.json` 的 `scripts` 中增加 `"test": "vitest run"`，并在 `devDependencies` 中引入 `vitest`。

- [ ] **Step 2: 编写数据契约测试用例**

在 `src/types/vocab.test.ts` 中编写测试，验证 `VocabPair` 和 `VocabGroup` 结构的字段有效性。

- [ ] **Step 3: 实现 `src/types/vocab.ts` 并在 `src/types/index.ts` 导出**

```typescript
export type DatasetKey = 'zhangwei' | 'bbgre';
export type GroupStatus = 'unstarted' | 'in_progress' | 'completed';

export interface VocabPair {
  id: string;
  word1: string;
  word2: string;
  allEquivalents?: string[];
  definition: string;
}

export interface VocabGroup {
  groupId: number;
  title: string;
  rangeLabel: string;
  pairs: VocabPair[];
}

export interface GroupProgress {
  status: GroupStatus;
  currentIndex: number;
  sessionQuestions?: any[];
  wrongIndices: number[];
  lastAccuracy?: number;
  lastErrorRate?: number;
  updatedAt: number;
}
```

- [ ] **Step 4: 运行测试验证**

运行：`pnpm test`
期望：通过

- [ ] **Step 5: 提交代码**

```bash
git add package.json src/types/
git commit -m "feat: setup vitest and define vocabulary types"
```

---

### Task 2: 双词库 CSV 解析适配器与分组切片

**Files:**
- Create: `src/utils/vocabAdapters.ts`
- Test: `src/utils/vocabAdapters.test.ts`

**Interfaces:**
- Consumes: `VocabPair`, `VocabGroup`, `DatasetKey` from `src/types/vocab`
- Produces: `parseZhangweiCSV(csv: string): VocabPair[]`, `parseBbgreCSV(csv: string): VocabPair[]`, `chunkVocabPairs(pairs: VocabPair[], groupSize?: number): VocabGroup[]`

- [ ] **Step 1: 编写 CSV 适配器单元测试**

编写针对张巍（903词、一对多）和 BBGRE（1079成对词、双释义合并）的解析测试，以及每 30 词一组的切片逻辑测试。

- [ ] **Step 2: 运行测试验证失败**

运行：`pnpm test src/utils/vocabAdapters.test.ts`
期望：FAIL（函数未实现）

- [ ] **Step 3: 实现 `vocabAdapters.ts`**

实现 `parseZhangweiCSV`、`parseBbgreCSV` 与 `chunkVocabPairs`。
对于 BBGRE，双释义相同则去重，不同用 `" / "` 连接；
对于张巍，主词作为 `word1`，首个等价词作为 `word2`，其余等价词保留在 `allEquivalents`。

- [ ] **Step 4: 运行测试验证通过**

运行：`pnpm test src/utils/vocabAdapters.test.ts`
期望：PASS

- [ ] **Step 5: 提交代码**

```bash
git add src/utils/vocabAdapters.ts src/utils/vocabAdapters.test.ts
git commit -m "feat: implement CSV adapters and grouping logic"
```

---

### Task 3: 题目生成引擎重构（真题匹配与中文释义纯净兜底）

**Files:**
- Modify: `src/utils/questionGenerator.ts`
- Test: `src/utils/questionGenerator.test.ts`

**Interfaces:**
- Consumes: `VocabPair`, `QuizQuestion`
- Produces: `generateGroupQuizQueue(groupPairs: VocabPair[], allQuestions: QuizQuestion[], allPoolPairs: VocabPair[]): QuizQuestion[]`

- [ ] **Step 1: 编写题目生成引擎单元测试**

测试点：
1. 优先在 `allQuestions` 匹配真题，并打乱 6 选项。
2. 无真题时，`question.stem` 严格等于 `pair.definition`（无额外字样），`answers` 为 `[pair.word1, pair.word2]`，并包含 4 个不重复的干扰项。
3. 题目挂载 `vocabPair` 元数据。

- [ ] **Step 2: 运行测试验证失败**

运行：`pnpm test src/utils/questionGenerator.test.ts`
期望：FAIL

- [ ] **Step 3: 实现 `generateGroupQuizQueue` 与干扰项生成**

在 `questionGenerator.ts` 中实现词对匹配真题逻辑与中文释义题干降级生成逻辑。

- [ ] **Step 4: 运行测试验证通过**

运行：`pnpm test src/utils/questionGenerator.test.ts`
期望：PASS

- [ ] **Step 5: 提交代码**

```bash
git add src/utils/questionGenerator.ts src/utils/questionGenerator.test.ts
git commit -m "feat: implement group quiz queue generator with clean fallback stem"
```

---

### Task 4: 分组进度状态机 (`useGroupProgressStore`)

**Files:**
- Create: `src/stores/useGroupProgressStore.ts`
- Test: `src/stores/useGroupProgressStore.test.ts`

**Interfaces:**
- Consumes: `VocabGroup`, `DatasetKey`, `QuizQuestion`
- Produces: `useGroupProgressStore`（包含 `currentDataset`, `progress`, `activeGroupId`, `activeQueue`, `currentIndex`, `wrongIndices`, 动作：`setDataset`, `startGroupSession`, `answerCurrentQuestion`, `exitSession`, `completeSession` 等）

- [ ] **Step 1: 编写 Store 状态机单元测试**

测试点：
1. 词库切换与进度独立隔离。
2. 开始未练习组：初始化 `currentIndex=0, wrongIndices=[]`，状态为 `in_progress`。
3. 作答记录：错误题目索引被正确追加到 `wrongIndices`。
4. 断点续做：退出后状态保持 `in_progress`，重新进入保留原题目队列和题目序号。
5. 组答完结算：状态变为 `completed`，记录 `lastAccuracy` 和 `lastErrorRate`。

- [ ] **Step 2: 运行测试验证失败**

运行：`pnpm test src/stores/useGroupProgressStore.test.ts`
期望：FAIL

- [ ] **Step 3: 实现 `useGroupProgressStore.ts` 并配置 Zustand persist**

实现完整的状态持久化存储与流转方法。

- [ ] **Step 4: 运行测试验证通过**

运行：`pnpm test src/stores/useGroupProgressStore.test.ts`
期望：PASS

- [ ] **Step 5: 提交代码**

```bash
git add src/stores/useGroupProgressStore.ts src/stores/useGroupProgressStore.test.ts
git commit -m "feat: implement group progress store with persistence and session resume"
```

---

### Task 5: 首页分组列表重构 (`GroupSelectionPage`)

**Files:**
- Create: `src/components/GroupList/GroupSelectionPage.tsx`
- Create: `src/components/GroupList/GroupCard.tsx`
- Modify: `src/components/Common/Header.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `useGroupProgressStore`, `VocabGroup`

- [ ] **Step 1: 创建 `GroupCard.tsx`**

实现美观的分组卡片：
- 展示组序号（`第 X 组`）、词条范围（`1 - 30 词`）。
- 三态徽章展示：
  - 未练习：浅灰色徽章 `未练习`。
  - 练习中：琥珀蓝高亮徽章 `练习中 (已做 X/30)` + 组内小进度条。
  - 已完成：翡翠绿徽章 `已完成` + **高亮显示 `最近正确率: XX%`**。
- 支持点击回调进入练习。

- [ ] **Step 2: 创建 `GroupSelectionPage.tsx`**

实现首页整体布局：
- 顶部双词库切换 Tab：`张巍等价词 (31 组)` / `BBGRE 词对 (36 组)`。
- 全局完成概览指标栏（展示已完成组数与总百分比）。
- 响应式分组卡片网格列表。

- [ ] **Step 3: 在 `App.tsx` 与 `Header.tsx` 中接入**

更新主入口，替换原有旧版选词页面。

- [ ] **Step 4: 本地构建与静态检查**

运行：`pnpm build`
期望：TS 类型检查通过，构建成功。

- [ ] **Step 5: 提交代码**

```bash
git add src/components/GroupList/ src/components/Common/Header.tsx src/App.tsx
git commit -m "feat: implement group selection page with dual dataset tabs and 3-state cards"
```

---

### Task 6: 刷题界面重构（顺畅作答与 600ms 直跳）

**Files:**
- Modify: `src/components/Quiz/QuizPage.tsx`
- Modify: `src/components/Quiz/QuizCard.tsx`
- Modify: `src/components/Quiz/QuizActions.tsx`

**Interfaces:**
- Consumes: `useGroupProgressStore`, `QuizQuestion`

- [ ] **Step 1: 重构 `QuizCard.tsx`**

- 题干逻辑：若是真题展示真题 stem；若是降级题，直接呈现大号中文释义文本（无任何前缀词）。
- 6 选 2 选项卡片，保持优雅微动效。

- [ ] **Step 2: 重构 `QuizPage.tsx` 答题流转逻辑**

- 选中 2 项自动判定：
  - 答对：绿框脉冲 + 正确音效 + 600ms 自动下一题。
  - 答错 / 点击不认识：红框抖动 + 错误音效 + 记录错题索引 + **600ms 直接跳下一题（绝无弹窗打断，不追加队尾）**。
- 顶部返回按钮：安全退出，保存当前进度，保持 `in_progress`。
- 最后一题答完：计算正确率与错误率，标记 `completed`，自动切换至结算页。

- [ ] **Step 3: 本地构建与类型验证**

运行：`pnpm build`
期望：成功。

- [ ] **Step 4: 提交代码**

```bash
git add src/components/Quiz/
git commit -m "feat: streamline quiz flow with 600ms non-blocking skip and clean stem"
```

---

### Task 7: 结算复盘页重构 (`CompletionPage`)

**Files:**
- Modify: `src/components/Completion/CompletionPage.tsx`

**Interfaces:**
- Consumes: `useGroupProgressStore` 结算数据与词对元数据

- [ ] **Step 1: 升级结算看板与指标展示**

展示当前练习组名称、做对题数/总题数、**大号醒目正确率与错误率标签**。

- [ ] **Step 2: 实现「错词专区」与「完整词对」双视图切换**

- 选项卡：`做错单词 (X)` 与 `本次完整词对 (30)`。
- 点击切换查看：每条词对整齐排布 `主词 = 等价词` | `中文释义`，并带有对错状态指示。

- [ ] **Step 3: 底部操作**

提供单一主按钮 **「返回分组列表」**，点击清空当前会话并返回首页。

- [ ] **Step 4: 本地构建与类型验证**

运行：`pnpm build`
期望：构建成功。

- [ ] **Step 5: 提交代码**

```bash
git add src/components/Completion/CompletionPage.tsx
git commit -m "feat: enhance completion page with accuracy stats and full word pairs toggle"
```

---

### Task 8: 全面验证与端到端质量验收

**Files:**
- Run: 全部单元测试与构建
- Run: 浏览器实际交互验收（双词库切换、无真题中文题干展示、断点续做、首页最近正确率更新、结算页全部词对切换）

- [ ] **Step 1: 运行全量单元测试**

运行：`pnpm test`
期望：所有单元测试 100% 通过。

- [ ] **Step 2: 运行生产构建验证**

运行：`pnpm build`
期望：构建零错误零警告。

- [ ] **Step 3: 浏览器交互真实验收**

通过已运行的本地 dev server (`http://localhost:5173`) 验证：
1. 切换 张巍 / BBGRE Tab，分组卡片正常对应更新（31 组 vs 36 组）。
2. 点击某组刷题，做错时红框闪烁后直接切下一题。
3. 中途点击返回，首页卡片显示“练习中 (已做 X/30)”。
4. 再次点击该卡片，从上次退出处继续做题。
5. 答完第 30 题进入结算页，查看正确率与错误率，点击选项卡切换查看“做错的单词”与“完整词对”。
6. 返回首页，该组状态变为“已完成”，并清晰显示“最近正确率 XX%”。

- [ ] **Step 4: 最终代码提交**

```bash
git add .
git commit -m "chore: complete gre grouped refactor verification"
```

# GRE 6选2分组刷题与双词库重构设计规范 (Design Spec)

## 1. 概述与目标

本项目为 GRE 6选2 填空等价词专项练习单页应用。本次重构的目标是：
1. **支持双词库**：同时支持原有的张巍等价词（`words.csv`）和成对词格式的 BBGRE（`bbgreword.csv`），并在首页提供清晰的词库切换。
2. **分组练习机制**：取消原先的自由勾选模式，改为固定顺序分组，默认以 30 行/条目为一组。
3. **极简三态记录**：每个分组记录三种独立状态——「未练习」、「练习中 (练习过)」、「已完成 (完成过)」，并在首页卡片直观呈现；已完成的分组在首页展示最近一次的正确率。
4. **纯粹高效刷题流**：做错时不把错题加入队尾循环，不弹出打断性背诵弹窗；错题红框抖动后约 600ms 直接跳至下一题，保证刷题连贯性。支持随时中途退出，下次点击该组可无缝从中断处恢复继续答题。
5. **考后集中查漏补缺**：完成 30 题后进入结算页，集中展示总题数、错误率/正确率、做错的单词列表（主词 = 等价词 | 中文释义）。
6. **无真题降级机制**：若某词条未在真题库中匹配到 6选2 真题，题干直接展示其中文释义（去除任何冗余前缀），选项为 2 个正确等价词 + 4 个随机不相干干扰词。

---

## 2. 数据层架构 (Data Layer)

### 2.1 统一数据契约 (`VocabPair`)
```typescript
export interface VocabPair {
  id: string;                    // 唯一键，如 "zw-1", "bb-1"
  word1: string;                 // 主词 1 (如 "mitigate" 或 "succumb to")
  word2: string;                 // 等价词 2 (如 "abate" 或 "yield to")
  allEquivalents?: string[];     // 其他等价词（针对张巍一对多格式）
  definition: string;            // 核心中文释义（如 "缓解" 或 "屈服于"）
}

export interface VocabGroup {
  groupId: number;               // 组号（1-based: 1, 2, 3...）
  title: string;                 // 标题，如 "第 1 组"
  rangeLabel: string;            // 范围标签，如 "1 - 30 词"
  pairs: VocabPair[];            // 属于该组的 30 个词对
}
```

### 2.2 CSV 适配器
* **张巍适配器 (`parseZhangweiCSV`)**：
  * 解析 `src/data/words.csv`（表头：`单词,等价词,汉语解释`）。
  * 提取 `word1 = 单词`，`word2 = 等价词[0]`，`allEquivalents = 分割后的全部等价词`，`definition = 汉语解释`。
  * 约 903 词，切分成 31 组。
* **BBGRE 适配器 (`parseBbgreCSV`)**：
  * 解析 `src/data/bbgreword.csv`（表头：`Word1,Definition1,Word2,Definition2`）。
  * 提取 `word1 = Word1`，`word2 = Word2`，`definition` 取自 `Definition1` 与 `Definition2`（去除首尾多余空格与引号，若不同则用 " / " 拼接）。
  * 约 1079 行成对词，切分成 36 组。

---

## 3. 题目生成与降级策略 (`questionGenerator`)

针对组内的每个 `VocabPair`：
1. **优先匹配真题 (`questions.csv`)**：
   * **张巍模式**：在题库中检索答案中包含 `word1` 或其等价词的 6选2 真题，匹配到时随机挑选 1 道。
   * **BBGRE 模式**：在题库中检索答案同时成对包含 `word1` 和 `word2` 的 6选2 真题（包含词干时态/变体匹配），匹配到时随机挑选 1 道。
   * 命中的真题绑定 `vocabPair` 元数据，并将 6 个选项顺序打乱。
2. **无真题降级题（核心规范）**：
   * 若无法在题库中命中真题，生成中文题干题：
     * `stem`: 直接展示 `pair.definition`（例如：`缓解、减轻` 或 `屈服于`，不添加任何【中文释义】前缀）。
     * `answers`: `[pair.word1, pair.word2]`。
     * `distractors`: 从当前词库中随机挑取 4 个不重叠的无关联英文词。
     * `options`: 打乱 `[pair.word1, pair.word2, ...distractors]` 组成的 6 选项。
     * `vocabPair`: 绑定对应 `pair`。

---

## 4. 状态机与持久化规范 (`useGroupProgressStore`)

### 4.1 数据结构
```typescript
export type GroupStatus = 'unstarted' | 'in_progress' | 'completed';

export interface GroupProgress {
  status: GroupStatus;           // 未练习 | 练习中 | 已完成
  currentIndex: number;          // 进度索引 (0 ~ 29)
  sessionQuestions?: QuizQuestion[]; // 题目队列快照（确保断点恢复一致性）
  wrongIndices: number[];        // 做错的题号索引列表
  lastAccuracy?: number;         // 最近一次答完的正确率（百分比 0 ~ 100）
  lastErrorRate?: number;        // 最近一次答完的错误率（百分比 0 ~ 100）
  updatedAt: number;
}

export interface ProgressState {
  currentDataset: 'zhangwei' | 'bbgre'; // 当前词库
  progress: {
    zhangwei: Record<number, GroupProgress>;
    bbgre: Record<number, GroupProgress>;
  };
  
  // Actions
  setDataset: (dataset: 'zhangwei' | 'bbgre') => void;
  startGroup: (groupId: number, questions: QuizQuestion[]) => void;
  recordAnswer: (groupId: number, questionIndex: number, isCorrect: boolean) => void;
  saveProgress: (groupId: number, nextIndex: number) => void;
  completeGroup: (groupId: number, accuracy: number, errorRate: number) => void;
  resetAll: () => void;
}
```

### 4.2 状态流转规则
1. **未练习 (`unstarted`)**：
   * 首页卡片显示：浅灰色标签「未练习」。
   * 点击：即时生成该组 30 道题目，初始化 `currentIndex = 0`，`wrongIndices = []`，进入答题页，状态转为 `in_progress`。
2. **练习中 (`in_progress`)**：
   * 首页卡片显示：高亮蓝色标签「练习中 (已做 X/30)」，并带组内迷你进度条。
   * 点击：读取已缓存的 `sessionQuestions` 与 `wrongIndices`，直接从第 `currentIndex` 题恢复作答。
3. **已完成 (`completed`)**：
   * 首页卡片显示：翡翠绿标签「已完成」，**并在卡片上显式显示最近一次的正确率（如 `最近正确率 86.7%`）**。
   * 点击：重置进度，重新生成 30 道题，从第 1 题开始重新刷题挑战。
4. **中途退出**：
   * 随时可点击左上角“返回”按钮退出，进度自动保存，状态保持为 `in_progress`。

---

## 5. 视图层与交互规范 (UI/UX)

### 5.1 首页分组列表 (`GroupSelectionPage`)
* **头部控制区**：
  * 应用标题与简洁说明。
  * 词库切换 Tab（`张巍等价词 (31组)` / `BBGRE 词对 (36组)`）。
  * 概览进度条：展示当前词库的完成组数与总完成率。
* **分组卡片网格**：
  * 30 词一组的卡片列表，响应式布局。
  * 卡片信息：组编号、词条序号范围、状态徽章（未练习 / 练习中进度 / 已完成 + 最近正确率）。
  * 点击动效与平滑过渡。

### 5.2 刷题页 (`QuizPage`)
* **顶部条**：
  * 返回首页按钮（触发自动保存断点）。
  * 进度指示器：清晰展示 `第 X / 30 题`。
* **题干区**：
  * 真题：英文题干，留空处随用户点选选项动态填入。
  * 降级题：直接居中展示中文释义文本（例如 `缓解、减轻`），大号字体，清晰醒目。
* **选项区 (6 选 2)**：
  * 选满 2 项触发判定：
    * **答对**：绿色高亮脉冲 + 正确音效 + 600ms 自动滑至下一题。
    * **答错 / 点“不认识”**：红色高亮抖动 + 错误音效 + 记录错题 + **600ms 直接跳至下一题（无打断，不加队尾）**。
* **第 30 题答完**：
  * 状态置为 `completed`，自动结算正确率与错误率，进入结算页。

### 5.3 结算页 (`CompletionPage`)
* **战绩看板**：
  * 组名与恭喜图标。
  * **显眼的正确率与错误率数据面板**（如 `正确率 83.3%`，`错误率 16.7%`，答对 25/30 题）。
* **错词回顾专区**：
  * 零错题时：展示全对徽章。
  * 有错题时：列表集中展示本次做错的所有词条：
    * 格式：`主词 = 等价词`  |  `中文释义`。
* **底部操作**：
  * 单一主按钮：**「返回分组列表」**。

---

## 6. 测试与验证策略

1. **数据解析测试**：
   * 验证 `parseZhangweiCSV` 能正确解析 903 行并切分 31 组。
   * 验证 `parseBbgreCSV` 能正确解析 1079 行并切分 36 组。
2. **题目生成与降级测试**：
   * 验证真题匹配成功的题目包含真题 stem。
   * 验证未匹配真题的题目，其 stem 严格等于纯中文释义，且包含 6 个不重复选项（2 答案 + 4 干扰词）。
3. **状态机与断点恢复测试**：
   * 验证中途退出时，首页该组显示 `练习中 (已做 X/30)`。
   * 再次进入该组，题目与上次完全一致，且从第 X 题开始继续。
   * 答完 30 题后，首页该组变为 `已完成`，并正确显示最近正确率。
4. **前端视觉与交互验证**：
   * 使用开发环境运行验证界面布局、切换流畅度、音效与动效。

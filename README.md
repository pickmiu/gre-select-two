# GRE 6选2等价词练习单页应用

## 一、项目描述

这是一个单页应用（SPA），已有的 800 等价词词表和题库。以下题目仅用于说明功能和流程，实际题目来自已有题库。

---

## 二、等价词表

```csv
单词,等价词,汉语解释
mitigate,"abate, curtail, temper, ameliorate",缓和
anomaly,aberration,异常
quiescent,"abeyant, calm",不活跃的，静止的
unprecedented,abnormal,前所未有的
proliferate,abound,激增
synoptic,abridged,概要的
exonerate,absolve,免罪
general,abstract,笼统的
```

---

## 三、题库示例

```json
[
  {
    "id": 1,
    "stem": "The researchers managed to ______ the negative impacts of the policy through careful adjustments.",
    "options": ["proliferate", "abate", "synoptic", "mitigate", "exonerate", "anomaly"],
    "answers": ["mitigate", "abate"]
  },
  {
    "id": 2,
    "stem": "The sudden drop in temperature was an ______ that baffled meteorologists for weeks.",
    "options": ["quiescent", "anomaly", "unprecedented", "aberration", "general", "synoptic"],
    "answers": ["anomaly", "aberration"]
  },
  {
    "id": 3,
    "stem": "During the winter months, the volcano remained ______, showing no signs of activity.",
    "options": ["proliferate", "quiescent", "exonerate", "abeyant", "mitigate", "abnormal"],
    "answers": ["quiescent", "abeyant"]
  },
  {
    "id": 4,
    "stem": "The team achieved an ______ level of success, surpassing all historical records.",
    "options": ["unprecedented", "synoptic", "abnormal", "general", "quiescent", "abate"],
    "answers": ["unprecedented", "abnormal"]
  },
  {
    "id": 5,
    "stem": "Rumors began to ______ across social media after the official announcement was delayed.",
    "options": ["exonerate", "abound", "mitigate", "proliferate", "aberration", "abridged"],
    "answers": ["proliferate", "abound"]
  },
  {
    "id": 6,
    "stem": "The report provides a ______ overview of the entire project without getting bogged down in details.",
    "options": ["synoptic", "general", "unprecedented", "abeyant", "abridged", "abate"],
    "answers": ["synoptic", "abridged"]
  },
  {
    "id": 7,
    "stem": "New DNA evidence served to ______ the suspect, proving his innocence beyond a doubt.",
    "options": ["proliferate", "exonerate", "absolve", "mitigate", "aberration", "abstract"],
    "answers": ["exonerate", "absolve"]
  },
  {
    "id": 8,
    "stem": "The professor gave a ______ explanation of the theory, leaving out the specifics for later lectures.",
    "options": ["synoptic", "abstract", "quiescent", "general", "abnormal", "absolve"],
    "answers": ["general", "abstract"]
  }
]
```

---

## 四、用户选词

用户打开网页后，可以在单词列表中选择需要学习的单词。

### 功能

- 单词列表分页展示。
- 支持单选单词。
- 支持「全选整页」。
- 每页显示数量可以自定义。
- 用户选择完成后，点击「开始学习」。

---

## 五、题目生成逻辑

根据用户选择的单词，从现有题库中生成练习题。

### 选择规则

1. 对每一个用户选择的单词，在题库中查找包含该单词的题目。
2. 每个单词随机选择 **1 道**对应题目。
3. 所有题目选择完成后，将题目顺序随机打乱。
4. 最终生成本次练习的题目队列。

例如用户选择：

```text
mitigate
anomaly
quiescent
proliferate
```

系统需要分别为这 4 个单词找到对应题目：

```text
mitigate → 题目 1
anomaly → 题目 2
quiescent → 题目 3
proliferate → 题目 5
```

然后随机打乱：

```text
题目 3 → 题目 1 → 题目 5 → 题目 2
```

### 找不到题目

如果某个单词在题库中没有对应题目，则不能直接开始学习，需要提示用户生成失败，并说明原因。

例如：

```text
无法开始练习

以下单词没有对应题目：
- word123
- word456

原因：题库中没有找到包含这些单词的题目。

请重新选择单词。
```

---

# 六、GRE 6选2练习页面

开始学习后，首先展示一道 **6 选 2** 的 GRE 等价词题目。

页面结构：

```text
┌─────────────────────────────┐
│           3 / 8             │
│ ███████████░░░░░░░░░░       │
├─────────────────────────────┤
│                             │
│ The researchers managed to  │
│ ______ the negative impacts │
│ of the policy through       │
│ careful adjustments.        │
│                             │
│ ┌──────────┐ ┌──────────┐   │
│ │proliferate│ │  abate   │   │
│ └──────────┘ └──────────┘   │
│ ┌──────────┐ ┌──────────┐   │
│ │ synoptic │ │ mitigate │   │
│ └──────────┘ └──────────┘   │
│ ┌──────────┐ ┌──────────┐   │
│ │ exonerate│ │ anomaly  │   │
│ └──────────┘ └──────────┘   │
│                             │
│        [ 不认识 ]            │
│                             │
│      [ 上一个题目 ]          │
└─────────────────────────────┘
```

---

## 七、答题流程

用户需要从 6 个选项中选择 2 个单词。

### 1. 选择答案

用户可以点击两个选项。

未提交时：

- 第一次点击 → 选中。
- 第二次点击 → 选中。
- 已经选择两个后，可以取消其中一个，再选择其他选项。

选中的选项需要有明显高亮。

---

### 2. 两个答案全部正确

如果用户选择的两个单词正好是正确答案：

```text
正确 ✓
```

两个答案显示：

- 绿色背景
- 白色文字
- 绿色脉冲动画
- 手机端可以调用 `navigator.vibrate()` 提供轻微震动反馈

随后**自动进入下一题**。

不需要用户额外点击「下一题」。

---

### 3. 选择错误

如果用户选择的答案错误：

- 错误选项显示红色。
- 正确选项显示绿色。
- 卡片执行左右摇晃（Shake Animation）。
- 手机端可以调用 `navigator.vibrate()`。
- 暂停自动进入下一题。

同时展示正确答案以及完整的等价词信息。

例如：

```text
✕ 回答错误

正确答案：
mitigate
abate

mitigate
= abate, curtail, temper, ameliorate

缓和
```

用户查看释义后，才显示：

```text
[ 下一题 ]
```

---

## 八、「不认识」功能

用户可以直接点击：

```text
[ 不认识 ]
```

表示当前单词不会。

点击后：

1. 当前题目标记为未掌握。
2. 显示正确答案。
3. 显示该单词的全部等价词。
4. 显示中文释义。
5. 当前题目进入错题队列。
6. 用户查看释义后显示「下一题」。

例如：

```text
不认识

正确答案：
mitigate / abate

等价词：
abate
curtail
temper
ameliorate

中文：
缓和

────────────────

[ 下一题 ]
```

---

# 九、错题重做

用户答错或者点击「不认识」的题目，需要加入错题队列。

例如第一次练习：

```text
题目 1 ✓
题目 2 ✕
题目 3 ✓
题目 4 ✕
题目 5 ✓
```

第一轮结束后：

```text
错题：
题目 2
题目 4
```

系统自动让用户重新完成：

```text
题目 2
→ 题目 4
```

直到所有题目都答对。

### 注意

错题重新答对后，才算真正完成。

因此最终完成条件是：

```text
所有题目至少有一次正确完成
```

---

# 十、顶部进度条

顶部固定显示当前练习进度：

```text
3 / 8
```

并使用颜色区分题目状态。

例如：

- **绿色**：一次性答对。
- **黄色**：错题重做中。
- **灰色**：尚未完成。

示意：

```text
3 / 8

████████████░░░░░░░░
```

其中：

```text
绿色 = 一次性通过
黄色 = 错题重做
灰色 = 尚未完成
```

---

# 十一、上一个题目

页面下方提供：

```text
[ 上一个题目 ]
```

点击后可以重新做上一道题。

「上一个题目」不会直接改变题目的完成状态。

如果用户上一题已经答对，再次进入时可以重新选择答案。

---

# 十二、自适应卡片设计

整体 UI 风格参考 **墨墨背单词**：

- 简洁
- 卡片化
- 大面积留白
- 强调当前学习内容
- 减少不必要的 UI 元素
- 手机优先

---

## 手机端

手机端优先适配。

题目卡片居中，占据主要屏幕空间。

6 个选项采用：

### 两列布局

```text
┌──────────┐ ┌──────────┐
│ mitigate │ │  abate   │
└──────────┘ └──────────┘

┌──────────┐ ┌──────────┐
│ synoptic │ │proliferate│
└──────────┘ └──────────┘

┌──────────┐ ┌──────────┐
│ exonerate│ │ anomaly  │
└──────────┘ └──────────┘
```

如果屏幕较窄，可以切换为单列：

```text
┌─────────────────────┐
│      mitigate       │
└─────────────────────┘

┌─────────────────────┐
│       abate         │
└─────────────────────┘
```

按钮需要足够大，方便手机拇指操作。

---

## iPad

根据屏幕宽度自适应：

- 中等宽度采用两列。
- 较大屏幕可以增加卡片宽度。
- 保持题目主体居中。

---

## PC

桌面端：

- 内容区域居中。
- 限制最大宽度。
- 不让卡片横向拉得过宽。
- 保持类似移动端的学习卡片结构。

---

# 十三、按钮状态

### 默认

```text
白色背景
黑色文字
轻微阴影
圆角
```

### 选中但未提交

```text
蓝色 / 黑色高亮
```

表示用户当前选择的答案。

### 答案正确

```text
绿色背景
白色文字
绿色脉冲动画
```

### 答案错误

```text
红色背景
白色文字
左右 Shake Animation
```

可以使用 Framer Motion 实现动画。

---

# 十四、学习完成页面

当用户所有题目都完成后，展示结束页。

例如：

```text
🎉

练习完成！

本次练习
8 个单词
8 道题目

全部掌握 ✓

[ 继续选词练习 ]
```

完成时使用 `canvas-confetti` 播放通关彩花效果。

用户点击：

```text
[ 继续选词练习 ]
```

返回单词选择页面。

---

# 十五、数据持久化

用户的学习数据需要保存到浏览器 `localStorage`。

保证用户刷新页面后：

- 已选择的单词记录不会丢失。
- 学习进度不会丢失。
- 做错的单词不会丢失。
- 已掌握的单词状态不会丢失。

建议保存的数据包括：

```js
{
  selectedWords: [],
  learnedWords: [],
  wrongWords: [],
  currentSession: {},
  questionQueue: [],
  currentQuestionIndex: 0
}
```

刷新页面后恢复当前练习状态。

---

# 十六、状态管理

使用 **Zustand** 管理整个学习流程。

主要状态可以包括：

```text
wordList
selectedWords
currentSession
questionQueue
currentQuestion
wrongQuestionQueue
currentQuestionIndex
completedQuestions
learnedWords
```

建议将状态拆分为：

### Word Store

负责：

- 单词列表
- 用户选择的单词
- 分页
- 每页数量
- 已学习单词

### Quiz Store

负责：

- 当前题目
- 题目队列
- 错题队列
- 答题状态
- 练习进度

### Persistence

通过 Zustand `persist` middleware 将数据保存到 `localStorage`。

---

# 十七、推荐技术栈

## 核心框架

**React 18 + Vite**

负责：

- SPA
- 页面组件
- 状态驱动 UI
- 路由和页面结构

---

## 样式

**Tailwind CSS**

用于：

- 极简卡片
- 响应式布局
- 手机端优先
- 按钮状态
- 间距
- Typography

---

## 状态管理

**Zustand**

用于：

- 用户选词
- 题目队列
- 错题队列
- 当前答题状态
- 学习进度
- `localStorage` 持久化

相比 Redux 更轻量，适合这个单页应用。

---

## 动画

**Framer Motion**

用于：

- 答错 Shake Animation
- 卡片进入/退出动画
- 题目切换
- 正确答案绿色反馈
- 释义展开动画
- 错题重新进入队列

---

## 通关反馈

**canvas-confetti**

用于全部答对后的通关彩花效果。

---

## 手机震动

使用浏览器原生 API：

```js
navigator.vibrate()
```

用于：

- 答错
- 答对
- 其他重要反馈

需要注意部分 iOS 浏览器可能不支持 `navigator.vibrate`，因此必须做兼容处理：

```js
if ("vibrate" in navigator) {
  navigator.vibrate(100);
}
```

---

# 十八、推荐项目结构

```text
src/
├── components/
│   ├── WordList/
│   │   ├── WordList.tsx
│   │   ├── WordItem.tsx
│   │   └── Pagination.tsx
│   │
│   ├── Quiz/
│   │   ├── QuizCard.tsx
│   │   ├── AnswerOption.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── WordExplanation.tsx
│   │   └── QuizActions.tsx
│   │
│   └── Completion/
│       └── CompletionPage.tsx
│
├── data/
│   ├── words.csv
│   └── questions.json
│
├── stores/
│   ├── wordStore.ts
│   └── quizStore.ts
│
├── utils/
│   ├── questionGenerator.ts
│   ├── localStorage.ts
│   └── vibration.ts
│
├── pages/
│   ├── WordSelectionPage.tsx
│   ├── QuizPage.tsx
│   └── CompletionPage.tsx
│
├── App.tsx
├── main.tsx
└── index.css
```

---

# 十九、整体用户流程

```text
打开网页
    ↓
单词列表
    ↓
选择单词
    ↓
分页 / 全选 / 调整每页数量
    ↓
点击「开始学习」
    ↓
检查每个单词是否存在对应题目
    ↓
 ┌───────────────┐
 │ 是否全部存在？ │
 └───────┬───────┘
         │
    ┌────┴────┐
    │         │
   否         是
    │         │
    ↓         ↓
提示生成失败   随机选择题目
              ↓
          打乱题目顺序
              ↓
          开始 6 选 2
              ↓
        用户选择两个答案
              ↓
       ┌──────┴──────┐
       │             │
      正确           错误
       │             │
       ↓             ↓
   绿色反馈       红色反馈
       │          显示答案
       │          显示等价词
       │          显示释义
       │             │
       │             ↓
       │          加入错题队列
       │             │
       └──────┬──────┘
              ↓
            下一题
              ↓
        是否还有未完成题？
          ↓           ↓
         是            否
          │            │
          ↓            ↓
        继续做       是否有错题？
                       ↓
                  ┌────┴────┐
                  │         │
                 是          否
                  │         │
                  ↓         ↓
                重做错题   完成练习
                  │         │
                  └────┐     ↓
                       │   通关页面
                       │     ↓
                       └→继续选词
```

---

# 二十、核心产品目标

这个应用的核心不是简单的「刷题」，而是围绕 **GRE 等价词成组记忆 + 6选2主动辨认** 建立学习闭环：

```text
选择单词
    ↓
6选2辨认
    ↓
正确 → 自动进入下一题
    ↓
错误 / 不认识
    ↓
展示正确答案
    ↓
展示全部等价词
    ↓
展示中文释义
    ↓
错题重做
    ↓
全部答对
    ↓
完成本轮学习
```

整体设计应始终遵循 **手机优先、操作简单、反馈明显、减少干扰、强化等价词组记忆** 的原则。
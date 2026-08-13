# GRE 6选2等价词刷题 (GRE Select-Two SPA)

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

一个专为 GRE 考生设计的**等价词 6选2 主动辨认与成组背诵**单页应用（SPA）。界面参考**墨墨背单词**的极简卡片风格，支持全套 CSV 数据自定义导入与导出，帮您建立“选词 - 辨认 - 反馈 - 错题重做 - 通关”的高效学习闭环。

---

## ✨ 核心特性

- **📚 430+ 真题库 & 800+ 等价词**：内置完整的 GRE 6选2 试题库与常考等价词词表。
- **📊 动态连贯进度条**：
  - 支持全局连续计题（例如 `第 12 / 20 题`），真实反映累积练习进度。
  - 答错或点击“不认识”时自动将题目压入重做队列，**总题数实时 +1**。
  - 颜色标识区分：**绿色（一次通过）** / **红色（错题重做）** / **蓝色脉冲（当前）**。
- **⚡️ 6选2 双选自动判定**：
  - 勾选 2 个选项后触发自动判定。
  - **全对**：绿色脉冲 + 触发震动反馈 + 850ms 后自动跳下一题。
  - **错误**：红色高亮 + 摇晃动画 + 展开**单行极简等价词背诵面板**。
- **💡 1 行 1 词组背诵面板**：
  - 答错或点击“不认识”时，按 `主词 = 等价词1, 等价词2... [ 中文释义 ]` 格式整齐排布，专为高效背诵设计。
- **📂 CSV 自由导入导出**：
  - 支持在网页端一键导入/导出自定义的**词库 CSV** 与 **题库 CSV**。
- **💾 本地状态持久化**：
  - 基于 Zustand `persist` 将选词、已掌握单词及练习进度自动同步至 `localStorage`。

---

## 🛠️ 技术栈

- **核心框架**：React 19 + TypeScript + Vite
- **状态管理**：Zustand (带 `persist` 持久化)
- **样式动画**：Tailwind CSS + Framer Motion
- **数据处理**：PapaParse (CSV 高效解析)
- **通关反馈**：canvas-confetti (彩花爆破) + Web Vibration API (手机震动)

---

## 🚀 快速开始

### 1. 克隆项目与安装依赖

```bash
git clone https://github.com/pickmiu/gre-select-two.git
cd gre-select-two
pnpm install
```

### 2. 启动本地开发服务

```bash
pnpm run dev
```

访问 `http://localhost:5173/` 即可开始体验。

### 3. 构建生产环境产物

```bash
pnpm run build
```

构建产物将输出至 `dist/` 目录。

---

## 📄 数据格式 (CSV Standards)

### 词库 CSV (`words.csv`)

```csv
单词,等价词,汉语解释
mitigate,"abate, curtail, temper, ameliorate",缓和
anomaly,aberration,异常
```

### 题库 CSV (`questions.csv`)

```csv
id,stem,option1,option2,option3,option4,option5,option6,answer1,answer2
1,"The researchers managed to ______ the negative impacts.",proliferate,abate,synoptic,mitigate,exonerate,anomaly,mitigate,abate
```

> ⚠️ *注：包含逗号的题干或等价词字段必须包裹英文双引号 `""`。*

---

## 🌐 一键部署至 Cloudflare Pages

1. 将代码推送到 GitHub 仓库。
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/) -> **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**。
3. 选择仓库 `gre-select-two`，构建参数设置：
   - **Framework preset**: `React (Vite)` 或 `None`
   - **Build command**: `pnpm run build`
   - **Build output directory**: `dist`
4. 点击 **Save and Deploy** 即可完成自动部署！

---

## 📜 开源协议

本项目基于 [MIT License](LICENSE) 协议开源。

# 阶段 A 实施与验证记录

本轮仅建立 V2 展示入口和 URL 开关。视觉仍沿用 V1，阶段 B 的背景、舞台、比例和控件尚未实施。

## 使用与回退

- 默认 `/mihoyo-calendar/`：V1。
- `/mihoyo-calendar/?ui=v2`：V2 展示入口；根元素带 `data-display-layer="v2"`。
- 删除 `ui`、指定 `?ui=v1` 或使用未知值：V1。
- 开关仅在页面渲染时读取 URL，不读写 localStorage，不提供额外环境变量或运行时全局开关。修改 URL 后重新加载即可切换。

## 实现边界

`App.tsx` 保留全部业务状态、数据准备和回调，仅选择原始 `div` 或 `CalendarWorkspaceV2` 作为展示入口。后者接收 App 配置好的子节点以及主题、样式等根元素属性，输出同样的 `div`，额外添加 V2 标识。

没有修改原有组件、hooks、CSS、数据文件、日期工具或持久化键。清除了本次中断期间生成但未使用的占位组件、CSS 和日期工具。阶段 A 不创建未来阶段的空实现。

## V1 基线

基线提交：`b58908f0dcc0c32fd3cfb10be50462fa6f764223`。

- 修改前 `npm run build` 通过；最终构建通过，CSS 产物仍为 `index-CJ-Pd0nm.css`。
- 修改前、Git 原版副本和修改后 `npm test` 均为 57 项：56 通过、1 失败。
- 既有失败：`test/uiCss.test.js:78` 的 `mobile card mode places character names below avatars`，期望 `flex-direction: column`，CSS 测试解析值为 `undefined`。
- 原版与修改后源代码 lint 均有 8 个 `react-hooks/set-state-in-effect` 错误：App 3 个、AddCharacterModal 1 个、Hero 2 个、useCharacters 1 个、useReveal 1 个。新增文件 lint 通过。
- `git diff --check` 通过。

## 浏览器验证

固定浏览器本地日期为 2026-09-12，时区 Asia/Shanghai；视口为 1440×900 和 390×844。使用真实角色数据，外部图片由独立预览中已有的本地缓存响应；未缓存资源固定失败以消除网络差异。关闭轮播定时器、使用 reduced motion，截图期间禁用动画。

开发环境原版服务通过 Vite 的验证插件加载 `git show HEAD:src/App.tsx`，其余生产源码与 HEAD 一致。该插件仅位于仓库外的验证脚本中，不进入产品代码。

- 开发环境 10 张截图：原版、默认、显式 V1、V2、未知参数，各两个视口。每种入口的画面像素和初始业务/存储快照均与原版一致。
- 生产预览 6 张截图：默认、V1、V2，各两个视口。画面像素一致，GitHub Pages 的 `/mihoyo-calendar/` 子路径可用。
- 交互检查：翻月、今天、月/周、角色详情、收藏、刷新回到 V1。新入口与原版行为一致；生产预览下刷新前后的存储快照完全一致。

验证同时复现了既有问题，未扩大本轮范围修复：

- 开发 StrictMode 下，刷新后刚收藏的 ID 被清空；原始 V1 同样如此。生产构建下未复现。
- 图片失败场景中，角色交互会触发 `Cannot read properties of null (reading 'classList')`。原始 V1、显式 V1 和 V2 在相同脚本下均可复现，生产预览也存在。该错误没有因本轮新增。

上述截图证明受控环境下 V1 回退一致，不代表动画、外网资源或后续 V2 视觉阶段的完整验收。

## 本地证据

- 开发截图及结果：`C:/Users/Administrator/calendar-phase-a-verification/verification.json`，同目录内 10 张 PNG。
- 生产截图及结果：`C:/Users/Administrator/calendar-phase-a-production-verification/verification.json`，同目录内 6 张 PNG。
- 验证脚本：`C:/Users/Administrator/verify-calendar-phase-a.py`、`verify-calendar-phase-a-production.py`。
- 原始 V1 验证服务：`C:/Users/Administrator/serve-calendar-baseline.mjs`。
- lint 对照脚本：`C:/Users/Administrator/lint-calendar-phase-a.mjs`。

阶段 A 到此停止，后续按照冻结的实施计划进入阶段 B。

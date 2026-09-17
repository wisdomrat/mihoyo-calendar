# 日历 V2 实施方案

> 状态：实施前冻结方案
>
> 视觉基线：`C:\Users\Administrator\calendar-redesign-review\shots\01-sumeru-desktop.png`
>
> 业务项目：`D:\work\coding\mihoyo-calendar`

## 1. 当前决策

本项目进入 V2 实施阶段。V2 采用 GPT-01 的视觉方向和本轮独立预览验证过的真实数据网格，不再继续进行自由整页重绘。

V1 与 V2 的关系：

- V1 保持现状，作为稳定回退版本。
- V2 只重做展示层，不复制业务数据和工具逻辑。
- V2 开发期间通过 `?ui=v2` 或 feature flag 访问。
- V2 通过完整回归后，才切换为默认展示。
- 任何阶段发现视觉或功能回归，都可以关闭 flag 回到 V1。

不要把当前独立预览直接复制进生产目录。它的职责是视觉合同、几何规则和交互样本；生产实现必须重新接入现有 React 状态和回调。

## 2. V2 第一阶段范围

第一阶段只完成一条稳定的核心路径：

1. 打开日历工作区。
2. 查看真实月份和真实角色事件。
3. 切换月份、回到今天、选择年月。
4. 切换月 / 周视图。
5. 切换生日 / 实装纪念日模式，并遵守游戏日期回落规则。
6. 使用真实头像密度规则查看日期。
7. 点击角色进入详情。
8. 搜索角色并跳转到对应月份。
9. 使用游戏 / 地区筛选。
10. 在桌面和手机上保持稳定排布。

第一阶段暂不追求：

- 每日自动 Hero。
- 新增复杂粒子或持续动画。
- 重写业务数据层。
- 为每个角色建立独立主题。
- 将所有低频维护操作同时放到首屏。

这些内容不是删除，而是延后到核心路径稳定之后。

## 3. GitHub Pages 的时间语义

GitHub Pages 是静态托管，不提供可信的服务端当前时间。V2 应明确采用“访问者浏览器本地时间”作为日历的当前日期来源。这与个人提醒日历的使用预期一致。

必须使用本地日期组件生成日期键：

```ts
function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```

禁止用下面的方式判断本地日：

```ts
new Date().toISOString().slice(0, 10)
```

原因是 `toISOString()` 会转成 UTC，在午夜附近可能把用户的本地日期判定为前一天或后一天。

首次 Hero 标记建议使用版本化键：

```text
mihoyo-calendar-v2-intro-seen-v1
```

每日 Hero（第二阶段、默认关闭）建议使用：

```text
mihoyo-calendar-v2-daily-hero-date-v1
```

每日判断规则：

- 只在普通首页进入时判断，不拦截搜索、角色链接或日期链接。
- 比较 `localDateKey()`，不是 UTC 日期。
- 同一浏览器同一天最多自动显示一次。
- 页面长时间打开时，在 `visibilitychange` 回到前台时重新检查一次。
- 不需要图像识别；根据 `calendarDateKey()` 匹配当天生日或实装纪念日。
- 没有当天事件时，显示未来 7 天内最近事件；没有候选则使用中性 Hero。
- 浏览器禁用 `localStorage` 时退化为当前会话标记，不阻塞日历。

第一版建议只启用“一次性首次进入 Hero”，每日 Hero 先保留开关和数据接口，默认关闭。这样可以保留视觉冲击，同时不让日常使用被反复打断。

## 4. 生产代码架构

业务层继续复用：

- `useCharacters`
- `src/types`
- `src/utils/calendar.ts`
- `src/utils/characterData.ts`
- `src/utils/filterUi.ts`
- `src/utils/characterSearch.ts`
- `src/utils/favorites.ts`
- `src/utils/ics.ts`
- `src/data/affiliations*.ts`
- `useTheme`

新增展示层建议：

```text
src/components/v2/
  CalendarWorkspaceV2.tsx
  WorkspaceStageV2.tsx
  WorkspaceHeaderV2.tsx
  WorkspaceControlsV2.tsx
  WorkspaceFiltersV2.tsx
  WorkspaceMonthGridV2.tsx
  WorkspaceDayCellV2.tsx
  WorkspaceWeekViewV2.tsx
  WorkspaceCharacterDetailV2.tsx
  WorkspaceHeroV2.tsx
src/styles/v2/
  tokens.css
  workspace.css
  dialogs.css
src/utils/v2/
  localDate.ts
  introHero.ts
```

`App.tsx` 继续拥有业务状态和回调；`CalendarWorkspaceV2` 只接收已经整理好的数据、当前状态和事件函数。V2 不应在组件内部重新加载角色 JSON，也不应维护第二套筛选状态。

## 5. 实施阶段与停止点

### 阶段 A：建立回退点和 V2 开关

- 确认当前 V1 的构建、测试和截图基线。
- 新增 V2 展示层入口。
- 默认仍渲染 V1，使用 query 或 flag 打开 V2。
- 不改数据、日期和现有持久化键。

停止条件：关闭 V2 后，V1 的行为和截图基线不变。

### 阶段 B：实现视觉骨架

- 实现页面背景、L1/L2/L3 图层。
- 实现 34 / 66 左右构图、26px 圆角和顶部裸文字导航。
- 实现响应式断点和移动端舞台 → 日历顺序。
- 暂时使用真实角色和月份，但先不接全部低频操作。

停止条件：中性、须弥、手机三张基准图与独立预览的结构和光场位置一致；去掉光晕后构图仍成立。

### 阶段 C：接入真实日期和头像

- 接入月视图和周视图。
- 使用 `date-fns` 生成真实月周网格。
- 日期数字固定在格子内部。
- 头像作为日期格 DOM 子节点渲染，不使用绝对画布坐标。
- 实现 1 位、2–3 位、4+ `+N` 三档规则。
- `+N` 打开当天完整名单。

停止条件：高密度月份、跨游戏同日、无头像和非闰年 2 月 29 日均通过几何检查。

### 阶段 D：接入高频功能

- 月份导航、今天、年月选择。
- 月 / 周和生日 / 实装切换。
- 搜索与键盘操作。
- 游戏、地区 / 阵营和游戏专属筛选。
- 收藏摘要和清除筛选。

停止条件：控件仍然保持层级，任何状态变化不改变主网格几何；移动端不出现页面横向滚动。

### 阶段 E：接入详情和低频功能

- 角色详情、收藏、仅看立绘。
- 添加 / 编辑角色。
- JSON 导入导出。
- ICS 导出。
- 同步、最后更新时间和偏好设置。

低频功能放入设置 / 更多面板，不扩充首屏常驻控件。

### 阶段 F：首次 Hero 和可选每日 Hero

- 首次 V2 普通进入显示全屏 Hero。
- 关闭后恢复日历，不丢失月份、筛选、选中角色和日期模式。
- Hero 和工作区使用同一个主题 profile，但 Hero 关闭不能永久污染工作区 token。
- 默认只启用一次性首次 Hero。
- 每日 Hero 只有在设置中开启后才运行。
- `prefers-reduced-motion` 下改为静态显示。

停止条件：首次进入、刷新、深链接、Esc 关闭、禁用存储和跨午夜回前台均不会阻塞或破坏日历。

### 阶段 G：切换默认和回归

- 在 V1/V2 两套入口上执行完整回归。
- 确认生产构建和 GitHub Pages base path。
- 先把 V2 设为内部默认或小范围预览。
- 通过一轮真实使用后，再移除 V1 默认入口；V1 代码可暂时保留作为回退。

## 6. 视觉冻结合同

以下内容在 V2 实施期间不得随意改变：

- GPT-01 的深靛 / 深青绿 / 右下紫色温渐变。
- 光晕从角色舞台位置产生，并向右侧自然衰减。
- 舞台立绘下方的垂直压暗。
- 26px 桌面圆角、22px 移动圆角。
- 顶部中央裸文字导航。
- 左侧舞台、右侧月历和中间留白的总体比例。
- 日期数字、事件标记、头像轨道的固定几何关系。
- 头像数量规则和可访问的 `+N` 入口。

可以调整字号、间距、具体主题 token 和低频面板文案，但每次调整必须说明原因并重新生成基准截图。

## 7. 验收清单

### 视觉和几何

- [ ] 1440×900 中性。
- [ ] 1440×900 须弥。
- [ ] 1440×900 高密度月份。
- [ ] 1024×768 紧凑桌面。
- [ ] 768×1024 平板。
- [ ] 390×844 手机。
- [ ] 360×800 窄手机。
- [ ] 1920×1080 宽桌面。
- [ ] 日期数字没有被头像覆盖。
- [ ] 头像没有越出日期格。
- [ ] 主题切换不改变日期网格几何。
- [ ] 没有页面横向滚动。

### 功能

- [ ] 月份、周视图、今天和年月跳转。
- [ ] 生日 / 实装模式和游戏日期回落。
- [ ] 搜索中文名、英文名、游戏和地区。
- [ ] 游戏专属筛选和地区 / 阵营筛选。
- [ ] 单角色、2–3 角色和 4+ `+N`。
- [ ] `+N` 完整名单。
- [ ] 头像 / 立绘失败回退。
- [ ] 角色详情和收藏。
- [ ] Hero 关闭后状态恢复。
- [ ] 首次 Hero 标记和每日开关。

### GitHub Pages / 时间

- [ ] 使用本地日期组件而不是 `toISOString().slice(0, 10)`。
- [ ] 本地时区午夜前后日期匹配正确。
- [ ] 页面跨午夜回前台会重新检查每日 Hero。
- [ ] 无 `localStorage` 时仍可使用日历。
- [ ] GitHub Pages 子路径下静态资源路径正确。
- [ ] 不依赖服务端 API 或构建机当前日期。

## 8. 新对话交接指令

新对话开始时，先读取本文件和以下资料：

1. `docs/calendar-redesign/gpt-visual-theme-analysis.md`
2. `docs/calendar-redesign/reviews/GPT-01-REGION-GLOSSARY.md`
3. `C:\Users\Administrator\calendar-redesign-review\REVIEW.md`
4. `C:\Users\Administrator\calendar-redesign-review/verification.json`
5. 本项目 `src/App.tsx`、`src/hooks/useCharacters.ts`、`src/hooks/useTheme.ts`、`src/utils/calendar.ts`、`src/utils/characterData.ts`

新对话的第一项任务应是重新确认 V1 构建 / 测试基线，然后只创建 V2 开关和展示层骨架，不要直接修改所有旧组件，也不要重新发起模型视觉候选。

# candidate-01 隔离原型 ·「一台两面 · 边光工作区」

> 这是 candidate-01 的**视觉验证原型**，不是生产代码，也不替代 PROPOSAL.md 的 A–N 书面规范。
> 它只回答一件事：边光方向在真实数据密度下，跨 1440 / 768 / 390 / 360 是否站得住。

## 文件

| 文件 | 说明 |
|---|---|
| `index.html` | 自包含原型（内联 CSS/JS），通过 URL 参数切换状态 |
| `data.js` | 真实数据样本（见下方「数据来源」），由 `src/data/characters.json` 提取生成 |
| `shoot.mjs` | Edge headless CDP 批量截图脚本，一次跑完全部 10 个状态 |
| `shots/` | 截图输出目录（跑 `node shoot.mjs` 生成） |

## 数据来源（不虚构）

`data.js` 于 2026-08-17 从 `src/data/characters.json`（288 名角色）提取：

- `GRID_CHARACTERS`：70 名生日在 7–9 月的角色（覆盖原型月份 2026 年 8 月及其前后补位周），
  保留 name/nameEn/game/birthday/rarity/element/weapon/region/avatar/portrait 字段。
  选 7–9 月是因为 8 月网格能同时展示：跨月补位、今天（08-17）、密集日（样本内 08-18 有 5 人）。
- `MODAL_CHARACTERS`：甘雨（原神，有立绘）、安比、妮可（绝区零，有立绘），用于详情弹窗状态。

头像/立绘 URL 沿用生产数据的真实外链，`referrerpolicy="no-referrer"` + `onerror` 首字回退，
与生产行为一致。原型中没有虚构角色、虚构日期或虚构阵营。

## URL 参数与截图矩阵

`?state=neutral|liyue|hares|hsr` —— 上下文主题状态；
`?view=month|week` —— 视图；`?modal=ganyu|anby` —— 打开详情弹窗。

`shoot.mjs` 一次跑完（遵守批量验证约定）：

| # | 视口 | 状态 | 验证点 |
|---|---|---|---|
| 01 | 1440×900 | neutral · 月 | 基线：工作区条+侧栏+舞台、边光关闭 |
| 02 | 1440×900 | liyue（原神·璃月） | 边光开启：顶条/今日环/fx 层染金 |
| 03 | 1440×900 | hares（绝区零·狡兔屋） | zzz 主题+hazard 纹理、侧栏游戏切换 |
| 04 | 1440×900 | liyue + 甘雨弹窗 | 立绘背景详情、操作主次、文本对比 |
| 05 | 1440×900 | neutral · 周 | 周视图密度、游戏色左边框、空日文案 |
| 06 | 768×1024 | neutral | 平板：侧栏移除、工具条两行、格子压缩 |
| 07 | 768×1024 | liyue | 平板 + 边光 |
| 08 | 390×844 | neutral | 手机：46px 级格子、容量上限 4、+N chip |
| 09 | 390×844 | hares | 手机 + 边光（验证小屏上效果不过载） |
| 10 | 360×800 | neutral | 窄手机防溢出底线 |

每张截图同时回传探针结论：`页面横向溢出`（任务书 5.2 硬底线）、侧栏可见性、
日期格/有角色格/溢出 chip 数量、图片失败数等，直接打印在脚本输出里。

## 运行

```powershell
node docs/calendar-redesign/candidates/candidate-01/prototype/shoot.mjs
```

或手动在浏览器打开 `index.html`（file:// 直开即可，无需 dev server）：

```
index.html?state=liyue&modal=ganyu
index.html?view=week
index.html?state=hares
```

## 已知边界（如实申报）

- 原型是静态渲染的 2026 年 8 月，不含交互状态机（筛选点击、搜索键盘导航等以 PROPOSAL.md F 节为准）。
- 侧栏筛选标签来自样本内真实字段，但「已选中」状态是演示值。
- `state=hsr`（星穹铁道游戏级 fallback）已实现但未列入默认截图矩阵，可手动查看。
- 弹窗仅实现桌面形态；≤480px 的底部抽屉形态由 CSS 给出，未单独截图。

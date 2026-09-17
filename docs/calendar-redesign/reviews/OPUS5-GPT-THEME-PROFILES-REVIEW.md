# Opus5 审核报告：GPT Theme Profiles 候选

## 1. 一句话结论

**需要一轮静态复核**：`ThemeProfile + 场景图层` 机制本身可以采纳（14 个字段全部被真实消费、网格几何在全部 profile 下不变），但 GPT 视觉母版在**圆角语言、主光晕位置、双栏间距、容器阴影/边框、面板不透明度、选中态材质、顶部控件重量**这 7 个耦合轴上同时偏离，修订后的组合从未被渲染过，现在冻结视觉合同没有依据。

---

## 2. 证据范围与未验证项

### 已直接核验（一手读取）

| 材料 | 状态 |
| --- | --- |
| `candidate-GPT-01/concept-v3-GPT/01-neutral-month-GPT.svg` | 已逐行读取（43 行） |
| `.../02-sumeru-filter-GPT.svg` | 已逐行读取（24 行） |
| `.../03-character-detail-GPT.svg` | 已逐行读取（10 行） |
| `.../04-mobile-orbit-GPT.svg` | 已逐行读取（13 行） |
| `.../01-neutral-month-GPT.png` | 已渲染查看 |
| `refinement-gpt-sol-01/REFINEMENT-NOTE.md` | 已读取 |
| `.../concept-refinement/01-desktop-neutral.svg` | 已逐行读取（50 行） |
| `.../concept-refinement/03-mobile.svg` | 已逐行读取（26 行） |
| 候选 `README.md` / `THEME-PROFILE-CONTRACT.md` | 已读取 |
| 候选 `prototype/index.html`(71) / `styles.css`(61) / `app.js`(53) | 已逐行读取 |
| 候选 6 张验收截图 | 全部已渲染查看 |
| `src/hooks/useTheme.ts` | 已读取（81 行，只读） |
| `src/data/affiliations.ts` | 已读取前 70 行（只读） |

### 未验证项（不得当作通过或失败）

1. **纯 token 对比从未被截图验证。** `applyPreset()`（`app.js:47`）在切换 profile 的同时改变了 `year/month/character/selectedDay/filter/mode`。6 张截图分别是 8 月/10 月、不同筛选、不同 mode 的**不同数据场景**，因此无法从截图中隔离"只换 token"的视觉效果。合同第 56 行的验收问题「profile 切换是否没有移动网格、头像和控件」只在**几何**层面被证实（见 §3），在**同月同数据**下的纯色彩对比属于未验证。
2. `02-desktop-context-detail.svg`（gpt-sol 图 2）与 `03-character-detail-GPT.png`、`02-sumeru-filter-GPT.png`、`04-mobile-orbit-GPT.png` 未渲染查看；相关结论均改用同名 SVG 的属性值作为依据。
3. `gpt-visual-theme-analysis.md`、`gpt-refinement-brief.md`、`implementation-roadmap.md`、`pre-implementation-prep.md` 本轮未读取，故本报告**不引用**任何来自这四份文档的约束；如其中已有与本报告冲突的既定决议，以那些文档为准并需另行调和。
4. `resolveAffiliation()` 仅读取到函数签名与前 70 行（占位阵营定义）；原神/绝区零的地区级配色表（`affiliations-genshin.ts`、`affiliations-zzz.ts`）未读取，故"候选 5 个手工 profile 与生产 N 个 Affiliation 的数量差"只给出方向性判断，未给出确切数字。
5. 实际性能：`backdrop-filter: blur(17px)`（`styles.css:42`）的合成开销未实测，本报告只给出视觉必要性论证（见 P1-6），不以性能为由要求删除。
6. 短视口裁切（P1-8）由 CSS 盒模型推算得出，未用浏览器实测；截图为整画布输出，不含浏览器 chrome，因此无法证伪。

---

## 3. 四个独立判定

| 判定项 | 结论 | 证据 | 风险 |
| --- | --- | --- | --- |
| **ThemeProfile 合同** | **有条件通过** | `app.js:35` `tokenMap` 14 字段 → `app.js:36` `applyTokens()` 写入 `--*` 变量；逐字段追踪确认 **14/14 全部被 CSS 真实消费，无定义未消费项**（§6）。`heroStrength` 仅出现在 `.hero-shade`（`styles.css:48,51`）→ 确实只在 Hero 生效。`eventBirthday/eventRelease` 经 `--event-color`（`app.js:41,43`）驱动 `.pin` 与 `.avatar` 边框，**不只是图例色**。`density` preset 复用 `neutral` profile（`app.js:21`）如合同所述。 | 光晕位置、辅助光强度、`--line`、圆角**全部硬编码**，无法随 profile 变化，而 GPT 母版 02 恰恰改变了光晕位置（见 P1-2）。`:root` 的 `--context-strength:.56`/`--hero-strength:.86` 为无单位值，对 `color-mix()` 非法 → 声明的 fallback 不可用（P1-9）。字段来源与生产 `Affiliation.colors{key,accent,deep}` 双轨（P0-3）。 |
| **场景图层机制** | **有条件通过** | 9 层全部可定位（§C 审计）：基础渐变 `styles.css:13` → 主光晕/辅助光 `:16` → 立绘裁切 `:36` → 垂直压暗 `:37` → 顶部层 `:17` → 面板表面 `:42` → 网格/头像/事件点/选中/摘要 `:44,46` → Hero 增强 `:48`。顺序与 GPT 母版一致，无层次错位。 | 3 层强度失准：主光晕位置上移出内容区、辅助光过大过强、立绘中段过暗（.436 vs .17）。顶部层从"无容器文字"变成"有边框分段控件"= 过度。 |
| **GPT 母版忠实度** | **不通过** | 主容器 `border-radius: 8px`（`styles.css:34`）对 GPT `rx="26"`（4 张 SVG 一致）；间距 18px 对 48px；`box-shadow: 0 22px 70px rgba(0,0,0,.24)` 对 GPT **无阴影**；面板 92%+blur 对 `fill-opacity=".76"`；选中态从浅珍珠药丸（`rx="24" fill="#f1f0ea"`）改为 accent 着色格+内环；active 控件填充从中性珍珠改为角色 accent。 | 这 7 条不是独立细节，而是共同构成"悬浮硬边卡片"观感的耦合集合；单独修一条不会恢复"浑然一体"。 |
| **头像与控件机制兼容性** | **头像有条件通过 / 控件不通过** | 头像：`.avatars{position:absolute}`+`.num{position:relative}`（`styles.css:44`）+ `grid-template-rows:32px repeat(6,minmax(62px,1fr))` → **头像在结构上不可能推动日期数字或改变行高**；4 张桌面截图交叉验证网格几何、控件位置逐像素一致。三档 39/32/26px + `slice(0,3)` + `+N`（`app.js:43`）机制成立。控件：首屏 19 个可交互控件对 GPT 母版 8 个；顶部中央 6 键 profile 切换器为验证工具；筛选状态在同一面板出现两处。 | `+N` 是惰性 `<span>`，4+ 角色无法访问（P1-4）；移动端 `+N` 少报 1（P1-5）；头像/Hero/搜索三处**均无图片失败回退**，与 README 第 31 行声明冲突（P1-3）。 |

---

## 4. P0/P1/P2 问题

### P0

**P0-1 主容器圆角 8px 取代了 GPT 的 26px 圆润语言**

- 位置：`styles.css:34` `.stage,.calendar { border-radius: 8px }`；同文件另有 5px/6px/7px/8px 共 14 处小圆角。
- 依据：GPT 母版主容器 `rx="26"`（`01-neutral-month-GPT.svg:9,23,26`；`02:7,13,15`；`04-mobile:2` 为 `rx="24"`；gpt-sol `01:7,23,29` 同为 26）。GPT 的圆角只有**两档**：26px 大容器 + 全圆胶囊（`rx="16"` on 32px 高、`rx="15"` on 30px、`rx="12.5"` on 25px、选中药丸 `rx="19/21/23/24/25"`）。**GPT 母版中不存在任何 5–8px 圆角。**
- 影响：候选把"26px 超椭圆容器 + 全圆胶囊"整体换成"5–8px 统一小圆角"，这是圆润语言的整体替换，也是截图观感差异的最大单一来源。
- 最小修订条件：主容器 24–28px（建议 26px 精确对齐母版）；所有在 GPT 中为胶囊的控件（今天、筛选芯片、生日/实装、月/周）恢复全圆（`border-radius: 999px`）；图标按钮保持圆形或胶囊。响应式上**主容器圆角在 ≥480px 全部宽度下取单一定值**，仅在 <480px 降为一档（20px），不使用 `clamp()` 连续插值，且该断点不得与改变网格行高的断点重合，避免复合重排。
- 置信度：高（直接属性对比）。

**P0-2 顶部中央 6 键 profile 切换器是验证工具，不能进入最终产品**

- 位置：`index.html:17-24` `<nav class="profiles">`；`styles.css:23` `.profiles{border:1px solid var(--line);border-radius:7px;background:rgba(6,8,20,.25);padding:3px}`；`styles.css:26` `.profiles button.active{background:var(--accent)}`。栅格中央列由 `styles.css:17` `.topbar{grid-template-columns:minmax(240px,1fr) auto minmax(220px,1fr)}` 指定。
- 依据：GPT 母版同一位置是**无容器、无背景、无边框的三个 12px 文字链接**（`01:19` `CALENDAR/COLLECTION/INSIGHTS`，`fill="#7b7f9a"`，`letter-spacing="1.6"`）；gpt-sol 将其改为 `日历/搜索角色/设置`（`01:18`），仍为裸文字。候选在此放入一个**有边框有填充的分段容器**。
- 三重问题：(a) GPT 处无容器 → 直接破坏"顶部信息融入背景"；(b) 6 项跨越四个互不同级的轴——地区(须弥)/游戏(星铁)/角色(芙宁娜)/数据密度(高密)/视图状态(Hero)——非同级项并列本身就产生"调试面板"读感；(c) `高密`、`Hero` 不是用户可理解的目的地。
- **生产代码交叉验证**：`src/hooks/useTheme.ts:8` 已定义面向用户的偏好 `ThemeMode = 'follow-neutral' | 'follow-character'`，并持久化到 localStorage（`:10,61`）。也就是说产品中**已经存在**的用户级主题控制是"是否跟随角色主题"这一个二元开关，而 profile 本身由 `resolveFollowedGame()`（`:31-40`）从选中角色/筛选状态**推导**得出。候选的 6 键切换器与这一既有设计直接冲突。
- 影响：移动端后果更严重——`styles.css:51` 使 `.profiles` 变为全宽横向滚动条并把 `.topbar` 撑到 `min-height:102px`，而 GPT `04-mobile-orbit-GPT.svg:3` 的顶部带仅约 44px（文字基线 y=26，舞台自 y=51 起）。移动首屏最显眼的元素变成了 6 个调试芯片（`05-furina-mobile` 截图可见）。
- 最小修订条件：**从最终产品视觉中移除**，不是降级。profile 由筛选/选中状态按 README 第 28 行的优先级链推导，用户无需切换。若确需人工覆盖，只能作为"设置/显示"展开面板中的一行低权重开关，且应直接复用既有 `ThemeMode`，不新增第三套控制。移除后顶部恢复为品牌 + 中性文字导航 + 月份摘要 + 今天 + 搜索。
- 置信度：高。

**P0-3 ThemeProfile 与生产既有 `Affiliation` / `useTheme` 构成三套并行主题源**

- 位置：候选 `app.js:9-15` 手写 5 个 profile；生产 `src/data/affiliations.ts:66` `resolveAffiliation(character): Affiliation`，`Affiliation.colors = {key, accent, deep}` 并附 `bg`、`ink`、`tagline`（`:29-34`）；`src/hooks/useTheme.ts:6` `ThemeId = 'neutral' | keyof typeof GAMES`。
- 依据：`affiliations.ts:17-19,65` 的注释明确说明其两级兜底就是"**地区细分 → 游戏通用回落**"（星铁/崩坏3 用 `hsr-other`/`honkai3-other` 占位）。这与候选 `sumeru`(地区) / `hsr`(游戏级回落) 演示的正是同一机制——**机制被生产代码验证为正确**，但候选把颜色**另起一张手工表**，而不是从 `resolveAffiliation()` 的 `colors{key,accent,deep}` + `bg` + `ink` 派生。
- 影响：(a) 每新增一个阵营就要手写 14 个字段，与既有配色表必然漂移；(b) `useTheme` 只有游戏粒度，`resolveAffiliation` 有地区粒度，候选 profile 又混入角色粒度和 Hero 场景粒度，四者语义重叠；(c) `Affiliation.ink`（明/暗字色提示）被候选固定的 `--text/--muted/--faint` 完全忽略。
- 最小修订条件：进入实现前确定**单一解析器**：`ThemeProfile` 必须是 `resolveAffiliation()` 结果的**派生产物**（`key→haloPrimary/accent`、`deep→stageDeep/baseStart`、`bg→立绘背景`、`ink→文字档位`），`useTheme` 的 `ThemeMode` 保留为唯一用户偏好，Hero 强度降级为**场景修饰符**而非 profile（见 P1-1）。禁止把手工 5 profile 表当作实现蓝本。
- 置信度：中高（`affiliations-genshin.ts` 未读，字段映射细节待确认；但三套并行的事实已确证）。

### P1

**P1-1 `hero` 被建模成 profile，关闭 Hero 后强主题永久残留在工作区**

- 位置：`app.js:22` `presets.hero = {profile:"hero", ..., openHero:true}`；`app.js:14` `hero` profile 的 `baseEnd:"#431b25"`、`haloPrimary:"#d13f47"`；`app.js:47` 先 `applyTokens(preset.profile)` 再 `setTimeout(openHero,80)`；`app.js:48` `closeHero()` 仅 `.close()`，**不还原 token**。
- 影响：进入 Hero 会把整个工作区染成酒红；关闭后工作区**仍是酒红**，因为 tokens 早已写在 `documentElement` 上。合同第 47 行验收项「关闭后回到原日历状态」在数据层成立（月份/筛选/视图/选中日/角色均未被 `closeHero` 改动 ✅），但在**视觉层不成立**。
- 最小修订条件：Hero 不是 profile。保留当前 profile 的 tokens，Hero 仅额外施加 `heroStrength` 作用域限于 `.hero-shade`（该作用域机制本身已正确，`styles.css:48`）。删除 `profiles.hero`，`presets.hero` 改为 `profile:"neutral"` + `openHero:true`。
- 置信度：高。

**P1-2 主光晕移出内容区，与舞台/日历的空间联系丢失**

- 位置：`styles.css:16` `.ambient` 第一层 `radial-gradient(ellipse 62% 64% at 78% 9%, ...)`。
- 依据与量化：GPT 母版主光晕 `cx="66%" cy="28%" r="65%"`（`01:6`）。GPT 日历面板占 x 41%–95%、y 16%–93%（由 `translate(590 146)` + 778×690 于 1440×900 推得），**(66%,28%) 落在面板内部偏上**，因此光晕可见地照亮日历顶边与双栏间隙——这就是"空间联系"。候选面板占 x 36%–95%、y 11.6%–96%（由 `styles.css:33,34` 推得），**(78%,9%) 落在面板上沿之外、位于顶栏带内**，光晕照亮的是顶栏而非内容。`01-neutral` 截图可见一条横贯顶部的亮带，而 GPT `01` 截图的光晕明确笼罩日历上半部。
- 附带：GPT 另有一枚独立右上模糊圆（`01:14` `cx=1230 cy=80 r=190 #8c7cff .12 blur34`），候选将其与主光晕**合并为一层**，这正是主光晕被上推到 9% 的原因；合并后失去"远处点光源 + 内容区主照明"的两级关系。
- 影响：直接对应用户观察到的"光晕位置不对 / 只像泛化背景渐变"。
- 最小修订条件：主光晕中心回到 x 64–68%、y 26–30%，使核心落在日历面板上部；恢复右上独立弱光为第三层（半径约 13–15% 宽、透明度 10–13%）；光晕的 `x/y` 位置纳入 token（GPT `02:5` 在须弥态把光晕移到 `cx="27%" cy="15%"`，位置本身是 profile 的一部分，当前硬编码无法表达）。
- 置信度：高。

**P1-3 头像 / Hero / 搜索结果三处均无图片失败回退，与 README 声明冲突**

- 位置：`app.js:38` `setImage()` 仅对舞台 `#stageImage`/`#fallback` 绑定 `onerror`；`app.js:41` `makeAvatar()` 直接 `innerHTML='<img src=...>'`，无 `onerror`；`app.js:40` `updateHero()` 设 `#heroImage.src`，无 `onerror`；`app.js:50` `renderSearch()` 同样无。
- 依据：README 第 31 行声明"支持 `prefers-reduced-motion` 与角色图片失败文字回退"。`prefers-reduced-motion` 已实现（`styles.css:53`）；文字回退只覆盖 1/4 场景。
- 影响：断网或缺图时日历格内出现破图占位，高密度格尤其明显。
- 最小修订条件：把首字母回退抽为公共函数，覆盖头像、Hero、搜索结果三处；头像回退用 `--event-color` 边框 + 首字母，尺寸与档位一致。
- 置信度：高。

**P1-4 `+N` 不可交互，4+ 角色静默不可达**

- 位置：`app.js:43` `const more=document.createElement("span"); more.className="more"; more.textContent=\`+${event.people.length-3}\`` —— 纯 `<span>`，无监听器、不可聚焦。格子点击 `selectDay(day, event?.people[0], event?.type)` 只取第 1 人。
- 依据：gpt-sol `REFINEMENT-NOTE.md:18` 明确要求"`+N` 打开当天完整名单入口，不静默丢失角色"。
- 影响：`density` 数据中 5 人日期共 5 天（`app.js:29` 第 6/18/22/26/30 日），每天有 2 位角色无任何访问路径。
- 最小修订条件：`+N` 改为 `<button>`，点击打开当天完整名单（可复用"当天摘要"区或搜索对话框样式的日面板）；可聚焦、有 `aria-label`；字号从 9px 提到 10–11px（gpt-sol 桌面用 12px、移动 11px）。
- 置信度：高。

**P1-5 移动端高密度 `+N` 少报一位**

- 位置：`styles.css:51` `.avatars.dense .avatar:nth-child(n+3){display:none}` 隐藏第 3 个头像（`.more` 不带 `.avatar` 类，不被匹配，仍显示）；`app.js:43` 的 N 仍按 `people.length-3` 计算。
- 影响：5 人日期在移动端显示 2 个头像 + `+2`，实际隐藏 3 人 → 标签少报 1。
- 最小修订条件：`+N` 的 N 必须由**实际渲染的头像数**导出，不能写死 3；或移动端保留 3 个头像并缩到 22–24px。
- 置信度：高。

**P1-6 面板 92% 不透明 + 阴影 + 不透明边框，共同破坏与页面背景的连续过渡**

- 位置：`styles.css:42` `.calendar{background:color-mix(in srgb,var(--surface) 92%,transparent);backdrop-filter:blur(17px)}`；`styles.css:34` `.stage,.calendar{border:1px solid color-mix(in srgb,var(--surface-border) 72%,transparent);box-shadow:0 22px 70px rgba(0,0,0,.24)}`；`styles.css:35` `.stage{border-color:color-mix(in srgb,var(--stage-border) 64%,var(--surface-border))}`。
- 依据与量化：GPT 面板 `fill-opacity=".76"`（`01:26`）/ `.78`（`02:15`）；GPT 容器描边 `stroke-opacity=".14"`（面板）与 `".18"`（舞台）；**GPT 母版容器无任何 drop shadow**（全文无 `filter` 应用于容器，`feGaussianBlur` 仅用于背景光球）。候选：不透明度 92%（vs 76%，约 +21%）、边框 72% alpha（vs 14%，约 5×）、舞台边框由两个**不透明色** `color-mix` 得出 → **完全不透明**（`05-furina-mobile` 截图中表现为一圈醒目珊瑚色硬边）、外加 70px 黑色阴影。
- 视觉必要性 / 可读性 / 维护 / 性能分别讨论（不以省资源为由要求删除）：
  - 视觉必要性：76–80% 的半透明是 GPT"两个容器悬浮在同一光场中"的必要条件；92% 使面板变成独立暗板，光场断开。
  - 可读性：76% + 当前 `--text/--muted/--faint` 在中性态下对比度充足（GPT 母版即以 .76 通过），降低不透明度不损可读性。
  - 维护复杂度：无变化（改常数）。
  - 性能：**在 92% 不透明度下 `blur(17px)` 几乎不可见，却支付了全额合成开销**；降到 .76–.80 后模糊才产生实际视觉回报。这是保留模糊的理由，不是删除的理由。
- 最小修订条件：面板不透明度回到 0.76–0.80；容器边框回到 12–18% alpha 白/浅色（且**必须带 alpha**，禁止两个不透明色 `color-mix`）；移除容器 `box-shadow`，或降到 `0 10px 30px rgba(0,0,0,.12)` 以下。
- 置信度：高。

**P1-7 双栏间距 48px→18px、容器变高、上下留白收窄，"大留白"显著减少**

- 位置：`styles.css:33` `.workspace{padding:28px clamp(18px,5vw,72px) 36px;grid-template-columns:minmax(300px,34fr) minmax(580px,66fr);gap:18px}`；`styles.css:34` `height:min(760px,calc(100vh - 132px))`。
- 量化（1440×900）：候选内容宽 1296，减 gap 18 后两栏为 **434.5 / 843.5**；GPT 为 **470 / 778**，gap **48**（间隙中还有一条 `x=570` 的 .08 白色发丝线，`01:15`）。候选容器高 **760**，上留白 **104**、下留白 **36**；GPT 高 **690**，上 **146**、下 **64**。
- 影响：间隙 48→18 使两个容器由"同一光场中的两块表面"变为"相邻的两块板"；上下留白收窄进一步压缩呼吸感。与 P0-1、P1-6 叠加后即为"不够浑然一体"的结构性原因。
- 最小修订条件：`gap` 恢复 40–48px；两栏比例回到约 37/63（在 1440 下逼近 470/778）；容器高度下调、上下留白回到约 viewport 高的 16% / 7%（1440×900 下约 146/64）；保留间隙中的发丝线（透明度 ≤.08）。
- 置信度：高。

**P1-8 短视口下最后一周被 `overflow:hidden` 裁掉**

- 位置：`styles.css:42` `.calendar{overflow:hidden;grid-template-rows:auto auto minmax(0,1fr) auto auto}`；`styles.css:34` `height:min(760px,calc(100vh-132px));min-height:620px`；`styles.css:44` `.grid{grid-template-rows:32px repeat(6,minmax(62px,1fr))}`。
- 推算：非网格行合计约 285px（内边距 49 + 标题区 ≈60 + context 61 + foot 50 + selected 65）；网格需 32 + 6×62 = **404px**；故容器需 ≥689px，即需 `100vh ≥ 821px`。**视口高度低于约 821px 时最后一周行被裁切**；低于 752px 时 `min-height:620px` 生效，网格仅得 335px，裁切确定发生。1440×900 的浏览器窗口去掉 chrome 后通常只剩约 800px 可视高度 → 落在裁切区间。
- 说明：6 张截图为整画布输出、不含浏览器 chrome，**因此截图无法暴露此问题**——这正是"截图尺寸准确不等于视觉合同通过"的实例。
- 最小修订条件：`.calendar` 改为 `overflow: visible` 或允许网格滚动；行高下限从 62px 降到 52–56px 并允许容器随内容增高；把 `min-height` 与实际最小内容高度（≈689px）对齐。
- 置信度：中高（盒模型推算，未浏览器实测）。

**P1-9 `contextStrength` / `heroStrength` 的 CSS 默认值对 `color-mix()` 非法，声明的 fallback 不可用**

- 位置：`styles.css:8` `--context-strength: .56; --hero-strength: .86;`（无单位）；`app.js:10-14` 提供 `"56%"` / `"86%"`。`styles.css:16,48` 以 `color-mix(in srgb, var(--halo-primary) var(--context-strength), transparent)` 消费。
- 影响：`color-mix()` 的分量要求百分比，无单位值使整条 `radial-gradient` 无效。当前被 `applyPreset()` 在加载时立即覆盖而掩盖；一旦 JS 失败/延迟，主光晕与 Hero 光完全消失，而这正是 fallback 该起作用的时刻。
- 最小修订条件：`:root` 默认值改为 `56%` / `86%`；并为每个 token 定义"缺失时的合法兜底"（`var(--x, 56%)` 形式），进入实现前写入合同。
- 置信度：高。

**P1-10 中性珍珠填充被角色 accent 取代，角色色越界进入控件——与候选自己的合同冲突**

- 位置：`styles.css:26` `.profiles button.active,.segmented button.active,.filters button.active{color:var(--stage-deep);background:var(--accent)}`；另有 `styles.css:19` `.brand-mark{background:var(--accent)}`、`styles.css:44` `.weekday.weekend{color:color-mix(in srgb,var(--accent) 55%,var(--faint))}`、`.day.selected{background:color-mix(accent 9%);box-shadow:inset 0 0 0 1px color-mix(accent 62%)}`。
- 依据：候选 README 第 29 行自述"角色色**只**进入舞台边框、头像环、事件点、焦点和摘要"。实际 accent 还进入了：控件填充、品牌标记、周末列标题、选中格背景与内环。**实现与自述合同直接冲突。**
- GPT 母版做法：active 控件填充**恒为中性珍珠**——`#edece7`(01)、`#f1f0ea`(01 选中药丸)、`#f2eee9`(04)、`#dff9ed`(02)。注意 02 须弥态的珍珠只带**极轻**色温（#dff9ed 近白），而非饱和 accent。GPT 从不用角色/地区饱和色填充控件。
- 影响：`05-furina-mobile` 截图中"生日"与"月"两枚芯片是整个日历面板最响的元素（饱和珊瑚），`06-hero` 同理；而 `03-hsr` 因 accent 恰为浅冰蓝 `#c4d3ff`（接近珍珠）反而观感尚可——说明问题严重度随 profile 波动，属机制错误而非调色错误。
- 最小修订条件：active 控件填充恢复中性珍珠（约 `#f0efe9`），允许按 profile 叠加 ≤10% 色温；accent 严格限定在舞台边框、头像环、事件点、焦点环、摘要强调；周末列标题恢复与其他星期同色；`.brand-mark` 改中性色。
- 置信度：高。

**P1-11 选中态/今天态从"信息标记"变成"格子材质"**

- 位置：`styles.css:44` `.day.selected{background:color-mix(in srgb,var(--accent) 9%,transparent);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--accent) 62%,transparent)}`、`.day.today .num{color:var(--stage-deep);background:var(--text)}`。
- 依据：GPT 母版四张图**一致**使用浅珍珠药丸承载选中/今天：`01:39` `rect 88×48 rx="24" fill="#f1f0ea"` + 两行文字（"22 · TODAY" / 角色名）；`02:22` `rect 215×50 rx="25" fill="#dff9ed"`；`04:10` `rect 91×38 rx="19" fill="#f2eee9"`；gpt-sol `01:45` `rect 100×42 rx="21" fill="#f0efe9"`。
- 影响：候选把最具识别度的 GPT 标记语言（浅色药丸浮于网格之上）替换为"整格着色 + 内环"，即从标记退化为材质——正是必审项 A 第 7 条要防的方向。
- 最小修订条件：恢复浅珍珠药丸承载选中日 + 当天摘要（药丸全圆、可容纳两行小字）；`.day.selected` 的格子底色去掉或降到 ≤4%；当天数字若需强调，用小尺寸中性标记而非反白方块。
- 置信度：高。

**P1-12 立绘垂直压暗中段过重（.436 vs .17）**

- 位置：`styles.css:37` `.stage-overlay{background:linear-gradient(90deg,rgba(4,5,12,.1),transparent 60%),linear-gradient(to bottom,rgba(5,6,14,.03) 35%,color-mix(in srgb,var(--stage-deep) 94%,transparent) 100%)}`。
- 量化：候选纵向压暗只有 **2 个停靠点**（35% 处 .03 → 100% 处 .94），线性插值在 64% 高度处 alpha = .03 + (.94−.03)×(29/65) = **.436**。GPT `01:4` 为 **3 个停靠点**：0% .05 → 64% **.17** → 100% .92。即候选在立绘中段（躯干区）比母版暗约 **2.6 倍**，压暗从"底部可读性斜坡"变成"下半幅整体压暗"。
- 附带：候选另加了一层 GPT 舞台**不存在**的横向左缘压暗（`90deg` 那一层）。
- 最小修订条件：改回 3 停靠点、复制母版曲线（≈.05 / 64% .17 / 100% .92）；删除横向压暗层，或降到 ≤.05 且仅用于文字块局部衬底。
- 置信度：高。

**P1-13 `生日/实装` 被实现为互斥硬筛选，但图例同时展示两色**

- 位置：`app.js:37` `currentEvents(){... if(event.type!==state.mode) return false; ...}`；`index.html:61` 图例同时列出 `生日` 与 `实装` 两个色点；`index.html:53` `生日/实装` 为 segmented 二选一。
- 依据：GPT 母版 `01:34` 在**同一网格内同时**渲染两类事件点（4 枚 `#ff715b` + 2 枚 `#8df1da`），图例 `01:40` 为 "○ 生日 · ◇ 实装 · ● 多角色"——即两类共存、以标记区分。gpt-sol `01:41` 同样两色共存。
- 影响：候选中任一时刻只能看到一类事件，月份计数也只统计当前类（`01-neutral` 截图顶部"6 条事件"，而该月实际 9 条）。图例展示两色但网格永远只有一色，属误导。
- 最小修订条件：`生日/实装` 恢复为**并存语义**（两类同屏、以颜色/形状区分），该 segmented 改为"强调"或"仅看某类"的可选筛选并移入展开面板；月份计数统计全部事件。
- 置信度：高。

**P1-14 `hsr` profile 重新分配了生日/实装的语义色**

- 位置：`app.js:12` `hsr:{... eventBirthday:"#efb979"（琥珀）, eventRelease:"#91b7ff"（蓝）...}`；其余四个 profile 的 `eventBirthday` 均为珊瑚系 `#ff897d/#ff957f/#ff8978/#ff806c`、`eventRelease` 为薄荷系。
- 依据：`03-hsr-fallback` 截图中图例"生日"点为琥珀、"实装"点为蓝，与 `01-neutral` 截图的珊瑚/薄荷完全不同，而**图例文字未变**。GPT 母版 02 在须弥态确实改了点色（`#54e9c8`/`#ffb777`），但**同时改写了图例语义**为"须弥·草木光 / 事件·生日"（`02:22`）——诚实地改变了含义。候选保留文字、只换色。
- 影响：跨 profile 的语义色不稳定，用户对"珊瑚=生日"的习得被破坏；且仅 `hsr` 一个 profile 破坏，一致性更难察觉。
- 最小修订条件：`eventBirthday`/`eventRelease` 设为 profile 近似不变量（允许 ≤8% 色相漂移以随色温），`hsr` 改为与其余一致的珊瑚/薄荷；若某 profile 确需改变点色含义，必须同步改写图例文字。
- 置信度：高。

**P1-15 舞台信号点颜色固定为生日色，与标签语义脱节**

- 位置：`styles.css:40` `.signal i{background:var(--event-birthday);box-shadow:0 0 13px var(--event-birthday)}`（硬编码）；`app.js:19` `presets.hsr.signal:"实装"`、`app.js:18` `sumeru.signal:"须弥"`、`app.js:21` `density.signal:"18 条"`。
- 依据：`03-hsr-fallback` 截图舞台右上为**琥珀点 + 文字"实装"**——点用的是生日色。
- 最小修订条件：信号点颜色由信号类型推导（生日/实装/地区/计数各自取色或在非事件语义下不显示点）。
- 置信度：高（截图直接可见）。

**P1-16 全局 `letter-spacing: 0` 抹掉了 GPT 的字距语汇**

- 位置：`styles.css:11` `*{box-sizing:border-box;letter-spacing:0}`。
- 依据：GPT 母版对所有小号大写标签系统性使用字距：`letter-spacing="3"`（品牌 01:17）、`"2"`、`"2.4"`、`"2.5"`、`"1.6"`、`"1.8"`、`"4"`（01:24 "AUGUST · FRIDAY"）。gpt-sol 同样保留 `1.2–3.5`。候选的 `.eyebrow{text-transform:uppercase;font-size:10px}` 在 0 字距下明显局促（`01-neutral` 截图"记忆轨道 04"、"当前主角 · 原神"可见）。
- 最小修订条件：移除通配 `letter-spacing:0`；对 eyebrow/标签/大写小字恢复 1.4–2.5px 字距，品牌行 2–3px。
- 置信度：高。

**P1-17 移动端隐藏了关键信息与筛选项**

- 位置：`styles.css:51` `.stage-meta span:last-child,.stage-button{display:none}`（隐藏舞台日期与"进入全屏"）；`.filters button:nth-child(n+3){display:none}`（隐藏第 3 个筛选=星穹铁道）；`.brand small,.today{display:none}`。
- 影响：(a) 移动端舞台丢失"10月13日 · 生日"这一最核心数据（`05-furina-mobile` 截图仅剩阵营芯片），而 GPT `04-mobile:5` 明确保留"10月13日 · 生日"；(b) 星穹铁道筛选在移动端**完全不可达**；(c) 移动端无法从舞台进入 Hero（仅剩摘要区 ↗）。
- 最小修订条件：舞台日期必须保留（可与阵营合并为一行）；筛选项改为横向滚动或移入展开面板，不得直接 `display:none` 丢功能；"今天"移入日历工具区而非隐藏。
- 置信度：高。

### P2

- **P2-1** `stageDeep` 语义过载：除舞台背景/压暗外，还被用作 active 控件的**文字色**（`styles.css:26`）与当天数字色（`styles.css:44`）。功能上是"浅底上的深墨"，与"舞台深度"无关。建议新增 `inkOnLight` token。
- **P2-2** `--muted:#a6afd1` 与 `neutral.surfaceBorder` 取值相同但前者不在 `tokenMap` 中，profile 切换时边框变而文字不变。对可读性有利，但属隐式耦合，应在合同中显式声明"文字档位不随 profile 变化"。
- **P2-3** `contextStrength` 名不符实：仅缩放主光晕的 `color-mix` 分量，不影响表面/边框强度；辅助光强度硬编码 18%（`styles.css:16`）。建议改名 `haloPrimaryStrength` 并补 `haloSecondaryStrength`。
- **P2-4** 辅助光过大过强：候选 `at 8% 82%`、椭圆 42%×48%、18%；GPT `01:14` 为 `cx=460 cy=820 r=210`（32%, 91%, 半径≈14.6% 宽）、透明度 .08。建议缩到 18–22% 半径、7–9% 透明度、x 移到 28–34%，使其成为舞台下缘的远处点光而非大面积泛光。
- **P2-5** `月/周` 视图为占位实现：`styles.css:49` `body[data-view="week"] .day:nth-of-type(n+15){display:none}` 仅隐藏第 15 格之后，展示的是当月前两行而非"当前周"。建议移入展开面板并正式实现，或从 v1 移除。
- **P2-6** `.selected` 摘要条无圆角、仅有 `border-top` + 渐变（`styles.css:46`）。GPT 词汇中的同类块是**带圆角的半透明卡片**（`04:12` `rx="22" fill-opacity=".78" stroke .12`；gpt-sol `03:24` `rx="22" fill-opacity=".86"`）。机制应保留，但需恢复卡片身份（圆角 20–24px、半透明表面、极弱描边）。
- **P2-7** Hero 右上区文字对比度不足：`.hero-top`（`styles.css:48`）色为 `color-mix(accent 78%, text)`，在 `heroStrength:96%` 的饱和红光核心区内（`06-hero` 截图右上"04 / 31"）。建议该区文字改中性高亮色或为其加局部衬底。`.hero-foot` 的 `--faint` 同样偏弱。
- **P2-8** `--line: rgba(212,220,255,.14)`（`styles.css:9`）不随 profile 变化，且比 GPT 的发丝线（`stroke-opacity=".08"`，`01:15`）强近 2 倍；`.topbar` 下边框因此比母版明显。建议降到 .08–.10。
- **P2-9** 顶栏"当前月 · N 条事件"在有色 profile 下对比度不足：`.top-actions > span` 用固定 `--faint:#697394`（`styles.css:22`），在须弥青绿与星铁蓝紫光场中几乎不可读（`02-sumeru`、`03-hsr` 截图右上可见）。建议提到 `--muted` 档或使其随 profile 亮度自适应。
- **P2-10** "今天"硬编码为 2026-08-24（`app.js:42`），`#today` 亦写死（`app.js:51`）。原型可接受，实现须改为真实当日。
- **P2-11** 无角色数据的事件在任何游戏筛选下消失：`app.js:37` 用 `event.people.some(...)`，`people:[]` 的事件恒被过滤（`03-hsr` 中 8/19 的 release 因此缺失，顶部显示"3 条"而非 4 条）。需明确"无角色事件"在筛选下的归属规则。
- **P2-12** 单头像 39px 低于 gpt-sol 规范：`styles.css:44` `.avatars.single .avatar{width:39px}`，而 `REFINEMENT-NOTE.md:17` 要求桌面单角色 48–64px。当前单头像仅比双头像态（32px）大 22%，"1 位角色=一个较大头像"的信号偏弱。
- **P2-13** 头像重叠 22%（`margin-left:-7px` / 32px）略低于 gpt-sol 的 25–35%（`REFINEMENT-NOTE.md:17`）。

---

## 5. 视觉忠实度矩阵

| 项目 | 原始 GPT 应保留 | 新候选现状 | 判定 | 依据 |
| --- | --- | --- | --- | --- |
| **构图** | 左舞台 470 / 右日历 778、间隙 48、页边 72、容器高 690、上留白 146 下 64（1440×900） | 434.5 / 843.5、间隙 **18**、容器高 **760**、上 **104** 下 **36** | **修改后保留** | GPT `01:22,25,26`；候选 `styles.css:33,34`（P1-7） |
| **容器圆角** | 主容器 `rx=26`；控件全圆胶囊（`rx=16/15/12.5`）；**无 5–8px 圆角** | 主容器 **8px**；控件 5–7px | **回退** | GPT `01:9,23,26,39,40`、`02:7,13`、`04:2`；候选 `styles.css:34,23,24,30,31`（P0-1） |
| **容器边框/阴影** | 描边 `stroke-opacity .14`(面板)/`.18`(舞台)；**无 drop shadow** | 边框 72% alpha；舞台边框由两不透明色 mix → **完全不透明**；外加 `0 22px 70px rgba(0,0,0,.24)` | **回退** | GPT `01:23,26`；候选 `styles.css:34,35`（P1-6） |
| **主光晕** | `cx 66% cy 28% r 65%`，核心落在日历面板上部；另有独立右上弱光 `.12` | `at 78% 9%`，核心落在**顶栏带**、面板上沿之外；右上弱光被合并 | **回退** | GPT `01:6,14`；候选 `styles.css:16`（P1-2） |
| **辅助光** | 左下 `cx 32% cy 91% r≈14.6%` 透明度 `.08` | `at 8% 82%`、椭圆 42%×48%、**18%** | **修改后保留** | GPT `01:14`；候选 `styles.css:16`（P2-4） |
| **光晕位置可变性** | 须弥态把主光晕移到 `cx 27% cy 15%`（位置本身属 profile） | 位置硬编码，profile 只能改色与强度 | **修改后保留** | GPT `02:5` vs 候选 `styles.css:16`（P1-2） |
| **舞台压暗** | 3 停靠点垂直渐变 `.05 / 64% .17 / 100% .92`；纯纵向 | 2 停靠点 `35% .03 / 100% .94` → 64% 处 **.436**（≈2.6×）；另加横向左缘压暗 | **修改后保留** | GPT `01:4`；候选 `styles.css:37`（P1-12） |
| **立绘裁切** | `preserveAspectRatio="xMidYMid slice"` + 手工 x/y 偏移，主体居中偏上 | `object-fit:cover` + per-preset `object-position`（如 `50% 41%`） | **保留** | GPT `01:22`；候选 `styles.css:36`、`app.js:17-22,39`（机制等价，可控性更好） |
| **日历表面** | `fill-opacity .76`/`.78`，与背景色温连续 | **92%** + `blur(17px)`，读作独立暗板 | **回退** | GPT `01:26`、`02:15`；候选 `styles.css:42`（P1-6） |
| **顶部信息** | 无容器、无背景的低对比文字（12px，字距 1.6，`#7b7f9a`）；发丝线 `.08` | **有边框有填充的 6 键分段控件**；`--line .14` | **回退** | GPT `01:19,15`、gpt-sol `01:18`；候选 `index.html:17-24`、`styles.css:23,17`（P0-2、P2-8） |
| **选中/今天态** | 浅珍珠药丸（`rx 24/25/19/21`，`#f1f0ea/#dff9ed/#f2eee9/#f0efe9`）浮于网格 | accent 着色格 9% + 内环 62%；当天为反白方块数字 | **回退** | GPT `01:39`、`02:22`、`04:10`、gpt-sol `01:45`；候选 `styles.css:44`（P1-11） |
| **active 控件填充** | 恒为中性珍珠（须弥态仅带极轻色温 `#dff9ed`） | `var(--accent)` 饱和角色/地区色 | **回退** | GPT `01:20,40`、`02:12,16`、`04:6`；候选 `styles.css:26`（P1-10） |
| **事件点 / 头像环** | 珊瑚=生日、薄荷=实装，跨状态稳定；环为 2px 细环，不改变格子材质 | 机制正确（`--event-color` 驱动 `.pin` 与头像边框）；但 `hsr` 重分配为琥珀/蓝 | **修改后保留** | GPT `01:34-38`、`04:10`；候选 `styles.css:44`、`app.js:12,41,43`（P1-14） |
| **两类事件共存** | 同一网格内同时渲染生日与实装两色 | `生日/实装` 互斥硬筛选，任一时刻只有一类；图例仍展示两色 | **回退** | GPT `01:34,40`、gpt-sol `01:41`；候选 `app.js:37`、`index.html:61`（P1-13） |
| **网格几何** | 7 列 × 100px、行 72px、日期数字定位固定 | 7 列 `minmax(0,1fr)`、行 `minmax(62px,1fr)`、头像绝对定位不推动数字 | **保留** | GPT `01:29-32`；候选 `styles.css:44`（4 张桌面截图交叉验证一致） |
| **字距语汇** | 小号大写标签系统性 1.6–4px 字距 | 通配 `letter-spacing: 0` | **回退** | GPT `01:17,18,19,24`；候选 `styles.css:11`（P1-16） |
| **移动端** | 顶部带 ≈44px（两条文字）；舞台 218–288px 高、`rx 23/24`；保留日期"10月13日 · 生日"；第三块为 `rx 22` 半透明卡片 | 顶部 **102px**（含 6 键滚动条）；舞台 270px ✅、圆角 8px ✗；舞台日期被隐藏；星铁筛选被隐藏；第三块为无圆角渐变条 | **回退** | GPT `04:3,4,5,12`、gpt-sol `03:13,24`；候选 `styles.css:51,34,46`（P0-2、P1-17、P2-6） |
| **移动端顺序** | 舞台 → 月历 → 下一事件/详情 | 舞台 → 月历 → 当天摘要 | **保留** | GPT `04`；gpt-sol `REFINEMENT-NOTE.md:13`；候选 `index.html:32-63` + `styles.css:51`（截图确认） |
| **Hero** | （母版为角色详情页 `03`，非全屏 Hero；全屏沉浸层属新增机制） | 真全屏 `dialog`，100vw×100vh、无边框；红光限于右上、文字区压至近黑、可读 | **保留** | 候选 `styles.css:48`、`06-hero` 截图；`heroStrength` 仅作用于 `.hero-shade`（作用域正确） |
| **Hero 关闭后状态** | — | 数据状态（月份/筛选/视图/选中日/角色）完整保留 ✅；但 `hero` profile 的酒红 token 永久残留 ✗ | **修改后保留** | `app.js:22,47,48`（P1-1） |

---

## 6. ThemeProfile 字段审计表

`applyTokens()`（`app.js:36`）逐字段写入 `documentElement.style`。**14/14 字段全部被真实消费，无定义未消费项。**

| 字段 | 语义 | 实际消费者（CSS 选择器 / 行号） | 状态 | 风险 | 建议 |
| --- | --- | --- | --- | --- | --- |
| `baseStart` | 页面渐变起点 | `body{background:linear-gradient(128deg,…)}` `:13` | 已验证 | — | 保留。128deg 与 GPT 对角向量（≈122deg）接近，忠实 |
| `baseMid` | 页面渐变中点（54%） | 同上 `:13` | 已验证 | — | 保留。**与 `baseEnd` 共同真实驱动背景，非空定义** |
| `baseEnd` | 页面渐变终点 | 同上 `:13` | 已验证 | — | 保留 |
| `haloPrimary` | 主光源色 | `.ambient` 第 1 层 `:16`；`.hero-shade` 径向层 `:48,51` | 已验证 | **位置硬编码 `78% 9%`，无法表达 GPT 02 的位置变化** | 补 `haloPrimaryX/Y` token；位置回到 64–68% / 26–30%（P1-2） |
| `haloSecondary` | 辅助远处光源 | `.ambient` 第 2 层 `at 8% 82%` `:16` | 已验证：**确为辅助光源，非普通装饰圆**（独立径向层、位于对角、低透明度） | 强度硬编码 18%、尺寸 42%×48% 远超母版 | 缩到 18–22% 半径 / 7–9% 透明度 / x 28–34%（P2-4） |
| `stageDeep` | 舞台深色基底 | `.stage{background}` `:35`；`.stage-overlay` 底端 `:37`；`.fallback` `:38`；`.hero{background}`+`.hero-shade` ×2 `:48`；**另**：active 控件文字色 `:26`、当天数字色 `:44` | 已验证：**同时影响立绘底部可读性与舞台背景** ✅ | 语义过载为"浅底深墨"（P2-1） | 保留主用途；拆出 `inkOnLight` |
| `stageBorder` | 舞台边框色 | `.stage{border-color:color-mix(stageBorder 64%,surfaceBorder)}` `:35` | 已验证 | **两个不透明色 mix → 边框完全不透明**，母版为 `.18` 描边 | 必须带 alpha；目标 15–25% alpha（P1-6） |
| `surface` | 日历面板表面 | `.calendar{background:color-mix(surface 92%,transparent)}` `:42`；`.avatar{background}` `:44`；`.dialog` `:47`；`.toast` `:48` | 已验证 | 92% 过于不透明（母版 .76） | 降到 0.76–0.80（P1-6） |
| `surfaceBorder` | 容器边框基色 | `.stage,.calendar{border}` 72% alpha `:34`；`.dialog{border}` **无 alpha** `:47` | 已验证 | 72% vs 母版 14%；`.dialog` 完全不透明 | 降到 12–18% alpha（P1-6） |
| `accent` | 局部强调色 | 焦点环 `:15`；`.brand-mark` `:19`；**active 控件背景** `:26`；`.icon:hover` `:32`；`.fallback` `:38`；`.eyebrow` `:41`；`.stage-button` `:41`；`.weekday.weekend` `:44`；`.day.selected` `:44`；`.selected` `:46`；`.hero-copy span`/`.hero-top` `:48`；`.result img` `:47` | 已验证 | **越界进入控件填充/品牌/周末标题，与 README:29 自述冲突** | 收回到舞台边框/头像环/事件点/焦点/摘要；控件恢复中性珍珠（P1-10） |
| `eventBirthday` | 生日事件色 | `.dot.birthday` `:45`；`.signal i` `:40`；经 `--event-color`（`app.js:41,43`）→ `.pin{background,box-shadow}`、`.avatar{border}` `:44` | 已验证：**真实驱动生日事件，非仅图例** ✅ | `hsr` 改为琥珀，破坏跨 profile 语义（P1-14）；`.signal i` 硬绑生日色（P1-15） | 设为近似不变量；信号点改由类型推导 |
| `eventRelease` | 实装事件色 | `.dot.release` `:45`；同上 `--event-color` 路径 `:44` | 已验证：**真实驱动实装事件** ✅ | `hsr` 改为蓝色 | 同上 |
| `contextStrength` | 工作区光晕强度 | `.ambient` 第 1 层 `color-mix(haloPrimary var(--context-strength),transparent)` `:16` | 已验证 | **`:root` 默认 `.56` 无单位 → `color-mix()` 非法，fallback 不可用**（P1-9）；名不符实，仅管主光晕（P2-3） | 默认值改 `56%`；改名 `haloPrimaryStrength`；补辅助光强度 token |
| `heroStrength` | Hero 光晕强度 | **仅** `.hero-shade` 径向层 `:48` 与 `:51`（移动端） | 已验证：**确实只在 Hero 场景生效** ✅ | `:root` 默认 `.86` 无单位，同上非法 | 默认值改 `86%`；Hero 改为场景修饰符而非独立 profile（P1-1） |

**profile 切换是否只换 token？** 分两层：

- **几何层：是。** `applyTokens()` 只写颜色/强度变量；日期位置、7 列网格、行高、头像档位、控件布局均由 profile 无关的 CSS 决定。4 张桌面截图交叉比对，网格与控件位置一致。**判定：保留。**
- **数据层：否。** 用户点击 profile 按钮实际调用 `applyPreset()`（`app.js:47`），同时改变 `year/month/character/selectedDay/filter/mode` 及 5 条文案。因此**截图无法隔离 token 的纯视觉效果**（见 §2 未验证项 1）。合同应明确区分 `profile`（纯 token）与 `preset`（演示场景），且验证截图必须在同月同数据下重拍。

---

## 7. 头像与控件合并决策

### 头像机制

| 项目 | 决策 | 不破坏 GPT 美学的条件 |
| --- | --- | --- |
| 三档密度（1 / 2–3 / 4+） | **直接采用** | 机制已由 `app.js:43` + `styles.css:44` 实现且几何稳定 |
| 日期数字位置固定、头像不改变行高 | **直接采用** | `.avatars{position:absolute}` + 固定 `grid-template-rows` 已在结构上保证；实现须保留"头像绝对定位、行高由轨道而非内容决定"这一约束 |
| 最多 3 个头像 + `+N` | **直接采用** | 保留 `slice(0,3)`；N 必须由**实际渲染数**导出（修 P1-5） |
| 头像边框表达事件类型 | **直接采用** | 1px 环 + 2px 内边距 + surface 底，环色取 `--event-color`；**不得**给格子加底色或边框（当前已满足） |
| 点击头像选角色 / 点击日期选日期 | **直接采用** | `stopPropagation()` 已正确隔离（`app.js:41`） |
| 头像尺寸档位 | **修改后采用** | 单头像 39→**44–52px**（gpt-sol 要求 48–64，受行高约束取下限）；2–3 位保持 32px、重叠提到 25–30%；4+ 位保持 26px |
| `+N` | **修改后采用** | 改为可聚焦 `<button>`，打开当天完整名单；字号 10–11px；不得静默丢角色（P1-4） |
| 图片失败回退 | **修改后采用** | 首字母回退必须覆盖头像/Hero/搜索三处，不只舞台（P1-3） |
| 移动端 `nth-child(n+3)` 隐藏 | **不采用** | 用尺寸缩放（22–24px×3）替代隐藏，或让 N 随实际渲染数变化；禁止用 `display:none` 造成计数不一致（P1-5） |

### 控件取舍

| 层级 | 内容 |
| --- | --- |
| **常驻** | 月份标题、上月/下月、今天、搜索、生日/实装语义（改为并存标记，见 P1-13）、当前筛选摘要 |
| **可展开**（单一"筛选 / 显示 / 更多"面板，从工作区右侧展开，不遮挡 7 列网格） | 游戏/地区筛选、月/周视图、头像密度、周起始日、立绘背景、收藏、JSON 导入导出、ICS、数据更新时间 |
| **独立状态** | 全屏 Hero、角色详情、搜索对话框 |
| **移除** | **6 键 profile 切换器**（验证工具，P0-2）；`高密`/`Hero` 作为导航项 |

**profile 切换是否是用户功能：不是。** 依据 README:28 自述的优先级链（中性→游戏回落→地区→角色）与生产 `useTheme.ts:31-40` `resolveFollowedGame()`，profile 应由筛选/选中状态**推导**。产品中唯一合理的用户级主题控制是既有的 `ThemeMode`（follow-neutral / follow-character，`useTheme.ts:8`），其入口属"设置/显示"展开面板中的一行低权重开关，默认不可见于首屏。

**控件数量与留白影响：** 候选首屏 19 个可交互控件，对 GPT 母版 `01` 的 8 个（TODAY + 3 导航文字 + 4 筛选胶囊）。移除 profile 切换器（−6）、筛选移入面板（−3）、月/周移入面板（−2）后为 8 个，回到母版量级。此外须消除两处重复：`当前筛选` 摘要与底部 `全部游戏/原神/星穹铁道` 表达同一状态；`生日/实装` segmented 与图例 `生日/实装` 文字重复。

---

## 8. 修订后的冻结合同

1. 主容器圆角取 26px（允许 24–28px），≥480px 全部宽度下为单一定值，<480px 降为一档 20px，不使用连续插值，且该断点不与改变网格行高的断点重合。
2. 凡在 GPT 母版中为胶囊的控件（今天、筛选芯片、生日/实装、月/周、摘要药丸）一律全圆；图标按钮为圆形或胶囊；禁止 5–8px 圆角出现在任何容器或控件上。
3. 桌面双栏比例约 37/63，1440 宽下逼近 470/778，栏间距 40–48px，间隙中保留一条透明度 ≤.08 的发丝线。
4. 容器上下留白约为视口高的 16% / 7%（1440×900 下约 146/64），容器高度不得挤占该留白。
5. 日历面板表面不透明度 0.76–0.80；保留背景模糊（在该不透明度下模糊才产生视觉回报）。
6. 所有容器边框必须带 alpha，取 12–18%；禁止由两个不透明色 `color-mix` 产生不透明边框。
7. 容器不得使用 drop shadow；如需分离感，一律通过光晕与表面透明度表达。
8. 主光晕核心必须落在日历面板上部（约 x 64–68%、y 26–30%），其位置为 profile token 而非硬编码。
9. 恢复独立的右上远处弱光（半径约 13–15% 宽、透明度 10–13%）与左下辅助光（约 x 28–34%、y 88–92%、半径 18–22%、透明度 7–9%）三层光结构。
10. 立绘垂直压暗为 3 停靠点、复制母版曲线（约 0% .05 / 64% .17 / 100% .92）；不得使用 2 停靠点线性压暗；不得叠加整幅横向遮罩。
11. 顶部信息层无容器、无填充、无边框；中央位置只放中性文字导航或留空；顶栏分隔线透明度 ≤.10。
12. 移除 profile 切换器。profile 由筛选与选中状态推导，唯一用户级主题控制是既有 `ThemeMode`，位于展开面板内。
13. active 控件填充恒为中性珍珠（约 `#f0efe9`），允许按 profile 叠加 ≤10% 色温；禁止用饱和 accent 填充控件。
14. accent 仅进入：舞台边框、头像环、事件点、焦点环、当天/选中摘要强调。不得进入控件填充、品牌标记、星期标题、格子底色。
15. 选中日与当天由浅珍珠全圆药丸承载（可容纳两行小字），浮于网格之上；格子底色 ≤4%；不得以整格着色替代药丸。
16. 生日与实装在同一网格内并存、以颜色区分；月份计数统计全部事件；"只看某类"为展开面板中的可选筛选，不是首屏互斥开关。
17. `eventBirthday` / `eventRelease` 为跨 profile 近似不变量（允许 ≤8% 色相漂移随色温）；若任何 profile 改变其含义，必须同步改写图例文字。
18. 舞台信号点颜色由信号类型推导；非事件语义（地区名、计数）下不显示色点。
19. 7 列网格、日期数字位置、行高由轨道尺寸决定，与事件数量无关；头像组绝对定位，永不推动数字或改变行高。
20. 头像三档：单角色 44–52px；2–3 位 32px、重叠 25–30%；4+ 位 26px、最多 3 个 + `+N`。移动端按比例缩放（约 27px / 22–24px），不得用隐藏元素达成密度。
21. `+N` 是可聚焦按钮，打开当天完整名单；N 由实际渲染的头像数导出；任何情况下不得静默丢失角色。
22. 首字母文字回退覆盖舞台、日历头像、Hero、搜索结果全部四处。
23. 控件分三层：常驻（月份、前后月、今天、搜索、生日/实装语义、筛选摘要）；可展开（游戏/地区筛选、月/周、头像密度、周起始日、导入导出/ICS、同步、偏好）；独立状态（Hero、角色详情、搜索）。首屏可交互控件不超过 10 个。
24. 同一状态不得在同一面板内表达两次（筛选摘要与筛选芯片、语义开关与图例文字各择其一）。
25. 移动端顶部带高度不超过 56px；舞台高 218–288px、圆角同主容器规则；舞台必须保留角色名、阵营与日期三项；第三块为带圆角（20–24px）的半透明卡片。
26. 移动端不得以 `display:none` 移除功能项（筛选、今天、进入全屏）；改为横向滚动或移入展开面板。
27. Hero 是场景而非 profile：保留当前 profile 的 tokens，仅额外施加 `heroStrength`（作用域限于 Hero 遮罩层）；关闭 Hero 后色彩与数据状态双双回到原工作区。
28. `ThemeProfile` 必须由 `resolveAffiliation()` 的 `colors{key,accent,deep}` + `bg` + `ink` 派生，不得维护平行手工色表；`ink` 必须参与文字档位决策；全局只保留一个主题解析器。
29. 每个 token 在 `:root` 都有语法合法的兜底值（强度类必须带 `%`），且在 JS 未执行时页面仍呈现完整的中性场景。
30. 文字档位（正文/次要/微弱）不随 profile 变化；小号大写标签保留 1.4–2.5px 字距，品牌行 2–3px；禁止通配 `letter-spacing: 0`。

---

## 9. 是否可以进入实现

**先补一轮静态视觉验证。**

理由：token 机制与场景图层顺序已足以进入实现（14/14 字段真实消费、几何在 profile 间不变、`heroStrength` 作用域正确、头像密度机制结构性稳定），但 §5 中判定为「回退」的 9 项——圆角语言、主光晕位置、容器边框/阴影、面板不透明度、选中态材质、active 控件填充、两类事件共存、顶部控件重量、移动端顶部带——是**相互耦合**的：它们共同决定"浑然一体"与否，单独修任何一条都无法预测合成结果。这个修订后的组合从未被渲染过，因此现在冻结视觉合同没有依据。

同时，§2 未验证项 1 指出现有 6 张截图分别处于不同月份/筛选/mode，**无法隔离 token 的纯视觉效果**；P1-8 的短视口裁切又说明整画布截图会系统性地隐藏真实浏览器中的布局失败。这两点使当前截图集不足以作为验收证据。

### 下一轮只需验证的静态状态（同月同数据，2026 年 8 月，`mode` 为生日+实装并存，不切换筛选）

1. `neutral` 1440×900
2. `sumeru` 1440×900（**与第 1 项同月同数据**，仅换 token，用于隔离色彩变化）
3. `density` 1440×900（含 5 人日期与 `+N`）
4. `neutral` 1440×**768**（验证 P1-8 短视口不裁切最后一周）
5. `furina` 390×844（验证顶部带 ≤56px、舞台三项信息齐全、控件为中性珍珠而非珊瑚）
6. `hero` 1440×900 + **关闭 Hero 后**的 1440×900（验证色彩不残留）

---

## 10. 下一步唯一动作

**由 GPT（原视觉母版作者）在 `candidate-GPT-theme-profiles-01` 之外新建一个修订候选目录，按 §8 的 30 条冻结合同重出上述 6 项静态截图，不改动本候选与任何既有候选。**

不引入新模型、不做第三套风格探索、不进入 `src/` 实现。收到 6 张截图后，只需针对 §5 中判定为「回退」的 9 项做一次通过/不通过复核。

# Opus5：GPT ThemeProfile 与视觉合同审核提示词

> 用途：交给 Opus5 审核 GPT 刚完成的 ThemeProfile、场景图层、截图和视觉合同。
>
> 本轮是严格审核，不是重新设计，也不是正式代码实现。只允许输出审核报告；不得修改生产 `src/`，不得修改 GPT 或其他候选产物。

## 使用方法

新建一个 Opus5 会话，将下面完整提示词原样发送。模型需要能够读取：

- `D:\work\coding\mihoyo-calendar`
- `docs/calendar-redesign/candidates/4/`
- GPT 与 GPT-sol 视觉参考目录
- Opus5 自己此前生成的受控精修目录

不要把用户的视觉偏好重新交给 Opus5 投票。整体美学已经确定采用 GPT；Opus5 的职责是检查合同和实现边界，并指出 GPT 这次交付是否真正符合已经冻结的 GPT 美学。

## 完整提示词

```text
你现在担任高级设计系统审计师、视觉实现审查员、前端架构审查员和可访问性审查员。

项目目录：D:\work\coding\mihoyo-calendar

本轮任务：
严格审核 GPT 刚完成的 ThemeProfile、场景图层、视觉合同和隔离原型，判断它是否可以作为后续正式实现的可靠输入。你不是来重新设计一套页面，也不是来证明某个模型更好。

==================================================
一、已经确定、不得重新投票的决策
==================================================

1. 最终整体美学采用 GPT 方向：深靛色舞台、左侧角色主视觉、右侧 7 列月历、大留白、克制的半透明表面和有限光晕。
2. Opus5 的局部优势用于头像密度、日期位置、控件分层、真实数据压力和移动端几何，不用于替换 GPT 的整体风格。
3. 默认入口是日历工作区；左侧角色舞台可点击进入全屏 Hero 沉浸状态。
4. Hero 应保留全屏沉浸能力，但它是日历的第二层状态，不是默认挡在日历前面的首页。
5. 普通日历工作区允许随游戏 / 地区产生有控制的整体色温变化；全屏 Hero 可以使用更强的地区 / 角色主题。
6. 不在第一版做运行时图片自动取色；使用人工审校的 ThemeProfile。
7. 不给每个日期格单独换材质；日期位置、网格、控件位置和头像规则不能因主题变化而跳动。
8. 本轮不允许修改生产代码，也不允许继续自由发散视觉方向。

如果你不同意其中某项，可以在“残余风险”中给出证据，但不得自行推翻并输出另一套设计。

==================================================
二、审计权威层级
==================================================

请严格按照以下优先级判断，不要因为某个原型代码更多、状态更完整，就把它误认为视觉权威：

第一层：已经冻结的 GPT 美学基线

- docs/calendar-redesign/candidates/candidate-GPT-01/CONCEPT-V3-GPT.md
- candidate-GPT-01/concept-v3-GPT/01-neutral-month-GPT.png / SVG
- candidate-GPT-01/concept-v3-GPT/02-sumeru-filter-GPT.png / SVG
- candidate-GPT-01/concept-v3-GPT/03-character-detail-GPT.png / SVG
- candidate-GPT-01/concept-v3-GPT/04-mobile-orbit-GPT.png / SVG
- docs/calendar-redesign/candidates/refinement-gpt-sol-01/REFINEMENT-NOTE.md
- refinement-gpt-sol-01/concept-refinement/ 下的三张概念图

第二层：已经确认要吸收的 Opus5 局部机制

- docs/calendar-redesign/candidates/refinement-opus5-01/REFINEMENT-NOTE.md
- refinement-opus5-01/concept-refinement/ 下的三张概念图
- docs/calendar-redesign/gpt-opus-mechanism-audit.md

第三层：主题机制和合同分析

- docs/calendar-redesign/gpt-visual-theme-analysis.md
- docs/calendar-redesign/implementation-roadmap.md
- docs/calendar-redesign/pre-implementation-prep.md

第四层：本轮需要审核的 GPT 产物

- docs/calendar-redesign/candidates/4/PROPOSAL-V2.md
- docs/calendar-redesign/candidates/4/prototype-v2/index.html
- docs/calendar-redesign/candidates/4/prototype-v2/app.js
- docs/calendar-redesign/candidates/4/prototype-v2/styles.css
- docs/calendar-redesign/candidates/4/prototype-v2/screenshots/11-profile-neutral-1440x900.png
- docs/calendar-redesign/candidates/4/prototype-v2/screenshots/12-profile-sumeru-1440x900.png
- docs/calendar-redesign/candidates/4/prototype-v2/screenshots/13-profile-victoria-mobile-390x844.png
- 同目录其他规定截图，用于判断 profile 是否破坏已有状态

第五层：真实业务事实

- src/types/index.ts
- src/hooks/useCharacters.ts
- src/hooks/useTheme.ts
- src/utils/calendar.ts
- src/utils/characterData.ts
- src/utils/filterUi.ts
- src/utils/characterSearch.ts
- src/utils/favorites.ts
- src/utils/ics.ts
- src/data/affiliations.ts
- src/data/affiliations-genshin.ts
- src/data/affiliations-zzz.ts
- src/data/characters.json

注意：`candidate-4` 原本是“无边界月历长卷 / Borderless Almanac”方向，使用左侧月份书脊、方形头像名条和底部命令坞。该方向不是已经冻结的 GPT 左舞台 / 右月历视觉母版。

GPT 这次把 ThemeProfile 和场景图层添加到了 candidate-4 的旧原型中。因此必须分别判断：

A. ThemeProfile 机制是否值得保留；
B. candidate-4 的当前截图是否真的符合 GPT 美学；
C. candidate-4 能否作为主题机制实验载体；
D. candidate-4 能否直接作为最终视觉合同或正式实现参考。

不得把 A/C 的通过自动等同于 B/D 的通过。

==================================================
三、GPT 本次自述的完成内容
==================================================

GPT 声称已经完成：

- 将原型主题改为 ThemeProfile + 场景图层：
  - 深靛基础渐变；
  - 主 / 辅光晕；
  - 立绘底部压暗；
  - 深色半透明月历表面；
  - profile 级事件色与边框色。
- 新增真实须弥上下文：珐露珊 / 须弥。
- 新增 profile：neutral、genshin、genshin-sumeru、hsr、zzz、honkai3。
- 重新生成并检查全部规定截图，追加三张 Theme Profile 复核截图。
- 更新 candidate-4/PROPOSAL-V2.md，加入视觉 profile、图层顺序、强度规则和验收标准。
- app.js 语法检查通过、截图尺寸正确、生产 src 未修改。

这些是待验证声明，不是审计结论。你必须以文件、截图和运行状态为证据逐项核验。

==================================================
四、必须完成的审计
==================================================

### A. 视觉母版忠实度审计

把 candidate-4 的三张 profile 截图与 candidate-GPT-01、refinement-gpt-sol-01 并排比较，明确回答：

1. candidate-4 是否仍然保留旧“书脊 + 长卷 + 底部命令坞 + 方形演员名条”的主轮廓？
2. 加入深靛和青绿 token 后，它是否只是旧页面换色，而不是 GPT 左舞台 / 右月历设计的视觉合同？
3. GPT 参考图中的以下机制，在 candidate-4 中分别是完整、部分、缺失还是被其他结构替代：
   - 左侧约 30–34% 角色舞台；
   - 右侧约 66–70% 月历面板；
   - 大幅角色裁切；
   - 立绘底部垂直压暗；
   - 左右共享的背景光晕和色温过渡；
   - 大留白和克制控件；
   - 圆形头像三档密度；
   - 点击左侧进入全屏 Hero；
   - 移动端“舞台 → 月历 → 下一事件”。
4. candidate-4 的主题截图是否能用来审查颜色和图层，但不能用来冻结页面结构？
5. 如果当前产物偏离视觉母版，指出偏离来自“ThemeProfile 合同”还是来自“错误的承载原型”。不要把两者混为一谈。

视觉审计必须引用具体截图区域。例如：“12-profile-sumeru 顶部 0–184px 仍是横向章节头，而非左侧 34% 角色舞台”。不要只写“感觉不像”。

### B. ThemeProfile 数据合同审计

审核 `themeProfiles` 中每一个字段：

- `baseStart`
- `baseMid`
- `baseEnd`
- `haloPrimary`
- `haloSecondary`
- `stageDeep`
- `stageBorder`
- `surface`
- `surfaceBorder`
- `accent`
- `eventBirthday`
- `eventRelease`
- `contextStrength`
- `heroStrength`

对每个字段回答：

1. 是否被实际消费？
2. 被哪些场景和选择器消费？
3. 如果没有消费，是否属于“合同已定义但原型未验证”的死 token？
4. 类型和取值范围是否明确？
5. 缺失时如何回退？
6. 是否与现有 `useTheme` / `resolveAffiliation` 的职责重复或冲突？
7. 是否需要分别定义工作区强度和 Hero 强度？当前是否真的验证了这两个强度？

重点核验：

- `heroStrength` 是否在任何真实 Hero 场景中使用；
- `eventBirthday` / `eventRelease` 是否真正驱动了生日 / 实装视觉；
- `baseMid` / `baseEnd` 是否只在局部详情使用，还是驱动全局背景；
- `haloSecondary` 是否存在明确的辅助光源而不是普通装饰块；
- `stageDeep` 是否真正控制立绘底部压暗和文字可读区域；
- CSS 中 `--ink`、`--muted` 等旧 token 是否会绕过 profile，导致某些 profile 对比度失控；
- `color-mix()` 混合结果是否在所有目标浏览器中可接受。

输出一张字段审计表：字段、语义、实际消费者、状态、风险、建议。

### C. 主题解析优先级审计

当前项目可能同时存在：中性主题、游戏筛选、地区 / 阵营筛选、选中角色、左侧舞台主角、自动轮播角色、角色详情和全屏 Hero。

必须给出一个确定、可测试、不会闪烁的主题解析优先级。以下是工作假设，请根据业务和 GPT 参考图审核，不要无理由照抄：

默认日历工作区：

1. 明确选择的地区 / 阵营筛选 → 对应地区 profile；
2. 只选择一个游戏 → 游戏级 profile；
3. 多游戏或没有明确上下文 → neutral；
4. 仅点击一个角色 → 先更新左侧舞台和选中头像环，不应让自动轮播每几秒改变整个日历；
5. 如果产品明确进入“跟随角色”模式，才允许选中角色驱动工作区 profile。

全屏 Hero：

1. 当前聚焦角色的地区 / 阵营 profile；
2. 无地区映射时使用游戏 profile；
3. 无映射时 neutral；
4. Hero 可以使用 `heroStrength`，普通工作区使用 `contextStrength`。

请输出最终推荐状态表，至少覆盖：

- 默认多游戏；
- 单一游戏；
- 原神 / 须弥筛选；
- 点击纳西妲但未应用须弥筛选；
- 自动轮播切换主角；
- 打开全屏 Hero；
- 关闭 Hero；
- 星穹铁道游戏级 fallback；
- 崩坏3游戏级 fallback；
- 用户关闭主题跟随；
- 用户打开减少动态效果。

每个状态写清：工作区 profile、左侧舞台 accent、Hero profile、是否动画过渡、退出后恢复什么。

### D. 场景图层审计

分别检查以下图层是否存在、顺序是否正确、是否过度：

1. 全局基础渐变；
2. 主径向光晕；
3. 辅助模糊光源；
4. 角色立绘裁切；
5. 立绘底部垂直压暗；
6. 半透明日历表面；
7. 网格、头像环、事件点和边框。

重点判断：

- candidate-4 是否真的展示了“大立绘舞台 + 压暗”，还是只在狭小章节头中放了一张缩小立绘；
- 光晕是否形成 GPT 图中的左舞台到右月历的连续色温，而不是离散装饰块；
- 普通工作区和全屏 Hero 是否有不同强度；
- 模糊层是否只有 1–2 层，并且不会在每个组件重复；
- 静态模式、`prefers-reduced-motion` 和低性能设备如何退化；
- 页面切换 profile 时应瞬时切换、短时交叉淡化还是动画；推荐时给出时间范围和可关闭策略；
- CSS blur、巨大伪元素、持续动画和图片数量的实际性能风险，不能把普通静态渐变误判成严重性能问题。

### E. 颜色、可读性与状态辨识审计

不要只判断颜色“好不好看”。至少检查：

- 主文字、次文字、日期、补位日期、按钮、筛选摘要的对比度；
- `neutral`、`genshin-sumeru`、`hsr`、`zzz`、`honkai3` 各 profile 下的可读性；
- 今天、选中、生日、实装、多角色是否不能只依赖颜色区分；
- 青绿色须弥状态是否保留 GPT 的色温变化，同时没有变成满屏单一青绿；
- ZZZ 黄色和崩坏3粉色在深色表面上是否过于抢眼；
- profile 切换后焦点环、按钮文字和禁用状态是否仍然清晰；
- 灰度下是否仍能区分日期状态和头像密度。

如无法自动得到完整对比度数据，可提供可复核的颜色对和风险等级，但不要伪造测量值。

### F. Opus5 头像与控件机制兼容审计

整体美学服从 GPT，但需要吸收 Opus5 的局部机制。审核最终合同是否明确保留：

头像：

- 日期数字固定左上；
- 1 人大头像；
- 2–3 人头像堆叠；
- 4+ 人最多 3 个头像 + `+N`；
- 默认 avatar 模式不让所有角色名常驻；
- card 模式可以显示短名；
- compact 模式保持当天名单入口；
- 无图、加载失败、`ui-avatars.com` 和非角色占位资源回退为首字头像。

控件：

- 常驻只保留搜索、月/周、生日/实装、筛选摘要、更多；
- 月份标题、上一月、下一月、今天放在月历卡头；
- 桌面筛选 / 显示面板点击后从左侧舞台区域展开，不遮挡右侧月历；
- 面板内部渐进披露，不能一次常驻所有 chip；
- 移动端使用底部抽屉或等价交互；
- 低频导入、导出、ICS、同步和偏好进入更多。

判断 candidate-4 当前的方形名条、底部命令坞和固定 42 格长卷是否应该进入最终合同。不得因为它们已经写成原型就默认保留。

### G. 全屏 Hero 合同审计

明确判断当前 GPT 交付是否真正定义并验证了全屏 Hero，而不是把“角色详情页”误当作 Hero。

全屏 Hero 合同至少应包含：

- 从左侧舞台进入；
- 全屏或近全屏覆盖层；
- 当前角色大立绘；
- 更强的地区 / 游戏背景和光晕；
- `heroStrength` 的实际消费者；
- 手动角色切换；
- 自动轮播是否允许以及何时暂停；
- 查看角色详情入口；
- 关闭按钮、Escape、返回焦点；
- 关闭后保持月份、筛选、日期模式、选中日期；
- 减少动态效果和无立绘回退；
- Hero 与角色详情的职责边界。

如果 candidate-4 没有验证这些内容，应判定为“合同缺失 / 未验证”，而不是“以后再做所以通过”。

### H. 响应式和真实数据压力审计

至少检查：

- 1440×900 中性状态；
- 1440×900 须弥状态；
- 390×844 移动状态；
- 1280×800、1024×768 的可行性；
- 5 行和 6 行月份；
- 4 月 / 8 月密集月份；
- 01-01 七角色；
- 全年最密同日；
- 无事件月；
- 无头像和非角色占位头像；
- 多游戏同日；
- 展开筛选面板；
- 打开全屏 Hero；
- 切换 profile 时布局是否稳定。

如果现有截图没有覆盖某状态，请标记“未验证”，不要凭说明文字判定通过。

==================================================
五、不得做的事
==================================================

1. 不得修改 `src/`、`public/`、`package.json` 或生产代码。
2. 不得修改 candidate-4、candidate-GPT-01、refinement-gpt-sol-01、refinement-opus5-01 的任何文件。
3. 不得重新设计一套新页面或新隐喻。
4. 不得以“代码能运行”“语法检查通过”“截图尺寸正确”代替视觉合同审核。
5. 不得把 candidate-4 的旧书脊 / 长卷结构当作既定方向。
6. 不得只输出赞同意见；必须列出阻塞问题、证据和修正条件。
7. 不得开始正式 React / TypeScript 实现。
8. 不得给所有角色逐一设计 profile。
9. 不得建议运行时自动取色作为第一版必要条件。
10. 不得用自评分替代证据。

允许进行只读检查、启动隔离原型、使用浏览器检查现有状态。若确实需要新增审计截图，只能放到新的审核输出目录，不能覆盖已有截图。

==================================================
六、最终输出格式
==================================================

将报告保存为：

docs/calendar-redesign/reviews/OPUS5-THEME-PROFILE-AUDIT.md

报告必须按以下结构输出：

## 1. 一句话结论

用一句话说明：当前 GPT 交付是否可以直接冻结、是否需要有条件修订、还是不能作为最终视觉合同。

## 2. 四个独立判定

分别给出 `通过 / 有条件通过 / 不通过 / 未验证`：

- ThemeProfile 数据合同；
- 场景图层机制；
- candidate-4 作为主题实验载体；
- candidate-4 作为最终视觉 / 实现母版。

每项必须给出 2–4 条证据。

## 3. 主要发现

按严重度排序：

- P0：不修正就不能进入正式实现；
- P1：可以开始准备，但必须在视觉冻结前修正；
- P2：实现阶段可处理的细节。

每条发现必须包含：

- 问题；
- 文件与行号或截图位置；
- 具体影响；
- 最小修正条件；
- 置信度。

## 4. 视觉忠实度矩阵

逐项比较：GPT 原始母版、GPT-sol 精修、candidate-4 当前交付、最终合同应保留什么。

至少包括：构图、舞台、光晕、月历表面、头像、控件、移动端、Hero、上下文换色。

## 5. ThemeProfile 字段审计表

字段、语义、消费者、是否已验证、风险、建议。

## 6. 主题解析状态表

列出 C 节要求的所有状态，给出 workspace profile、stage accent、Hero profile、强度和退出行为。

## 7. 场景图层审核

按图层顺序说明：已实现、部分实现、缺失、过度实现。

## 8. 头像与控件合并结论

只列三类：

- 直接采用；
- 修改后采用；
- 不采用。

每项说明为何不会破坏 GPT 美学。

## 9. Hero 合同结论

明确当前是否有真正的全屏 Hero 合同，缺少哪些状态。

## 10. 修订后的冻结清单

输出一份不超过 30 条的最终视觉合同修订清单。它必须足够让后续实现者执行，但不要写组件代码或 CSS。

## 11. 是否可以进入实现

只允许以下结论之一：

- 可以进入实现；
- 完成列出的 P0 修订后可以进入实现；
- 需要补一轮静态视觉验证后再进入实现。

明确下一步只需要谁做什么，不要再建议多模型自由设计。

==================================================
七、评分框架
==================================================

评分只用于辅助，最终结论必须以发现为准：

- GPT 视觉母版忠实度：30；
- ThemeProfile 语义完整性：20；
- 主题解析和状态稳定性：15；
- 头像 / 控件机制兼容性：15；
- Hero 与响应式合同：10；
- 对比度、性能和可访问性：10。

以下任一项构成硬性不通过：

- 把 candidate-4 的旧长卷结构误当成最终 GPT 母版；
- ThemeProfile 关键字段只定义未消费，却声称已经验证；
- 没有确定的主题解析优先级；
- 普通自动轮播可以持续改变整个工作区 profile；
- 全屏 Hero 没有定义却声称合同完整；
- 主题切换改变网格、日期位置或头像密度；
- 移动端只验证换色，没有验证 GPT 的“舞台 → 月历 → 下一事件”结构；
- 只凭截图尺寸和 JS 语法通过就判定可实施。

请保持审计中立：可以确认 GPT 主题机制做对的部分，也必须指出错误承载原型、未使用 token、未验证状态和美学偏离。最终目标不是否定任何候选，而是避免把一套局部可用的主题实验错误冻结成最终产品结构。
```

# Opus5 审核提示词：GPT Theme Profiles 候选复核

## 使用方式

请在一个全新的会话中执行本提示词。你是视觉与交互合同的审核者，不是自由发挥的重新设计者。

执行时只替换以下变量：

- `{{PROJECT_ROOT}}`：`D:/work/coding/mihoyo-calendar`
- `{{REPORT_PATH}}`：`D:/work/coding/mihoyo-calendar/docs/calendar-redesign/reviews/OPUS5-GPT-THEME-PROFILES-REVIEW.md`

如果 `reviews/` 不存在，可以创建该目录和报告文件，但不得修改其他文件。

---

## 完整任务提示词

你现在要对一个已经有明确美学母版的日历原型做一次严格审核。你的任务是判断新候选哪些机制可以吸收、哪些视觉细节必须回退到 GPT 母版，以及是否具备进入正式实施规划的条件。

这不是新一轮自由设计，不是前端实现，也不是让你把两个候选混合成第三套风格。GPT 的视觉美学已经定调；你只能在这个定调内进行证据审计和局部修订建议。

### 1. 审核目标

必须分别回答以下四个问题，不能用一个总分代替：

1. 新候选的 `ThemeProfile + 场景图层` 机制是否可以作为正式实现的技术/视觉机制。
2. 新候选是否忠实保留了原始 GPT 的视觉母版；如果没有，哪些部分应回退。
3. Opus 风格的头像密度、`+N`、控件分层和真实数据压力样本，哪些可以在 GPT 美学内采用。
4. 修订后是否可以进入生产实现；如果不可以，必须列出阻塞项和下一次只需验证的静态状态。

### 2. 必须读取的材料

先读取文本和源文件，再看截图。不得只根据 README 或模型自述下结论。

#### A. 原始 GPT 视觉母版（最高优先级）

- `{{PROJECT_ROOT}}/docs/calendar-redesign/candidates/candidate-GPT-01/concept-v3-GPT/01-neutral-month-GPT.svg`
- `{{PROJECT_ROOT}}/docs/calendar-redesign/candidates/candidate-GPT-01/concept-v3-GPT/02-sumeru-filter-GPT.svg`
- `{{PROJECT_ROOT}}/docs/calendar-redesign/candidates/candidate-GPT-01/concept-v3-GPT/03-character-detail-GPT.svg`
- `{{PROJECT_ROOT}}/docs/calendar-redesign/candidates/candidate-GPT-01/concept-v3-GPT/04-mobile-orbit-GPT.svg`
- 上述 SVG 的同名 PNG 截图

#### B. GPT-sol 局部精修参考（次高优先级）

- `{{PROJECT_ROOT}}/docs/calendar-redesign/candidates/refinement-gpt-sol-01/concept-refinement/01-desktop-neutral.svg`
- `{{PROJECT_ROOT}}/docs/calendar-redesign/candidates/refinement-gpt-sol-01/concept-refinement/02-desktop-context-detail.svg`
- `{{PROJECT_ROOT}}/docs/calendar-redesign/candidates/refinement-gpt-sol-01/concept-refinement/03-mobile.svg`
- 对应 PNG 和 `REFINEMENT-NOTE.md`

#### C. 本次待审核 GPT Theme Profiles 候选

- `{{PROJECT_ROOT}}/docs/calendar-redesign/candidates/candidate-GPT-theme-profiles-01/README.md`
- `{{PROJECT_ROOT}}/docs/calendar-redesign/candidates/candidate-GPT-theme-profiles-01/THEME-PROFILE-CONTRACT.md`
- `{{PROJECT_ROOT}}/docs/calendar-redesign/candidates/candidate-GPT-theme-profiles-01/prototype/index.html`
- `{{PROJECT_ROOT}}/docs/calendar-redesign/candidates/candidate-GPT-theme-profiles-01/prototype/styles.css`
- `{{PROJECT_ROOT}}/docs/calendar-redesign/candidates/candidate-GPT-theme-profiles-01/prototype/app.js`
- `{{PROJECT_ROOT}}/docs/calendar-redesign/candidates/candidate-GPT-theme-profiles-01/prototype/shots/01-neutral-1440x900.png`
- `02-sumeru-1440x900.png`
- `03-hsr-fallback-1440x900.png`
- `04-density-1440x900.png`
- `05-furina-mobile-390x844.png`
- `06-hero-1440x900.png`

#### D. 背景约束文档

- `{{PROJECT_ROOT}}/docs/calendar-redesign/gpt-visual-theme-analysis.md`
- `{{PROJECT_ROOT}}/docs/calendar-redesign/gpt-refinement-brief.md`
- `{{PROJECT_ROOT}}/docs/calendar-redesign/implementation-roadmap.md`
- `{{PROJECT_ROOT}}/docs/calendar-redesign/pre-implementation-prep.md`

如果路径、文件或截图缺失，记录为“未验证”，不要猜测内容，也不要用模型自述补齐证据。

### 3. 已知背景与证据优先级

项目已经决定采用 GPT 的美学方向：深靛基础、左侧角色舞台、右侧日历、大留白、柔和光晕、圆润大容器、顶部信息融入背景、全屏 Hero 沉浸状态。

原始 GPT SVG 中可以直接核验到的参考事实包括（请再次核验，不要盲目接受）：

- 左右主容器约为 `rx=26` 的圆角大容器。
- 页面使用深蓝黑到靛紫的对角基础渐变。
- 中性状态主径向光晕大致位于右上区域，另有低透明度左下辅助光。
- 左侧立绘有从顶部较透明到底部较深的垂直压暗渐变。
- 右侧月历是半透明深色表面，与页面背景有连续的色温和透明度过渡。
- 须弥状态是明显但受控的青绿色温变化，不是每个日期格单独换材质。
- 移动芙宁娜状态只做较弱的角色局部强调。
- 顶部导航/品牌信息较轻，不是一个显眼的 profile 测试面板。

以上是待核验的参考事实。新候选的截图、README 和合同不是更高优先级证据；如果它们与原始 SVG 冲突，必须指出冲突。

### 4. 严格边界

你必须遵守以下限制：

1. 不修改 `src/`、`public/`、`package.json` 或任何生产代码。
2. 不修改任何已有 candidate、GPT-sol 或原型文件。
3. 不生成新的网页、CSS、React 组件或替代方案代码。
4. 不把新候选截图直接认定为最终视觉母版。
5. 不因为截图尺寸准确、JS 语法通过、图片加载成功就判定视觉合同通过。
6. 不重新发明品牌、布局、字体体系或第三套整体风格。
7. 不要求为每个角色建立独立完整主题；角色只能作为受控的局部 accent。
8. 不把实时图片取色作为第一版必须条件。
9. 只做只读检查、浏览器查看和报告写入。若必须新增截图，只能写入 `{{REPORT_PATH}}` 所在的新审核目录。

### 5. 审核方法

对每个结论都要区分：

- **直接证据**：SVG 属性、CSS 选择器/变量、JS 调用、截图中的明确位置。
- **合理推断**：由证据推导出的设计影响。
- **未验证**：当前材料无法确认的内容。

截图比较应至少覆盖 1440x900 的中性、须弥、高密度和 Hero，以及 390x844 的芙宁娜移动端。需要时可用浏览器打开候选原型进行只读交互，但不要为了“让它更好看”临时改代码。

每个视觉结论必须引用文件路径，并尽量引用 SVG 行号、CSS 选择器或截图区域（例如“右上 20% 区域”“左舞台底部 25%”）。不要只写“感觉更丑”“不够高级”。

### 6. 必审项目

#### A. GPT 母版忠实度

逐项比较原始 GPT 与新候选：

- 左右区域比例和空间节奏。
- 主容器圆角、边框柔和度和阴影克制度。
- 左侧立绘裁切、主体位置和底部垂直压暗。
- 页面主光晕、辅助光晕的位置、尺寸、透明度和与舞台/日历的关系。
- 日历面板与页面背景的连续过渡。
- 顶部品牌、导航、月份信息和右侧操作的视觉重量。
- 选中态、今天态、事件点和头像环是否仍然是信息标记，而不是新的装饰材质。
- 移动端“舞台 -> 月历 -> 下一事件”的顺序和几何稳定性。

特别回答：

1. 新候选的 `border-radius: 8px` 是否破坏了 GPT 母版的圆润语言；给出建议范围，默认以约 24–28px 为候选而不是武断固定一个值。
2. 新候选的顶部中间 profile segmented control 是否带来“测试工具/调试面板”感；最终产品中应隐藏、降级为低权重入口，还是保留为产品功能。
3. 新候选的光晕是否只是泛化背景渐变，是否保留了原始 GPT 中主光晕与左右内容区的空间联系。
4. 左侧底部压暗是否仍是垂直可读性渐变，而非整块黑色遮罩。

#### B. ThemeProfile 合同和真实消费

检查 `app.js` 的 `profiles`、`tokenMap`、`applyTokens()`，以及 `styles.css` 的实际消费，逐字段审核：

`baseStart`, `baseMid`, `baseEnd`, `haloPrimary`, `haloSecondary`, `stageDeep`, `stageBorder`, `surface`, `surfaceBorder`, `accent`, `eventBirthday`, `eventRelease`, `contextStrength`, `heroStrength`。

对每个字段输出：

- 语义是否清楚。
- 是否真的写入 CSS 变量并被使用。
- 被哪些选择器/场景消费。
- 是否存在定义但未消费、消费位置不合理或被旧 token 覆盖。
- 缺失或异常时的 fallback。
- 是否与 `useTheme` / `resolveAffiliation` 的职责冲突（如能从现有项目核验）。

特别核验：

- `heroStrength` 是否只在真正的 Hero 场景生效。
- `eventBirthday` / `eventRelease` 是否分别驱动生日和实装事件，而不是仅作为图例颜色。
- `baseMid` / `baseEnd` 是否共同驱动页面背景，而不是只定义未生效。
- `haloSecondary` 是否确实是辅助光源，而不是普通装饰圆。
- `stageDeep` 是否同时影响立绘底部可读性与舞台背景。
- profile 切换是否只换 token，不改变日期位置、网格几何、头像密度和控件布局。

#### C. 场景图层顺序

按以下顺序审计，并标记“正确 / 部分正确 / 缺失 / 过度”：

1. 页面基础渐变。
2. 主径向光晕。
3. 辅助低透明度光源。
4. 角色立绘裁切。
5. 立绘顶部到下方的垂直压暗。
6. 顶部轻信息层。
7. 右侧半透明深色月历表面。
8. 网格、头像环、事件点、选中态和当天摘要。
9. Hero 的独立增强层。

说明哪些层应该回退到原始 GPT 的位置或强度。不要通过增加更多 blur、渐变球、边框或阴影来补救。

#### D. 头像与高密度事件机制

审核能否吸收 Opus 机制，同时不破坏 GPT 美学：

- 1 个角色：单个较大头像。
- 2–3 个角色：有限重叠堆叠。
- 4 个及以上：最多 3 个头像加 `+N`。
- 日期数字位置固定，头像区域不能推动数字或改变网格高度。
- 头像边框应表达事件类型，不能让每个格子变成彩色卡片。
- 点击头像能选择角色，点击日期仍能选择日期。
- 无图片/加载失败时有稳定首字母回退。

判断新候选头像尺寸、重叠、`+N` 的可读性；若需要修改，给出“保留 / 调整 / 不采用”以及不会破坏 GPT 视觉的最小条件。

#### E. 控件和功能取舍

不要把所有旧功能都永久放在首屏。将控件分为：

- 常驻：月份、前后月、今天、搜索、生日/实装语义、当前筛选摘要。
- 可展开：游戏/地区筛选、更多筛选、导入导出/ICS、同步、偏好设置等低频能力。
- 独立状态：全屏 Hero、角色详情、搜索对话框。

审核 profile 切换本身是否是用户功能。如果只是视觉验证工具，不得进入最终首屏；如果确实是产品功能，必须说明它的入口、默认隐藏方式和视觉重量。重点判断控件数量和层级是否会破坏原始 GPT 的留白、圆润和顶部融合感。

#### F. 移动端与 Hero

移动端检查 390x844：

- 顶部品牌/状态信息是否过高或被 profile 控件挤压。
- 舞台高度、立绘裁切、底部压暗和标题是否稳定。
- 月历是否在舞台之后自然进入，而不是重新变成一组硬边卡片。
- 工具是否应折叠，网格日期与头像是否不跳动。
- 顶部控件是否仍具有 GPT 的轻量感。

Hero 检查：

- 是否真的是全屏沉浸层，而不是放大的角色详情卡。
- 是否比普通工作区允许更强的 profile/角色主题强度。
- `heroStrength` 是否实际消费。
- 关闭 Hero 后是否保留月份、筛选、视图、选中日期和角色状态。
- Hero 的红/青等角色色是否仍受控，不能覆盖可读性。

### 7. 结论分类

所有发现必须放入以下四类之一：

- **保留**：可直接进入视觉合同。
- **回退**：必须恢复原始 GPT 母版的做法。
- **修改后保留**：机制正确，但要给出最小修订条件。
- **未验证**：材料不足，不能判定通过或失败。

严重度使用：

- `P0`：不修订就不能进入正式实现。
- `P1`：会明显破坏 GPT 美学或关键交互，必须在视觉冻结前修订。
- `P2`：实现阶段可处理的细节。

### 8. 报告输出格式

把报告写入 `{{REPORT_PATH}}`，严格使用以下结构：

```markdown
# Opus5 审核报告：GPT Theme Profiles 候选

## 1. 一句话结论
（只能是：可进入实现 / 修订指定 P0 后进入 / 需要一轮静态复核 / 不可采用）

## 2. 证据范围与未验证项

## 3. 四个独立判定
| 判定项 | 结论 | 证据 | 风险 |
| ThemeProfile 合同 | 通过/有条件通过/不通过/未验证 | ... | ... |
| 场景图层机制 | ... | ... | ... |
| GPT 母版忠实度 | ... | ... | ... |
| 头像与控件机制兼容性 | ... | ... | ... |

## 4. P0/P1/P2 问题
每项包含：问题、文件/行号或截图区域、影响、最小修订条件、置信度。

## 5. 视觉忠实度矩阵
| 项目 | 原始 GPT 应保留 | 新候选现状 | 保留/回退/修改后保留/未验证 | 依据 |
| 构图 | ... | ... | ... | ... |
| 容器圆角 | ... | ... | ... | ... |
| 主/辅光晕 | ... | ... | ... | ... |
| 舞台压暗 | ... | ... | ... | ... |
| 日历表面 | ... | ... | ... | ... |
| 顶部信息 | ... | ... | ... | ... |
| 移动端 | ... | ... | ... | ... |
| Hero | ... | ... | ... | ... |

## 6. ThemeProfile 字段审计表
| 字段 | 语义 | 实际消费者 | 已验证/未验证 | 风险 | 建议 |

## 7. 头像与控件合并决策
只列：直接采用 / 修改后采用 / 不采用，并说明不会破坏 GPT 美学的条件。

## 8. 修订后的冻结合同
不超过 30 条，写成后续实现者可以执行的规则，不写代码。

## 9. 是否可以进入实现
只能选择：
- 可以进入实现
- 完成列出的 P0 修订后进入实现
- 先补一轮静态视觉验证

## 10. 下一步唯一动作
只指定一个下一步动作和负责人，不再提出无边界的多模型自由设计。
```

### 9. 额外强制要求

- 报告必须明确指出新候选与原始 GPT 母版不同的地方，不能只复述新候选的 README。
- 对用户已经观察到的三个疑问必须给出证据结论：光晕位置、边缘圆润度、顶部中间控件的浑然一体感。
- 不要把“减少资源占用”作为不采用渐变或光晕的默认理由；应分别讨论视觉必要性、可读性、维护复杂度和实际性能证据。
- 不要把“视觉更强”自动等同于“整页换材质”；说明哪些变化应该留在场景层，哪些应该留在事件/状态层。
- 若新候选的 profile 切换按钮只是验证工具，必须明确从最终产品视觉中移除或降级，而不是把它当作最终导航。
- 若建议采用原始 GPT 的圆润边缘，给出一个可执行范围（例如主容器约 24–28px，按钮/小控件另定），并说明响应式下不得产生几何跳变。
- 对所有没有足够证据的判断写“未验证”，禁止用自信语气填空。

完成报告后停止，不要继续修改代码或生成新的候选。


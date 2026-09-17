# GPT Theme Profiles 01

这是按 `docs/calendar-redesign/gpt-visual-theme-analysis.md` 落地的独立 Stage A 视觉验证候选。

本目录没有覆盖生产 React 界面，也没有修改任何既有候选。原型采用一套共享 DOM，通过
Theme Profile token 切换中性、地区、游戏回落、角色强调和 Hero 强度。

## 打开方式

直接打开 `prototype/index.html`，或访问本地静态服务器：

`http://127.0.0.1:4173/index.html?state=neutral`

可复现状态：

- `?state=neutral`：阿蕾奇诺 / 中性月历
- `?state=sumeru`：纳西妲 / 须弥地区主题
- `?state=hsr`：卡芙卡 / 星铁游戏级回落
- `?state=furina`：芙宁娜 / 移动端弱角色强调
- `?state=density`：高密度日期与 `+N`
- `?state=hero`：全屏强主题 Hero

## 冻结规则

- 桌面工作区采用 34/66 左舞台 / 右月历；移动端顺序为舞台 -> 月历 -> 当天摘要。
- 所有状态共享 7 列网格、日期位置、头像规则、控件位置、搜索和 Hero 结构。
- Profile 只替换基础渐变、两个光晕、舞台深色/边框、面板表面/边框、强调色、事件色和强度。
- 主题优先级为中性 -> 游戏回落 -> 地区 -> 当前角色局部强调。
- 日期格没有独立材质；角色色只进入舞台边框、头像环、事件点、焦点和摘要。
- 关闭 Hero 后保留月份、日期模式、选中日、筛选和 profile。
- 支持 `prefers-reduced-motion` 与角色图片失败文字回退。

## 验收截图

- `prototype/shots/01-neutral-1440x900.png`
- `prototype/shots/02-sumeru-1440x900.png`
- `prototype/shots/03-hsr-fallback-1440x900.png`
- `prototype/shots/04-density-1440x900.png`
- `prototype/shots/05-furina-mobile-390x844.png`
- `prototype/shots/06-hero-1440x900.png`

## 资源策略

原始 GPT 候选中的 5 张 webp 被复制到本候选自己的 `prototype/assets/`，用于隔离静态服务。
源图片与所有旧候选均保持不变。

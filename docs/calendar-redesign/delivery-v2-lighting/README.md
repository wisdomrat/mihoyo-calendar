# V2 Hero 与舞台光效调整

本轮处理 Hero 打开后立绘变暗，以及其他地区、阵营舞台偏暗的问题。

## 修改

- Hero 原先横向、纵向深色遮罩大面积重叠，彩色光晕也覆盖在立绘上。现在将环境光放到立绘后方，遮罩收窄到文字区和画面边缘；手机端同步调整，人物保留原图亮度。
- 舞台主题接入现有地区与阵营配色：璃月暖金、稻妻紫、枫丹蓝、维多利亚紫金、白祇重工橙黄等。为偏暗的主题色加入浅色成分，分别形成背光、侧面补光和环境色。
- 保留纳西妲所在须弥舞台的既有配色与光效。修改前后纳西妲舞台截图 SHA-256 完全相同。
- 角色详情、舞台和日历的布局、立绘尺寸与交互未调整。

实现文件：`src/components/v2/profiles.ts`、`src/styles/v2/workspace.css`、`src/styles/v2/dialogs.css`。

## 验证

- `npm run build`：通过。
- `npm run lint`：通过。
- 修改前执行的 `npm test -- --test-reporter=dot`：已有 6 项 `test/portraitLayout.test.js` 失败，与本轮光效无关；本轮没有修改该模块。
- Chromium 桌面 1920×1080 检查 12 名角色的舞台与详情，6 名角色的 Hero；手机 390×844 检查钟离和艾莲。
- Hero 全屏、角色对应、Escape / 关闭按钮、滚动锁定与恢复、焦点恢复、月份保持均通过。修改前后舞台与详情尺寸一致，无页面运行异常。
- 爱莉希雅的数据未提供立绘，截图为现有缺图占位；该样本只验证粉色主题与缺图回退。

浏览器记录：[修改前](./before/verification.json)、[修改后](./after/verification.json)。

## 视觉对照

- 舞台：[修改前](./before/stages.png) / [修改后](./after/stages.png)
- Hero：[修改前](./before/heroes.png) / [修改后](./after/heroes.png)
- 手机 Hero：[钟离](./after/mobile-hero-zhongli.png)、[艾莲](./after/mobile-hero-ellen.png)

本地预览：<http://127.0.0.1:5173/mihoyo-calendar/?ui=v2>。

复跑浏览器验证：启动开发服务器后执行 `node docs/calendar-redesign/delivery-v2-lighting/verify.mjs after`。`before` 目录保存本轮修改前基线，请勿用修改后的代码覆盖。

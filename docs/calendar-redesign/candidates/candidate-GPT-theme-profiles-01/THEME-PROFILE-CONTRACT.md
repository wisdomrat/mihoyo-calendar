# Theme Profile 视觉合同 / GPT 01

## Token 模型

```text
ThemeProfile {
  baseStart
  baseMid
  baseEnd
  haloPrimary
  haloSecondary
  stageDeep
  stageBorder
  surface
  surfaceBorder
  accent
  eventBirthday
  eventRelease
  contextStrength
  heroStrength
}
```

运行时由 `applyTokens()` 和 `tokenMap` 写入 `--base-start`、`--halo-primary` 等 CSS 变量。
布局组件不根据 profile 名称分叉。`density` 故意复用 `neutral`，只改变日期事件密度，用于验证
高事件量不会触发每格换材质或日期位置跳动。

## Profile 边界

| Profile | 基础方向 | 主光晕 | 局部强调 | 工作区强度 | Hero 强度 |
| --- | --- | --- | --- | ---: | ---: |
| `neutral` | 深靛 / 紫 | 靛紫 | 珍珠紫 | 56% | 86% |
| `sumeru` | 深绿 / 紫 | 薄荷绿 | 浅薄荷 | 68% | 90% |
| `hsr` | 深蓝 / 紫 | 星海蓝 | 冰蓝 | 55% | 88% |
| `furina` | 深靛 / 珊瑚紫 | 克制紫 | 珊瑚 | 32% | 90% |
| `hero` | 深靛 / 酒红 | 红紫 | 珊瑚红 | 62% | 96% |

须弥面板只保留轻微青绿色温；芙宁娜的珊瑚只进入边框与状态；Hero 才允许更强的整屏主题。

## 六项验收

1. 中性：立绘裁切与底部垂直压暗可读。
2. 须弥：绿色集中在舞台、轻微表面色温、选中环和事件点。
3. 芙宁娜：390 x 844 下珊瑚保持局部强调，不覆盖整个月历。
4. 星铁：无地区映射时使用稳定的游戏级 profile。
5. 高密：7 列网格、日期位置、3 个头像加 `+N` 不跳动。
6. Hero：沉浸层显著更强，关闭后回到原日历状态。

## 验收问题

- 去掉光晕后，日期、今天、选中、生日和实装是否仍可辨识？
- 切换 profile 后是否仍是同一个日历产品？
- 须弥是否避免满屏荧光？
- 芙宁娜珊瑚是否保持局部？
- Hero 是否明显强于工作区？
- profile 切换是否没有移动网格、头像和控件？

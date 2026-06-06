# 🎮 米哈游角色生日日历

追踪米哈游游戏角色的生日日历应用。支持原神、崩坏：星穹铁道、绝区零等游戏。

## ✨ 功能特性

- 📅 **日历视图**：支持月视图和周视图切换
- 🎨 **角色展示**：在日历中显示角色头像，点击可查看详情
- 🎮 **多游戏支持**：支持原神、星穹铁道、绝区零等米哈游游戏
- 🔄 **数据同步**：支持手动更新角色数据
- 📱 **响应式设计**：适配桌面和移动设备
- 💾 **本地存储**：角色数据存储在本地，无需后端服务器

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 部署到 GitHub Pages

```bash
npm run deploy
```

## 🗂️ 项目结构

```
mihoyo-calendar/
├── .github/workflows/       # GitHub Actions 自动同步配置
├── scripts/
│   └── fetch-characters.js  # 角色数据获取脚本
├── public/data/
│   └── characters.json      # 角色数据缓存
├── src/
│   ├── components/
│   │   ├── Calendar/        # 日历组件
│   │   └── Header.tsx       # 头部导航
│   ├── hooks/
│   │   └── useCharacters.ts # 角色数据管理
│   ├── utils/
│   │   └── calendar.ts      # 日历工具函数
│   ├── types/
│   │   └── index.ts         # TypeScript 类型定义
│   ├── App.tsx              # 主应用组件
│   └── main.tsx             # 入口文件
└── package.json
```

## 📊 数据来源

角色数据来自以下渠道：

1. **手动维护**：项目内置了完整的角色数据库（191+ 角色）
2. **Wiki API**：支持从 Fandom Wiki 和 Bilibili BWIKI 自动获取更新
3. **手动添加**：可通过脚本或编辑 JSON 文件添加新角色

## 🔄 自动同步

项目配置了 GitHub Actions，每周日自动运行角色数据同步脚本：

- 文件：`.github/workflows/sync-characters.yml`
- 触发条件：每周日 00:00 UTC 或手动触发
- 功能：尝试从 Wiki API 获取最新角色数据并提交到仓库

## 🛠️ 技术栈

- **前端框架**：React 19 + TypeScript
- **构建工具**：Vite 8
- **日期处理**：date-fns
- **样式**：纯 CSS（无 UI 框架依赖）
- **部署**：GitHub Pages

## 📝 添加新角色

### 方式一：编辑 JSON 文件

直接编辑 `public/data/characters.json` 或 `src/data/characters.json`，添加如下格式的角色数据：

```json
{
  "id": "character-name-game",
  "name": "角色中文名",
  "nameEn": "Character Name",
  "game": "genshin",
  "birthday": "MM-DD",
  "rarity": 5,
  "element": "元素",
  "weapon": "武器类型",
  "region": "地区",
  "source": "manual",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 方式二：运行同步脚本

```bash
npm run fetch-characters
```

## 📄 许可证

MIT License

# 小红书封面生成器 - 开发与使用指南

## 环境要求
- Node.js ≥ 18（项目中已声明约束，见 package.json "engines"）
- NPM ≥ 10（推荐）
- 系统：Windows / macOS / Linux

可选：若使用 nvm 管理 Node 版本：
```
nvm install 18
nvm use 18
```

## 安装依赖
```
npm install
```

## 启动开发服务器
```
npm run dev
```
- 本地访问地址：http://localhost:8080
- 支持热更新（HMR）

## 构建与预览
- 构建产物：
```
npm run build
```
- 构建预览（本地静态服务）：
```
npm run preview
```

## 可选维护命令
- 更新 Browserslist 数据（消除“caniuse-lite 过期”提示）：
```
npx update-browserslist-db@latest
```

## 功能概览
- 模板选择：左侧「精选模板」支持多风格底图与默认文案
- 文本编辑：标题 / 高亮关键词 / 正文 / 标签文字，常用标签一键填充
- 主题与背景：多套主题色可选，支持拾色器精细调色
- Emoji 素材：支持添加、拖拽定位、删除
- 实时预览：中间画布 360x480 比例展示
- 一键导出：导出 1080x1440 PNG 图片
  - 已加入 Toast 提示导出状态
  - 处理了跨域图片的导出稳定性（crossOrigin、referrerPolicy）
- 本地持久化：自动保存/恢复编辑状态（localStorage）

## 目录结构
- 入口与挂载： [index.html](index.html:12) / [index.html](index.html:13)
- 应用根： [ReactDOM.createRoot()](src/main.jsx:5) 载入 [App](src/App.jsx:9)
- 路由表： [navItems](src/nav-items.jsx:7) 配置 “/” -> [Index](src/pages/Index.jsx:9)
- 关键组件：
  - 模板面板： [TemplatePanel](src/components/TemplatePanel.jsx:3)
  - 文本编辑： [TextEditor](src/components/TextEditor.jsx:3)
  - 颜色面板： [ColorPanel](src/components/ColorPanel.jsx:4)
  - 预览画布： [PreviewCanvas](src/components/PreviewCanvas.jsx:6)
  - 导出按钮： [ExportButton](src/components/ExportButton.jsx:5)
  - Toast 容器： [Toaster](src/components/ui/sonner.jsx:4)

## 常见问题
- 终端提示 Browserslist 数据过期：执行上文“更新 Browserslist 数据”命令即可
- 导出图片空白或失败：
  - 项目已设置跨域图片策略；若网络异常导致加载失败，导出仍会继续
  - 建议尽量使用可跨域访问的图片源

## 版本约束
- Node 版本：见 [.nvmrc](.nvmrc:1) 与 [package.json.engines](package.json:6)
- Vite 5 要求 Node ≥ 18，请勿使用 Node 16

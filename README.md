# Cyrus Lo — Portfolio (React + Vite)

这是一份将旧版静态作品集（HTML / Bootstrap）重构为 **Vite + React + TypeScript + Tailwind CSS + Framer Motion** 的现代化项目。

- 路由：`react-router-dom` + **HashRouter**（适配 GitHub Pages 刷新不 404）
- 视觉风格：黑/深灰为主（极简、神秘、高级感），细线条分割与低调冷灰高光
- 动效：页面切换过渡、滚动入场动画、卡片 3D hover 视差
- 旧子项目保留：`/waroftank`、`/VenmoSplit`、`/webGLshading`
  - 其中 `webGLshading` 已改造为“Tech Demo”风格 UI，但底层 WebGL/Shader 逻辑保持不变


## 1) 本地启动

```bash
cd cyrus-portfolio
npm install
npm run dev
```

访问：终端输出的本地地址（通常是 `http://localhost:5173/`）。


## 2) 目录结构（关键部分）

- `src/pages/*`：Home / About / Projects / Contact 页面
- `src/components/*`：Navbar、背景、滚动 Reveal、项目卡片等组件
- `src/content/portfolio.ts`：从旧站点抽取的文案/项目/技能/时间轴（后续更新内容只需要改这里）
- `public/assets/Resume.pdf`：简历 PDF（从旧站复制）
- `public/webGLshading` / `public/waroftank` / `public/VenmoSplit`：旧版子项目（静态资源）


## 3) Contact 表单（EmailJS）

Contact 页面已接入 `@emailjs/browser`，但为了避免把密钥写进仓库，默认不会配置。

在项目根目录创建：`.env.local`

```bash
VITE_EMAILJS_SERVICE_ID=...
VITE_EMAILJS_TEMPLATE_ID=...
VITE_EMAILJS_PUBLIC_KEY=...
```

模板变量（可在 EmailJS 控制台配置）：
- `from_name`
- `reply_to`
- `message`


## 4) GitHub Pages 部署

### 方式 A：使用 gh-pages（已内置脚本）

```bash
npm run deploy
```

该命令会：
1. `npm run build` 产出 `dist/`
2. 使用 `gh-pages -d dist` 推送到 `gh-pages` 分支

> 如果你启用了自定义域名（比如旧站点的 `cyruslo.co`），`public/CNAME` 会自动被带到 `dist/`，从而在 GitHub Pages 上生效。

### base 路径说明（重要）

本项目按需求将 `vite.config.ts` 的 `base` 设置为 `/`：
- **适合自定义域名**（例如 `https://cyruslo.co/`）

如果你的站点是 “repo pages”（例如 `https://<user>.github.io/<repo>/`），通常需要：
- 将 `vite.config.ts` 的 `base` 改为 `/<repo>/`


## 5) 子项目访问路径

- `/#/`：主站（React）
- `/waroftank/index.html`：Unity WebGL 游戏
- `/VenmoSplit/index.html`：VenmoSplit 工具
- `/webGLshading/index.html`：WebGL Real-time Shading Demo（Tech Demo 风格 UI）


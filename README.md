# 中建科工 · 场景化产教融合平台

基于 Vite + React 19 + TypeScript 的场景化产教融合平台前端。业务数据保存在浏览器 localStorage，无需后端服务即可运行。

## 开发

```bash
npm install
npm run dev
```

生产构建与预览：

```bash
npm run build
npm run preview
```

类型检查与代码检查：

```bash
npm run typecheck
npm run lint
```

Node 版本要求 `>= 20.19`。

## AI 助手

页面底部悬浮的“科工产业副驾”使用用户自填的 OpenAI 兼容 API Key：

- 助手以独立自定义元素挂载在 `body`，内部是独立 React root，不进入业务 React 树；所有页面（包括登录页）都会显示。
- 点击底部的“未配置 · 填写 API Key”，或展开面板后点击齿轮图标。
- 默认服务为 DeepSeek：`https://api.deepseek.com` + `deepseek-flash`，可改为其他 OpenAI 兼容服务。
- Key 仅保存在当前浏览器的 localStorage，不经过平台服务器，直接发送至所填模型服务。
- 服务商需允许浏览器跨域调用（CORS）。DeepSeek 已验证支持。
- 点击“保存并连接”后配置才会生效；修改未保存时发送任务会提示先保存。
- 点击“清除”会删除本机配置并停用助手。

页面内容发送给模型前会进行手机号、邮箱、证件号、密钥等敏感信息脱敏；提交审核、发布、确权等高风险操作不会被自动点击。

## 内容说明

- 企业概况、业务体系、工程案例与政策信息基于中建科工官网及公开报道整理，页面内附官方来源链接。
- 岗位、场景、课程、测评、项目、招聘与薪酬数据为演示内容，用于展示产品能力，不代表企业真实岗位设置或薪酬口径。

## 路由

使用 BrowserRouter，路径统一挂载在 `/platform/*` 下。当前按域名根目录部署；部署到静态服务器时，需要把未知路径回落到 `index.html`。

Nginx 示例：

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

如果部署到子路径（例如 `/zjkg/`），需要同时调整 Vite `base`、Router `basename` 以及 public 资源地址，不能只改 Nginx。

## 目录

```text
index.html
vite.config.ts
src/
  main.tsx                 React 入口
  App.tsx                  路由与全局挂载
  pages/platform-page.tsx  平台页面入口
  components/router/       Link / Image / 滚动管理适配
  components/enterprise/   业务组件
  lib/                     状态、数据、AI 配置与运行时
  styles/                  全局与平台样式
public/                    品牌与资源图片
```

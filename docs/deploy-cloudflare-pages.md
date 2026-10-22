# 部署到 Cloudflare Pages（blog.080124.xyz）

本站是**纯静态**站点，`pnpm build` 产出 `dist/` 目录（当前约 17.8 MB / 256 个文件，主要在 Live2D 模型）。

> ⚠️ **不要**设 `CF_WORKERS` 环境变量。
> `astro.config.mjs` 里只有检测到 `CF_WORKERS` 时才会挂 `@astrojs/cloudflare` 适配器（输出 Worker）。
> Pages 走静态托管，设了反而会构建错。

---

## 当前实际部署方式：直传（Direct Upload）

线上状态（2026-10-22 完成）：

| 项目 | 值 |
|---|---|
| Cloudflare 账号 | `3535839213@qq.com's Account`（`8d12a7bc65d00e98dfc86fb4063547b1`） |
| Pages 项目名 | `firefly` |
| 项目默认域名 | `https://firefly-988.pages.dev` |
| 自定义域名 | `https://blog.080124.xyz`（已 active，Google Trust Services 证书） |
| 生产分支名 | `master` |
| DNS 托管 | Spaceship（`launch1/launch2.spaceship.net`） |
| DNS 记录 | `blog` **CNAME** → `firefly-988.pages.dev` |

### 更新上线（改完文章后跑这一条）

```bash
pnpm deploy
```

等价于：

```bash
pnpm build
wrangler pages deploy dist --project-name firefly --branch master
```

首次在别的机器上用之前，先 `wrangler login` 走一次 OAuth 授权。

### 看看线上

- 站点：<https://blog.080124.xyz>
- Pages 后台：<https://dash.cloudflare.com/8d12a7bc65d00e98dfc86fb4063547b1/pages/view/firefly>

---

## 为什么不是 Git 自动部署？

本来打算用 Pages 的 Git 集成（`git push` 后自动构建）。卡住的原因很具体：

- Cloudflare 的 Pages Git 集成必须先装它的 **GitHub App**，安装入口在 `github.com`
- 这台机器的网络访问 `github.com:443` 会超时（`api.github.com` 正常，`git push` 时好时坏）
- 没装 App 时调 API 建 Git 项目会返回：`There is an internal issue with your Cloudflare Pages Git installation`

**想开自动部署，两条路二选一：**

**A. 走 Git 集成（推荐，最省心）**
1. 能打开 `github.com` 的网络环境下，访问 <https://github.com/apps/cloudflare-pages/installations/new>
2. 选 `QUITERO/Firefly789` 安装授权
3. 回 Cloudflare 后台删掉 `firefly` 项目，重新用「连接到 Git」建一次
   - 构建命令 `pnpm build`，输出目录 `dist`
   - 环境变量 `NODE_VERSION=22`、`PNPM_VERSION=11.22.0`
4. 之后每次 `git push` 到 `master` 自动构建发布

**B. 走 GitHub Actions + wrangler（直传项目也能用）**
1. Cloudflare 后台建一个 API Token，权限：`Account › Cloudflare Pages › Edit`
2. GitHub 仓库 `Settings → Secrets and variables → Actions` 加两个 secret：
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID` = `8d12a7bc65d00e98dfc86fb4063547b1`
3. 加一个 workflow，跑 `pnpm build` + `wrangler pages deploy dist --project-name firefly --branch master`
4. ⚠️ 注意：仓库自带的 `.github/workflows/deploy.yml` 是给 **GitHub Pages** 用的，别直接用

---

## 排错

| 现象 | 原因 / 处理 |
|---|---|
| 构建报字体下载失败 | `fontConfig.ts` 里字体必须是 `provider: "local"`，字体文件在 `public/assets/fonts/`（CDN 在国内会挂） |
| 页面 500 且提示 `ImageNotFound` | `.astro` 缓存引用了已删除的图片，删掉 `D:\Blog\.astro` 重启 |
| 自定义域名一直 pending | 确认 CNAME 指向 `firefly-988.pages.dev`（不是 `firefly.pages.dev`，CF 建项目时自动加了后缀） |
| 改了文章线上没变 | 直传项目不会跟 push 联动，要手动跑 `pnpm deploy` |
| Live2D 模型没加载 | 别关 `pioConfig.live2dWidgetConfig.enable`，构建脚本 `prune-pio-assets.ts` 会在关闭时裁掉模型文件 |

## 变更记录

| 日期 | 事项 |
|---|---|
| 2026-10-22 | 创建 Pages 项目 `firefly`，直传上线 `firefly-988.pages.dev` |
| 2026-10-22 | 绑定 `blog.080124.xyz`，Spaceship 加 CNAME，证书签发完成 |

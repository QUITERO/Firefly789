# 部署到 Cloudflare Pages（blog.080124.xyz）

本站是**纯静态**站点，`pnpm build` 产出 `dist/` 目录。Cloudflare Pages 免费额度对个人博客远远够用。

> ⚠️ 注意：**不要**设 `CF_WORKERS` 环境变量。
> `astro.config.mjs` 里只有检测到 `CF_WORKERS` 时才会挂 `@astrojs/cloudflare` 适配器（输出 Worker）。
> Pages 走静态托管，设了反而会构建错。

---

## 一、在 Cloudflare 建 Pages 项目

1. 打开 <https://dash.cloudflare.com> 注册/登录（邮箱注册即可，免费）
2. 左侧菜单 **Workers 和 Pages** → **创建** → **Pages** 标签页 → **连接到 Git**
3. 授权 GitHub，选中仓库 **`QUITERO/Firefly789`** → **开始设置**
4. 构建配置按下表填：

   | 配置项 | 填什么 |
   |---|---|
   | 项目名称 | `terminal-0x7f`（决定 `<项目名>.pages.dev`，可自定） |
   | 生产分支 | **`master`**（本仓库默认分支是 master，不是 main！） |
   | 框架预设 | `Astro`（没识别出来就选 `None`） |
   | 构建命令 | **`pnpm build`** |
   | 构建输出目录 | **`dist`** |
   | 根目录 | 留空 |

5. 展开 **环境变量**，添加：

   | 变量名 | 值 |
   |---|---|
   | `NODE_VERSION` | `22` |
   | `PNPM_VERSION` | `11.22.0`（可选，保险用；仓库 package.json 已声明 packageManager） |

6. 点 **保存并部署**，等 3～5 分钟。完成后会拿到 `https://<项目名>.pages.dev`。

### 为什么构建命令必须是 `pnpm build`

`pnpm build` 除了 `astro build`，还会依次跑：
图片 LQIP 占位生成 → GitHub 卡片缓存 → Astro 构建 → 清理看板娘资源 → 字体子集化 → 内联脚本压缩 → **Pagefind 全文搜索索引**。

如果只用默认的 `astro build`，站点能打开，但**搜索功能是坏的**（`dist/pagefind` 不存在）。

### 为什么必须用 pnpm

`package.json` 里有 `"preinstall": "npx only-allow pnpm"`，用 npm / yarn 安装会直接报错退出。

---

## 二、绑定 blog.080124.xyz

域名在 **Spaceship** 买的，DNS 也托管在 Spaceship，所以不用改 NS，加一条 CNAME 就行。

### 第一步：在 Pages 里加自定义域

项目 → **自定义域** → **设置自定义域** → 填 `blog.080124.xyz` → 继续。
它会提示你去域名商加记录，先别关这个页面。

### 第二步：在 Spaceship 加 DNS 记录

登录 Spaceship → **Launchpad** → 你的域名 `080124.xyz` → **Manage** → **DNS / Nameservers** → **Advanced DNS**，添加：

| 类型 | 主机 / Name | 值 / Target | TTL |
|---|---|---|---|
| `CNAME` | `blog` | `<你的项目名>.pages.dev` | 自动 / 30 min |

⚠️ 值里**不要**带 `https://`，也**不要**带结尾的 `/`。

### 第三步：等证书

回到 Cloudflare Pages 自定义域页面点 **检查 DNS 记录** / 等待。CNAME 生效后 Cloudflare 会自动签发 SSL 证书，一般 1～10 分钟（偶尔要几十分钟）。状态变成 **Active** 之后就能 `https://blog.080124.xyz` 访问了。

---

## 三、之后的日常发布流程

```bash
# 1. 写文章
pnpm new-post 文章文件名
#    然后编辑 src/content/posts/文章文件名.md

# 2. 本地预览
pnpm dev            # → http://localhost:4321

# 3. 推上去
git add .
git commit -m "新增文章：xxx"
git push
```

推送后 Cloudflare 检测到 `master` 有新提交会自动重新构建，约 3 分钟线上生效。**不需要动服务器。**

---

## 四、构建失败怎么排查

把构建日志里的报错整段贴出来看，九成是这三类：

| 现象 | 原因 | 解决 |
|---|---|---|
| `only-allow pnpm` 报错 | 用了 npm/yarn | 构建命令确认是 `pnpm build`；删掉 `package-lock.json` / `yarn.lock` 后重试 |
| `Node.js version ... is not supported` | Node 版本太低 | 环境变量加 `NODE_VERSION=22` |
| 线上搜索框搜不出东西 | 构建命令没跑 Pagefind | 构建命令改回 `pnpm build` |
| `CannotFetchFontFile` | 字体从 cdn.jsdelivr.net 拉取失败 | 本仓库已改为本地字体文件（`public/assets/fonts/`），不该再出现；若出现说明 fontConfig 被改回了 `fontsource` |
| 图片 404 | 引用了不存在的图片 | 检查 frontmatter 里 `image:` 的相对路径 |

---

## 五、与本仓库相关的几处自定义改动

| 文件 | 改了什么 |
|---|---|
| `src/config/siteConfig.ts` | 标题/副标题/站点 URL/描述/关键词/默认暗色/`siteStartDate`；留言板关闭（`guestbook: false`） |
| `src/config/profileConfig.ts` | 昵称 Otaku、签名、GitHub 与邮箱链接 |
| `src/config/fontConfig.ts` | 三个字体从 `fontsource` 在线源改为**本地文件**，规避 cdn.jsdelivr.net 不可达 |
| `src/config/friendsConfig.ts` | 清空模板自带友链 |
| `src/content/spec/about.md` | 重写「关于我」 |
| `src/content/spec/friends.mdx` | 友链页本站信息改为自己的 |
| `src/content/posts/` | 删除全部模板演示文章，仅保留 `hello-world.md` |
| `public/assets/fonts/` | 新增 11 个 woff2 字体文件 |
| `public/assets/images/avatar.avif` | 头像副本（供友链页外链引用） |

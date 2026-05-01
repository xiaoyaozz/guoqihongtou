# 快速部署指南

## 最简单的方式：Git自动部署（推荐）

### 1. 准备代码仓库

```bash
# 如果还没有Git仓库，初始化一个
git init
git add .
git commit -m "Initial commit"
```

推送到GitHub/GitLab。

### 2. 在Cloudflare创建项目

1. 访问 https://dash.cloudflare.com
2. 进入 Workers & Pages → Create application → Pages
3. 选择 "Connect to Git"
4. 选择刚才的仓库
5. 配置：
   - 项目名称：guoqi-meeting-minutes（或其他你喜欢的）
   - 构建命令：`npm run build`
   - 构建输出目录：`.next`
   - Node.js版本：20

### 3. 配置D1数据库

**在部署前先在本地创建数据库：**

```bash
# 登录
npx wrangler login

# 创建数据库
npx wrangler d1 create guoqi-meeting-db

# 复制输出的 database_id
```

**更新配置文件：**

编辑 `wrangler.toml` 和 `cloudflare.toml`，填入刚才的 database_id。

**执行迁移：**

```bash
npx wrangler d1 execute guoqi-meeting-db --file=./migrations/0001_init.sql --remote
```

### 4. 配置环境变量

在Cloudflare Pages项目设置 → Environment variables中添加：

```
JWT_SECRET=生成一个长随机字符串（至少32位）
```

### 5. 部署！

在Cloudflare Pages中点击 "Save and Deploy"

等待几分钟，你的应用就上线了！

## 测试部署

部署完成后，访问提供的URL，测试：

1. ✓ 首页加载正常
2. ✓ 注册功能正常
3. ✓ 登录功能正常  
4. ✓ 生成会议纪要
5. ✓ 导出Word文档

## 下一步

- 设置自定义域名
- 配置支付宝（如需要）
- 监控使用情况
- 配置备份策略

## 需要帮助？

查看完整的 `DEPLOYMENT.md` 文件获取更详细的说明。

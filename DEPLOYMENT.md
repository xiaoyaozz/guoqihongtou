# 部署到Cloudflare Pages

## 前置要求

1. 已注册Cloudflare账号（免费版即可）
2. 已安装wrangler CLI
3. 已安装Node.js 20+

## 部署步骤

### 第一步：登录Cloudflare

```bash
npx wrangler login
```

### 第二步：创建D1数据库

```bash
# 创建数据库
npx wrangler d1 create guoqi-meeting-db

# 查看数据库信息，复制database_id
npx wrangler d1 list
```

### 第三步：更新配置文件

编辑 `wrangler.toml` 和 `cloudflare.toml`，填入刚才的 `database_id`：

```toml
# wrangler.toml
[[d1_databases]]
binding = "DB"
database_name = "guoqi-meeting-db"
database_id = "你的database_id"
```

### 第四步：执行数据库迁移

```bash
# 本地执行迁移
npx wrangler d1 execute guoqi-meeting-db --file=./migrations/0001_init.sql

# 或者远程执行
npx wrangler d1 execute guoqi-meeting-db --file=./migrations/0001_init.sql --remote
```

### 第五步：配置环境变量

1. 访问 Cloudflare Dashboard
2. 进入 Workers & Pages
3. 创建 Pages 项目或选择现有项目
4. 设置 > Environment variables
5. 添加以下变量：

```
JWT_SECRET=你的随机密钥（至少32位）
ALIPAY_APP_ID=你的支付宝应用ID（可选）
ALIPAY_PRIVATE_KEY=你的支付宝私钥（可选）
ALIPAY_PUBLIC_KEY=支付宝公钥（可选）
ALIPAY_GATEWAY=https://openapi.alipay.com/gateway.do（可选）
```

### 第六步：构建项目

```bash
npm run build
```

### 第七步：部署

#### 方式A：使用Git自动部署（推荐）

1. 将代码推送到GitHub/GitLab
2. 在Cloudflare Pages中连接你的仓库
3. 配置构建命令：`npm run build`
4. 配置构建输出目录：`.next`
5. 保存并部署

#### 方式B：使用wrangler直接部署

```bash
npm run pages:deploy
```

## 验证部署

部署完成后，访问Cloudflare提供的URL进行测试：

1. 测试注册功能
2. 测试登录功能
3. 测试生成会议纪要
4. 测试导出Word文档

## 支付宝配置（可选）

如果需要使用支付宝支付功能：

1. 在支付宝开放平台创建应用
2. 获取应用ID和密钥
3. 在Cloudflare Pages环境变量中配置
4. 配置支付宝回调地址

## 故障排查

### 数据库连接问题

确保：
- D1数据库已创建
- database_id已正确配置
- 迁移脚本已执行

### 环境变量问题

确保：
- 所有必需的环境变量已设置
- 在Cloudflare Pages设置中配置了变量
- 重新部署使变量生效

### 构建失败

检查：
- Node.js版本是否兼容（需要20+）
- 依赖是否正确安装
- 本地是否可以正常构建

## 生产环境建议

1. 设置自定义域名
2. 配置SSL证书（Cloudflare自动提供）
3. 设置访问策略
4. 配置监控和日志
5. 定期备份数据库

## 本地预览部署（可选）

使用wrangler在本地模拟Cloudflare Pages环境：

```bash
npm run pages:dev
```

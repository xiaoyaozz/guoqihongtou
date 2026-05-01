# 国企红头会议纪要生成器

一个完整的全栈Web应用，用于快速生成标准的国企红头会议纪要。

## 技术栈

- Next.js 14 (App Router)
- Tailwind CSS
- Cloudflare D1 (数据库)
- Cloudflare Pages (部署)
- 支付宝当面付 (支付集成)

## 功能特性

### 用户系统
- 邮箱注册 + 图形验证码
- 邮箱登录 + JWT认证
- 密码bcrypt加密存储
- 每日IP注册限制

### 会员系统
- 免费用户：每日3次生成，1次Word导出
- 月卡会员：¥19.9/月，无限生成+无限导出
- 终身会员：¥199，永久无限

### 核心功能
- 支持党委、行政、项目例会三种会议类型
- 自动生成标准国企红头格式
- 一键导出Word文档
- 支持复制内容
- 不存储会议内容，保护机密

### 管理员后台
- 用户管理
- 订单管理
- 数据统计
- 手动修改会员状态

### 安全防护
- API请求频率限制
- XSS/CSRF防护
- 数据库防注入
- 同一设备限制多账号

## 本地开发

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
复制`.env.example`为`.env.local`并填写配置：
```bash
cp .env.example .env.local
```

### 3. 创建Cloudflare D1数据库
```bash
# 安装wrangler CLI
npm install -g wrangler

# 登录Cloudflare
wrangler login

# 创建数据库
wrangler d1 create guoqi-meeting-db
```

将返回的database_id更新到`wrangler.toml`和`cloudflare.toml`。

### 4. 执行数据库迁移
```bash
wrangler d1 execute guoqi-meeting-db --file=./migrations/0001_init.sql
```

### 5. 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000

## 部署到Cloudflare Pages

### 1. 构建项目
```bash
npm run build
```

### 2. 创建Pages项目
在Cloudflare Dashboard创建Pages项目，选择上传方式。

### 3. 配置环境变量
在Pages项目设置中配置所有环境变量：
- JWT_SECRET
- ALIPAY_APP_ID
- ALIPAY_PRIVATE_KEY
- ALIPAY_PUBLIC_KEY
- ALIPAY_GATEWAY

### 4. 绑定D1数据库
在Pages项目设置中绑定之前创建的D1数据库，绑定名称为`DB`。

### 5. 上传部署
将`.next`目录或整个项目上传部署。

## 支付宝配置

### 沙箱环境（测试用）
1. 访问 https://open.alipay.com/platform/appDaily.htm
2. 创建沙箱应用
3. 获取APP_ID、应用私钥、支付宝公钥
4. 配置ALIPAY_GATEWAY为 https://openapi.alipaydev.com/gateway.do

### 正式环境
1. 创建正式应用
2. 签约当面付产品
3. 配置密钥
4. ALIPAY_GATEWAY改为 https://openapi.alipay.com/gateway.do

## 创建管理员账号

首次部署后，需要手动在数据库中创建管理员账号：
1. 先通过注册页面创建一个普通账号
2. 在D1数据库中执行：
```sql
UPDATE users SET is_admin = 1, is_verified = 1 WHERE email = 'your_email@example.com';
```

## 项目结构

```
.
├── app/                    # Next.js App Router
│   ├── api/               # API路由
│   │   ├── auth/          # 认证API
│   │   ├── payment/       # 支付API
│   │   ├── meeting/       # 会议纪要API
│   │   ├── admin/         # 管理员API
│   │   └── captcha/       # 验证码API
│   ├── admin/             # 管理后台页面
│   ├── generator/         # 生成器页面
│   ├── login/             # 登录页面
│   ├── register/          # 注册页面
│   ├── pricing/           # 会员套餐页面
│   ├── page.tsx           # 首页
│   ├── layout.tsx         # 根布局
│   └── globals.css        # 全局样式
├── lib/                   # 工具库
│   ├── db.ts             # 数据库操作
│   ├── jwt.ts            # JWT工具
│   ├── captcha.ts        # 验证码工具
│   ├── alipay.ts         # 支付宝工具
│   └── meetingGenerator.ts # 会议纪要生成
├── types/                 # 类型定义
├── migrations/            # 数据库迁移
├── wrangler.toml          # Cloudflare配置
├── cloudflare.toml        # Cloudflare Pages配置
└── package.json
```

## 注意事项

1. **不存储会议内容**：系统仅在内存中处理会议内容，不保存到数据库
2. **密钥安全**：所有密钥使用环境变量，前端不暴露
3. **频率限制**：API有频率限制，防止滥用
4. **支付宝回调**：确保回调地址可被支付宝服务器访问

## License

MIT

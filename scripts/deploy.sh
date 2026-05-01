#!/bin/bash
# Cloudflare部署脚本

set -e

echo "=========================================="
echo "国企红头会议纪要生成器 - Cloudflare部署"
echo "=========================================="
echo ""

# 检查wrangler
if ! command -v wrangler &> /dev/null; then
    echo "wrangler未安装，正在安装..."
    npm install -g wrangler
fi

# 登录检查
echo "检查Cloudflare登录状态..."
if ! wrangler whoami &> /dev/null; then
    echo "需要登录Cloudflare，请按提示操作"
    wrangler login
fi

echo ""
echo "步骤1：创建/检查D1数据库"
echo "----------------------------"

# 检查数据库是否存在
DB_EXISTS=$(wrangler d1 list 2>/dev/null | grep -q "guoqi-meeting-db" && echo "yes" || echo "no")

if [ "$DB_EXISTS" = "no" ]; then
    echo "创建数据库 guoqi-meeting-db..."
    wrangler d1 create guoqi-meeting-db
else
    echo "数据库 guoqi-meeting-db 已存在"
fi

# 获取数据库ID
DB_ID=$(wrangler d1 list --json 2>/dev/null | grep -A5 "guoqi-meeting-db" | grep "uuid" | cut -d'"' -f4)
echo "数据库ID: $DB_ID"

echo ""
echo "步骤2：更新配置文件"
echo "------------------------"

# 更新wrangler.toml
if [ -n "$DB_ID" ]; then
    sed -i.bak "s/database_id = \"\"/database_id = \"$DB_ID\"/" wrangler.toml
    sed -i.bak "s/database_id = \"\"/database_id = \"$DB_ID\"/" cloudflare.toml
    rm -f *.bak
    echo "已更新配置文件"
else
    echo "警告：无法获取数据库ID，请手动配置"
fi

echo ""
echo "步骤3：执行数据库迁移"
echo "------------------------"

wrangler d1 execute guoqi-meeting-db --file=./migrations/0001_init.sql --remote

echo ""
echo "步骤4：构建项目"
echo "------------------"

npm run build

echo ""
echo "=========================================="
echo "部署前准备完成！"
echo "=========================================="
echo ""
echo "下一步操作："
echo "1. 访问 Cloudflare Dashboard: https://dash.cloudflare.com"
echo "2. 创建新的 Pages 项目"
echo "3. 连接您的 Git 仓库"
echo "4. 配置构建命令: npm run build"
echo "5. 配置构建输出目录: .next"
echo "6. 添加环境变量（参考.env.example）"
echo "7. 部署！"
echo ""
echo "或者直接运行: npm run pages:deploy"
echo ""

#!/bin/bash
set -e  # 遇到错误立即退出

# ===== 配置区 =====
PROJECT_DIR="/var/www/blog"
ENV_FILE="/etc/secrets/blog.env"
# =================

echo "=== 开始部署: $(date '+%Y-%m-%d %H:%M:%S') ==="

# 进入项目目录
cd $PROJECT_DIR

# 链接环境变量
ln -sf $ENV_FILE .env.production

# 更新代码
git fetch --all
git reset --hard origin/main

# 安装依赖
npm install --production

# 构建项目
npm run build

# 重启应用
pm2 restart next-blog --update-env

# 记录部署信息
COMMIT_HASH=$(git rev-parse --short HEAD)
echo "✅ 部署成功: $(date '+%Y-%m-%d %H:%M:%S')"
echo "🔄 当前版本: $COMMIT_HASH"
echo "🌐 访问地址: https://hdajun.me"
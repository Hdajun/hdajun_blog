#!/bin/bash
set -e

echo "🚀 开始部署: $(date)"

cd /var/www/next-blog

# 确保使用正确的Node版本
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20

# 链接环境变量
ln -sf /etc/secrets/blog.env .env.production

# 更新代码
git fetch --all
git reset --hard origin/main

# 安装所有依赖（包括devDependencies）
npm install

# 构建项目
npm run build

# 重启应用
pm2 restart next-blog

echo "✅ 部署成功! 版本: $(git rev-parse --short HEAD)"
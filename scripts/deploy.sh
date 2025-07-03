#!/bin/bash
set -e

echo "🚀 开始部署: $(date)"

cd /var/www/blog

# 确保使用正确的Node版本
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 安装并使用指定版本的 Node.js
nvm use 20.19.3

# 验证 Node.js 版本
node_version=$(node -v)
echo "当前 Node.js 版本: $node_version"

# 清理旧的构建缓存和模块
echo "清理旧的构建文件..."
rm -rf .next
rm -rf node_modules

# 链接环境变量
echo "配置环境变量..."
ln -sf /etc/secrets/blog.env .env.production

# 更新代码
echo "更新代码..."
git fetch --all
git reset --hard origin/main

# 使用 --legacy-peer-deps 安装依赖，避免版本冲突
echo "安装依赖..."
npm install --legacy-peer-deps

# 构建项目
echo "开始构建..."
npm run build

# 重启应用
echo "重启应用..."
pm2 restart next-blog

echo "✅ 部署成功! 版本: $(git rev-parse --short HEAD)"
echo "完成时间: $(date)"
#!/bin/bash

# 启用错误追踪和输出
set -e
set -x

# 记录部署开始时间和目录
echo "🚀 开始部署: $(date)"
echo "当前目录: $(pwd)"

# 进入项目目录
cd /var/www/blog

# 设置 Node 环境
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20.19.3

# 输出环境信息
echo "Node 版本: $(node -v)"
echo "NPM 版本: $(npm -v)"

# 拉取最新代码
echo "拉取最新代码..."
git fetch --all
git reset --hard origin/main

# 安装依赖
echo "安装依赖..."
npm install --legacy-peer-deps

# 确保环境变量文件存在
echo "检查环境变量..."
if [ -f "/etc/secrets/blog.env" ]; then
    ln -sf /etc/secrets/blog.env .env.production
else
    echo "警告: 环境变量文件不存在"
    exit 1
fi

# 构建项目
echo "开始构建..."
npm run build

# 重启服务
echo "重启服务..."
pm2 restart blog || pm2 start npm --name "blog" -- start

# 输出部署信息
echo "✅ 部署完成!"
echo "部署版本: $(git rev-parse --short HEAD)"
echo "完成时间: $(date)"
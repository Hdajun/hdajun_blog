#!/bin/bash
set -e

# ===== 配置区 =====
PROJECT_DIR="/var/www/blog"
ENV_FILE="/etc/secrets/blog.env"
LOG_FILE="/var/log/blog-deploy.log"
BUILD_TIMEOUT=900  # 15分钟构建超时
# =================

# 记录开始时间
START_TIME=$(date +%s)
echo "=== 开始部署: $(date '+%Y-%m-%d %H:%M:%S') ===" | tee -a $LOG_FILE

# 确保使用Node 20
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20

# 进入项目目录
cd $PROJECT_DIR

# 链接环境变量
ln -sf $ENV_FILE .env.production

# 更新代码
echo ">> 拉取最新代码" | tee -a $LOG_FILE
git fetch --all
git reset --hard origin/main

# 安装依赖（使用ci命令加速）
echo ">> 安装依赖" | tee -a $LOG_FILE
npm ci --production

# 构建项目（增加超时保护）
echo ">> 构建项目" | tee -a $LOG_FILE
timeout $BUILD_TIMEOUT npm run build || {
  BUILD_EXIT_CODE=$?
  if [ $BUILD_EXIT_CODE -eq 124 ]; then
    echo "❌ 构建超时（超过 $BUILD_TIMEOUT 秒）" | tee -a $LOG_FILE
  else
    echo "❌ 构建失败，退出码: $BUILD_EXIT_CODE" | tee -a $LOG_FILE
  fi
  exit $BUILD_EXIT_CODE
}

# 重启应用
echo ">> 重启服务" | tee -a $LOG_FILE
pm2 restart next-blog

# 计算并显示耗时
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
echo "✅ 部署成功! 耗时: ${DURATION}秒" | tee -a $LOG_FILE
echo "🔄 当前版本: $(git rev-parse --short HEAD)" | tee -a $LOG_FILE
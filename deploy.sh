#!/bin/bash
# Profile 项目部署脚本
# 使用方法: ./deploy.sh [user@server]

set -e

# 配置
SERVER=${1:-"root@your-server-ip"}
REMOTE_PATH="/opt/nginx/html/profile"
LOCAL_DIST="./dist"

echo "🚀 开始部署 Profile 项目..."

# 1. 构建项目
echo "📦 构建项目..."
npm run build

# 2. 修复本地文件权限（确保所有文件可读）
echo "🔐 修复本地文件权限..."
chmod -R 755 ${LOCAL_DIST}
find ${LOCAL_DIST} -type f -exec chmod 644 {} \;

# 3. 上传文件到服务器
echo "📤 上传文件到服务器..."
rsync -avz --delete ${LOCAL_DIST}/ ${SERVER}:${REMOTE_PATH}/

# 4. 远程设置权限（双重保险）
echo "🔐 设置远程文件权限..."
ssh ${SERVER} "chmod -R 755 ${REMOTE_PATH} && find ${REMOTE_PATH} -type f -exec chmod 644 {} \;"

# 5. 重载 nginx
echo "🔄 重载 nginx..."
ssh ${SERVER} "docker exec nginx nginx -s reload"

echo "✅ 部署完成！"
echo "🌐 访问: https://linxianglive.cn"

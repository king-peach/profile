#!/bin/bash
# Profile 项目部署脚本
# 使用方法: 
#   ./deploy.sh [user@server]           - 完整部署（含构建）
#   ./deploy.sh --skip-build [user@server] - 跳过构建，直接上传
#   ./deploy.sh -s [user@server]        - 同上

set -e

# 解析参数
SKIP_BUILD=false
SERVER=""

for arg in "$@"; do
  case $arg in
    --skip-build|-s)
      SKIP_BUILD=true
      ;;
    *)
      if [ -z "$SERVER" ]; then
        SERVER="$arg"
      fi
      ;;
  esac
done

# 配置
SERVER=${SERVER:-"root@your-server-ip"}
REMOTE_PATH="/opt/nginx/html/profile"
LOCAL_DIST="./dist"

echo "🚀 开始部署 Profile 项目..."

# 1. 构建项目（可跳过）
if [ "$SKIP_BUILD" = true ]; then
  echo "⏭️  跳过构建步骤..."
  if [ ! -d "$LOCAL_DIST" ]; then
    echo "❌ 错误: dist 目录不存在，请先运行 npm run build"
    exit 1
  fi
else
  echo "📦 构建项目..."
  npm run build
fi

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

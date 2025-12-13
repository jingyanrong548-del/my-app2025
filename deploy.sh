#!/bin/bash

# App链接收集器部署脚本
# 使用方法：./deploy.sh

set -e

echo "🚀 开始部署流程..."

# 1. 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin main || git pull origin master || echo "⚠️  无法拉取，可能是首次推送"

# 2. 添加更改
echo "➕ 添加更改..."
git add .

# 3. 提交更改（如果有更改）
if [ -n "$(git status --porcelain)" ]; then
  echo "💾 提交更改..."
  read -p "请输入提交信息（直接回车使用默认信息）: " commit_msg
  commit_msg=${commit_msg:-"更新：App链接收集器"}
  git commit -m "$commit_msg"
else
  echo "ℹ️  没有需要提交的更改"
fi

# 4. 推送到GitHub
echo "📤 推送到GitHub..."
git push origin main || git push origin master

# 5. 部署到GitHub Pages
echo "🌐 部署到GitHub Pages..."
npm run deploy

echo "✅ 部署完成！"
echo "📝 请访问：https://你的用户名.github.io/my-app2025/"


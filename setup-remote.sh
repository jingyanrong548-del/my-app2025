#!/bin/bash

# 配置GitHub远程仓库脚本

echo "🔧 配置GitHub远程仓库"
echo ""
read -p "请输入你的GitHub用户名: " github_username
read -p "请输入仓库名（默认：my-app2025）: " repo_name
repo_name=${repo_name:-my-app2025}

remote_url="git@github.com:${github_username}/${repo_name}.git"

echo ""
echo "📝 将添加远程仓库：$remote_url"
read -p "确认添加？(y/n): " confirm

if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
  git remote add origin "$remote_url"
  echo "✅ 远程仓库已添加"
  echo ""
  echo "📤 现在可以执行推送："
  echo "   git push -u origin main"
  echo ""
  echo "或者使用部署脚本："
  echo "   ./deploy.sh"
else
  echo "❌ 已取消"
fi


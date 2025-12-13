# 部署指南

## 前置条件

1. 确保已在GitHub上创建了仓库（仓库名：my-app2025）
2. 确保已配置SSH密钥，可以无密码访问GitHub

## 首次部署配置

### 1. 配置远程仓库

```bash
# 替换为你的实际GitHub用户名和仓库名
git remote add origin git@github.com:你的用户名/my-app2025.git

# 验证配置
git remote -v
```

### 2. 推送到GitHub

```bash
# 推送到远程仓库
git push -u origin main

# 如果远程仓库使用master分支，使用：
# git push -u origin master
```

### 3. 启用GitHub Pages

1. 访问GitHub仓库页面
2. 进入 Settings → Pages
3. Source 选择：Deploy from a branch
4. Branch 选择：gh-pages，文件夹选择：/ (root)
5. 点击 Save

## 日常部署流程

按照以下顺序执行：

```bash
# 1. 进入目录
cd /Users/jingyanrong/Desktop/MyGitHubProjects/my-app2025

# 2. 拉取最新代码
git pull

# 3. 添加更改
git add .

# 4. 提交更改
git commit -m "你的提交信息"

# 5. 推送到GitHub
git push

# 6. 部署到GitHub Pages
npm run deploy
```

## 或者使用部署脚本

```bash
./deploy.sh
```

## 访问地址

部署成功后，访问地址为：
- `https://你的用户名.github.io/my-app2025/`

## 注意事项

1. 如果修改了仓库名，需要同步更新 `vite.config.js` 中的 `repositoryName`
2. 首次部署可能需要几分钟时间才能访问
3. 确保 `package.json` 中的 `gh-pages` 依赖已安装


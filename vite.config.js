import { defineConfig } from 'vite';

// GitHub Pages部署配置
// 如果仓库名是 my-app2025，则 base: '/my-app2025/'
// 如果部署到自定义域名根目录，则 base: '/'
const repositoryName = 'my-app2025'; // 请根据实际仓库名修改

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? `/${repositoryName}/` : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});


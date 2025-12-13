// GitHub仓库导入工具

/**
 * 从GitHub API获取用户的所有仓库
 * @param {string} username - GitHub用户名
 * @returns {Promise<Array>} 仓库列表
 */
export async function fetchGitHubRepos(username) {
  try {
    const repos = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(
        `https://api.github.com/users/${username}/repos?per_page=100&page=${page}&sort=updated`
      );

      if (!response.ok) {
        throw new Error(`GitHub API错误: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.length === 0) {
        hasMore = false;
      } else {
        repos.push(...data);
        page++;
        // GitHub API限制每页最多100个，如果返回少于100个说明没有更多了
        if (data.length < 100) {
          hasMore = false;
        }
      }
    }

    return repos;
  } catch (error) {
    console.error('获取GitHub仓库失败:', error);
    throw error;
  }
}

/**
 * 将GitHub仓库转换为链接数据
 * @param {Array} repos - 仓库列表
 * @param {string} username - GitHub用户名
 * @param {string} currentRepoName - 当前仓库名（排除）
 * @returns {Array} 链接数据数组
 */
export function convertReposToLinks(repos, username, currentRepoName = 'my-app2025') {
  return repos
    .filter(repo => {
      // 排除当前仓库和fork的仓库（可选）
      return repo.name !== currentRepoName && !repo.fork;
    })
    .map(repo => {
      // 优先使用homepage（自定义域名），否则尝试GitHub Pages链接，最后使用仓库链接
      let appUrl = repo.homepage;
      
      if (!appUrl) {
        // 尝试构建GitHub Pages链接：https://用户名.github.io/仓库名/
        appUrl = `https://${username}.github.io/${repo.name}/`;
      }
      
      // 如果homepage存在，使用homepage；否则使用GitHub Pages链接
      // 仓库代码链接作为最后备选（但通常我们想要的是应用界面）
      const finalUrl = repo.homepage || appUrl;
      
      return {
        title: repo.name,
        url: finalUrl,
        description: repo.description || `GitHub应用: ${repo.name}`,
        homepage: repo.homepage,
        githubPagesUrl: appUrl,
        repoUrl: repo.html_url, // 保留仓库链接作为参考
        stars: repo.stargazers_count,
        language: repo.language,
      };
    })
    .sort((a, b) => {
      // 按stars数量排序，然后按更新时间
      if (b.stars !== a.stars) {
        return b.stars - a.stars;
      }
      return 0;
    });
}

/**
 * 批量导入GitHub仓库链接
 * @param {string} username - GitHub用户名
 * @param {Function} addLinkCallback - 添加链接的回调函数
 * @returns {Promise<Object>} 导入结果
 */
export async function importGitHubRepos(username, addLinkCallback) {
  try {
    const repos = await fetchGitHubRepos(username);
    const links = convertReposToLinks(repos, username);
    
    let successCount = 0;
    let skipCount = 0;
    const errors = [];

    for (const linkData of links) {
      try {
        // 使用应用链接（GitHub Pages或homepage），而不是代码仓库链接
        const url = linkData.url; // 已经是处理后的应用链接
        
        // 构建描述
        let description = linkData.description;
        if (linkData.language) {
          description += ` | 语言: ${linkData.language}`;
        }
        if (linkData.stars > 0) {
          description += ` | ⭐ ${linkData.stars}`;
        }
        // 添加提示：这是应用链接
        if (linkData.homepage) {
          description += ' | 🌐 已部署';
        } else {
          description += ' | 📱 GitHub Pages';
        }

        addLinkCallback({
          title: linkData.title,
          url: url,
          description: description,
        });
        
        successCount++;
      } catch (error) {
        errors.push({ repo: linkData.title, error: error.message });
        skipCount++;
      }
    }

    return {
      success: true,
      total: links.length,
      imported: successCount,
      skipped: skipCount,
      errors: errors,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}


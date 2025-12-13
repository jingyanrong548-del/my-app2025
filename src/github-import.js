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
 * @param {string} currentRepoName - 当前仓库名（排除）
 * @returns {Array} 链接数据数组
 */
export function convertReposToLinks(repos, currentRepoName = 'my-app2025') {
  return repos
    .filter(repo => {
      // 排除当前仓库和fork的仓库（可选）
      return repo.name !== currentRepoName && !repo.fork;
    })
    .map(repo => ({
      title: repo.name,
      url: repo.html_url,
      description: repo.description || `GitHub仓库: ${repo.name}`,
      homepage: repo.homepage, // 如果有主页链接
      stars: repo.stargazers_count,
      language: repo.language,
    }))
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
    const links = convertReposToLinks(repos);
    
    let successCount = 0;
    let skipCount = 0;
    const errors = [];

    for (const linkData of links) {
      try {
        // 使用主页链接（如果有），否则使用仓库链接
        const url = linkData.homepage || linkData.url;
        
        // 构建描述
        let description = linkData.description;
        if (linkData.language) {
          description += ` | 语言: ${linkData.language}`;
        }
        if (linkData.stars > 0) {
          description += ` | ⭐ ${linkData.stars}`;
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


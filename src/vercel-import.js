// Vercel项目导入工具

/**
 * 从Vercel API获取用户的所有项目
 * @param {string} token - Vercel API Token
 * @returns {Promise<Array>} 项目列表
 */
export async function fetchVercelProjects(token) {
  try {
    const projects = [];
    let page = 0;
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(
        `https://api.vercel.com/v9/projects?limit=100&until=${page}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Vercel API Token无效或已过期');
        }
        throw new Error(`Vercel API错误: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.projects && data.projects.length > 0) {
        projects.push(...data.projects);
        // 如果有更多项目，继续获取
        if (data.pagination && data.pagination.hasNext) {
          page = data.pagination.next;
        } else {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }

    return projects;
  } catch (error) {
    console.error('获取Vercel项目失败:', error);
    throw error;
  }
}

/**
 * 将Vercel项目转换为链接数据
 * @param {Array} projects - 项目列表
 * @returns {Array} 链接数据数组
 */
export function convertProjectsToLinks(projects) {
  return projects
    .filter(project => {
      // 只包含有生产部署的项目
      return project.productionDeployment || project.latestDeployment;
    })
    .map(project => {
      // 优先使用自定义域名，否则使用vercel.app域名
      const deployment = project.productionDeployment || project.latestDeployment;
      let appUrl = '';
      
      if (project.alias && project.alias.length > 0) {
        // 使用自定义域名
        appUrl = `https://${project.alias[0]}`;
      } else if (deployment && deployment.url) {
        // 使用vercel.app域名
        appUrl = deployment.url;
      } else if (project.name) {
        // 回退到项目名称的vercel.app域名
        appUrl = `https://${project.name}.vercel.app`;
      }
      
      return {
        title: project.name,
        url: appUrl,
        description: project.framework 
          ? `Vercel应用: ${project.name} | 框架: ${project.framework}`
          : `Vercel应用: ${project.name}`,
        framework: project.framework,
        deploymentUrl: deployment?.url || '',
        createdAt: project.createdAt || new Date().toISOString(),
        updatedAt: project.updatedAt || new Date().toISOString(),
      };
    })
    .sort((a, b) => {
      // 按更新时间排序
      const dateA = new Date(a.updatedAt || 0);
      const dateB = new Date(b.updatedAt || 0);
      return dateB - dateA;
    });
}

/**
 * 批量导入Vercel项目链接
 * @param {string} token - Vercel API Token
 * @param {Function} addLinkCallback - 添加链接的回调函数
 * @returns {Promise<Object>} 导入结果
 */
export async function importVercelProjects(token, addLinkCallback) {
  try {
    const projects = await fetchVercelProjects(token);
    const links = convertProjectsToLinks(projects);
    
    let successCount = 0;
    let updatedCount = 0;
    const errors = [];

    for (const linkData of links) {
      try {
        // 使用更新时间生成版本号（格式：YYYY.MM.DD）
        const updateDate = new Date(linkData.updatedAt || Date.now());
        const version = `${updateDate.getFullYear()}.${String(updateDate.getMonth() + 1).padStart(2, '0')}.${String(updateDate.getDate()).padStart(2, '0')}`;
        
        addLinkCallback({
          title: linkData.title,
          url: linkData.url,
          description: linkData.description,
          version: version,
        });
        
        successCount++;
      } catch (error) {
        errors.push({ project: linkData.title, error: error.message });
      }
    }

    return {
      success: true,
      total: links.length,
      imported: successCount,
      updated: updatedCount,
      errors: errors,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}


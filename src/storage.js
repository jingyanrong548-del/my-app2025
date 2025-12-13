// localStorage数据管理模块

const STORAGE_KEY = 'app_links';

/**
 * 从localStorage获取所有链接
 * @returns {Array} 链接数组
 */
export function getLinks() {
  try {
    const linksJson = localStorage.getItem(STORAGE_KEY);
    return linksJson ? JSON.parse(linksJson) : [];
  } catch (error) {
    console.error('获取链接失败:', error);
    return [];
  }
}

/**
 * 保存链接到localStorage
 * @param {Array} links - 链接数组
 */
export function saveLinks(links) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
    return true;
  } catch (error) {
    console.error('保存链接失败:', error);
    return false;
  }
}

/**
 * 生成唯一ID
 * @returns {string} 唯一ID
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 根据ID获取链接
 * @param {string} id - 链接ID
 * @returns {Object|null} 链接对象或null
 */
export function getLinkById(id) {
  const links = getLinks();
  return links.find(link => link.id === id) || null;
}


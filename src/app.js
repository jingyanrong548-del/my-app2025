// 核心应用逻辑模块

import { getLinks, saveLinks, generateId } from './storage.js';

let links = [];
let editingLinkId = null;
let deletingLinkId = null;

/**
 * 初始化应用数据
 */
export function initApp() {
  links = getLinks();
  renderLinks();
}

/**
 * 添加链接
 * @param {Object} linkData - 链接数据 {title, url, description}
 */
export function addLink(linkData) {
  const newLink = {
    id: generateId(),
    title: linkData.title.trim(),
    url: linkData.url.trim(),
    description: linkData.description?.trim() || '',
    createdAt: new Date().toISOString(),
  };

  links.push(newLink);
  saveLinks(links);
  renderLinks();
  return newLink;
}

/**
 * 更新链接
 * @param {string} id - 链接ID
 * @param {Object} linkData - 更新的链接数据
 */
export function updateLink(id, linkData) {
  const index = links.findIndex(link => link.id === id);
  if (index !== -1) {
    links[index] = {
      ...links[index],
      title: linkData.title.trim(),
      url: linkData.url.trim(),
      description: linkData.description?.trim() || '',
    };
    saveLinks(links);
    renderLinks();
    return links[index];
  }
  return null;
}

/**
 * 删除链接
 * @param {string} id - 链接ID
 */
export function deleteLink(id) {
  links = links.filter(link => link.id !== id);
  saveLinks(links);
  renderLinks();
}

/**
 * 获取所有链接
 * @returns {Array} 链接数组
 */
export function getAllLinks() {
  return [...links];
}

/**
 * 批量添加链接
 * @param {Array} linksData - 链接数据数组
 * @returns {number} 成功添加的数量
 */
export function batchAddLinks(linksData) {
  let count = 0;
  linksData.forEach(linkData => {
    // 检查是否已存在相同URL的链接
    const exists = links.some(link => link.url === linkData.url.trim());
    if (!exists) {
      const newLink = {
        id: generateId(),
        title: linkData.title.trim(),
        url: linkData.url.trim(),
        description: linkData.description?.trim() || '',
        createdAt: new Date().toISOString(),
      };
      links.push(newLink);
      count++;
    }
  });
  if (count > 0) {
    saveLinks(links);
    renderLinks();
  }
  return count;
}

/**
 * 获取正在编辑的链接ID
 * @returns {string|null}
 */
export function getEditingLinkId() {
  return editingLinkId;
}

/**
 * 设置正在编辑的链接ID
 * @param {string|null} id
 */
export function setEditingLinkId(id) {
  editingLinkId = id;
}

/**
 * 获取正在删除的链接ID
 * @returns {string|null}
 */
export function getDeletingLinkId() {
  return deletingLinkId;
}

/**
 * 设置正在删除的链接ID
 * @param {string|null} id
 */
export function setDeletingLinkId(id) {
  deletingLinkId = id;
}

/**
 * 打开链接
 * @param {string} url - 链接URL
 */
export function openLink(url) {
  if (url) {
    // 确保URL有协议
    let fullUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      fullUrl = 'https://' + url;
    }
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  }
}

/**
 * 渲染链接列表
 */
export function renderLinks() {
  const linksGrid = document.getElementById('linksGrid');
  const emptyState = document.getElementById('emptyState');

  if (!linksGrid || !emptyState) return;

  // 清空现有内容
  linksGrid.innerHTML = '';

  if (links.length === 0) {
    linksGrid.style.display = 'none';
    emptyState.style.display = 'block';
  } else {
    linksGrid.style.display = 'grid';
    emptyState.style.display = 'none';

    links.forEach(link => {
      const card = createLinkCard(link);
      linksGrid.appendChild(card);
    });
  }
}

/**
 * 创建链接卡片元素
 * @param {Object} link - 链接对象
 * @returns {HTMLElement} 卡片元素
 */
function createLinkCard(link) {
  const card = document.createElement('div');
  card.className = 'link-card';
  card.setAttribute('data-id', link.id);

  // 提取域名作为图标占位符
  const domain = extractDomain(link.url);
  const initial = domain.charAt(0).toUpperCase();

  card.innerHTML = `
    <div class="card-icon">${initial}</div>
    <div class="card-content">
      <h3 class="card-title">${escapeHtml(link.title)}</h3>
      ${link.description ? `<p class="card-description">${escapeHtml(link.description)}</p>` : ''}
      <p class="card-url">${escapeHtml(domain)}</p>
    </div>
    <div class="card-actions">
      <button class="btn-icon btn-edit" data-id="${link.id}" aria-label="编辑" title="编辑">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      </button>
      <button class="btn-icon btn-delete" data-id="${link.id}" aria-label="删除" title="删除">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    </div>
  `;

  // 点击卡片打开链接
  const cardContent = card.querySelector('.card-content');
  cardContent.addEventListener('click', (e) => {
    if (!e.target.closest('.card-actions')) {
      openLink(link.url);
    }
  });

  // 编辑按钮
  const editBtn = card.querySelector('.btn-edit');
  editBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    setEditingLinkId(link.id);
    fillForm(link);
    showModal('linkModal');
  });

  // 删除按钮
  const deleteBtn = card.querySelector('.btn-delete');
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    setDeletingLinkId(link.id);
    showModal('deleteModal');
  });

  return card;
}

/**
 * 提取域名
 * @param {string} url - URL字符串
 * @returns {string} 域名
 */
function extractDomain(url) {
  try {
    let fullUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      fullUrl = 'https://' + url;
    }
    const urlObj = new URL(fullUrl);
    return urlObj.hostname.replace('www.', '');
  } catch (error) {
    return url;
  }
}

/**
 * HTML转义
 * @param {string} text - 原始文本
 * @returns {string} 转义后的文本
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 填充表单
 * @param {Object} link - 链接对象
 */
export function fillForm(link) {
  document.getElementById('linkId').value = link.id;
  document.getElementById('linkTitle').value = link.title;
  document.getElementById('linkUrl').value = link.url;
  document.getElementById('linkDescription').value = link.description || '';
  document.getElementById('modalTitle').textContent = '编辑链接';
}

/**
 * 清空表单
 */
export function clearForm() {
  document.getElementById('linkId').value = '';
  document.getElementById('linkTitle').value = '';
  document.getElementById('linkUrl').value = '';
  document.getElementById('linkDescription').value = '';
  document.getElementById('modalTitle').textContent = '添加链接';
  setEditingLinkId(null);
}

/**
 * 显示模态框
 * @param {string} modalId - 模态框ID
 */
export function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

/**
 * 隐藏模态框
 * @param {string} modalId - 模态框ID
 */
export function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}


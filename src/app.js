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
  // 为现有数据添加order字段（兼容性处理）
  let needsSave = false;
  links.forEach((link, index) => {
    if (typeof link.order === 'undefined') {
      link.order = index;
      needsSave = true;
    }
    if (typeof link.version === 'undefined') {
      link.version = '1.0.0';
      needsSave = true;
    }
  });
  if (needsSave) {
    saveLinks(links);
  }
  // 按order排序
  links.sort((a, b) => (a.order || 0) - (b.order || 0));
  renderLinks();
}

/**
 * 添加链接
 * @param {Object} linkData - 链接数据 {title, url, description}
 */
export function addLink(linkData) {
  const maxOrder = links.length > 0 ? Math.max(...links.map(l => l.order || 0)) : -1;
  const newLink = {
    id: generateId(),
    title: linkData.title.trim(),
    url: linkData.url.trim(),
    description: linkData.description?.trim() || '',
    createdAt: new Date().toISOString(),
    order: maxOrder + 1,
    version: linkData.version || '1.0.0',
    updatedAt: new Date().toISOString(),
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
      version: linkData.version || links[index].version || '1.0.0',
      updatedAt: new Date().toISOString(),
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
 * 批量添加或更新链接
 * @param {Array} linksData - 链接数据数组
 * @returns {Object} 结果统计 {added, updated, skipped}
 */
export function batchAddLinks(linksData) {
  let addedCount = 0;
  let updatedCount = 0;
  const maxOrder = links.length > 0 ? Math.max(...links.map(l => l.order || 0)) : -1;
  let currentOrder = maxOrder + 1;

  linksData.forEach(linkData => {
    const url = linkData.url.trim();
    // 检查是否已存在相同URL的链接
    const existingIndex = links.findIndex(link => link.url === url);
    
    if (existingIndex !== -1) {
      // 更新已存在的链接
      const existingLink = links[existingIndex];
      // 更新版本号
      const newVersion = linkData.version || incrementVersion(existingLink.version || '1.0.0');
      links[existingIndex] = {
        ...existingLink,
        title: linkData.title.trim(),
        description: linkData.description?.trim() || existingLink.description || '',
        version: newVersion,
        updatedAt: new Date().toISOString(),
      };
      updatedCount++;
    } else {
      // 添加新链接
      const newLink = {
        id: generateId(),
        title: linkData.title.trim(),
        url: url,
        description: linkData.description?.trim() || '',
        createdAt: new Date().toISOString(),
        order: currentOrder++,
        version: linkData.version || '1.0.0',
        updatedAt: new Date().toISOString(),
      };
      links.push(newLink);
      addedCount++;
    }
  });

  if (addedCount > 0 || updatedCount > 0) {
    saveLinks(links);
    renderLinks();
  }
  
  return { added: addedCount, updated: updatedCount, skipped: 0 };
}

/**
 * 递增版本号
 * @param {string} version - 当前版本号 (格式: major.minor.patch)
 * @returns {string} 新版本号
 */
function incrementVersion(version) {
  const parts = version.split('.').map(v => parseInt(v) || 0);
  // 增加patch版本号
  parts[2] = (parts[2] || 0) + 1;
  return parts.join('.');
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
 * 更新链接顺序
 * @param {string} draggedId - 被拖拽的链接ID
 * @param {string} targetId - 目标位置的链接ID
 */
export function updateLinkOrder(draggedId, targetId) {
  const draggedIndex = links.findIndex(link => link.id === draggedId);
  const targetIndex = links.findIndex(link => link.id === targetId);
  
  if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
    return;
  }

  // 移除被拖拽的元素
  const [draggedLink] = links.splice(draggedIndex, 1);
  // 插入到目标位置
  links.splice(targetIndex, 0, draggedLink);

  // 重新计算order
  links.forEach((link, index) => {
    link.order = index;
  });

  saveLinks(links);
  renderLinks();
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

    // 按order排序
    const sortedLinks = [...links].sort((a, b) => (a.order || 0) - (b.order || 0));
    
    sortedLinks.forEach(link => {
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
  // 不设置draggable，而是通过拖拽手柄来控制

  // 提取域名作为图标占位符
  const domain = extractDomain(link.url);
  const initial = domain.charAt(0).toUpperCase();
  const version = link.version || '1.0.0';

  card.innerHTML = `
    <div class="card-drag-handle" title="拖拽排序">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="9" cy="12" r="1"></circle>
        <circle cx="9" cy="5" r="1"></circle>
        <circle cx="9" cy="19" r="1"></circle>
        <circle cx="15" cy="12" r="1"></circle>
        <circle cx="15" cy="5" r="1"></circle>
        <circle cx="15" cy="19" r="1"></circle>
      </svg>
    </div>
    <div class="card-icon">${initial}</div>
    <div class="card-content">
      <h3 class="card-title">${escapeHtml(link.title)}</h3>
      ${link.description ? `<p class="card-description">${escapeHtml(link.description)}</p>` : ''}
      <p class="card-url">${escapeHtml(domain)}</p>
      <p class="card-version">版本: ${escapeHtml(version)}</p>
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

  // 设置拖拽手柄为可拖拽元素
  const dragHandle = card.querySelector('.card-drag-handle');
  if (dragHandle) {
    dragHandle.draggable = true;
    
    // 防止拖拽手柄的默认行为干扰拖拽
    dragHandle.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      // 在 Mac 上，确保拖拽可以正常启动
      if (e.button === 0) { // 左键
        dragHandle.style.cursor = 'grabbing';
      }
    });
    
    dragHandle.addEventListener('mouseup', (e) => {
      dragHandle.style.cursor = 'grab';
    });
    
    dragHandle.addEventListener('dragstart', (e) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', link.id);
      // 兼容性：同时设置 text/html
      e.dataTransfer.setData('text/html', link.id);
      card.classList.add('dragging');
      // 在 Mac 上确保拖拽效果
      e.dataTransfer.dropEffect = 'move';
    });
    
    dragHandle.addEventListener('dragend', (e) => {
      card.classList.remove('dragging');
      document.querySelectorAll('.link-card').forEach(c => c.classList.remove('drag-over'));
      dragHandle.style.cursor = 'grab';
    });
    
    // 拖拽手柄阻止点击事件传播（但不阻止拖拽）
    dragHandle.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  card.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    const draggingCard = document.querySelector('.link-card.dragging');
    if (draggingCard && draggingCard !== card) {
      card.classList.add('drag-over');
    }
  });

  card.addEventListener('dragleave', (e) => {
    // 只有当离开到卡片外部时才移除drag-over类
    const relatedTarget = e.relatedTarget;
    if (!relatedTarget || !card.contains(relatedTarget)) {
      card.classList.remove('drag-over');
    }
  });

  card.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    card.classList.remove('drag-over');
    // 兼容性：尝试多种方式获取拖拽数据
    const draggedId = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text/html');
    if (draggedId && draggedId !== link.id) {
      updateLinkOrder(draggedId, link.id);
    }
  });

  // 点击卡片打开链接（排除拖拽手柄和操作按钮）
  card.addEventListener('click', (e) => {
    if (!e.target.closest('.card-actions') && !e.target.closest('.card-drag-handle')) {
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


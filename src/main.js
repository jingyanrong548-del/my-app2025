// 主入口文件

// 导入样式
import './styles.css';

import {
  initApp,
  addLink,
  updateLink,
  deleteLink,
  batchAddLinks,
  getEditingLinkId,
  getDeletingLinkId,
  clearForm,
  showModal,
  hideModal,
  renderLinks,
} from './app.js';

import { importGitHubRepos } from './github-import.js';
import { importVercelProjects } from './vercel-import.js';

// 应用版本号（从 package.json 同步）
const APP_VERSION = '1.0.0';

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
  // 显示应用版本号
  const versionElement = document.getElementById('appVersion');
  if (versionElement) {
    versionElement.textContent = `v${APP_VERSION}`;
  }
  
  initApp();
  setupEventListeners();
});

/**
 * 设置事件监听器
 */
function setupEventListeners() {
  // 添加按钮
  const addBtn = document.getElementById('addBtn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      clearForm();
      showModal('linkModal');
    });
  }

  // 链接表单提交
  const linkForm = document.getElementById('linkForm');
  if (linkForm) {
    linkForm.addEventListener('submit', handleFormSubmit);
  }

  // 关闭模态框按钮
  const closeModal = document.getElementById('closeModal');
  if (closeModal) {
    closeModal.addEventListener('click', () => {
      hideModal('linkModal');
      clearForm();
    });
  }

  const cancelBtn = document.getElementById('cancelBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      hideModal('linkModal');
      clearForm();
    });
  }

  // 删除确认
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', handleDeleteConfirm);
  }

  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', () => {
      hideModal('deleteModal');
    });
  }

  const closeDeleteModal = document.getElementById('closeDeleteModal');
  if (closeDeleteModal) {
    closeDeleteModal.addEventListener('click', () => {
      hideModal('deleteModal');
    });
  }

  // 点击模态框背景关闭
  const linkModal = document.getElementById('linkModal');
  if (linkModal) {
    linkModal.addEventListener('click', (e) => {
      if (e.target === linkModal) {
        hideModal('linkModal');
        clearForm();
      }
    });
  }

  const deleteModal = document.getElementById('deleteModal');
  if (deleteModal) {
    deleteModal.addEventListener('click', (e) => {
      if (e.target === deleteModal) {
        hideModal('deleteModal');
      }
    });
  }

  // GitHub导入按钮
  const importBtn = document.getElementById('importBtn');
  if (importBtn) {
    importBtn.addEventListener('click', () => {
      showModal('importModal');
    });
  }

  // Vercel导入按钮
  const importVercelBtn = document.getElementById('importVercelBtn');
  if (importVercelBtn) {
    importVercelBtn.addEventListener('click', () => {
      showModal('importVercelModal');
    });
  }

  // GitHub导入模态框相关事件
  const closeImportModal = document.getElementById('closeImportModal');
  if (closeImportModal) {
    closeImportModal.addEventListener('click', () => {
      hideModal('importModal');
      resetImportStatus();
    });
  }

  const cancelImportBtn = document.getElementById('cancelImportBtn');
  if (cancelImportBtn) {
    cancelImportBtn.addEventListener('click', () => {
      hideModal('importModal');
      resetImportStatus();
    });
  }

  const confirmImportBtn = document.getElementById('confirmImportBtn');
  if (confirmImportBtn) {
    confirmImportBtn.addEventListener('click', handleGitHubImport);
  }

  const importModal = document.getElementById('importModal');
  if (importModal) {
    importModal.addEventListener('click', (e) => {
      if (e.target === importModal) {
        hideModal('importModal');
        resetImportStatus();
      }
    });
  }

  // Vercel导入模态框相关事件
  const closeImportVercelModal = document.getElementById('closeImportVercelModal');
  if (closeImportVercelModal) {
    closeImportVercelModal.addEventListener('click', () => {
      hideModal('importVercelModal');
      resetVercelImportStatus();
    });
  }

  const cancelImportVercelBtn = document.getElementById('cancelImportVercelBtn');
  if (cancelImportVercelBtn) {
    cancelImportVercelBtn.addEventListener('click', () => {
      hideModal('importVercelModal');
      resetVercelImportStatus();
    });
  }

  const confirmImportVercelBtn = document.getElementById('confirmImportVercelBtn');
  if (confirmImportVercelBtn) {
    confirmImportVercelBtn.addEventListener('click', handleVercelImport);
  }

  const importVercelModal = document.getElementById('importVercelModal');
  if (importVercelModal) {
    importVercelModal.addEventListener('click', (e) => {
      if (e.target === importVercelModal) {
        hideModal('importVercelModal');
        resetVercelImportStatus();
      }
    });
  }

  // ESC键关闭模态框
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideModal('linkModal');
      hideModal('deleteModal');
      hideModal('importModal');
      hideModal('importVercelModal');
      clearForm();
      resetImportStatus();
      resetVercelImportStatus();
    }
  });
}

/**
 * 处理表单提交
 * @param {Event} e - 提交事件
 */
function handleFormSubmit(e) {
  e.preventDefault();

  const title = document.getElementById('linkTitle').value.trim();
  const url = document.getElementById('linkUrl').value.trim();
  const description = document.getElementById('linkDescription').value.trim();
  const linkId = document.getElementById('linkId').value;

  if (!title || !url) {
    alert('请填写标题和URL');
    return;
  }

  const linkData = { title, url, description };
  const editingId = getEditingLinkId();

  if (editingId && linkId === editingId) {
    // 更新链接
    updateLink(editingId, linkData);
  } else {
    // 添加新链接
    addLink(linkData);
  }

  hideModal('linkModal');
  clearForm();
}

/**
 * 处理删除确认
 */
function handleDeleteConfirm() {
  const deletingId = getDeletingLinkId();
  if (deletingId) {
    deleteLink(deletingId);
    hideModal('deleteModal');
  }
}

/**
 * 处理GitHub导入
 */
async function handleGitHubImport() {
  const usernameInput = document.getElementById('githubUsername');
  const importStatus = document.getElementById('importStatus');
  const importMessage = document.getElementById('importMessage');
  const progressBar = document.getElementById('progressBar');
  const progressFill = document.getElementById('progressFill');
  const confirmImportBtn = document.getElementById('confirmImportBtn');

  const username = usernameInput.value.trim();
  if (!username) {
    alert('请输入GitHub用户名');
    return;
  }

  // 显示导入状态
  importStatus.style.display = 'block';
  importMessage.textContent = '正在获取GitHub仓库列表...';
  progressBar.style.display = 'block';
  progressFill.style.width = '0%';
  confirmImportBtn.disabled = true;
  confirmImportBtn.textContent = '导入中...';

  try {
    const allLinks = [];
    const result = await importGitHubRepos(username, (linkData) => {
      allLinks.push(linkData);
    });

    if (result.success) {
      // 批量添加/更新链接
      const batchResult = batchAddLinks(allLinks);
      progressFill.style.width = '100%';
      importMessage.innerHTML = `
        ✅ 导入完成！<br>
        共找到 ${result.total} 个仓库<br>
        新增 ${batchResult.added} 个链接<br>
        更新 ${batchResult.updated} 个链接（版本号已更新）
      `;
      
      // 3秒后自动关闭
      setTimeout(() => {
        hideModal('importModal');
        resetImportStatus();
      }, 3000);
    } else {
      importMessage.textContent = `❌ 导入失败: ${result.error}`;
      progressBar.style.display = 'none';
    }
  } catch (error) {
    importMessage.textContent = `❌ 导入失败: ${error.message}`;
    progressBar.style.display = 'none';
    console.error('GitHub导入错误:', error);
  } finally {
    confirmImportBtn.disabled = false;
    confirmImportBtn.textContent = '开始导入';
  }
}

/**
 * 处理Vercel导入
 */
async function handleVercelImport() {
  const tokenInput = document.getElementById('vercelToken');
  const importStatus = document.getElementById('importVercelStatus');
  const importMessage = document.getElementById('importVercelMessage');
  const progressBar = document.getElementById('progressVercelBar');
  const progressFill = document.getElementById('progressVercelFill');
  const confirmImportVercelBtn = document.getElementById('confirmImportVercelBtn');

  const token = tokenInput.value.trim();
  if (!token) {
    alert('请输入Vercel API Token');
    return;
  }

  // 显示导入状态
  importStatus.style.display = 'block';
  importMessage.textContent = '正在获取Vercel项目列表...';
  progressBar.style.display = 'block';
  progressFill.style.width = '0%';
  confirmImportVercelBtn.disabled = true;
  confirmImportVercelBtn.textContent = '导入中...';

  try {
    const allLinks = [];
    const result = await importVercelProjects(token, (linkData) => {
      allLinks.push(linkData);
    });

    if (result.success) {
      // 批量添加/更新链接
      const batchResult = batchAddLinks(allLinks);
      progressFill.style.width = '100%';
      importMessage.innerHTML = `
        ✅ 导入完成！<br>
        共找到 ${result.total} 个项目<br>
        新增 ${batchResult.added} 个链接<br>
        更新 ${batchResult.updated} 个链接（版本号已更新）
      `;
      
      // 3秒后自动关闭
      setTimeout(() => {
        hideModal('importVercelModal');
        resetVercelImportStatus();
      }, 3000);
    } else {
      importMessage.textContent = `❌ 导入失败: ${result.error}`;
      progressBar.style.display = 'none';
    }
  } catch (error) {
    importMessage.textContent = `❌ 导入失败: ${error.message}`;
    progressBar.style.display = 'none';
    console.error('Vercel导入错误:', error);
  } finally {
    confirmImportVercelBtn.disabled = false;
    confirmImportVercelBtn.textContent = '开始导入';
  }
}

/**
 * 重置导入状态
 */
function resetImportStatus() {
  const importStatus = document.getElementById('importStatus');
  const importMessage = document.getElementById('importMessage');
  const progressBar = document.getElementById('progressBar');
  const progressFill = document.getElementById('progressFill');
  const confirmImportBtn = document.getElementById('confirmImportBtn');
  const githubUsername = document.getElementById('githubUsername');

  if (importStatus) importStatus.style.display = 'none';
  if (importMessage) importMessage.textContent = '';
  if (progressBar) progressBar.style.display = 'none';
  if (progressFill) progressFill.style.width = '0%';
  if (confirmImportBtn) {
    confirmImportBtn.disabled = false;
    confirmImportBtn.textContent = '开始导入';
  }
  if (githubUsername) githubUsername.value = '';
}

/**
 * 重置Vercel导入状态
 */
function resetVercelImportStatus() {
  const importStatus = document.getElementById('importVercelStatus');
  const importMessage = document.getElementById('importVercelMessage');
  const progressBar = document.getElementById('progressVercelBar');
  const progressFill = document.getElementById('progressVercelFill');
  const confirmImportVercelBtn = document.getElementById('confirmImportVercelBtn');
  const vercelToken = document.getElementById('vercelToken');

  if (importStatus) importStatus.style.display = 'none';
  if (importMessage) importMessage.textContent = '';
  if (progressBar) progressBar.style.display = 'none';
  if (progressFill) progressFill.style.width = '0%';
  if (confirmImportVercelBtn) {
    confirmImportVercelBtn.disabled = false;
    confirmImportVercelBtn.textContent = '开始导入';
  }
  if (vercelToken) vercelToken.value = '';
}


// 主入口文件

// 导入样式
import './styles.css';

import {
  initApp,
  addLink,
  updateLink,
  deleteLink,
  getEditingLinkId,
  getDeletingLinkId,
  clearForm,
  showModal,
  hideModal,
  renderLinks,
} from './app.js';

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
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

  // ESC键关闭模态框
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideModal('linkModal');
      hideModal('deleteModal');
      clearForm();
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


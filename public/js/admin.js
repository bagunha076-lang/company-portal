// =====================
// 탭 전환
// =====================
const tabBtns   = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    tabPanels.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const panel = document.getElementById(`tab-${btn.dataset.tab}`);
    if (panel) panel.classList.add('active');
  });
});

// =====================
// 사이즈 바 차트 애니메이션
// =====================
function animateBars() {
  document.querySelectorAll('.size-bar-row').forEach(row => {
    const count = parseInt(row.dataset.count);
    const max   = parseInt(row.dataset.max);
    const fill  = row.querySelector('.bar-fill');
    if (fill) {
      setTimeout(() => {
        fill.style.width = ((count / max) * 100).toFixed(1) + '%';
      }, 300);
    }
  });
}

// 피복 탭 클릭 시 차트 애니메이션
document.querySelector('[data-tab="admin-clothing"]').addEventListener('click', () => {
  setTimeout(animateBars, 100);
});

// =====================
// 승인/반려 처리
// =====================
let currentRejectRow = null;

const rejectModal       = document.getElementById('rejectModal');
const rejectModalClose  = document.getElementById('rejectModalClose');
const rejectCancelBtn   = document.getElementById('rejectCancelBtn');
const rejectConfirmBtn  = document.getElementById('rejectConfirmBtn');

function attachActionBtns() {
  document.querySelectorAll('.btn-approve').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('tr');
      const chip = row.querySelector('.status-chip');
      if (chip) {
        chip.textContent = '승인완료';
        chip.className = 'status-chip chip-done';
      }
      const cell = btn.closest('.action-cell');
      if (cell) cell.innerHTML = '<span style="color:#15803d; font-size:0.82rem;">처리완료</span>';
    });
  });

  document.querySelectorAll('.btn-reject').forEach(btn => {
    btn.addEventListener('click', () => {
      currentRejectRow = btn.closest('tr');
      rejectModal.classList.add('active');
    });
  });
}

attachActionBtns();

if (rejectModalClose) rejectModalClose.addEventListener('click', () => rejectModal.classList.remove('active'));
if (rejectCancelBtn)  rejectCancelBtn.addEventListener('click',  () => rejectModal.classList.remove('active'));

if (rejectConfirmBtn) {
  rejectConfirmBtn.addEventListener('click', () => {
    if (currentRejectRow) {
      const chip = currentRejectRow.querySelector('.status-chip');
      if (chip) {
        chip.textContent = '반려';
        chip.className = 'status-chip chip-reject';
      }
      const cell = currentRejectRow.querySelector('.action-cell');
      if (cell) cell.innerHTML = '<span style="color:#dc2626; font-size:0.82rem;">반려처리</span>';
    }
    rejectModal.classList.remove('active');
    document.getElementById('rejectReason').value = '';
  });
}

rejectModal && rejectModal.addEventListener('click', e => {
  if (e.target === rejectModal) rejectModal.classList.remove('active');
});

// =====================
// 일괄 승인
// =====================
const bulkApproveBtn = document.getElementById('bulkApproveBtn');
const clothingAllCheck = document.getElementById('clothingAllCheck');

if (clothingAllCheck) {
  clothingAllCheck.addEventListener('change', () => {
    document.querySelectorAll('#tab-admin-clothing input[type=checkbox]:not(#clothingAllCheck)').forEach(cb => {
      cb.checked = clothingAllCheck.checked;
    });
  });
}

if (bulkApproveBtn) {
  bulkApproveBtn.addEventListener('click', () => {
    const checked = document.querySelectorAll('#tab-admin-clothing tbody input[type=checkbox]:checked');
    if (checked.length === 0) {
      alert('승인할 항목을 선택하세요.');
      return;
    }
    if (confirm(`선택한 ${checked.length}건을 일괄 승인하시겠습니까?`)) {
      checked.forEach(cb => {
        const row  = cb.closest('tr');
        const chip = row.querySelector('.status-chip');
        if (chip && chip.classList.contains('chip-pending')) {
          chip.textContent = '처리완료';
          chip.className = 'status-chip chip-done';
          const cell = row.querySelector('.action-cell');
          if (cell) cell.innerHTML = '-';
        }
        cb.checked = false;
      });
      if (clothingAllCheck) clothingAllCheck.checked = false;
    }
  });
}

// =====================
// 전체 검색
// =====================
const globalSearch = document.getElementById('globalSearch');
if (globalSearch) {
  globalSearch.addEventListener('input', () => {
    const q = globalSearch.value.toLowerCase();
    document.querySelectorAll('#adminMainTable tbody tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}

// =====================
// 공지 관리
// =====================
const addNoticeBtn    = document.getElementById('addNoticeBtn');
const addNoticeModal  = document.getElementById('addNoticeModal');
const noticeModalClose= document.getElementById('noticeModalClose');
const noticeCancelBtn = document.getElementById('noticeCancelBtn');
const noticeConfirmBtn= document.getElementById('noticeConfirmBtn');
const noticeManageList= document.getElementById('noticeManageList');

function closeNoticeModal() {
  addNoticeModal && addNoticeModal.classList.remove('active');
}

if (addNoticeBtn)     addNoticeBtn.addEventListener('click',     () => addNoticeModal.classList.add('active'));
if (noticeModalClose) noticeModalClose.addEventListener('click', closeNoticeModal);
if (noticeCancelBtn)  noticeCancelBtn.addEventListener('click',  closeNoticeModal);
addNoticeModal && addNoticeModal.addEventListener('click', e => {
  if (e.target === addNoticeModal) closeNoticeModal();
});

if (noticeConfirmBtn) {
  noticeConfirmBtn.addEventListener('click', () => {
    const text = document.getElementById('newNoticeText').value.trim();
    if (!text) { alert('공지 내용을 입력하세요.'); return; }

    const item = document.createElement('div');
    item.className = 'notice-manage-item';
    item.innerHTML = `
      <div class="nm-drag"><i class="fa-solid fa-grip-vertical"></i></div>
      <div class="nm-content">${text}</div>
      <div class="nm-actions">
        <button class="btn-nm-edit"><i class="fa-solid fa-pen"></i></button>
        <button class="btn-nm-del"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;
    noticeManageList && noticeManageList.appendChild(item);
    bindNoticeItemBtns(item);
    document.getElementById('newNoticeText').value = '';
    closeNoticeModal();
  });
}

function bindNoticeItemBtns(item) {
  item.querySelector('.btn-nm-del').addEventListener('click', () => {
    if (confirm('공지를 삭제하시겠습니까?')) item.remove();
  });
  item.querySelector('.btn-nm-edit').addEventListener('click', () => {
    const content = item.querySelector('.nm-content');
    const newText = prompt('공지를 수정하세요:', content.textContent);
    if (newText !== null && newText.trim()) content.textContent = newText.trim();
  });
}

document.querySelectorAll('.notice-manage-item').forEach(bindNoticeItemBtns);

// =====================
// 결재함 — 승인/반려 처리 (admin.js의 attachActionBtns 패턴 재사용)
// =====================
var currentRejectRow = null;

var rejectModal      = document.getElementById('rejectModal');
var rejectModalClose = document.getElementById('rejectModalClose');
var rejectCancelBtn  = document.getElementById('rejectCancelBtn');
var rejectConfirmBtn = document.getElementById('rejectConfirmBtn');

function attachActionBtns() {
  document.querySelectorAll('.btn-approve').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var row  = btn.closest('tr');
      var chip = row.querySelector('.status-chip');
      if (chip) {
        chip.textContent = '승인완료';
        chip.className = 'status-chip chip-done';
      }
      var cell = btn.closest('.action-cell');
      if (cell) cell.innerHTML = '<span style="color:#15803D; font-size:.82rem;">처리완료</span>';
    });
  });

  document.querySelectorAll('.btn-reject').forEach(function (btn) {
    btn.addEventListener('click', function () {
      currentRejectRow = btn.closest('tr');
      rejectModal.classList.add('active');
    });
  });
}

attachActionBtns();

if (rejectModalClose) rejectModalClose.addEventListener('click', function () { rejectModal.classList.remove('active'); });
if (rejectCancelBtn)  rejectCancelBtn.addEventListener('click',  function () { rejectModal.classList.remove('active'); });

if (rejectConfirmBtn) {
  rejectConfirmBtn.addEventListener('click', function () {
    if (currentRejectRow) {
      var chip = currentRejectRow.querySelector('.status-chip');
      if (chip) {
        chip.textContent = '반려';
        chip.className = 'status-chip chip-reject';
      }
      var cell = currentRejectRow.querySelector('.action-cell');
      if (cell) cell.innerHTML = '<span style="color:var(--danger); font-size:.82rem;">반려처리</span>';
    }
    rejectModal.classList.remove('active');
    document.getElementById('rejectReason').value = '';
  });
}

rejectModal && rejectModal.addEventListener('click', function (e) {
  if (e.target === rejectModal) rejectModal.classList.remove('active');
});

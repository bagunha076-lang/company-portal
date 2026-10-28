// =====================
// 근태수정신청 — 폼 제출
// =====================
var correctionForm = document.getElementById('correctionForm');
var successModal    = document.getElementById('successModal');
var successClose    = document.getElementById('successClose');
var historyTable     = document.getElementById('correctionHistoryTable');

if (correctionForm) {
  correctionForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var targetDate = correctionForm.target_date.value;
    var afterIn    = correctionForm.after_in.value;
    var afterOut   = correctionForm.after_out.value;
    var reason     = correctionForm.reason.value.trim();

    if (!targetDate) { alert('수정 대상 날짜를 입력해주세요.'); return; }
    if (!afterIn || !afterOut) { alert('수정 후 시간을 입력해주세요.'); return; }
    if (!reason) { alert('수정 사유를 입력해주세요.'); return; }

    if (historyTable) {
      var tbody = historyTable.querySelector('tbody');
      var today = new Date();
      var dateStr = today.getFullYear() + '.' + String(today.getMonth() + 1).padStart(2, '0') + '.' + String(today.getDate()).padStart(2, '0');
      var row = document.createElement('tr');
      row.innerHTML = '<td>' + dateStr + '</td><td>' + targetDate.replace(/-/g, '.') + '</td><td>' + afterIn + ' ~ ' + afterOut + '</td><td>' + reason + '</td><td><span class="chip chip-pending">검토중</span></td>';
      tbody.insertBefore(row, tbody.firstChild);
    }

    successModal.classList.add('active');
  });
}

if (successClose) {
  successClose.addEventListener('click', function () {
    successModal.classList.remove('active');
    correctionForm && correctionForm.reset();
  });
}
successModal && successModal.addEventListener('click', function (e) {
  if (e.target === successModal) successModal.classList.remove('active');
});

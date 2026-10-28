// =====================
// 대근대휴신청 — 폼 제출
// =====================
var shiftSwapForm = document.getElementById('shiftSwapForm');
var successModal   = document.getElementById('successModal');
var successClose   = document.getElementById('successClose');
var historyTable    = document.getElementById('shiftSwapHistoryTable');

if (shiftSwapForm) {
  shiftSwapForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var workDate   = shiftSwapForm.work_date.value;
    var substitute = shiftSwapForm.substitute.value;
    var compDate   = shiftSwapForm.comp_leave_date.value;
    var reason     = shiftSwapForm.reason.value.trim();

    if (!workDate)   { alert('대근 대상 날짜를 입력해주세요.'); return; }
    if (!substitute) { alert('대근자를 선택해주세요.'); return; }
    if (!compDate)   { alert('대휴 사용 예정일을 입력해주세요.'); return; }
    if (!reason)     { alert('사유를 입력해주세요.'); return; }

    if (historyTable) {
      var tbody = historyTable.querySelector('tbody');
      var today = new Date();
      var dateStr = today.getFullYear() + '.' + String(today.getMonth() + 1).padStart(2, '0') + '.' + String(today.getDate()).padStart(2, '0');
      var row = document.createElement('tr');
      row.innerHTML = '<td>' + dateStr + '</td><td>' + workDate.replace(/-/g, '.') + '</td><td>' + substitute.replace(/\s*\(.*\)/, '') + '</td><td>' + compDate.replace(/-/g, '.') + '</td><td><span class="chip chip-pending">검토중</span></td>';
      tbody.insertBefore(row, tbody.firstChild);
    }

    successModal.classList.add('active');
  });
}

if (successClose) {
  successClose.addEventListener('click', function () {
    successModal.classList.remove('active');
    shiftSwapForm && shiftSwapForm.reset();
  });
}
successModal && successModal.addEventListener('click', function (e) {
  if (e.target === successModal) successModal.classList.remove('active');
});

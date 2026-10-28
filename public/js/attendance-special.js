// =====================
// 특이근태등록 — 폼 제출
// =====================
var specialForm   = document.getElementById('specialForm');
var successModal   = document.getElementById('successModal');
var successClose   = document.getElementById('successClose');
var historyTable    = document.getElementById('specialHistoryTable');

if (specialForm) {
  specialForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var type  = specialForm.type.value;
    var start = specialForm.start_date.value;
    var end   = specialForm.end_date.value;
    var reason = specialForm.reason.value.trim();

    if (!type)   { alert('근태 유형을 선택해주세요.'); return; }
    if (!start || !end) { alert('기간을 입력해주세요.'); return; }
    if (!reason) { alert('사유를 입력해주세요.'); return; }

    if (historyTable) {
      var tbody = historyTable.querySelector('tbody');
      var today = new Date();
      var dateStr = today.getFullYear() + '.' + String(today.getMonth() + 1).padStart(2, '0') + '.' + String(today.getDate()).padStart(2, '0');
      var period = start === end ? start.replace(/-/g, '.') : start.replace(/-/g, '.') + ' ~ ' + end.replace(/-/g, '.');
      var row = document.createElement('tr');
      row.innerHTML = '<td>' + dateStr + '</td><td>' + type + '</td><td>' + period + '</td><td>' + reason + '</td><td><span class="chip chip-pending">검토중</span></td>';
      tbody.insertBefore(row, tbody.firstChild);
    }

    successModal.classList.add('active');
  });
}

if (successClose) {
  successClose.addEventListener('click', function () {
    successModal.classList.remove('active');
    specialForm && specialForm.reset();
  });
}
successModal && successModal.addEventListener('click', function (e) {
  if (e.target === successModal) successModal.classList.remove('active');
});

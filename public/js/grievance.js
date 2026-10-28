// =====================
// 고충상담 — 폼 제출
// =====================
var grievanceForm = document.getElementById('grievanceForm');
var successModal   = document.getElementById('successModal');
var successClose   = document.getElementById('successClose');
var historyBody    = document.getElementById('grievanceHistoryBody');

if (grievanceForm) {
  grievanceForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var type    = grievanceForm.type.value;
    var content = grievanceForm.content.value.trim();
    if (!type)    { alert('상담 유형을 선택해주세요.'); return; }
    if (!content) { alert('상담 내용을 입력해주세요.'); return; }

    var isAnon = grievanceForm.anonymous.checked;
    if (historyBody) {
      if (historyBody.children.length === 1 && historyBody.children[0].children.length === 1) {
        historyBody.innerHTML = '';
      }
      var today = new Date();
      var dateStr = today.getFullYear() + '.' + String(today.getMonth() + 1).padStart(2, '0') + '.' + String(today.getDate()).padStart(2, '0');
      var row = document.createElement('tr');
      row.innerHTML = '<td>' + dateStr + '</td><td>' + type + '</td><td>' + (isAnon ? '익명' : '실명') + '</td><td><span class="chip chip-pending">접수완료</span></td>';
      historyBody.insertBefore(row, historyBody.firstChild);
    }

    successModal.classList.add('active');
  });
}

if (successClose) {
  successClose.addEventListener('click', function () {
    successModal.classList.remove('active');
    grievanceForm && grievanceForm.reset();
  });
}
successModal && successModal.addEventListener('click', function (e) {
  if (e.target === successModal) successModal.classList.remove('active');
});

// =====================
// iNSIGHT 수시피드백 — 폼 제출
// =====================
var insightForm    = document.getElementById('insightForm');
var successModal   = document.getElementById('successModal');
var successClose   = document.getElementById('successClose');
var sentBody        = document.getElementById('sentFeedbackBody');

var TYPE_BADGE = { '칭찬': 'badge-green', '제안': 'badge-navy', '우려': 'badge-amber' };

if (insightForm) {
  insightForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var receiver = insightForm.receiver.value;
    var type     = document.querySelector('input[name="feedback_type"]:checked');
    var message  = insightForm.message.value.trim();

    if (!receiver) { alert('받는 사람을 선택해주세요.'); return; }
    if (!type)     { alert('피드백 유형을 선택해주세요.'); return; }
    if (!message)  { alert('메시지를 입력해주세요.'); return; }

    if (sentBody) {
      var today = new Date();
      var dateStr = today.getFullYear() + '.' + String(today.getMonth() + 1).padStart(2, '0') + '.' + String(today.getDate()).padStart(2, '0');
      var badgeClass = TYPE_BADGE[type.value] || 'badge-navy';
      var row = document.createElement('tr');
      row.innerHTML = '<td>' + dateStr + '</td><td>' + receiver + '</td><td><span class="badge ' + badgeClass + '">' + type.value + '</span></td><td>' + message + '</td>';
      sentBody.insertBefore(row, sentBody.firstChild);
    }

    successModal.classList.add('active');
  });
}

if (successClose) {
  successClose.addEventListener('click', function () {
    successModal.classList.remove('active');
    insightForm && insightForm.reset();
  });
}

successModal && successModal.addEventListener('click', function (e) {
  if (e.target === successModal) successModal.classList.remove('active');
});

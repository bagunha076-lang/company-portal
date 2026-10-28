// =====================
// 리더십 다면진단 — 폼 제출
// =====================
var leadershipForm = document.getElementById('leadershipForm');
var successModal    = document.getElementById('successModal');
var successClose    = document.getElementById('successClose');

if (leadershipForm) {
  leadershipForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var answered = ['q1', 'q2', 'q3', 'q4', 'q5'].every(function (name) {
      return document.querySelector('input[name="' + name + '"]:checked');
    });
    if (!answered) { alert('모든 문항에 응답해주세요.'); return; }
    successModal.classList.add('active');
  });
}

if (successClose) {
  successClose.addEventListener('click', function () {
    successModal.classList.remove('active');
    leadershipForm && leadershipForm.reset();
  });
}

successModal && successModal.addEventListener('click', function (e) {
  if (e.target === successModal) successModal.classList.remove('active');
});

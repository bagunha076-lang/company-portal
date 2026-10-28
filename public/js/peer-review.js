// =====================
// 위아다운 동료진단 — 동료별 폼 제출
// =====================
var successModal = document.getElementById('successModal');
var successTitle = document.getElementById('successTitle');
var successClose = document.getElementById('successClose');

document.querySelectorAll('.peer-form').forEach(function (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var radios = form.querySelectorAll('input[type="radio"]');
    var names = {};
    radios.forEach(function (r) { names[r.name] = true; });
    var allAnswered = Object.keys(names).every(function (name) {
      return form.querySelector('input[name="' + name + '"]:checked');
    });
    if (!allAnswered) { alert('모든 문항에 응답해주세요.'); return; }

    if (successTitle) successTitle.textContent = form.dataset.peer + '님 평가가 제출되었습니다!';
    successModal.classList.add('active');
    form.reset();

    var panel = form.closest('.tab-panel');
    if (panel) panel.querySelectorAll('.form-card').forEach(function (card) {
      card.style.opacity = '.55'; card.style.pointerEvents = 'none';
    });
  });
});

if (successClose) {
  successClose.addEventListener('click', function () { successModal.classList.remove('active'); });
}
successModal && successModal.addEventListener('click', function (e) {
  if (e.target === successModal) successModal.classList.remove('active');
});

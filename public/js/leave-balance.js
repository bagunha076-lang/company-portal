// =====================
// 연월차조회 — 진행률 바 애니메이션
// =====================
document.querySelectorAll('.progress-bar-fill[data-target]').forEach(function (bar) {
  var target = bar.dataset.target;
  setTimeout(function () { bar.style.width = target + '%'; }, 200);
});

var ctProgress = document.getElementById('ctProgress');
if (ctProgress) {
  setTimeout(function () { ctProgress.style.width = '55%'; }, 200);
}

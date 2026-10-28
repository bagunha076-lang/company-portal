// =====================
// 급여명세서 — 다운로드 버튼 (데모)
// =====================
var downloadBtn = document.getElementById('downloadBtn');
if (downloadBtn) {
  downloadBtn.addEventListener('click', function () {
    alert('급여명세서 PDF 다운로드 기능은 준비 중입니다.');
  });
}

var monthSelect = document.getElementById('monthSelect');
if (monthSelect) {
  monthSelect.addEventListener('change', function () {
    // 데모: 월 변경 시 실제 데이터 갱신 없이 안내만 표시
  });
}

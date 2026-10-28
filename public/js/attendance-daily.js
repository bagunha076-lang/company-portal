// =====================
// 일일근태등록 — 실시간 시계 + 출퇴근 버튼
// =====================
var liveClock   = document.getElementById('liveClock');
var liveDate    = document.getElementById('liveDate');
var checkInBtn  = document.getElementById('checkInBtn');
var checkOutBtn = document.getElementById('checkOutBtn');
var clockStatus = document.getElementById('clockStatus');
var attendanceTable = document.getElementById('attendanceTable');

var WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function pad(n) { return String(n).padStart(2, '0'); }

function tickClock() {
  var now = new Date();
  if (liveClock) liveClock.textContent = pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
  if (liveDate) {
    liveDate.textContent = now.getFullYear() + '.' + pad(now.getMonth() + 1) + '.' + pad(now.getDate()) + ' (' + WEEKDAYS[now.getDay()] + ')';
  }
}
tickClock();
setInterval(tickClock, 1000);

var checkInTime = null;

if (checkInBtn) {
  checkInBtn.addEventListener('click', function () {
    var now = new Date();
    checkInTime = now;
    checkInBtn.classList.add('active');
    checkInBtn.disabled = true;
    checkOutBtn.disabled = false;
    clockStatus.innerHTML = '<strong>' + pad(now.getHours()) + ':' + pad(now.getMinutes()) + '</strong>에 출근 등록되었습니다.';
  });
}

if (checkOutBtn) {
  checkOutBtn.addEventListener('click', function () {
    var now = new Date();
    checkOutBtn.classList.add('active');
    checkOutBtn.disabled = true;
    clockStatus.innerHTML = '<strong>' + pad(now.getHours()) + ':' + pad(now.getMinutes()) + '</strong>에 퇴근 등록되었습니다. 오늘도 수고하셨습니다!';

    if (attendanceTable && checkInTime) {
      var tbody = attendanceTable.querySelector('tbody');
      var dateStr = now.getFullYear() + '.' + pad(now.getMonth() + 1) + '.' + pad(now.getDate());
      var inStr   = pad(checkInTime.getHours()) + ':' + pad(checkInTime.getMinutes());
      var outStr  = pad(now.getHours()) + ':' + pad(now.getMinutes());
      var row = document.createElement('tr');
      row.innerHTML = '<td>' + dateStr + '</td><td>' + inStr + '</td><td>' + outStr + '</td><td>-</td><td><span class="chip chip-done">정상</span></td>';
      tbody.insertBefore(row, tbody.firstChild);
    }
  });
}

/* ============================================================
   uniform.js — 근무복 신청 페이지 전용 스크립트
   ============================================================ */
'use strict';

/* ============================================================
   D-Day 계산 + 상태 뱃지
============================================================ */
(function calcDDay() {
  var DEADLINE = '2026-07-31';
  var el = document.getElementById('dDay');
  var badge = document.getElementById('dDayBadge');
  if (!el) return;
  var diff = Math.ceil((new Date(DEADLINE) - new Date()) / 86400000);
  if (diff > 0) {
    el.textContent = 'D-' + diff;
    if (badge) { badge.textContent = '신청중'; badge.className = 'badge-open'; }
  } else if (diff === 0) {
    el.textContent = 'D-Day';
    if (badge) { badge.textContent = '마감 임박'; badge.className = 'badge-soon'; }
  } else {
    el.textContent = '마감';
    if (badge) { badge.textContent = '마감'; badge.className = 'badge-closed'; }
  }
})();

/* ============================================================
   탭 전환 (sub-common.js 공통 탭 사용 — 여기선 백업용)
============================================================ */
document.querySelectorAll('.tab-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var target = this.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
    document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
    this.classList.add('active');
    var panel = document.getElementById('tab-' + target);
    if (panel) panel.classList.add('active');
  });
});

/* ============================================================
   수량 +/- 버튼
============================================================ */
document.querySelectorAll('.qty-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var targetId = this.dataset.target;
    var inp      = document.getElementById(targetId);
    if (!inp) return;
    var min = parseInt(inp.min) || 1;
    var max = parseInt(inp.max) || 99;
    var val = parseInt(inp.value) || 1;
    if (this.dataset.action === 'plus')  val = Math.min(val + 1, max);
    if (this.dataset.action === 'minus') val = Math.max(val - 1, min);
    inp.value = val;
  });
});

/* ============================================================
   사이즈 가이드 모달
============================================================ */
var SIZE_GUIDE = {
  top: {
    title: '상의 사이즈 가이드',
    headers: ['사이즈', '가슴둘레(cm)', '어깨너비(cm)', '소매길이(cm)', '총장(cm)'],
    rows: [
      ['XS',   '82-86',  '40',   '58',   '65'],
      ['S',    '86-90',  '42',   '59',   '67'],
      ['M',    '90-94',  '44',   '60',   '69'],
      ['L',    '94-98',  '46',   '61',   '71'],
      ['XL',   '98-104', '48',   '62',   '73'],
      ['XXL',  '104-110','50',   '63',   '75'],
      ['XXXL', '110-118','52',   '64',   '77'],
    ]
  },
  bottom: {
    title: '하의 사이즈 가이드',
    headers: ['사이즈(인치)', '허리둘레(cm)', '엉덩이(cm)', '허벅지(cm)', '총장(cm)'],
    rows: [
      ['26', '66-68',  '86-88',  '52', '97'],
      ['28', '70-72',  '90-92',  '54', '98'],
      ['30', '74-76',  '94-96',  '56', '99'],
      ['32', '80-82',  '98-100', '58', '100'],
      ['34', '86-88',  '102-104','60', '101'],
      ['36', '92-94',  '106-108','62', '102'],
      ['38', '98-100', '110-112','64', '103'],
      ['40↑', '103↑',  '115↑',   '66', '104'],
    ]
  },
  chest: {
    title: '근무복·작업복 사이즈 가이드 (겹점퍼/홑점퍼/긴팔티셔츠/조끼 공통)',
    headers: ['사이즈', '가슴둘레 기준(cm)'],
    rows: [
      ['80',  '76~80'],
      ['85',  '81~85'],
      ['90',  '86~90'],
      ['95',  '91~95'],
      ['100', '96~100'],
      ['105', '101~105'],
      ['110', '106~110'],
      ['115', '111~115'],
      ['120', '116~120'],
      ['125', '121~125'],
      ['130', '126~130'],
      ['135', '131~135'],
      ['140', '136~140'],
    ]
  }
};

document.querySelectorAll('.size-guide-link').forEach(function(link) {
  link.addEventListener('click', function() {
    var type  = this.dataset.type;
    var guide = SIZE_GUIDE[type];
    if (!guide) return;

    document.getElementById('modalTitle').textContent = guide.title;
    document.getElementById('modalBody').innerHTML =
      '<div class="size-guide-note">' +
        '<i class="fa-solid fa-circle-info"></i>' +
        ' 신체 사이즈를 기준으로 선택하세요. 여유있는 착용을 원하시면 한 사이즈 큰 것을 권장합니다.' +
      '</div>' +
      '<div class="table-wrap">' +
      '<table class="data-table size-guide-table">' +
        '<thead><tr>' +
          guide.headers.map(function(h) { return '<th>' + h + '</th>'; }).join('') +
        '</tr></thead>' +
        '<tbody>' +
          guide.rows.map(function(row) {
            return '<tr>' +
              row.map(function(cell, i) {
                return i === 0
                  ? '<td><strong style="color:#004C98">' + cell + '</strong></td>'
                  : '<td>' + cell + '</td>';
              }).join('') +
            '</tr>';
          }).join('') +
        '</tbody>' +
      '</table></div>';

    openModal('sizeModal');
  });
});

document.getElementById('modalClose') &&
  document.getElementById('modalClose').addEventListener('click', function() {
    closeModal('sizeModal');
  });

/* ============================================================
   폼 유효성 검사 + 제출
============================================================ */
var uniformForm = document.getElementById('uniformForm');
uniformForm && uniformForm.addEventListener('submit', function(e) {
  e.preventDefault();

  var errors = [];

  var phone = this.elements['phone'];
  if (!phone || !phone.value.trim()) {
    errors.push('연락처를 입력해 주세요.');
  } else if (!/^01[0-9]-?\d{3,4}-?\d{4}$/.test(phone.value.replace(/-/g, ''))) {
    errors.push('연락처 형식이 올바르지 않습니다. (예: 010-1234-5678)');
  }

  var summerTop    = this.elements['summer_top'];
  var summerBottom = this.elements['summer_bottom'];
  if (!summerTop    || !summerTop.value)    errors.push('하복 상의 사이즈를 선택해 주세요.');
  if (!summerBottom || !summerBottom.value) errors.push('하복 하의 사이즈를 선택해 주세요.');

  var winterOuterSize = this.elements['winter_outer_size'];
  var winterPantsSize = this.elements['winter_pants_size'];
  var winterInnerSize = this.elements['winter_inner_size'];
  if (!winterOuterSize || !winterOuterSize.value) errors.push('동계 근무복 사이즈를 선택해 주세요.');
  if (!winterPantsSize || !winterPantsSize.value) errors.push('동계 하의 사이즈를 선택해 주세요.');
  if (!winterInnerSize || !winterInnerSize.value) errors.push('동계 작업복 사이즈를 선택해 주세요.');

  var shoeSize = this.elements['shoe_size'];
  var shoeType = this.elements['shoe_type'];
  var hasShoeSize = shoeSize && shoeSize.value;
  var hasShoeType = shoeType && shoeType.value;
  if (hasShoeSize && !hasShoeType) errors.push('안전화 종류를 선택해 주세요.');
  if (!hasShoeSize && hasShoeType) errors.push('안전화 사이즈를 선택해 주세요.');

  if (errors.length > 0) {
    showValidationError(errors);
    return;
  }

  submitUniformForm(uniformForm);
});

function showValidationError(errors) {
  var old = document.getElementById('validationErrorBox');
  if (old) old.remove();

  var box = document.createElement('div');
  box.id = 'validationErrorBox';
  box.className = 'validation-error-box';
  box.innerHTML =
    '<div class="ve-title"><i class="fa-solid fa-circle-exclamation"></i> 아래 항목을 확인해 주세요</div>' +
    '<ul>' + errors.map(function(e) { return '<li>' + e + '</li>'; }).join('') + '</ul>';

  var actions = document.querySelector('.form-actions');
  actions && actions.insertAdjacentElement('beforebegin', box);
  box.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function submitUniformForm(form) {
  var old = document.getElementById('validationErrorBox');
  if (old) old.remove();

  /* 실제 API 연동 시 여기에 fetch/supabase 로직 추가 */
  /*
  var data = {
    summer_top: form.elements['summer_top'].value,
    summer_bottom: form.elements['summer_bottom'].value,
    winter_outer_type: form.elements['winter_outer_type'].value,
    winter_outer_size: form.elements['winter_outer_size'].value,
    winter_pants_size: form.elements['winter_pants_size'].value,
    winter_inner_type: form.elements['winter_inner_type'].value,
    winter_inner_size: form.elements['winter_inner_size'].value,
    extra_gyeopjeompeo: form.elements['extra_gyeopjeompeo'].value,
    extra_hotjeompeo:   form.elements['extra_hotjeompeo'].value,
    extra_pants:        form.elements['extra_pants'].value,
    extra_tshirt:       form.elements['extra_tshirt'].value,
    extra_vest:         form.elements['extra_vest'].value,
    shoe_size: form.elements['shoe_size'].value,
    shoe_type: form.elements['shoe_type'].value,
    phone:     form.elements['phone'].value,
    remark:    form.elements['remark'].value,
  };
  */

  openModal('successModal');
}

document.getElementById('successClose') &&
  document.getElementById('successClose').addEventListener('click', function() {
    closeModal('successModal');
    document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
    document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
    var histBtn   = document.querySelector('[data-tab="uniform-history"]');
    var histPanel = document.getElementById('tab-uniform-history');
    if (histBtn)   histBtn.classList.add('active');
    if (histPanel) histPanel.classList.add('active');
  });

/* ============================================================
   모달 공통 유틸
============================================================ */
function openModal(id) {
  var m = document.getElementById(id);
  if (!m) return;
  m.style.display = 'flex';
  setTimeout(function() { m.classList.add('active'); }, 10);
}
function closeModal(id) {
  var m = document.getElementById(id);
  if (!m) return;
  m.classList.remove('active');
  setTimeout(function() { m.style.display = 'none'; }, 300);
}
document.querySelectorAll('.modal-overlay').forEach(function(overlay) {
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeModal(overlay.id);
  });
});
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(function(m) { closeModal(m.id); });
  }
});

/* ============================================================
   연락처 자동 하이픈
============================================================ */
var phoneInput = document.querySelector('input[name="phone"]');
phoneInput && phoneInput.addEventListener('input', function() {
  var v = this.value.replace(/\D/g, '').substring(0, 11);
  if (v.length < 4)       this.value = v;
  else if (v.length < 8)  this.value = v.slice(0,3) + '-' + v.slice(3);
  else                    this.value = v.slice(0,3) + '-' + v.slice(3,7) + '-' + v.slice(7);
});

/* ============================================================
   신청 이력 → 엑셀 다운로드 (SheetJS)
============================================================ */
var exportHistoryBtn = document.getElementById('exportHistoryBtn');
exportHistoryBtn && exportHistoryBtn.addEventListener('click', function() {
  var table = document.getElementById('historyTable');
  if (!table || typeof XLSX === 'undefined') return;
  var wb = XLSX.utils.book_new();
  var ws = XLSX.utils.table_to_sheet(table);
  XLSX.utils.book_append_sheet(wb, ws, '근무복 신청이력');
  XLSX.writeFile(wb, '근무복_신청이력_' + new Date().toISOString().slice(0,10) + '.xlsx');
});

/* ============================================================
   부서 일괄 업로드 (엑셀 파싱 → 미리보기 → 일괄 등록)
============================================================ */
(function () {
  var dropZone    = document.getElementById('bulkDropZone');
  var fileInput   = document.getElementById('bulkFileInput');
  var previewWrap = document.getElementById('bulkPreviewWrap');
  var previewBody = document.getElementById('bulkPreviewBody');
  var countEl     = document.getElementById('bulkCount');
  var cancelBtn   = document.getElementById('bulkCancelBtn');
  var submitBtn   = document.getElementById('bulkSubmitBtn');
  var templateBtn = document.getElementById('downloadTemplateBtn');

  if (!dropZone || typeof XLSX === 'undefined') return;

  var bulkRows = [];

  var TEMPLATE_HEADERS = ['소속','세부소속','성명','연락처','겹점퍼사이즈','홑점퍼사이즈','하의사이즈','긴팔티셔츠사이즈','조끼사이즈','겹점퍼추가수량','홑점퍼추가수량','하의추가수량','긴팔티셔츠추가수량','조끼추가수량','비고'];
  var TEMPLATE_SAMPLE  = ['엔진생산2팀','생산직','홍길동','010-1234-5678',105,'',30,105,'',0,0,0,0,0,''];

  templateBtn && templateBtn.addEventListener('click', function (e) {
    e.preventDefault();
    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, TEMPLATE_SAMPLE]);
    XLSX.utils.book_append_sheet(wb, ws, '일괄신청양식');
    XLSX.writeFile(wb, '근무복_일괄신청_양식.xlsx');
  });

  dropZone.addEventListener('click', function () { fileInput.click(); });
  fileInput.addEventListener('change', function () {
    if (this.files && this.files[0]) handleFile(this.files[0]);
  });
  ['dragover', 'dragenter'].forEach(function (evt) {
    dropZone.addEventListener(evt, function (e) { e.preventDefault(); dropZone.classList.add('dragover'); });
  });
  ['dragleave', 'drop'].forEach(function (evt) {
    dropZone.addEventListener(evt, function (e) { e.preventDefault(); dropZone.classList.remove('dragover'); });
  });
  dropZone.addEventListener('drop', function (e) {
    e.preventDefault();
    var file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  function handleFile(file) {
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var data = new Uint8Array(e.target.result);
        var wb = XLSX.read(data, { type: 'array' });
        var sheet = wb.Sheets[wb.SheetNames[0]];
        var rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        bulkRows = rows;
        renderPreview(rows);
      } catch (err) {
        alert('엑셀 파일을 읽는 중 오류가 발생했습니다. 양식을 확인해 주세요.');
        console.error(err);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function renderPreview(rows) {
    if (!rows.length) { alert('업로드한 파일에 데이터가 없습니다.'); return; }
    countEl.textContent = rows.length;
    previewBody.innerHTML = rows.map(function (r) {
      return '<tr>' +
        '<td>' + (r['소속'] || '') + '</td>' +
        '<td>' + (r['세부소속'] || '') + '</td>' +
        '<td>' + (r['성명'] || '') + '</td>' +
        '<td>' + (r['겹점퍼사이즈'] || '-') + '</td>' +
        '<td>' + (r['홑점퍼사이즈'] || '-') + '</td>' +
        '<td>' + (r['하의사이즈'] || '-') + '</td>' +
        '<td>' + (r['긴팔티셔츠사이즈'] || '-') + '</td>' +
        '<td>' + (r['조끼사이즈'] || '-') + '</td>' +
        '<td>' + (r['비고'] || '') + '</td>' +
      '</tr>';
    }).join('');
    previewWrap.style.display = 'block';
    previewWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  cancelBtn && cancelBtn.addEventListener('click', function () {
    bulkRows = [];
    previewWrap.style.display = 'none';
    fileInput.value = '';
  });

  submitBtn && submitBtn.addEventListener('click', function () {
    if (!bulkRows.length) return;
    /* 실제 API 연동 시 bulkRows 배열을 서버/Supabase로 일괄 전송 */
    alert(bulkRows.length + '건의 신청이 일괄 등록되었습니다.');
    bulkRows = [];
    previewWrap.style.display = 'none';
    fileInput.value = '';
  });
})();
/* ============================================================
   사이드바 — 실시간 신청 활동 피드 (데모용)
============================================================ */
/* ============================================================
   캘린더 타임라인 + 진행률 바 애니메이션
============================================================ */
(function initCalendarTimeline() {
  var points = document.querySelectorAll('#ctPoints .ct-point');
  var progress = document.getElementById('ctProgress');
  if (!points.length || !progress) return;

  var today = new Date();
  var dates = Array.prototype.map.call(points, function (p) { return new Date(p.dataset.date); });
  var start = dates[0];
  var end   = dates[dates.length - 1];

  var pct = ((today - start) / (end - start)) * 100;
  pct = Math.max(0, Math.min(100, pct));
  progress.style.width = pct + '%';

  points.forEach(function (p, i) {
    p.classList.remove('done', 'active');
    if (today >= dates[i]) {
      var isLastPassed = !dates[i + 1] || today < dates[i + 1];
      p.classList.add(isLastPassed ? 'active' : 'done');
    }
  });
})();

(function initProgressBars() {
  document.querySelectorAll('.progress-bar-fill[data-target]').forEach(function (bar) {
    var target = bar.dataset.target;
    setTimeout(function () { bar.style.width = target + '%'; }, 200);
  });
})();

(function initActivityFeed() {
  var feed = document.getElementById('activityFeed');
  if (!feed) return;
  var NAMES = ['김*준', '이*영', '박*수', '최*은', '정*호', '한*미', '윤*진', '강*혁'];
  var ITEMS = ['동계 근무복', '하계 근무복', '안전화'];
  var entries = [];

  function addEntry() {
    var name = NAMES[Math.floor(Math.random() * NAMES.length)];
    var item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    var li = document.createElement('li');
    li.innerHTML = '<span class="af-dot"></span><div>' + name + '님이 <strong>' + item + '</strong> 신청을 완료했습니다.<span class="af-time">방금 전</span></div>';
    feed.insertBefore(li, feed.firstChild);
    entries.unshift(li);
    if (entries.length > 5) {
      var old = entries.pop();
      old.remove();
    }
  }

  addEntry(); addEntry(); addEntry();
  setInterval(addEntry, 6000);
})();
/* ============================================================
   welfare.js v9 — employee_points(dept_name/work_location) 연동
============================================================ */
'use strict';

var STATE = {
  currentRole  : 'employee',
  isAdminAuth  : false,
  adminPIN     : '1234',
  uploadedData : [],
  lastErrors   : []
};

var CURRENT_USER = {
  empId: '', name: '', dept: '', loc: '',
  totalPt: 0, prevYearPt: 0
};

var DEADLINE   = '2025-09-23';
var CARD_RATES = { lotte: 0.02, shinsegae: 0.02, daedong: 0.035, hyundai: 0 };
var CARD_NAMES = { lotte: '롯데', shinsegae: '신세계', daedong: '대동', hyundai: '현대' };

var EMP = {
  totalPt: 0, applyPt: 0, carryPt: 0,
  bonusRate: 0, bonusPt: 0, payoutPt: 0,
  confirmPt: 0, cardType: null, isValid: false
};

/* ── 포인트 목록 캐시 ── */
var POINT_LIST = [];

/* ============================================================
   초기화
============================================================ */
window.addEventListener('load', function () {
  calcDeadlineDday();
  initEmpForm();
  initUpload();
  initAdminSection();
  initAdminFilters();
  initAdminModal();
});

function calcDeadlineDday() {
  var d    = new Date(DEADLINE);
  var now  = new Date();
  var diff = Math.ceil((d - now) / 86400000);
  var txt  = diff > 0 ? 'D-' + diff : diff === 0 ? 'D-Day' : '마감';
  el('heroDeadlineDday') && (el('heroDeadlineDday').textContent = txt);
  el('empDeadline')      && (el('empDeadline').textContent = DEADLINE.replace(/-/g, '.'));
  el('mgrDeadline')      && (el('mgrDeadline').textContent = DEADLINE.replace(/-/g, '.'));
}

/* ============================================================
   역할 전환
============================================================ */
window.switchRole = function (role) {
  if (role === 'admin' && !STATE.isAdminAuth) {
    el('adminPinInput') && (el('adminPinInput').value = '');
    el('adminPinError') && (el('adminPinError').style.display = 'none');
    openModal('adminAuthModal');
    return;
  }
  applyRole(role);
};

function applyRole(role) {
  STATE.currentRole = role;
  qsa('.role-btn').forEach(function (b) { b.classList.remove('active'); });
  qsa('.role-view').forEach(function (v) { v.classList.remove('active'); });
  var btnMap  = { employee: 'roleEmployee', manager: 'roleManager', admin: 'roleAdmin' };
  var viewMap = { employee: 'view-employee', manager: 'view-manager', admin: 'view-admin' };
  var btn  = el(btnMap[role]);
  var view = el(viewMap[role]);
  btn  && btn.classList.add('active');
  view && view.classList.add('active');
  if (role === 'admin') renderAdminView();
}

/* ============================================================
   관리자 PIN 모달
============================================================ */
function initAdminModal() {
  el('adminPinConfirm') && el('adminPinConfirm').addEventListener('click', function () {
    var pin = el('adminPinInput') ? el('adminPinInput').value : '';
    if (pin === STATE.adminPIN) {
      STATE.isAdminAuth = true;
      closeModal('adminAuthModal');
      applyRole('admin');
      showToast('관리자 인증 완료!', 'success');
    } else {
      el('adminPinError') && (el('adminPinError').style.display = 'block');
      el('adminPinInput') && el('adminPinInput').select();
    }
  });
  el('adminPinInput') && el('adminPinInput').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') el('adminPinConfirm') && el('adminPinConfirm').click();
  });
  el('adminAuthClose')  && el('adminAuthClose').addEventListener('click',  function () { closeModal('adminAuthModal'); });
  el('adminAuthCancel') && el('adminAuthCancel').addEventListener('click', function () { closeModal('adminAuthModal'); });
  el('adminLogoutBtn')  && el('adminLogoutBtn').addEventListener('click',  function () {
    STATE.isAdminAuth = false;
    applyRole('employee');
    showToast('관리자 로그아웃되었습니다.', 'info');
  });
}

/* ============================================================
   개인 신청 폼
============================================================ */
function initEmpForm() {
  el('applyAllBtn') && el('applyAllBtn').addEventListener('click', function () {
    var inp = el('applyPtInput');
    if (inp) { inp.value = EMP.totalPt; calcPoints(EMP.totalPt); }
  });

  el('applyPtInput') && el('applyPtInput').addEventListener('input', function () {
    var v = parseInt(this.value) || 0;
    if (v > EMP.totalPt) { v = EMP.totalPt; this.value = v; }
    calcPoints(v);
  });

  qsa('input[name="cardType"]').forEach(function (r) {
    r.addEventListener('change', function () {
      EMP.cardType  = this.value;
      EMP.bonusRate = parseFloat(this.dataset.rate) || 0;
      calcBonus(); updateDenomHint(); validate();
    });
  });

  qsa('.gc-qty-input').forEach(function (i) { i.addEventListener('input', onQtyChange); });

  el('autoFillBtn') && el('autoFillBtn').addEventListener('click', function () {
    if (!EMP.cardType) { showToast('먼저 상품권 종류를 선택해 주세요.', 'warning'); return; }
    if (!EMP.applyPt)  { showToast('먼저 신청 포인트를 입력해 주세요.', 'warning'); return; }
    autoFill(EMP.payoutPt);
    showToast('자동 구성 완료! 실지급 금액(' + fmtW(EMP.payoutPt) + ') 기준으로 배분했습니다.', 'info');
  });

  el('saveDraftBtn') && el('saveDraftBtn').addEventListener('click', function () {
    showToast('임시저장 완료!', 'info');
  });

  var form = el('empGiftForm');
  form && form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!EMP.isValid) return;
    showEmpConfirmModal();
  });

  el('gcConfirmClose')  && el('gcConfirmClose').addEventListener('click',  function () { closeModal('gcConfirmModal'); });
  el('gcConfirmCancel') && el('gcConfirmCancel').addEventListener('click', function () { closeModal('gcConfirmModal'); });
  el('gcConfirmSubmit') && el('gcConfirmSubmit').addEventListener('click', submitEmpForm);
  el('successOkBtn')    && el('successOkBtn').addEventListener('click',    function () { closeModal('successModal'); });
}

function calcPoints(raw) {
  EMP.applyPt = raw - (raw % 5000);
  EMP.carryPt = raw % 5000;
  setText('formApplyPt', fmtP(EMP.applyPt));
  setText('formCarryPt', fmtP(EMP.carryPt));
  calcBonus(); updateDenomHint(); validate();
}

function calcBonus() {
  if (!EMP.cardType || !EMP.applyPt) {
    EMP.bonusPt = 0; EMP.payoutPt = EMP.applyPt || 0;
    el('calcResult') && (el('calcResult').style.display = 'none');
    return;
  }
  EMP.bonusPt  = Math.floor(EMP.applyPt * EMP.bonusRate);
  EMP.payoutPt = EMP.applyPt + EMP.bonusPt;
  var res = el('calcResult');
  if (res) {
    res.style.display = 'block';
    setText('calcBase',    fmtW(EMP.applyPt));
    setText('calcBonus',   '+ ' + fmtW(EMP.bonusPt));
    setText('calcTotal',   fmtW(EMP.payoutPt));
    setText('calcRateTxt', '(' + (EMP.bonusRate * 100).toFixed(1) + '%)');
  }
}

function updateDenomHint() {
  var hintEl = el('denomHint');
  if (!hintEl) return;
  if (!EMP.cardType || !EMP.applyPt) {
    hintEl.innerHTML = '⚠️ 신청 포인트와 상품권 종류를 먼저 선택해 주세요.';
    hintEl.style.cssText += 'border-color:#e2e8f0;background:#f8fafc;color:#94a3b8;';
    return;
  }
  hintEl.style.cssText += 'border-color:#86efac;background:#f0fdf4;color:#374151;';
  hintEl.innerHTML = EMP.bonusRate > 0
    ? '📌 권종 수량 합계가 <strong style="color:#16a34a;font-size:1rem">' + fmtW(EMP.payoutPt) + '</strong> 이 되도록 입력해주세요.<br>' +
      '<span style="color:#64748b;font-size:.8rem">신청 ' + fmtW(EMP.applyPt) + ' + 추가지급 ' + fmtW(EMP.bonusPt) + ' (' + (EMP.bonusRate * 100).toFixed(1) + '%) = 실지급 ' + fmtW(EMP.payoutPt) + '</span>'
    : '📌 권종 수량 합계가 <strong style="color:#2563eb;font-size:1rem">' + fmtW(EMP.payoutPt) + '</strong> 이 되도록 입력해주세요.';
}

function onQtyChange() {
  var total = 0;
  qsa('.gc-qty-input').forEach(function (inp) {
    var d = parseInt(inp.dataset.denom), q = parseInt(inp.value) || 0;
    total += d * q;
    var sub = el('sub' + d);
    if (sub) sub.textContent = fmtW(d * q);
  });
  EMP.confirmPt = total;
  el('confirmTotal') && (el('confirmTotal').textContent = fmtW(total));
  validate();
}

function autoFill(amount) {
  var denoms = [100000, 50000, 10000, 5000], rem = amount;
  denoms.forEach(function (d) {
    var q = Math.floor(rem / d); rem -= q * d;
    var inp = el('qty' + d), sub = el('sub' + d);
    if (inp) inp.value = q;
    if (sub) sub.textContent = fmtW(q * d);
  });
  EMP.confirmPt = amount - rem;
  el('confirmTotal') && (el('confirmTotal').textContent = fmtW(EMP.confirmPt));
  validate();
}

function validate() {
  var icon = el('matchIcon'), text = el('matchText'), btn = el('gcSubmitBtn');
  if (!EMP.cardType || !EMP.applyPt) {
    if (icon) { icon.textContent = '⬜'; icon.className = 'gc-match-icon'; }
    if (text) text.textContent = '포인트와 상품권 종류를 선택 후 수량을 입력해 주세요.';
    if (btn)  btn.disabled = true;
    EMP.isValid = false; return;
  }
  var ok = (EMP.confirmPt === EMP.payoutPt);
  EMP.isValid = ok;
  if (ok) {
    if (icon) { icon.textContent = '✅'; icon.className = 'gc-match-icon ok'; }
    if (text) text.innerHTML = '일치 확인 완료 ✔ &nbsp;|&nbsp; 신청 <strong>' + fmtW(EMP.applyPt) + '</strong>' +
      (EMP.bonusPt > 0 ? ' + 추가 <strong style="color:#16a34a">' + fmtW(EMP.bonusPt) + '</strong>' : '') +
      ' = 권종합계 <strong style="color:#2563eb">' + fmtW(EMP.confirmPt) + '</strong>';
    if (btn) btn.disabled = false;
  } else {
    if (icon) { icon.textContent = '❌'; icon.className = 'gc-match-icon ng'; }
    var diff = EMP.payoutPt - EMP.confirmPt;
    if (text) text.innerHTML = '불일치 &nbsp;|&nbsp; 필요: <strong style="color:#16a34a">' + fmtW(EMP.payoutPt) + '</strong>' +
      ' / 현재: <strong style="color:#dc2626">' + fmtW(EMP.confirmPt) + '</strong>' +
      (diff > 0 ? ' &nbsp;→ <span style="color:#d97706">아직 <b>' + fmtW(diff) + '</b> 부족</span>'
                : ' &nbsp;→ <span style="color:#dc2626"><b>' + fmtW(Math.abs(diff)) + '</b> 초과</span>');
    if (btn) btn.disabled = true;
  }
}

function showEmpConfirmModal() {
  var summary = el('gcConfirmSummary');
  if (summary) {
    var rows = [
      ['상품권 종류',               CARD_NAMES[EMP.cardType] || EMP.cardType],
      ['신청 포인트 (차감)',         fmtW(EMP.applyPt)],
      ['추가 지급액 (' + (EMP.bonusRate * 100).toFixed(1) + '%)', '+ ' + fmtW(EMP.bonusPt)],
      ['실지급 상품권 금액',         '<strong style="color:#2563eb;font-size:1.1rem">' + fmtW(EMP.payoutPt) + '</strong>'],
      ['이월 포인트 (5천원 미만)',   fmtW(EMP.carryPt)]
    ];
    summary.innerHTML = '<table class="gc-confirm-table">' +
      rows.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>'; }).join('') +
      '</table>';
  }
  openModal('gcConfirmModal');
}

function submitEmpForm() {
  closeModal('gcConfirmModal');
  el('successDetail') && (el('successDetail').innerHTML =
    '📦 ' + (CARD_NAMES[EMP.cardType] || '') + ' 상품권<br>' +
    '💰 신청: ' + fmtW(EMP.applyPt) + ' → 실지급: <strong style="color:#16a34a">' + fmtW(EMP.payoutPt) + '</strong>');
  setText('successTitle', '신청 완료! 🎉');
  setText('successDesc',  '상품권 전환 신청이 접수되었습니다.\n총무팀 처리 후 지급 예정입니다.');
  openModal('successModal');
  var st = el('empStatus');
  if (st) { st.textContent = '신청완료'; st.style.color = '#16a34a'; }
}

/* ============================================================
   부서담당자: 엑셀 업로드
============================================================ */
var uploadedFile = null;

function initUpload() {
  var drop = el('uploadDrop'), fileInp = el('excelFile');
  drop && drop.addEventListener('dragover',  function (e) { e.preventDefault(); drop.classList.add('drag-over'); });
  drop && drop.addEventListener('dragleave', function ()  { drop.classList.remove('drag-over'); });
  drop && drop.addEventListener('drop', function (e) {
    e.preventDefault(); drop.classList.remove('drag-over');
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  });
  fileInp && fileInp.addEventListener('change', function (e) {
    if (e.target.files[0]) handleFile(e.target.files[0]);
  });
  el('removeFileBtn')   && el('removeFileBtn').addEventListener('click',   resetFile);
  el('uploadStartBtn')  && el('uploadStartBtn').addEventListener('click',  startUpload);
  el('templateDownBtn') && el('templateDownBtn').addEventListener('click', function (e) {
    e.preventDefault(); showToast('양식 다운로드는 서버 연동 후 활성화됩니다.', 'info');
  });
  el('errorModalClose') && el('errorModalClose').addEventListener('click', function () { closeModal('uploadErrorModal'); });
  el('errorModalOk')    && el('errorModalOk').addEventListener('click',    function () { closeModal('uploadErrorModal'); });
  el('errorExcelDlBtn') && el('errorExcelDlBtn').addEventListener('click', function () {
    showToast('오류 목록 다운로드는 서버 연동 후 활성화됩니다.', 'info');
  });
}

function handleFile(file) {
  var ext = file.name.split('.').pop().toLowerCase();
  if (ext !== 'xlsx' && ext !== 'xls') { showToast('엑셀 파일(.xlsx/.xls)만 업로드 가능합니다.', 'error'); return; }
  if (file.size > 10 * 1024 * 1024)   { showToast('파일 크기는 10MB 이하여야 합니다.', 'error'); return; }
  uploadedFile = file;
  setText('fileName', file.name);
  setText('fileSize', (file.size / 1024).toFixed(1) + ' KB');
  el('filePreview') && (el('filePreview').style.display = 'block');
}

function resetFile() {
  uploadedFile = null;
  var fi = el('excelFile'); if (fi) fi.value = '';
  el('filePreview')  && (el('filePreview').style.display  = 'none');
  el('uploadStats')  && (el('uploadStats').style.display  = 'none');
  el('progressWrap') && (el('progressWrap').style.display = 'none');
}

function startUpload() {
  if (!uploadedFile) return;
  if (typeof XLSX === 'undefined') { showToast('엑셀 파싱 라이브러리 로딩 중...', 'warning'); return; }
  var pw = el('progressWrap'), pf = el('progressFill'), pt = el('progressText');
  if (pw) pw.style.display = 'flex';
  var pct = 0, timer = setInterval(function () {
    pct = Math.min(pct + 5, 85);
    if (pf) pf.style.width = pct + '%';
    if (pt) pt.textContent = pct + '%';
  }, 60);
  var reader = new FileReader();
  reader.onload = function (e) {
    try {
      var data = new Uint8Array(e.target.result);
      var wb   = XLSX.read(data, { type: 'array' });
      var sheetName = wb.SheetNames.indexOf('종합') >= 0 ? '종합' : wb.SheetNames[0];
      var ws   = wb.Sheets[sheetName];
      var json = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      clearInterval(timer);
      if (pf) pf.style.width = '100%';
      if (pt) pt.textContent = '100%';
      setTimeout(function () {
        if (pw) pw.style.display = 'none';
        processExcelData(json, uploadedFile.name);
      }, 300);
    } catch (err) {
      clearInterval(timer);
      if (pw) pw.style.display = 'none';
      showToast('엑셀 파일 읽기 오류: ' + err.message, 'error');
    }
  };
  reader.readAsArrayBuffer(uploadedFile);
}

function processExcelData(rows, filename) {
  var headerIdx = -1;
  for (var i = 0; i < Math.min(rows.length, 10); i++) {
    for (var j = 0; j < rows[i].length; j++) {
      if (String(rows[i][j]).indexOf('사번') >= 0 || String(rows[i][j]).indexOf('근무지') >= 0) {
        headerIdx = i; break;
      }
    }
    if (headerIdx >= 0) break;
  }
  if (headerIdx < 0) { showToast('헤더를 찾을 수 없습니다.', 'error'); return; }

  var headers = rows[headerIdx].map(function (h) { return String(h).replace(/\n/g, '').replace(/\s/g, ''); });
  function colIdx(kw) {
    for (var k = 0; k < headers.length; k++) { if (headers[k].indexOf(kw) >= 0) return k; }
    return -1;
  }
  var COL = {
    loc: colIdx('근무지'), dept: colIdx('부서'), ban: colIdx('반'),
    empId: colIdx('사번'), name: colIdx('성명'),
    total: colIdx('보유'), apply: colIdx('신청대상'), prev: colIdx('24년'),
    card: colIdx('상품권종류'),
    d10: colIdx('10만'), d5: colIdx('5만'), d1: colIdx('1만'), d05: colIdx('5천')
  };

  var results = [], errors = [], rowNum = headerIdx + 2;
  for (var r = headerIdx + 1; r < rows.length; r++, rowNum++) {
    var row = rows[r];
    if (!row || row.every(function (c) { return !c || String(c).trim() === ''; })) continue;

    var empId   = String(row[COL.empId] || '').trim();
    var name    = String(row[COL.name]  || '').trim();
    var applyPt = parseInt(row[COL.apply]) || 0;
    var d10     = parseInt(row[COL.d10])   || 0;
    var d5      = parseInt(row[COL.d5])    || 0;
    var d1      = parseInt(row[COL.d1])    || 0;
    var d05     = parseInt(row[COL.d05])   || 0;
    var cardRaw = String(row[COL.card] || '').trim();

    if (!empId || empId === '사번') continue;

    if (applyPt === 0) {
      results.push({
        rowNum: rowNum, loc: String(row[COL.loc]||'').trim(),
        dept: String(row[COL.dept]||'').trim(), ban: String(row[COL.ban]||'').trim(),
        empId: empId, name: name, total: parseInt(row[COL.total])||0,
        apply: 0, prev: parseInt(row[COL.prev])||0, card: '-',
        d10:0, d5:0, d1:0, d05:0, payout:0, rate:0, bonus:0,
        status: '미신청', error: ''
      });
      continue;
    }

    var rowErrors = [];
    var cardKey   = null;
    var cardMap   = { '롯데':'lotte', '신세계':'shinsegae', '대동':'daedong', '현대':'hyundai' };
    Object.keys(cardMap).forEach(function (k) { if (cardRaw.indexOf(k) >= 0) cardKey = cardMap[k]; });
    if (!cardKey) rowErrors.push('상품권 종류 오류 (' + (cardRaw || '없음') + ')');

    var rate   = cardKey ? CARD_RATES[cardKey] : 0;
    var bonus  = Math.floor(applyPt * rate);
    var payout = applyPt + bonus;
    var calcSum = d10*100000 + d5*50000 + d1*10000 + d05*5000;
    if (calcSum > 0 && payout !== calcSum) {
      rowErrors.push('권종합계 불일치 (실지급: ' + fmtNum(payout) + '원 / 권종합계: ' + fmtNum(calcSum) + '원)');
    }

    var rec = {
      rowNum: rowNum, loc: String(row[COL.loc]||'').trim(),
      dept: String(row[COL.dept]||'').trim(), ban: String(row[COL.ban]||'').trim(),
      empId: empId, name: name, total: parseInt(row[COL.total])||0,
      apply: applyPt, prev: parseInt(row[COL.prev])||0,
      card: cardRaw, d10:d10, d5:d5, d1:d1, d05:d05,
      payout: payout, rate: rate, bonus: bonus,
      status: rowErrors.length > 0 ? '오류' : '신청완료',
      error: rowErrors.join(' | ')
    };
    if (rowErrors.length > 0) errors.push({ row: rowNum, empId: empId, name: name, reason: rowErrors.join(' | ') });
    results.push(rec);
  }

  STATE.uploadedData = results;
  STATE.lastErrors   = errors;

  var successCnt = results.filter(function (r) { return r.status === '신청완료'; }).length;
  setText('statTotal',   results.length + '');
  setText('statSuccess', successCnt + '');
  setText('statError',   errors.length + '');
  el('uploadStats') && (el('uploadStats').style.display = 'grid');
  bindErrorCardClick(errors, successCnt);
  addUploadHistory(filename, results.length, successCnt, errors.length);
  if (errors.length > 0) showErrorPopup(errors, successCnt);
  else showToast('전체 ' + results.length + '건 중 ' + successCnt + '건 처리 완료!', 'success');
  if (STATE.isAdminAuth && STATE.currentRole === 'admin') renderAdminView();
}

function bindErrorCardClick(errors, successCnt) {
  var oldCard = document.querySelector('#uploadStats .gc-stat-card.warning');
  if (!oldCard) return;
  var newCard = oldCard.cloneNode(true);
  oldCard.parentNode.replaceChild(newCard, oldCard);
  if (errors.length > 0) {
    newCard.style.cursor = 'pointer';
    var hint = document.createElement('div');
    hint.style.cssText = 'font-size:.7rem;color:#ca8a04;font-weight:700;margin-top:6px;text-align:center;';
    hint.textContent = '▶ 클릭하여 오류 내역 확인';
    newCard.appendChild(hint);
    newCard.addEventListener('click', function () { showErrorPopup(STATE.lastErrors, successCnt); });
  }
}

function showErrorPopup(errors, successCnt) {
  var tbody = el('errorTableBody');
  if (tbody) {
    tbody.innerHTML = errors.map(function (e) {
      return '<tr style="background:#fef2f2">' +
        '<td style="text-align:center;font-weight:700">' + e.row + '행</td>' +
        '<td style="text-align:center">' + e.empId + '</td>' +
        '<td style="text-align:center;font-weight:700">' + e.name + '</td>' +
        '<td style="color:#dc2626">⚠️ ' + e.reason + '</td></tr>';
    }).join('');
  }
  var desc = el('errorModalDesc');
  if (desc) desc.innerHTML = '아래 오류 행은 처리되지 않았습니다. 수정 후 재업로드해 주세요.<br>' +
    '<span style="color:#16a34a;font-weight:700">✅ 정상: ' + successCnt + '건</span> &nbsp;|&nbsp; ' +
    '<span style="color:#dc2626;font-weight:700">❌ 오류: ' + errors.length + '건</span>';
  openModal('uploadErrorModal');
}

function addUploadHistory(filename, total, success, errCnt) {
  var tbody = el('uploadHistoryBody');
  if (!tbody) return;
  var empty = tbody.querySelector('.gc-empty-row');
  if (empty) tbody.innerHTML = '';
  var errorSnapshot = STATE.lastErrors.slice(), successSnapshot = success;
  var now = new Date().toLocaleString('ko-KR');
  var statusHtml = errCnt > 0
    ? '<span class="history-error-btn" style="color:#d97706;font-weight:700;cursor:pointer;text-decoration:underline;">⚠️ 오류있음 (' + errCnt + '건)</span>'
    : '<span style="color:#16a34a;font-weight:700">✅ 완료</span>';
  var tr = document.createElement('tr');
  tr.innerHTML = '<td>' + now + '</td>' +
    '<td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + filename + '">' + filename + '</td>' +
    '<td>총무팀</td><td style="text-align:center">' + total + '</td>' +
    '<td style="text-align:center;color:#16a34a;font-weight:700">' + success + '</td>' +
    '<td style="text-align:center;color:#dc2626;font-weight:700">' + errCnt + '</td>' +
    '<td>' + statusHtml + '</td>';
  tbody.insertAdjacentElement('afterbegin', tr);
  var errorBtn = tr.querySelector('.history-error-btn');
  if (errorBtn) {
    (function (errs, succ) {
      errorBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        STATE.lastErrors = errs;
        showErrorPopup(errs, succ);
      });
    })(errorSnapshot, successSnapshot);
  }
}

/* ============================================================
   ★ 총무팀 관리자 — 포인트 등록/수정 (Supabase 연동)
   컬럼명: dept_name / work_location (통일)
============================================================ */
function initAdminSection() {
  el('openPointRegBtn') && el('openPointRegBtn').addEventListener('click', function () {
    openModal('pointRegModal');
    loadPointList();
  });
  el('pointRegModalClose')  && el('pointRegModalClose').addEventListener('click',  function () { closeModal('pointRegModal'); });
  el('pointRegModalCancel') && el('pointRegModalCancel').addEventListener('click', function () { closeModal('pointRegModal'); });
  el('pointRegSaveBtn')     && el('pointRegSaveBtn').addEventListener('click',     savePoint);
  el('pointExcelFile')      && el('pointExcelFile').addEventListener('change', function (e) {
    if (e.target.files[0]) importPointExcel(e.target.files[0]);
  });
  el('pointSearchInput') && el('pointSearchInput').addEventListener('input', function () {
    filterPointList(this.value);
  });
}

/* ★ Supabase에서 포인트 목록 불러오기 */
async function loadPointList() {
  var tbody = el('pointListBody');
  if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;color:#94a3b8;">불러오는 중...</td></tr>';

  try {
    var client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    var { data, error } = await client
      .from('employee_points')
      .select('emp_id, emp_name, dept_name, work_location, total_points, used_points, prev_year_points')
      .order('emp_id');

    if (error) throw error;

    POINT_LIST = (data || []).map(function (r) {
      return {
        empId: r.emp_id,
        name : r.emp_name         || '',
        dept : r.dept_name        || '',
        loc  : r.work_location    || '',
        total: r.total_points     || 0,
        used : r.used_points      || 0,
        prev : r.prev_year_points || 0,
        avail: (r.total_points || 0) - (r.used_points || 0)
      };
    });

    renderPointList(POINT_LIST);
    var countEl = el('pointListCount');
    if (countEl) countEl.textContent = POINT_LIST.length;

  } catch (err) {
    console.error('포인트 목록 로드 실패:', err);
    showToast('포인트 목록 불러오기 실패: ' + err.message, 'error');
    if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;color:#dc2626;">불러오기 실패</td></tr>';
  }
}

function filterPointList(keyword) {
  var kw = keyword.trim().toLowerCase();
  if (!kw) { renderPointList(POINT_LIST); return; }
  renderPointList(POINT_LIST.filter(function (r) {
    return r.empId.includes(kw) || r.name.includes(kw) || r.dept.toLowerCase().includes(kw);
  }));
}

function renderPointList(list) {
  var tbody = el('pointListBody');
  if (!tbody) return;
  if (!list || !list.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:#94a3b8;">등록된 포인트 데이터가 없습니다.</td></tr>';
    return;
  }
  tbody.innerHTML = list.map(function (r, i) {
    return '<tr>' +
      '<td style="text-align:center;color:#64748b;font-size:.8rem">' + (i + 1) + '</td>' +
      '<td style="text-align:center;font-size:.82rem">' + r.empId + '</td>' +
      '<td style="text-align:center;font-weight:700">' + r.name + '</td>' +
      '<td style="font-size:.8rem">' + (r.dept || '-') + '</td>' +
      '<td style="text-align:right;font-weight:700;color:#2563eb">' + fmtW(r.total) + '</td>' +
      '<td style="text-align:right;color:#16a34a;font-weight:700">' + fmtW(r.avail) + '</td>' +
      '<td style="text-align:center">' +
        '<button onclick="editPoint(\'' + r.empId + '\')" style="padding:4px 10px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;cursor:pointer;font-size:.78rem;color:#2563eb;font-weight:700;margin-right:4px;">✏️ 수정</button>' +
        '<button onclick="deletePoint(\'' + r.empId + '\')" style="padding:4px 10px;background:#fef2f2;border:1px solid #fecaca;border-radius:6px;cursor:pointer;font-size:.78rem;color:#dc2626;font-weight:700;">🗑️ 삭제</button>' +
      '</td></tr>';
  }).join('');
}

window.editPoint = function (empId) {
  var rec = POINT_LIST.find(function (r) { return r.empId === empId; });
  if (!rec) return;
  setVal('prEmpId',   rec.empId);
  setVal('prEmpName', rec.name);
  setVal('prDept',    rec.dept || '');
  setVal('prLoc',     rec.loc  || '');
  setVal('prTotal',   rec.total || 0);
  setVal('prUsed',    rec.used  || 0);
  setVal('prPrev',    rec.prev  || 0);
  el('pointRegForm') && (el('pointRegForm').dataset.mode = 'edit');
  el('pointRegFormTitle') && (el('pointRegFormTitle').textContent = '✏️ 포인트 수정 — ' + rec.name);
  el('pointRegForm') && el('pointRegForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
};

window.deletePoint = async function (empId) {
  if (!confirm('사번 ' + empId + ' 의 포인트 데이터를 삭제하시겠습니까?')) return;
  try {
    var client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    var { error } = await client.from('employee_points').delete().eq('emp_id', empId);
    if (error) throw error;
    POINT_LIST = POINT_LIST.filter(function (r) { return r.empId !== empId; });
    renderPointList(POINT_LIST);
    var countEl = el('pointListCount');
    if (countEl) countEl.textContent = POINT_LIST.length;
    showToast('삭제되었습니다.', 'info');
  } catch (err) {
    showToast('삭제 실패: ' + err.message, 'error');
  }
};

/* ★ 저장 — dept_name / work_location 컬럼명 사용 */
async function savePoint() {
  var empId = (el('prEmpId')   ? el('prEmpId').value   : '').trim();
  var name  = (el('prEmpName') ? el('prEmpName').value : '').trim();
  var dept  = (el('prDept')    ? el('prDept').value    : '').trim();
  var loc   = (el('prLoc')     ? el('prLoc').value     : '').trim();
  var total = parseInt(el('prTotal') ? el('prTotal').value : 0) || 0;
  var used  = parseInt(el('prUsed')  ? el('prUsed').value  : 0) || 0;
  var prev  = parseInt(el('prPrev')  ? el('prPrev').value  : 0) || 0;

  if (!empId || !name) { showToast('사번과 성명은 필수입니다.', 'error'); return; }
  if (used > total)    { showToast('사용 포인트가 보유 포인트를 초과할 수 없습니다.', 'error'); return; }

  var saveBtn = el('pointRegSaveBtn');
  if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = '저장 중...'; }

  try {
    var client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    /* ★ 컬럼명: dept_name / work_location */
    var { error } = await client
      .from('employee_points')
      .upsert({
        emp_id           : empId,
        emp_name         : name,
        dept_name        : dept,        /* ← dept_name */
        work_location    : loc,         /* ← work_location */
        total_points     : total,
        used_points      : used,
        prev_year_points : prev,
        updated_at       : new Date().toISOString()
      }, { onConflict: 'emp_id' });

    if (error) throw error;

    /* 로컬 캐시 업데이트 */
    var avail    = total - used;
    var existing = POINT_LIST.findIndex(function (r) { return r.empId === empId; });
    var rec = { empId:empId, name:name, dept:dept, loc:loc, total:total, used:used, prev:prev, avail:avail };
    if (existing >= 0) POINT_LIST[existing] = rec;
    else POINT_LIST.push(rec);

    renderPointList(POINT_LIST);
    var countEl = el('pointListCount');
    if (countEl) countEl.textContent = POINT_LIST.length;
    resetPointForm();
    showToast('✅ ' + name + ' 님의 포인트가 DB에 저장되었습니다!', 'success');

  } catch (err) {
    showToast('저장 실패: ' + err.message, 'error');
  } finally {
    if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> 저장'; }
  }
}

function resetPointForm() {
  ['prEmpId','prEmpName','prDept','prLoc','prTotal','prUsed','prPrev']
    .forEach(function (id) { setVal(id, ''); });
  el('pointRegForm') && (el('pointRegForm').dataset.mode = 'new');
  el('pointRegFormTitle') && (el('pointRegFormTitle').textContent = '➕ 신규 포인트 등록');
}

/* ★ 엑셀 일괄 등록 */
async function importPointExcel(file) {
  if (typeof XLSX === 'undefined') { showToast('XLSX 라이브러리 로딩 중...', 'warning'); return; }
  var reader = new FileReader();
  reader.onload = async function (e) {
    try {
      var wb   = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
      var ws   = wb.Sheets[wb.SheetNames[0]];
      var json = XLSX.utils.sheet_to_json(ws, { defval: '' });

      var upsertList = [];
      json.forEach(function (row) {
        var empId = String(row['사번'] || row['emp_id'] || '').trim();
        var name  = String(row['성명'] || row['emp_name'] || '').trim();
        if (!empId || !name) return;
        upsertList.push({
          emp_id           : empId,
          emp_name         : name,
          dept_name        : String(row['부서'] || row['dept'] || '').trim(),
          work_location    : String(row['근무지'] || row['location'] || '').trim(),
          total_points     : parseInt(row['보유포인트'] || row['total'] || 0) || 0,
          used_points      : parseInt(row['사용포인트'] || row['used']  || 0) || 0,
          prev_year_points : parseInt(row['전년도잔여'] || row['prev']  || 0) || 0,
          updated_at       : new Date().toISOString()
        });
      });

      if (!upsertList.length) { showToast('유효한 데이터가 없습니다.', 'warning'); return; }

      var client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      var { error } = await client
        .from('employee_points')
        .upsert(upsertList, { onConflict: 'emp_id' });

      if (error) throw error;
      showToast('✅ ' + upsertList.length + '명의 포인트가 DB에 저장되었습니다!', 'success');
      await loadPointList();

    } catch (err) {
      showToast('엑셀 등록 오류: ' + err.message, 'error');
    }
  };
  reader.readAsArrayBuffer(file);
}

/* ============================================================
   총무팀 관리자 — 신청 현황 테이블
============================================================ */
function initAdminFilters() {
  el('adSearchBtn')  && el('adSearchBtn').addEventListener('click',  doFilter);
  el('adExcelDlBtn') && el('adExcelDlBtn').addEventListener('click', function () {
    showToast('엑셀 다운로드는 서버 연동 후 활성화됩니다.', 'info');
  });
}

function renderAdminView() {
  var data = STATE.uploadedData;
  if (!data.length) {
    el('adStatusBody') && (el('adStatusBody').innerHTML =
      '<tr><td colspan="15" class="gc-empty-row">업로드된 데이터가 없습니다.<br>부서담당자가 먼저 엑셀을 업로드해야 합니다.</td></tr>');
    resetAdminStats(); return;
  }
  renderAdminTable(data);
  calcAdminStats(data);
}

function doFilter() {
  var loc    = el('adFilterLoc')    ? el('adFilterLoc').value    : '';
  var card   = el('adFilterCard')   ? el('adFilterCard').value   : '';
  var status = el('adFilterStatus') ? el('adFilterStatus').value : '';
  var filtered = STATE.uploadedData.filter(function (r) {
    if (loc    && r.loc.indexOf(loc)   < 0) return false;
    if (card   && r.card.indexOf(card) < 0) return false;
    if (status && r.status !== status)       return false;
    return true;
  });
  renderAdminTable(filtered);
  showToast(filtered.length + '건 조회되었습니다.', 'info');
}

function renderAdminTable(data) {
  var tbody = el('adStatusBody');
  if (!tbody) return;
  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="15" class="gc-empty-row">조회 결과가 없습니다.</td></tr>';
    return;
  }
  function showQty(q) {
    return (q && q > 0) ? '<strong style="color:#2563eb">' + q + '</strong>' : '<span style="color:#cbd5e1">-</span>';
  }
  tbody.innerHTML = data.map(function (r, i) {
    var badge = r.status === '신청완료'
      ? '<span style="background:#dcfce7;color:#15803d;padding:3px 8px;border-radius:100px;font-size:.72rem;font-weight:700">신청완료</span>'
      : r.status === '오류'
      ? '<span style="background:#fee2e2;color:#dc2626;padding:3px 8px;border-radius:100px;font-size:.72rem;font-weight:700">오류</span>'
      : '<span style="background:#fef9c3;color:#854d0e;padding:3px 8px;border-radius:100px;font-size:.72rem;font-weight:700">미신청</span>';
    var rowBg = r.status === '오류' ? 'background:#fef2f2;cursor:pointer' : 'cursor:pointer';
    return '<tr style="' + rowBg + '" onclick="showDetailRow(' + i + ')">' +
      '<td style="text-align:center;color:#2563eb;font-weight:700;font-size:.8rem">' + (i+1) + '</td>' +
      '<td style="text-align:center;font-size:.8rem">' + (r.loc||'-') + '</td>' +
      '<td style="font-size:.8rem">' + (r.dept||'-') + (r.ban ? '<div style="font-size:.68rem;color:#94a3b8">' + r.ban + '</div>' : '') + '</td>' +
      '<td style="text-align:center;font-size:.78rem;color:#64748b">' + r.empId + '</td>' +
      '<td style="text-align:center"><strong>' + r.name + '</strong></td>' +
      '<td style="text-align:right;font-size:.82rem">' + fmtNum(r.total) + '원</td>' +
      '<td style="text-align:right;font-weight:700">' + fmtNum(r.apply) + '원</td>' +
      '<td style="text-align:center">' + (r.card && r.card !== '-' ? '<strong>' + r.card + '</strong>' : '-') + '</td>' +
      '<td style="text-align:center">' + (r.rate > 0 ? '<span style="color:#16a34a;font-weight:700">+' + (r.rate*100).toFixed(1) + '%</span>' : '-') + '</td>' +
      '<td style="text-align:right">' + (r.payout > 0 ? '<strong style="color:#16a34a">' + fmtNum(r.payout) + '원</strong>' : '0원') + '</td>' +
      '<td style="text-align:center">' + showQty(r.d10)  + '</td>' +
      '<td style="text-align:center">' + showQty(r.d5)   + '</td>' +
      '<td style="text-align:center">' + showQty(r.d1)   + '</td>' +
      '<td style="text-align:center">' + showQty(r.d05)  + '</td>' +
      '<td style="text-align:center">' + badge +
        (r.error ? '<div style="font-size:.68rem;color:#dc2626;margin-top:2px">' + r.error.substring(0,40) + (r.error.length>40?'...':'') + '</div>' : '') +
      '</td></tr>';
  }).join('');
}

function calcAdminStats(data) {
  var done    = data.filter(function (r) { return r.status === '신청완료'; });
  var pending = data.filter(function (r) { return r.status === '미신청'; });
  setText('adStatTotal',   data.length + '명');
  setText('adStatDone',    done.length + '명');
  setText('adStatPending', pending.length + '명');
  setText('adStatAmt',     fmtW(done.reduce(function(s,r){return s+r.apply;},0)));
  setText('adStatPayout',  fmtW(done.reduce(function(s,r){return s+r.payout;},0)));
  [
    {key:'롯데',   c:'ctLotteCnt',a:'ctLotteAmt',p:'ctLottePayout'},
    {key:'신세계', c:'ctShinCnt', a:'ctShinAmt', p:'ctShinPayout' },
    {key:'대동',   c:'ctDaeCnt',  a:'ctDaeAmt',  p:'ctDaePayout'  },
    {key:'현대',   c:'ctHyuCnt',  a:'ctHyuAmt',  p:'ctHyuPayout'  }
  ].forEach(function (t) {
    var f = done.filter(function (r) { return r.card.indexOf(t.key) >= 0; });
    setText(t.c, f.length + '명');
    setText(t.a, fmtW(f.reduce(function(s,r){return s+r.apply;},0)));
    setText(t.p, fmtW(f.reduce(function(s,r){return s+r.payout;},0)));
  });
}

function resetAdminStats() {
  ['adStatTotal','adStatDone','adStatPending','adStatAmt','adStatPayout',
   'ctLotteCnt','ctLotteAmt','ctLottePayout','ctShinCnt','ctShinAmt','ctShinPayout',
   'ctDaeCnt','ctDaeAmt','ctDaePayout','ctHyuCnt','ctHyuAmt','ctHyuPayout'
  ].forEach(function (id) { setText(id, '-'); });
}

window.showDetailRow = function (idx) {
  var r = STATE.uploadedData[idx]; if (!r) return;
  el('successDetail') && (el('successDetail').innerHTML =
    '<table style="width:100%;border-collapse:collapse;font-size:.88rem">' +
    '<tr><td style="padding:7px 10px;color:#64748b;background:#f8fafc;border:1px solid #e2e8f0;width:40%">성명 (사번)</td><td style="padding:7px 10px;border:1px solid #e2e8f0;font-weight:700">' + r.name + ' (' + r.empId + ')</td></tr>' +
    '<tr><td style="padding:7px 10px;color:#64748b;background:#f8fafc;border:1px solid #e2e8f0">근무지 / 부서</td><td style="padding:7px 10px;border:1px solid #e2e8f0">' + r.loc + ' / ' + r.dept + (r.ban?' / '+r.ban:'') + '</td></tr>' +
    '<tr><td style="padding:7px 10px;color:#64748b;background:#f8fafc;border:1px solid #e2e8f0">상품권 종류</td><td style="padding:7px 10px;border:1px solid #e2e8f0;font-weight:700">' + r.card + (r.rate?' (+' + (r.rate*100).toFixed(1) + '%)':'') + '</td></tr>' +
    '<tr><td style="padding:7px 10px;color:#64748b;background:#f8fafc;border:1px solid #e2e8f0">신청 포인트</td><td style="padding:7px 10px;border:1px solid #e2e8f0">' + fmtW(r.apply) + '</td></tr>' +
    '<tr><td style="padding:7px 10px;color:#64748b;background:#f8fafc;border:1px solid #e2e8f0">추가 지급액</td><td style="padding:7px 10px;border:1px solid #e2e8f0;color:#16a34a;font-weight:700">+ ' + fmtW(r.bonus) + ' (' + (r.rate*100).toFixed(1) + '%)</td></tr>' +
    '<tr><td style="padding:7px 10px;color:#64748b;background:#f8fafc;border:1px solid #e2e8f0">실지급 금액</td><td style="padding:7px 10px;border:1px solid #e2e8f0;color:#16a34a;font-weight:700;font-size:1rem">' + fmtW(r.payout) + '</td></tr>' +
    '<tr><td style="padding:7px 10px;color:#64748b;background:#f8fafc;border:1px solid #e2e8f0">권종별 수량</td><td style="padding:7px 10px;border:1px solid #e2e8f0">10만: <b>' + (r.d10||0) + '</b>장 &nbsp; 5만: <b>' + (r.d5||0) + '</b>장 &nbsp; 1만: <b>' + (r.d1||0) + '</b>장 &nbsp; 5천: <b>' + (r.d05||0) + '</b>장</td></tr>' +
    (r.error?'<tr><td style="padding:7px 10px;color:#dc2626;background:#fef2f2;border:1px solid #e2e8f0">오류 내용</td><td style="padding:7px 10px;border:1px solid #e2e8f0;color:#dc2626">' + r.error + '</td></tr>':'') +
    '</table>');
  setText('successTitle', '신청 상세 정보');
  setText('successDesc',  '');
  openModal('successModal');
};

/* ============================================================
   공통 유틸
============================================================ */
function openModal(id)  { var m=el(id); if(!m)return; m.style.display='flex'; setTimeout(function(){m.classList.add('active');},10); }
function closeModal(id) { var m=el(id); if(!m)return; m.classList.remove('active'); setTimeout(function(){m.style.display='none';},300); }
document.addEventListener('click', function (e) {
  qsa('.gc-modal-overlay').forEach(function (overlay) {
    if (e.target === overlay) closeModal(overlay.id);
  });
});
function showToast(msg, type) {
  var c = el('toastContainer'); if(!c)return;
  var icons={success:'✅',error:'❌',info:'ℹ️',warning:'⚠️'};
  var t=document.createElement('div');
  t.className='gc-toast '+(type||'info');
  t.innerHTML='<span>'+(icons[type]||'')+'</span><span>'+msg+'</span>';
  c.appendChild(t);
  setTimeout(function(){t.classList.add('show');},10);
  setTimeout(function(){t.classList.remove('show');setTimeout(function(){t.remove();},300);},4000);
}
function el(id)        { return document.getElementById(id); }
function qsa(sel)      { return document.querySelectorAll(sel); }
function setText(id,v) { var e=el(id); if(e)e.textContent=v; }
function setVal(id,v)  { var e=el(id); if(e)e.value=v; }
function fmtNum(n)     { return (parseInt(n)||0).toLocaleString(); }
function fmtW(n)       { return fmtNum(n)+'원'; }
function fmtP(n)       { return fmtNum(n)+' P'; }

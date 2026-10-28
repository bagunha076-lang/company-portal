// =====================
// 탭 전환
// =====================
const tabBtns   = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

function switchTab(tabId) {
  tabBtns.forEach(b => b.classList.remove('active'));
  tabPanels.forEach(p => p.classList.remove('active'));
  const btn   = document.querySelector(`[data-tab="${tabId}"]`);
  const panel = document.getElementById(`tab-${tabId}`);
  if (btn)   btn.classList.add('active');
  if (panel) panel.classList.add('active');
}

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

// =====================
// 지역 필터
// =====================
const filterBtns = document.querySelectorAll('.filter-btn');
const resortCards = document.querySelectorAll('.resort-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const region = btn.dataset.region;
    resortCards.forEach(card => {
      if (region === 'all' || card.dataset.region === region) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

// =====================
// 카드에서 예약하기 버튼 → 예약 신청 탭 이동
// =====================
window.openBooking = function(resortName) {
  switchTab('resort-book');
  const select = document.getElementById('resortSelect');
  if (select) {
    for (let i = 0; i < select.options.length; i++) {
      if (select.options[i].text === resortName) {
        select.selectedIndex = i;
        break;
      }
    }
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// =====================
// 동반자 추가
// =====================
const addCompBtn     = document.getElementById('addCompBtn');
const companionList  = document.getElementById('companionList');

if (addCompBtn) {
  addCompBtn.addEventListener('click', () => {
    const row = document.createElement('div');
    row.className = 'companion-row';
    row.innerHTML = `
      <input type="text" placeholder="성명" class="comp-name"/>
      <input type="text" placeholder="관계 (예: 자녀)" class="comp-rel"/>
      <input type="text" placeholder="생년월일 (YYYYMMDD)" class="comp-birth"/>
      <button type="button" class="btn-remove-comp"><i class="fa-solid fa-trash"></i></button>
    `;
    companionList.appendChild(row);

    row.querySelector('.btn-remove-comp').addEventListener('click', () => row.remove());
  });
}

// 첫 번째 삭제 버튼
document.querySelectorAll('.btn-remove-comp').forEach(btn => {
  btn.addEventListener('click', () => btn.closest('.companion-row').remove());
});

// =====================
// 예약 요약 자동 업데이트
// =====================
const checkinInput  = document.querySelector('input[name="checkin"]');
const checkoutInput = document.querySelector('input[name="checkout"]');
const resortSelect  = document.getElementById('resortSelect');
const summaryDiv    = document.getElementById('bookingSummary');

function updateSummary() {
  if (!checkinInput || !checkoutInput || !summaryDiv) return;

  const ci = checkinInput.value;
  const co = checkoutInput.value;
  const resort = resortSelect ? resortSelect.value : '';

  if (!ci || !co) {
    summaryDiv.innerHTML = '<p class="summary-placeholder">입실일과 퇴실일을 선택하면 자동으로 표시됩니다.</p>';
    return;
  }

  const start = new Date(ci);
  const end   = new Date(co);
  const nights = Math.round((end - start) / (1000*60*60*24));

  if (nights <= 0) {
    summaryDiv.innerHTML = '<p style="color:#dc2626; font-size:0.88rem;">퇴실일은 입실일보다 이후여야 합니다.</p>';
    return;
  }

  if (nights > 4) {
    summaryDiv.innerHTML = '<p style="color:#dc2626; font-size:0.88rem;">최대 4박까지만 이용 가능합니다.</p>';
    return;
  }

  summaryDiv.innerHTML = `
    <div class="summary-row">
      <div class="summary-item">
        <span class="s-label">휴양소</span>
        <span class="s-value">${resort || '미선택'}</span>
      </div>
      <div class="summary-item">
        <span class="s-label">입실일</span>
        <span class="s-value">${ci}</span>
      </div>
      <div class="summary-item">
        <span class="s-label">퇴실일</span>
        <span class="s-value">${co}</span>
      </div>
      <div class="summary-item">
        <span class="s-label">숙박 기간</span>
        <span class="s-value">${nights}박 ${nights+1}일</span>
      </div>
    </div>
  `;
}

if (checkinInput)  checkinInput.addEventListener('change', updateSummary);
if (checkoutInput) checkoutInput.addEventListener('change', updateSummary);
if (resortSelect)  resortSelect.addEventListener('change', updateSummary);

// 오늘 이전 날짜 선택 방지
const today = new Date().toISOString().split('T')[0];
if (checkinInput)  checkinInput.min  = today;
if (checkoutInput) checkoutInput.min = today;

// =====================
// 신청자 프로필 로드
// =====================
let CURRENT_PROFILE = null;

async function initResortProfile() {
  const user = await getCurrentUser();
  if (!user) return;
  const profile = await getUserProfile(user.id);
  CURRENT_PROFILE = profile;

  const idEl   = document.getElementById('profEmpId');
  const nameEl = document.getElementById('profEmpName');
  const deptEl = document.getElementById('profDeptName');
  if (idEl)   idEl.value   = (profile && profile.emp_id)   || user.email;
  if (nameEl) nameEl.value = (profile && profile.emp_name) || user.email;
  if (deptEl) deptEl.value = (profile && profile.dept_name)|| '-';

  loadResortHistory();
}
initResortProfile();

// =====================
// 예약 폼 제출
// =====================
const resortForm         = document.getElementById('resortForm');
const resortSuccessModal = document.getElementById('resortSuccessModal');
const resortSuccessClose = document.getElementById('resortSuccessClose');

function collectCompanions() {
  const rows = document.querySelectorAll('#companionList .companion-row');
  const companions = [];
  rows.forEach(row => {
    const name  = row.querySelector('.comp-name').value.trim();
    const rel   = row.querySelector('.comp-rel').value.trim();
    const birth = row.querySelector('.comp-birth').value.trim();
    if (name) companions.push({ name, relation: rel, birth });
  });
  return companions;
}

if (resortForm) {
  resortForm.addEventListener('submit', async e => {
    e.preventDefault();

    const resort   = resortForm.elements['resort'].value;
    const checkin  = resortForm.elements['checkin'].value;
    const checkout = resortForm.elements['checkout'].value;
    const guests   = resortForm.elements['guests'].value;
    const phone    = resortForm.elements['phone'].value;

    if (!resort)   { alert('휴양소를 선택해주세요.'); return; }
    if (!checkin || !checkout) { alert('입실일/퇴실일을 입력해주세요.'); return; }
    if (new Date(checkout) <= new Date(checkin)) { alert('퇴실일은 입실일보다 이후여야 합니다.'); return; }
    if (!guests)   { alert('이용 인원을 선택해주세요.'); return; }
    if (!phone)    { alert('연락처를 입력해주세요.'); return; }

    const user = await getCurrentUser();
    if (!user) { alert('로그인이 필요합니다.'); return; }

    const payload = {
      user_id: user.id,
      emp_id: CURRENT_PROFILE ? CURRENT_PROFILE.emp_id : null,
      emp_name: CURRENT_PROFILE ? CURRENT_PROFILE.emp_name : null,
      dept_name: CURRENT_PROFILE ? CURRENT_PROFILE.dept_name : null,
      phone,
      resort_name: resort,
      checkin_date: checkin,
      checkout_date: checkout,
      guest_label: guests,
      adult_count: parseInt(resortForm.elements['adult'].value, 10) || 0,
      child_count: parseInt(resortForm.elements['child'].value, 10) || 0,
      companions: collectCompanions(),
      request_note: resortForm.elements['request'].value
    };

    const res = await supabaseClient.from('resort_reservations').insert(payload);
    if (res.error) {
      alert('예약 신청 중 오류가 발생했습니다: ' + res.error.message);
      return;
    }

    resortSuccessModal.classList.add('active');
    loadResortHistory();
  });
}

if (resortSuccessClose) {
  resortSuccessClose.addEventListener('click', () => {
    resortSuccessModal.classList.remove('active');
    switchTab('resort-history');
    resortForm && resortForm.reset();
    updateSummary();
  });
}

resortSuccessModal && resortSuccessModal.addEventListener('click', e => {
  if (e.target === resortSuccessModal) resortSuccessModal.classList.remove('active');
});

// =====================
// 나의 예약 - 실데이터 조회 + 취소
// =====================
const RESORT_STATUS_CLASS = { '검토중': 'chip-pending', '승인': 'chip-done', '이용완료': 'chip-done', '취소': 'chip-reject', '반려': 'chip-reject' };

async function loadResortHistory() {
  const tbody = document.querySelector('#resortHistoryTable tbody');
  if (!tbody) return;
  const user = await getCurrentUser();
  if (!user) return;

  const res = await supabaseClient
    .from('resort_reservations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (res.error || !res.data || !res.data.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--gray-400);">예약 내역이 없습니다.</td></tr>';
    return;
  }

  tbody.innerHTML = res.data.map(row => {
    const reserveNo = 'R-' + row.id.slice(0, 8).toUpperCase();
    const createdStr = new Date(row.created_at).toLocaleDateString('ko-KR');
    const statusClass = RESORT_STATUS_CLASS[row.status] || 'chip-pending';
    const canCancel = row.status === '검토중' || row.status === '승인';
    const actionCell = canCancel
      ? `<button class="btn-table-cancel" data-id="${row.id}">취소</button>`
      : '-';
    return `<tr>
      <td>${reserveNo}</td>
      <td>${row.resort_name}</td>
      <td>${row.checkin_date}</td>
      <td>${row.checkout_date}</td>
      <td>${row.guest_label}</td>
      <td>${createdStr}</td>
      <td><span class="status-chip ${statusClass}">${row.status}</span></td>
      <td>${actionCell}</td>
    </tr>`;
  }).join('');

  tbody.querySelectorAll('.btn-table-cancel').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('예약을 취소하시겠습니까?')) return;
      const id = btn.dataset.id;
      const res = await supabaseClient.from('resort_reservations').update({ status: '취소' }).eq('id', id);
      if (res.error) { alert('취소 중 오류가 발생했습니다: ' + res.error.message); return; }
      loadResortHistory();
    });
  });
}

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
// 예약 폼 제출
// =====================
const resortForm         = document.getElementById('resortForm');
const resortSuccessModal = document.getElementById('resortSuccessModal');
const resortSuccessClose = document.getElementById('resortSuccessClose');

if (resortForm) {
  resortForm.addEventListener('submit', e => {
    e.preventDefault();
    resortSuccessModal.classList.add('active');
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
// 나의 예약 - 취소 버튼
// =====================
document.querySelectorAll('.btn-table-cancel').forEach(btn => {
  btn.addEventListener('click', () => {
    if (confirm('예약을 취소하시겠습니까?')) {
      btn.closest('tr').querySelector('.status-chip').textContent = '취소됨';
      btn.closest('tr').querySelector('.status-chip').className = 'status-chip chip-reject';
      btn.remove();
    }
  });
});

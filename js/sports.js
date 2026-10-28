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
// 신청 시즌 계산 및 상태 설정
// =====================
const SEASON_START = new Date('2026-08-01T00:00:00');
const SEASON_END   = new Date('2026-08-15T23:59:59');
const now          = new Date();

const isOpen     = now >= SEASON_START && now <= SEASON_END;
const isUpcoming = now < SEASON_START;
const isClosed   = now > SEASON_END;

const seasonStatus     = document.getElementById('seasonStatus');
const beforeSeasonPanel= document.getElementById('beforeSeasonPanel');
const sportsSubmitBtn  = document.getElementById('sportsSubmitBtn');
const inlineCd         = document.getElementById('sportsCountdownInline');

if (isOpen) {
  seasonStatus.textContent  = '신청중';
  seasonStatus.className    = 'banner-status open-badge';
  beforeSeasonPanel.style.display = 'none';
  if (inlineCd) {
    const remain = Math.ceil((SEASON_END - now) / (1000*60*60*24));
    inlineCd.textContent = `D-${remain}`;
  }
} else if (isClosed) {
  seasonStatus.textContent  = '신청마감';
  seasonStatus.className    = 'banner-status';
  seasonStatus.style.cssText= 'background:#fee2e2;color:#991b1b;flex-shrink:0;font-size:.78rem;font-weight:700;padding:5px 14px;border-radius:20px;';
  beforeSeasonPanel.style.display = 'none';
  if (sportsSubmitBtn) {
    sportsSubmitBtn.disabled = true;
    sportsSubmitBtn.textContent = '신청 기간 종료';
    sportsSubmitBtn.style.background = '#94a3b8';
    sportsSubmitBtn.style.cursor = 'not-allowed';
  }
  if (inlineCd) inlineCd.textContent = '마감';
}
// upcoming은 카운트다운 카드가 기본으로 표시됨

// =====================
// 카운트다운 (신청 예정일 기준)
// =====================
function updateCountdown() {
  const target = isUpcoming ? SEASON_START : SEASON_END;
  const diff   = Math.max(0, target - new Date());

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const pad = n => String(n).padStart(2, '0');

  const cdD = document.getElementById('cd-d');
  const cdH = document.getElementById('cd-h');
  const cdM = document.getElementById('cd-m');
  const cdS = document.getElementById('cd-s');
  if (cdD) cdD.textContent = pad(d);
  if (cdH) cdH.textContent = pad(h);
  if (cdM) cdM.textContent = pad(m);
  if (cdS) cdS.textContent = pad(s);

  // 인라인 D-day
  if (inlineCd && isUpcoming) {
    inlineCd.textContent = `D-${d}`;
  }
}

if (isUpcoming || isOpen) {
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// =====================
// 제품 카드 선택 → 사이즈 행 표시
// =====================
const productNames = {
  'top-a':    '드라이핏 반팔 티셔츠 (A타입)',
  'top-b':    '쿨론 집업 반팔 셔츠 (B타입)',
  'top-c':    '메쉬 기능성 긴팔 티셔츠 (C타입)',
  'bottom-a': '트레이닝 조거 팬츠 (A타입)',
  'bottom-b': '기능성 반바지 (B타입)',
  'bottom-c': '스트레치 트랙 팬츠 (C타입)',
};

function updateSummary() {
  const topProd    = document.querySelector('input[name="top_product"]:checked');
  const topSize    = document.querySelector('input[name="top_size"]:checked');
  const bottomProd = document.querySelector('input[name="bottom_product"]:checked');
  const bottomSize = document.querySelector('input[name="bottom_size"]:checked');

  const sTop    = document.getElementById('summaryTop');
  const sTopSz  = document.getElementById('summaryTopSize');
  const sBot    = document.getElementById('summaryBottom');
  const sBotSz  = document.getElementById('summaryBottomSize');

  if (sTop)   sTop.textContent   = topProd    ? productNames[topProd.value]    : '미선택';
  if (sTopSz) sTopSz.textContent = topSize    ? topSize.value                  : '미선택';
  if (sBot)   sBot.textContent   = bottomProd ? productNames[bottomProd.value] : '미선택';
  if (sBotSz) sBotSz.textContent = bottomSize ? bottomSize.value               : '미선택';
}

// 상의 카드 선택
document.querySelectorAll('input[name="top_product"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const row = document.getElementById('topSizeRow');
    if (row) row.style.display = 'block';
    updateSummary();
  });
});

// 하의 카드 선택
document.querySelectorAll('input[name="bottom_product"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const row = document.getElementById('bottomSizeRow');
    if (row) row.style.display = 'block';
    updateSummary();
  });
});

// 사이즈 선택 시 요약 업데이트
document.querySelectorAll('input[name="top_size"], input[name="bottom_size"]').forEach(r => {
  r.addEventListener('change', updateSummary);
});

// =====================
// 사이즈 가이드 모달
// =====================
const sizeGuideData = {
  top: `
    <p style="margin-bottom:14px;font-size:0.88rem;color:#475569;">단위: cm / 가슴 둘레 기준</p>
    <table class="size-guide-table">
      <thead><tr><th>사이즈</th><th>가슴(cm)</th><th>어깨(cm)</th><th>총장(cm)</th></tr></thead>
      <tbody>
        <tr><td>XS</td><td>84~88</td><td>38</td><td>65</td></tr>
        <tr><td>S</td><td>88~92</td><td>40</td><td>67</td></tr>
        <tr><td>M</td><td>92~96</td><td>42</td><td>69</td></tr>
        <tr><td>L</td><td>96~100</td><td>44</td><td>71</td></tr>
        <tr><td>XL</td><td>100~104</td><td>46</td><td>73</td></tr>
        <tr><td>XXL</td><td>104~108</td><td>48</td><td>75</td></tr>
        <tr><td>XXXL</td><td>108~112</td><td>50</td><td>77</td></tr>
      </tbody>
    </table>`,
  bottom: `
    <p style="margin-bottom:14px;font-size:0.88rem;color:#475569;">단위: cm / 허리 둘레 기준 (체육복 기준)</p>
    <table class="size-guide-table">
      <thead><tr><th>사이즈</th><th>허리(cm)</th><th>엉덩이(cm)</th><th>인심(cm)</th></tr></thead>
      <tbody>
        <tr><td>XS</td><td>64~68</td><td>86</td><td>70</td></tr>
        <tr><td>S</td><td>68~72</td><td>88</td><td>71</td></tr>
        <tr><td>M</td><td>72~76</td><td>90</td><td>72</td></tr>
        <tr><td>L</td><td>76~80</td><td>92</td><td>73</td></tr>
        <tr><td>XL</td><td>80~84</td><td>94</td><td>74</td></tr>
        <tr><td>XXL</td><td>84~88</td><td>96</td><td>74</td></tr>
        <tr><td>XXXL</td><td>88~92</td><td>98</td><td>75</td></tr>
      </tbody>
    </table>`
};

const sizeModal  = document.getElementById('sizeModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody  = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');

document.querySelectorAll('.size-guide-link').forEach(link => {
  link.addEventListener('click', () => {
    const type = link.dataset.type;
    const titles = { top: '상의 사이즈 가이드 (체육복)', bottom: '하의 사이즈 가이드 (체육복)' };
    modalTitle.textContent = titles[type] || '사이즈 가이드';
    modalBody.innerHTML    = sizeGuideData[type] || '';
    sizeModal.classList.add('active');
  });
});

modalClose && modalClose.addEventListener('click', () => sizeModal.classList.remove('active'));
sizeModal  && sizeModal.addEventListener('click', e => {
  if (e.target === sizeModal) sizeModal.classList.remove('active');
});

// =====================
// 폼 제출
// =====================
const sportsForm   = document.getElementById('sportsForm');
const successModal = document.getElementById('successModal');
const successClose = document.getElementById('successClose');
const successSummaryModal = document.getElementById('successSummaryModal');

if (sportsForm) {
  sportsForm.addEventListener('submit', e => {
    e.preventDefault();

    if (isClosed || (!isOpen && !isUpcoming)) return;

    const topProd    = document.querySelector('input[name="top_product"]:checked');
    const topSize    = document.querySelector('input[name="top_size"]:checked');
    const bottomProd = document.querySelector('input[name="bottom_product"]:checked');
    const bottomSize = document.querySelector('input[name="bottom_size"]:checked');

    if (!topProd) { alert('상의 제품을 선택해주세요.'); return; }
    if (!topSize) { alert('상의 사이즈를 선택해주세요.'); return; }
    if (!bottomProd) { alert('하의 제품을 선택해주세요.'); return; }
    if (!bottomSize) { alert('하의 사이즈를 선택해주세요.'); return; }

    if (successSummaryModal) {
      successSummaryModal.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:6px;">
          <div><strong>상의:</strong> ${productNames[topProd.value]} / <strong>${topSize.value}</strong></div>
          <div><strong>하의:</strong> ${productNames[bottomProd.value]} / <strong>${bottomSize.value}</strong></div>
        </div>
      `;
    }

    successModal.classList.add('active');
  });
}

if (successClose) {
  successClose.addEventListener('click', () => {
    successModal.classList.remove('active');
    switchTab('sports-history');
    sportsForm && sportsForm.reset();

    // 사이즈 행 숨기기
    const topRow    = document.getElementById('topSizeRow');
    const bottomRow = document.getElementById('bottomSizeRow');
    if (topRow)    topRow.style.display    = 'none';
    if (bottomRow) bottomRow.style.display = 'none';

    // 요약 초기화
    updateSummary();
  });
}

successModal && successModal.addEventListener('click', e => {
  if (e.target === successModal) successModal.classList.remove('active');
});

// =====================
// 초기화 버튼
// =====================
const sportsReset = document.getElementById('sportsReset');
if (sportsReset) {
  sportsReset.addEventListener('click', () => {
    const topRow    = document.getElementById('topSizeRow');
    const bottomRow = document.getElementById('bottomSizeRow');
    if (topRow)    topRow.style.display    = 'none';
    if (bottomRow) bottomRow.style.display = 'none';
    setTimeout(updateSummary, 50);
  });
}

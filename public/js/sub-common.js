/* ============================================================
   sub-common.js — 서브 페이지 공통 초기화
   ============================================================ */
'use strict';

document.addEventListener('DOMContentLoaded', function () {

  /* ── 탭 전환 ── */
  var tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.dataset.tab;
      tabBtns.forEach(function (b) { b.classList.remove('active'); });
      document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
      btn.classList.add('active');
      var panel = document.getElementById('tab-' + target);
      if (panel) panel.classList.add('active');
    });
  });

  /* ── 햄버거 메뉴 ── */
  var hamburger     = document.getElementById('hamburger');
  var mobileDrawer  = document.getElementById('mobileDrawer');
  var drawerOverlay = document.getElementById('drawerOverlay');

  function closeDrawer() {
    mobileDrawer  && mobileDrawer.classList.remove('open');
    drawerOverlay && drawerOverlay.classList.remove('show');
    document.body.style.overflow = '';
  }
  if (hamburger) {
    hamburger.addEventListener('click', function () {
      var isOpen = mobileDrawer && mobileDrawer.classList.toggle('open');
      drawerOverlay && drawerOverlay.classList.toggle('show', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }
  drawerOverlay && drawerOverlay.addEventListener('click', closeDrawer);

  /* ── 수량 조절 버튼 ── */
  document.querySelectorAll('.qty-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var targetId = btn.dataset.target;
      var inp = document.getElementById(targetId);
      if (!inp) return;
      var val = parseInt(inp.value) || 1;
      var min = parseInt(inp.min)   || 1;
      var max = parseInt(inp.max)   || 99;
      if (btn.dataset.action === 'plus')  val = Math.min(val + 1, max);
      if (btn.dataset.action === 'minus') val = Math.max(val - 1, min);
      inp.value = val;
    });
  });

  /* ── 서브 히어로 사진 순환 ── */
  var heroSlides = document.querySelectorAll('.sub-hero-slide');
  if (heroSlides.length > 1) {
    var heroCur = 0;
    setInterval(function () {
      heroSlides[heroCur].classList.remove('active');
      heroCur = (heroCur + 1) % heroSlides.length;
      heroSlides[heroCur].classList.add('active');
    }, 5000);
  }

  /* ── 헤더 인증 초기화 ── */
  initHeaderAuth();
});

/* ============================================================
   헤더 인증 초기화
============================================================ */
async function initHeaderAuth() {
  /* Supabase 로드 확인 */
  if (typeof supabase === 'undefined' || typeof SUPABASE_URL === 'undefined') {
    console.warn('Supabase 미로드');
    return;
  }

  try {
    var client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    /* 세션 확인 */
    var { data: sessionData } = await client.auth.getSession();
    var session = sessionData && sessionData.session;

    if (!session) {
      var path = window.location.pathname;
      if (!path.includes('login') && !path.includes('register')) {
        window.location.href = 'login.html';
      }
      return;
    }

    /* ── user_profiles 에서 이름 조회 ── */
    var empName = null;
    var { data: profile, error: profileErr } = await client
      .from('user_profiles')
      .select('emp_name, emp_id, dept_name, work_location')
      .eq('id', session.user.id)
      .single();

    if (profile && profile.emp_name) {
      /* 정상: DB에 이름 있음 */
      empName = profile.emp_name;
    } else {
      /* 폴백 1: 이메일 앞부분에서 이름 추출 시도 */
      /* 폴백 2: 그냥 이메일 전체 */
      var email = session.user.email || '';
      empName = email.split('@')[0] || email;

      /* 콘솔에 원인 출력 (디버깅용) */
      console.warn('user_profiles에서 emp_name을 찾지 못했습니다.', profileErr);
    }

    /* 헤더 이름 업데이트 */
    var nameEls = document.querySelectorAll('#headerUserName, .btn-user span, .header-user-name');
    nameEls.forEach(function (el) { el.textContent = empName; });

    /* 로그아웃 버튼 렌더링 */
    renderLogoutBtn(client);

    /* 전역 프로필 저장 */
    window.LOGGED_IN_PROFILE = Object.assign({}, profile || {}, {
      emp_name : empName,
      userId   : session.user.id,
      email    : session.user.email
    });

  } catch (e) {
    console.error('헤더 인증 오류:', e);
  }
}

/* ============================================================
   로그아웃 버튼 — 이름 오른쪽에 나란히, 색상 명확하게
============================================================ */
function renderLogoutBtn(client) {
  if (document.getElementById('globalLogoutBtn')) return;

  var headerRight = document.querySelector('.header-right');
  if (!headerRight) return;

  /* flex 정렬 */
  headerRight.style.display    = 'flex';
  headerRight.style.alignItems = 'center';
  headerRight.style.gap        = '8px';

  var btn = document.createElement('button');
  btn.id = 'globalLogoutBtn';
  btn.innerHTML = '<i class="fa-solid fa-right-from-bracket" style="font-size:.8rem"></i> 로그아웃';

  /* ★ 색상 명확하게: 흰 배경 + 짙은 글자 */
  btn.style.cssText = [
    'display:inline-flex',
    'align-items:center',
    'gap:6px',
    'padding:7px 16px',
    'background:#ffffff',          /* 흰 배경 */
    'border:1.5px solid #e2e8f0',  /* 연한 테두리 */
    'border-radius:100px',
    'font-size:.82rem',
    'font-weight:700',
    'color:#374151',               /* 짙은 회색 글자 */
    'cursor:pointer',
    'font-family:inherit',
    'white-space:nowrap',
    'transition:background .18s,color .18s',
    'line-height:1'
  ].join(';');

  btn.addEventListener('mouseenter', function () {
    btn.style.background = '#fee2e2';   /* 호버: 연한 빨강 */
    btn.style.color      = '#dc2626';   /* 호버: 빨간 글자 */
    btn.style.borderColor= '#fca5a5';
  });
  btn.addEventListener('mouseleave', function () {
    btn.style.background = '#ffffff';
    btn.style.color      = '#374151';
    btn.style.borderColor= '#e2e8f0';
  });

  btn.addEventListener('click', async function () {
    if (confirm('로그아웃 하시겠습니까?')) {
      await client.auth.signOut();
      window.location.href = 'login.html';
    }
  });

  headerRight.appendChild(btn);
}

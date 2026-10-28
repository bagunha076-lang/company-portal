/* ============================================================
   auth.js — Supabase 인증 공통 모듈
============================================================ */
var SUPABASE_URL = 'https://gnvruxqlyedlsjuwodsd.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdudnJ1eHFseWVkbHNqdXdvZHNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4NTk0MjgsImV4cCI6MjEwMDQzNTQyOH0.ugQNMmHl2E5r86rRvPoqLejz7O-0In7QH9T6xL8RhyM';

var supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ── 현재 로그인 사용자 ── */
async function getCurrentUser() {
  try {
    var res = await supabaseClient.auth.getSession();
    if (res.data && res.data.session) return res.data.session.user;
    return null;
  } catch(e) { return null; }
}

/* ── 사용자 프로필 조회 ── */
async function getUserProfile(userId) {
  try {
    var res = await supabaseClient
      .from('user_profiles')
      .select('id, emp_id, emp_name, dept_name, work_location, role')
      .eq('id', userId)
      .single();
    return res.data || null;
  } catch(e) { return null; }
}

/* ── ★ 직원 포인트 조회 (employee_points 테이블) ── */
async function getEmployeePoints(empId) {
  try {
    var res = await supabaseClient
      .from('employee_points')
      .select('emp_id, emp_name, dept_name, work_location, total_points, used_points, prev_year_points')
      .eq('emp_id', empId)
      .single();

    if (res.error) {
      console.warn('포인트 조회 결과 없음 (emp_id=' + empId + '):', res.error.message);
      return null;
    }

    var data = res.data;
    /* available_points = total - used 직접 계산 */
    data.available_points = (data.total_points || 0) - (data.used_points || 0);
    return data;

  } catch(e) {
    console.error('getEmployeePoints 예외:', e);
    return null;
  }
}

/* ── 상품권 신청 내역 조회 ── */
async function getGiftCardRequests(empId) {
  try {
    var res = await supabaseClient
      .from('gift_card_requests')
      .select('*')
      .eq('emp_id', empId)
      .order('created_at', { ascending: false });
    return res.data || [];
  } catch(e) { return []; }
}

/* ── 로그아웃 ── */
async function signOut() {
  await supabaseClient.auth.signOut();
  window.location.href = 'login.html';
}

/* ── 로그인 필수 체크 ── */
async function requireAuth() {
  var user = await getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }
  return user;
}

/* ── 헤더 초기화 ── */
async function initHeader() {
  var user = await requireAuth();
  if (!user) return;
  var profile = await getUserProfile(user.id);
  var empName = (profile && profile.emp_name) ? profile.emp_name : user.email;
  var nameEls = document.querySelectorAll('#headerUserName, .btn-user span');
  nameEls.forEach(function(el) { el.textContent = empName; });
  return { user: user, profile: profile, empName: empName };
}

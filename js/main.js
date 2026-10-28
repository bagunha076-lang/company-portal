'use strict';

/* 헤더 스크롤 */
var hdr = document.getElementById('siteHeader');
window.addEventListener('scroll', function () {
  hdr && (window.scrollY > 40 ? hdr.classList.add('scrolled') : hdr.classList.remove('scrolled'));
}, { passive: true });

/* 드로어 */
var hbg = document.getElementById('hamburger');
var mdr = document.getElementById('mobileDrawer');
var dov = document.getElementById('drawerOverlay');
hbg && hbg.addEventListener('click', function () { mdr.classList.add('open'); dov.classList.add('show'); });
dov && dov.addEventListener('click', function () { mdr.classList.remove('open'); dov.classList.remove('show'); });

/* ================================================
   시네마 히어로 — 영상+카피 순환 (활성 슬라이드만 재생)
================================================ */
var cinemaSlides = document.querySelectorAll('.cinema-slide');
var cinemaDots   = document.querySelectorAll('.cinema-dot');
var cinemaCur    = 0;
var cinemaTimer  = null;
var CINEMA_MS    = 7000;

function cinemaPlayVideo(slide) {
  var v = slide.querySelector('.cinema-video');
  if (v) { v.currentTime = 0; v.play().catch(function () {}); }
}
function cinemaPauseVideo(slide) {
  var v = slide.querySelector('.cinema-video');
  if (v) v.pause();
}
function cinemaGoTo(idx) {
  if (!cinemaSlides.length) return;
  cinemaPauseVideo(cinemaSlides[cinemaCur]);
  cinemaSlides[cinemaCur].classList.remove('active');
  cinemaDots[cinemaCur] && cinemaDots[cinemaCur].classList.remove('active');
  cinemaCur = ((idx % cinemaSlides.length) + cinemaSlides.length) % cinemaSlides.length;
  cinemaSlides[cinemaCur].classList.add('active');
  cinemaDots[cinemaCur] && cinemaDots[cinemaCur].classList.add('active');
  cinemaPlayVideo(cinemaSlides[cinemaCur]);
}
function cinemaAutoStart() {
  clearInterval(cinemaTimer);
  cinemaTimer = setInterval(function () { cinemaGoTo(cinemaCur + 1); }, CINEMA_MS);
}
if (cinemaSlides.length) {
  cinemaDots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      cinemaGoTo(parseInt(dot.dataset.idx, 10));
      cinemaAutoStart();
    });
  });
  cinemaPlayVideo(cinemaSlides[0]);
  cinemaAutoStart();
}

/* ================================================
   통계 임팩트 카운트업 (뷰포트 진입 시 1회 실행)
================================================ */
function animateImpactCounters() {
  document.querySelectorAll('.impact-num .num[data-target]').forEach(function (el) {
    var target   = parseFloat(el.dataset.target);
    var decimals = el.dataset.decimals ? parseInt(el.dataset.decimals, 10) : 0;
    var cur = 0;
    var step = target / 60;
    var timer = setInterval(function () {
      cur = Math.min(cur + step, target);
      el.textContent = decimals ? cur.toFixed(decimals) : Math.round(cur).toLocaleString();
      if (cur >= target) clearInterval(timer);
    }, 20);
  });
}
var impactEl = document.getElementById('impactBand');
if (impactEl) {
  if ('IntersectionObserver' in window) {
    var impactIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateImpactCounters();
          impactIO.disconnect();
        }
      });
    }, { threshold: 0.3 });
    impactIO.observe(impactEl);
  } else {
    animateImpactCounters();
  }
}
/* ================================================
   영상 소개 섹션 — 모달 재생
================================================ */
(function () {
  var overlay  = document.getElementById('videoModalOverlay');
  var iframe   = document.getElementById('videoModalIframe');
  var closeBtn = document.getElementById('videoModalClose');
  if (!overlay || !iframe) return;

  document.querySelectorAll('.media-card[data-video]').forEach(function (card) {
    card.addEventListener('click', function (e) {
      e.preventDefault();
      var id = card.dataset.video;
      iframe.src = 'https://www.youtube.com/embed/' + id + '?autoplay=1';
      overlay.classList.add('open');
    });
  });

  function closeVideoModal() {
    overlay.classList.remove('open');
    iframe.src = '';
  }
  closeBtn && closeBtn.addEventListener('click', closeVideoModal);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeVideoModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeVideoModal(); });
})();
'use strict';

var MOA_FAQ = [
  { keywords: ['복지포인트', '포인트', '복지카드', '베네카페', '이제너두'],
    a: '복지포인트는 연간 80만 포인트가 지급됩니다 (3월, 9월 각 40만 포인트). 온라인(이제너두)과 오프라인(통합사원증)에서 사용 가능하고, 지급일로부터 2년 뒤 자동 소멸되니 기한 내에 사용해 주세요. 퇴직 시 미사용 포인트는 소멸됩니다.' },
  { keywords: ['경조금', '경조휴가', '결혼', '결혼축의금', '장례', '부고', '조의금', '화환'],
    a: '대표적인 경조금/경조휴가 기준입니다.\n• 본인 결혼: 휴가 10일 + 경조금 100만원\n• 자녀 결혼: 휴가 3일 + 경조금 30만원\n• 자녀 출생: 휴가 20일 + 경조금 250만원\n• 본인 사망: 경조금 300만원\n• 본인/배우자 부모 사망: 휴가 7일 + 경조금 50만원\n2개월 이상 근무자부터 지원되며, 발생일로부터 1년 이내 신청해야 합니다.' },
  { keywords: ['학자금', '자녀학자금', '등록금', '대학교학자금', '중고등학생'],
    a: '자녀 학자금은 신청월 기준 2년 이상 근속자에게 지원됩니다.\n• 취학전 아동: 월 10만원\n• 중·고등학생: 입학금+등록금 지원\n• 대학생: 1직원 3자녀 한도로 입학금·등록금 지원, 전액 장학생은 학업성취장려금 200만원 추가' },
  { keywords: ['명절선물', '사이버머니', '추석선물', '설선물'],
    a: '매년 1월 중 전 임직원에게 명절 선물로 50만원 상당의 사이버머니가 지급됩니다. 직원 쇼핑몰(teczen.ezwel.com)에서 사용 가능해요.' },
  { keywords: ['차량구입', '차량지원', '자동차구입', '사원차량'],
    a: '근속년수에 따라 차량 출고가 기준 10%~21%까지 할인 지원됩니다 (최초 구입 시 18% 적용). 전기차는 보조금 포함 21% 적용돼요.' },
  { keywords: ['대출이자', '주택대출', '전세자금', '이자지원'],
    a: '근속 3년 이상, 2년 이상 무주택 세대주를 대상으로 주택구입(최대 5,000만원) 또는 전세자금(최대 3,000만원) 대출이자를 지원합니다. 매년 2회(2월, 8월) 지급됩니다.' },
  { keywords: ['휴양소', '리조트', '콘도', '휴가지', '숙박시설'],
    a: '1년 이상 재직자는 설악·용인·속초·대천·경주·제주·평창·거제·여수 등 전국 제휴 숙소를 저렴하게 이용할 수 있어요. 성수기는 추첨제로 운영됩니다.' },
  { keywords: ['근무복', '작업복', '유니폼', '하복', '동복', '피복'],
    a: '작업복은 하계(5~9월)·동계(10~4월) 기준으로 지급돼요. 관리직은 하/동복 각 1착씩 연 지급, 생산직은 품목별로 연 1착 또는 2년 1착 기준입니다.' },
  { keywords: ['안전화', '보호구', '방진마스크', '안전모', '귀마개'],
    a: '안전화는 관리직 10개월, 생산직 8개월 주기로 지급됩니다. 방진/방독마스크, 안전모, 귀마개 등은 담당 업무에 따라 지급돼요.' },
  { keywords: ['외주세탁', '세탁', '작업복세탁'],
    a: '현장근무자의 작업복은 외주업체가 주 2회(사업장별 상이) 수거·배송해줘요. 각 반별 세탁물 수거함에 맡기시면 됩니다.' },
  { keywords: ['건강검진', '정기검진', '종합검진', '독감', '예방접종', '대상포진'],
    a: '만 35세 이상은 2년에 1회 종합검진(본인+가족 1인), 그 외 전 직원은 매년 일반건강진단을 받을 수 있어요. 독감 예방접종은 희망자 대상, 만 50세 이상은 대상포진 예방접종도 지원돼요.' },
  { keywords: ['난임', '난임시술', '불임'],
    a: '난임 시술 관련 비용을 시술 1회당 최대 100만원 한도로 지원하며, 횟수 제한 없이 지원됩니다. 인공수정/체외수정 휴가도 연간 5일 부여돼요.' },
  { keywords: ['출산휴가', '모성보호', '임신', '육아휴직', '유산', '사산'],
    a: '임신 중인 직원은 출산 전후 90일(다태아 120일)의 보호휴가를 받을 수 있어요. 가족돌봄휴직(연 최대 90일)과 가족돌봄휴가(연 10일, 무급)도 있습니다.' },
  { keywords: ['동호회', '동아리', '취미활동'],
    a: '20명 이상 모인 동호회는 등록하면 매월 인당 5,000원을 동호회 통장으로 지원받을 수 있어요.' },
  { keywords: ['장기근속', '근속포상', '근속휴가'],
    a: '10/15/20/25/30년 근속 시 포상휴가와 포상금을 받을 수 있어요 (예: 10년 차 휴가 2일+150만원, 20년 차는 해외여행 대체금 200만원+휴가 4일).' },
  { keywords: ['정년퇴직', '정년'],
    a: '정년은 만 60세가 되는 해의 12월 말일입니다. 정년퇴직자에게는 격려금 150만원과 휴가 5일이 주어져요.' },
  { keywords: ['국내출장', '출장비', '출장여비'],
    a: '왕복 100km 이상 출장 시 지원되며, 숙박비는 실비정산(한도 80,000원), 출장여비는 40,000원이 지급돼요.' },
  { keywords: ['해외출장'],
    a: '해외출장비는 지역과 직위에 따라 숙박비·일당이 차등 지급돼요. 항공권·호텔 예약은 비즈니스솔루션팀에서 일괄 진행합니다.' },
  { keywords: ['재직증명서', '경력증명서', '제증명서', '원천징수'],
    a: '재직증명서, 경력증명원, 원천징수영수증 등은 ERP > 증명서발급신청등록에서 신청 후 담당자 승인 즉시 출력 가능해요.' },
  { keywords: ['부임이사', '이사비', '전입'],
    a: '사업장 기준 반경 50km 이상 이동하는 부임자는 숙박비+교통비, 가족 이사비를 지원받을 수 있어요.' },
  { keywords: ['식당', '급식', '식권'],
    a: '사업장별로 조식(700원)·중식(2,000원) 식권이 운영되고 있어요. 사원증이나 지문 태그로 이용 가능합니다.' },
  { keywords: ['의료비', '병원비', '진료비지원'],
    a: '본인 및 건강보험에 등재된 가족의 본인부담금 중 40만원 초과분부터 지원돼요 (연간 한도 3,000만원).' },
  { keywords: ['단체상해보험', '상해보험', '사망보험금'],
    a: '단체상해보험을 통해 상해사망(최대 8,000만원), 질병사망(1,000만원), 암진단비 등을 보장받을 수 있어요.' },
  { keywords: ['출산축하', '바우처', '입학축하'],
    a: '자녀 초등학교 입학 시 50만원 바우처, 출산 시에도 50만원 바우처가 지급돼요.' },
  { keywords: ['국민연금', '고용보험', '산재', '4대보험'],
    a: '국민연금은 보수월액의 9.5%를 회사와 본인이 각 4.75%씩 부담해요.' },
  { keywords: ['문의', '연락처', '전화번호', '담당부서', '비즈니스솔루션팀', '미래성장팀'],
    a: '대부분의 생활지원·안전/건강 제도는 비즈니스솔루션팀이, 학자금·모성보호·퇴직연금 등은 미래성장팀이 담당하고 있어요.' }
];

var MOA_QUICK_QUESTIONS = [
  '복지포인트 얼마나 받나요?',
  '경조금은 얼마예요?',
  '휴양소 어떻게 예약해요?',
  '근무복은 언제 받나요?',
  '학자금 지원 조건이 뭔가요?'
];

var MOA_FALLBACK = '죄송해요, 정확히 이해하지 못했어요 🙏 아래 추천 질문을 눌러보시거나 다른 표현으로 다시 물어봐 주세요.';

(function () {
  var body      = document.getElementById('moaChatBody');
  var quickWrap = document.getElementById('moaChatQuick');
  var form      = document.getElementById('moaChatForm');
  var input     = document.getElementById('moaChatInput');

  if (!body || !form || !input) return;

  function scrollToBottom() { body.scrollTop = body.scrollHeight; }

  function addMessage(text, who) {
    var msg = document.createElement('div');
    msg.className = 'moa-msg ' + who;
    msg.innerHTML = (who === 'bot' ? '<div class="moa-msg-avatar"><i class="fa-solid fa-robot"></i></div>' : '') + '<div class="moa-msg-bubble"></div>';
    msg.querySelector('.moa-msg-bubble').textContent = text;
    body.appendChild(msg);
    scrollToBottom();
  }
  function showTyping() {
    var t = document.createElement('div');
    t.className = 'moa-msg bot';
    t.id = 'moaTypingMsg';
    t.innerHTML = '<div class="moa-msg-avatar"><i class="fa-solid fa-robot"></i></div><div class="moa-msg-bubble moa-typing"><span></span><span></span><span></span></div>';
    body.appendChild(t);
    scrollToBottom();
  }
  function hideTyping() {
    var t = document.getElementById('moaTypingMsg');
    if (t) t.remove();
  }
  function findAnswer(q) {
    var query = q.toLowerCase().replace(/\s/g, '');
    var best = null, bestScore = 0;
    MOA_FAQ.forEach(function (item) {
      var score = 0;
      item.keywords.forEach(function (k) {
        if (query.indexOf(k.toLowerCase().replace(/\s/g, '')) !== -1) score++;
      });
      if (score > bestScore) { bestScore = score; best = item; }
    });
    return bestScore > 0 ? best.a : MOA_FALLBACK;
  }
  function renderQuickChips() {
    quickWrap.innerHTML = '';
    MOA_QUICK_QUESTIONS.forEach(function (q) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'moa-chip';
      chip.textContent = q;
      chip.addEventListener('click', function () { handleUserInput(q); });
      quickWrap.appendChild(chip);
    });
  }
  function handleUserInput(text) {
    if (!text.trim()) return;
    addMessage(text, 'user');
    input.value = '';
    showTyping();
    setTimeout(function () {
      hideTyping();
      addMessage(findAnswer(text), 'bot');
    }, 600 + Math.random() * 400);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    handleUserInput(input.value);
  });

  addMessage('안녕하세요! 모아 복지도우미입니다 👋\n근무복·복지포인트·경조사·휴양소 등 궁금한 사내 복지제도를 물어보세요.', 'bot');
  renderQuickChips();
})();

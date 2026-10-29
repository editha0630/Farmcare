// 이 파일만 고치면 된다. 다른 js 파일은 건드리지 않아도 된다.
window.APP_CONFIG = {
  // Supabase 대시보드 → Project Settings → API 에서 복사한다.
  // 둘 다 비워두면 "데모 모드"로 실행된다: 데이터가 이 브라우저에만 저장되고, 인터넷 서버는 쓰지 않는다.
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: '',

  // 신청 마감 (한국 시간). supabase/schema.sql 의 closes_at 과 같아야 한다.
  BOOKING_CLOSES_AT: '2026-11-11T23:59:59+09:00',

  PRICE_PER_TEAM: 30000,

  // 농장주 동의를 받은 뒤 실제 정보로 바꾼다.
  ACCOUNT: {
    bank: '○○은행',
    number: '000-0000-0000-00',
    holder: '농장주 이름',
  },

  FARM: {
    name: '○○ 감 농장',
    region: '농장 위치(시·군)',
    intro: '가족이 함께 감나무 아래에서 직접 감을 따는 하루. 딴 감 중 5kg을 상자에 담아 가져가세요.',
  },

  // 데모 모드에서 운영자 화면에 들어갈 때 쓰는 계정 (실제 Supabase 모드에서는 쓰이지 않음)
  DEMO_OPERATOR: { email: 'demo@farmcare.test', password: 'demo1234' },
};

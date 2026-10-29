// 고객용 예약 화면
(function () {
  const cfg = window.APP_CONFIG;
  const api = window.FarmApi;
  const { fmt, normalizePhone, ERROR_MESSAGES } = window.FarmUtil;
  const $ = (id) => document.getElementById(id);

  const form = $('booking-form');
  const submitBtn = $('submit-btn');
  const formError = $('form-error');
  let depositorEdited = false;

  // ─── 고정 문구 채우기 ───────────────────────────
  $('farm-name').textContent = cfg.FARM.name;
  $('farm-region').textContent = cfg.FARM.region;
  $('farm-intro').textContent = cfg.FARM.intro;
  $('price').textContent = fmt.won(cfg.PRICE_PER_TEAM);
  document.querySelectorAll('.price-text').forEach((el) => { el.textContent = fmt.won(cfg.PRICE_PER_TEAM); });
  document.querySelectorAll('.account-bank').forEach((el) => { el.textContent = cfg.ACCOUNT.bank; });
  document.querySelectorAll('.account-number').forEach((el) => { el.textContent = cfg.ACCOUNT.number; });
  document.querySelectorAll('.account-holder').forEach((el) => { el.textContent = '예금주: ' + cfg.ACCOUNT.holder; });
  if (api.isDemo) $('demo-banner').hidden = false;

  // ─── 신청 마감 ─────────────────────────────────
  function isClosed() {
    return Date.now() > new Date(cfg.BOOKING_CLOSES_AT).getTime();
  }

  function showClosed() {
    $('closed-banner').hidden = false;
    form.hidden = true;
  }

  // ─── 회차와 남은 자리 ───────────────────────────
  async function loadSlots() {
    const list = $('slot-list');
    const selected = form.querySelector('input[name="slot"]:checked');
    const selectedId = selected ? selected.value : null;
    try {
      const slots = await api.getAvailability();
      list.innerHTML = '';
      slots.forEach((s) => {
        const full = s.remaining <= 0;
        const label = document.createElement('label');
        label.className = 'slot' + (full ? ' slot-full' : '');
        label.innerHTML = `
          <input type="radio" name="slot" value="${s.id}" ${full ? 'disabled' : ''}>
          <span class="slot-label"></span>
          <span class="slot-remaining">${full ? '마감' : `남은 자리 ${s.remaining}팀`}</span>`;
        label.querySelector('.slot-label').textContent = s.label;
        const input = label.querySelector('input');
        if (s.id === selectedId && !full) input.checked = true;
        list.appendChild(label);
      });
    } catch (e) {
      console.error(e);
      list.innerHTML = '<p class="notice notice-error">남은 자리를 불러오지 못했습니다. 새로고침해 주세요.</p>';
    }
  }

  // ─── 입금자명: 예약자 이름을 따라가다가, 직접 고치면 멈춤 ───
  $('name').addEventListener('input', () => {
    if (!depositorEdited) $('depositor').value = $('name').value;
  });
  $('depositor').addEventListener('input', () => { depositorEdited = true; });

  // ─── 인원 합계 안내 ─────────────────────────────
  function headcountOk() {
    return Number($('adults').value) + Number($('children').value) <= 4;
  }
  function updateHeadcountHint() {
    $('headcount-hint').classList.toggle('hint-error', !headcountOk());
  }
  $('adults').addEventListener('change', updateHeadcountHint);
  $('children').addEventListener('change', updateHeadcountHint);

  // ─── 입력 확인 ─────────────────────────────────
  function readForm() {
    const slot = form.querySelector('input[name="slot"]:checked');
    return {
      slotId: slot ? slot.value : '',
      slotLabel: slot ? slot.closest('.slot').querySelector('.slot-label').textContent : '',
      name: $('name').value.trim(),
      phone: $('phone').value,
      adults: Number($('adults').value),
      children: Number($('children').value),
      infants: Number($('infants').value),
      depositor: $('depositor').value.trim(),
      heardFrom: $('heard-from').value,
      privacyAgreed: $('privacy').checked,
    };
  }

  function validate(b) {
    if (!b.slotId) return '회차를 골라주세요.';
    if (!b.name) return '예약자 이름을 입력해 주세요.';
    if (!/^01[0-9]{8,9}$/.test(normalizePhone(b.phone))) return ERROR_MESSAGES.invalid_phone;
    if (b.adults + b.children > 4) return '어른과 어린이를 합쳐 최대 4명입니다. 5명 이상이면 2번 예약해 주세요.';
    if (!b.depositor) return '입금자명을 입력해 주세요.';
    if (!b.heardFrom) return '어떻게 알게 되셨는지 골라주세요.';
    if (!b.privacyAgreed) return '개인정보 수집·이용에 동의해 주셔야 예약할 수 있습니다.';
    return null;
  }

  function showError(msg) {
    formError.textContent = msg;
    formError.hidden = !msg;
    if (msg) formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // ─── 신청 ──────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submitBtn.disabled) return;
    if (isClosed()) { showClosed(); return; }

    const b = readForm();
    const problem = validate(b);
    if (problem) { showError(problem); return; }
    showError('');

    submitBtn.disabled = true;           // 두 번 누르기 방지
    submitBtn.textContent = '신청하는 중…';
    try {
      const res = await api.createBooking(b);
      if (!res.ok) {
        showError(ERROR_MESSAGES[res.code] || ERROR_MESSAGES.invalid);
        if (res.code === 'full') await loadSlots();
        if (res.code === 'closed') showClosed();
        return;
      }
      showDone(b, res);
    } catch (err) {
      console.error(err);
      showError('신청 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요. 계속 안 되면 문자로 알려주세요.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = '예약 신청';
    }
  });

  function showDone(b, res) {
    $('done-slot').textContent = res.slot_label || b.slotLabel;
    $('done-amount').textContent = fmt.won(cfg.PRICE_PER_TEAM);
    $('done-deadline').textContent = fmt.kst(res.deadline);
    $('done-depositor').textContent = b.depositor;
    form.hidden = true;
    $('done').hidden = false;
    $('done').focus();
    window.scrollTo({ top: $('done').offsetTop - 16, behavior: 'smooth' });
  }

  $('again-btn').addEventListener('click', () => {
    form.reset();
    depositorEdited = false;
    $('done').hidden = true;
    form.hidden = false;
    loadSlots();
    window.scrollTo({ top: form.offsetTop - 16, behavior: 'smooth' });
  });

  // ─── 계좌번호 복사 ──────────────────────────────
  function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { t.hidden = true; }, 2000);
  }

  async function copyAccount() {
    const text = cfg.ACCOUNT.number.replace(/[^0-9]/g, '');
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    toast('계좌번호를 복사했습니다');
  }
  document.querySelectorAll('.copy-btn').forEach((btn) => btn.addEventListener('click', copyAccount));

  // ─── 시작 ──────────────────────────────────────
  if (isClosed()) showClosed();
  else loadSlots();
})();

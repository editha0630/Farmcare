// 운영자 화면: 로그인, 명단 보기, 상태 변경
(function () {
  const cfg = window.APP_CONFIG;
  const api = window.FarmApi;
  const { fmt, ERROR_MESSAGES } = window.FarmUtil;
  const $ = (id) => document.getElementById(id);

  const STATUS_LABEL = { pending: '입금 대기', confirmed: '예약 확정', cancelled: '취소' };
  let slots = [];
  let bookings = [];

  if (api.isDemo) {
    $('demo-banner').hidden = false;
    $('demo-login-hint').hidden = false;
    $('demo-login-hint').textContent =
      `데모 계정: ${cfg.DEMO_OPERATOR.email} / ${cfg.DEMO_OPERATOR.password}`;
  }

  function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { t.hidden = true; }, 2000);
  }

  function showError(el, msg) {
    el.textContent = msg;
    el.hidden = !msg;
  }

  // ─── 로그인 ────────────────────────────────────
  async function start() {
    const session = await api.getSession();
    if (!session) { showLogin(); return; }
    if (!(await api.isOperator())) {
      await api.signOut();
      showLogin('운영자로 등록되지 않은 계정입니다. 정상섭에게 등록을 요청하세요.');
      return;
    }
    $('user-email').textContent = session.email;
    $('login').hidden = true;
    $('board').hidden = false;
    await loadBoard();
  }

  function showLogin(msg) {
    $('board').hidden = true;
    $('login').hidden = false;
    showError($('login-error'), msg || '');
  }

  $('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('login-btn');
    btn.disabled = true;
    try {
      await api.signIn($('email').value.trim(), $('password').value);
      $('password').value = '';
      await start();
    } catch (err) {
      console.error(err);
      showError($('login-error'), '이메일이나 비밀번호가 맞지 않습니다.');
    } finally {
      btn.disabled = false;
    }
  });

  $('logout-btn').addEventListener('click', async () => {
    await api.signOut();
    bookings = [];
    $('booking-list').innerHTML = '';
    showLogin();
  });

  // ─── 명단 ──────────────────────────────────────
  async function loadBoard() {
    showError($('board-error'), '');
    try {
      [slots, bookings] = await Promise.all([api.getAvailability(), api.listBookings()]);
      fillSlotFilter();
      render();
    } catch (err) {
      console.error(err);
      showError($('board-error'), '명단을 불러오지 못했습니다. 새로고침하거나 다시 로그인해 주세요.');
    }
  }

  function fillSlotFilter() {
    const sel = $('filter-slot');
    const current = sel.value;
    sel.innerHTML = '<option value="">전체</option>';
    slots.forEach((s) => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.label} (남은 ${s.remaining})`;
      sel.appendChild(opt);
    });
    sel.value = current;
  }

  function slotLabel(id) {
    const s = slots.find((x) => x.id === id);
    return s ? s.label : id;
  }

  function render() {
    const slotFilter = $('filter-slot').value;
    const statusFilter = $('filter-status').value;
    const order = slots.map((s) => s.id);
    const rows = bookings
      .filter((b) => (!slotFilter || b.slot_id === slotFilter) && (!statusFilter || b.status === statusFilter))
      .sort((a, b) => order.indexOf(a.slot_id) - order.indexOf(b.slot_id)
        || new Date(a.created_at) - new Date(b.created_at));

    $('count-line').textContent = `${rows.length}건 표시 (전체 ${bookings.length}건)`;
    const list = $('booking-list');
    list.innerHTML = '';
    if (!rows.length) {
      list.innerHTML = '<p class="muted">해당하는 예약이 없습니다.</p>';
      return;
    }
    rows.forEach((b) => list.appendChild(renderCard(b)));
  }

  function renderCard(b) {
    const card = document.createElement('article');
    card.className = `booking status-${b.status}`;
    card.innerHTML = `
      <div class="booking-top">
        <span class="badge badge-${b.status}"></span>
        <span class="booking-slot"></span>
      </div>
      <p class="booking-name"></p>
      <dl class="info small">
        <dt>전화</dt><dd><a class="booking-phone"></a></dd>
        <dt>인원</dt><dd class="booking-people"></dd>
        <dt>입금자명</dt><dd class="booking-depositor"></dd>
        <dt>알게 된 경로</dt><dd class="booking-heard"></dd>
        <dt>신청 시각</dt><dd class="booking-created"></dd>
      </dl>
      <div class="booking-actions"></div>`;
    card.querySelector('.badge').textContent = STATUS_LABEL[b.status];
    card.querySelector('.booking-slot').textContent = slotLabel(b.slot_id);
    card.querySelector('.booking-name').textContent = b.name;
    const phone = card.querySelector('.booking-phone');
    phone.textContent = fmt.phone(b.phone);
    phone.href = 'tel:' + b.phone;
    card.querySelector('.booking-people').textContent =
      `어른 ${b.adults} · 어린이 ${b.children}` + (b.infants ? ` · 만 3세 미만 ${b.infants}` : '');
    card.querySelector('.booking-depositor').textContent = b.depositor;
    card.querySelector('.booking-heard').textContent = b.heard_from;
    card.querySelector('.booking-created').textContent = fmt.kst(b.created_at);

    const actions = card.querySelector('.booking-actions');
    const add = (label, status, cls) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = cls;
      btn.textContent = label;
      btn.addEventListener('click', () => changeStatus(b, status, btn));
      actions.appendChild(btn);
    };
    if (b.status === 'pending') {
      add('입금 확인 → 확정', 'confirmed', 'btn-primary small');
      add('취소', 'cancelled', 'btn-danger small');
    } else if (b.status === 'confirmed') {
      add('입금 대기로 되돌리기', 'pending', 'btn-secondary small');
      add('취소', 'cancelled', 'btn-danger small');
    } else {
      add('다시 확정', 'confirmed', 'btn-primary small');
      add('입금 대기로', 'pending', 'btn-secondary small');
    }
    return card;
  }

  async function changeStatus(b, status, btn) {
    if (status === 'cancelled' && !confirm(`${b.name}님 예약을 취소할까요? 자리가 다시 열립니다.`)) return;
    btn.disabled = true;
    try {
      const res = await api.setStatus(b.id, status);
      if (!res.ok) {
        const msg = res.code === 'full'
          ? '이 회차는 정원이 찼습니다. 다른 회차를 제안하거나 환불해 주세요.'
          : (ERROR_MESSAGES[res.code] || '상태를 바꾸지 못했습니다.');
        showError($('board-error'), msg);
        return;
      }
      toast(`${b.name}님 → ${STATUS_LABEL[status]}`);
      await loadBoard();
    } catch (err) {
      console.error(err);
      showError($('board-error'), '상태를 바꾸지 못했습니다. 새로고침해 주세요.');
    } finally {
      btn.disabled = false;
    }
  }

  $('filter-slot').addEventListener('change', render);
  $('filter-status').addEventListener('change', render);
  $('refresh-btn').addEventListener('click', loadBoard);

  start();
})();

'use strict';

// 파일럿 설정. 농가·주말·운영 규칙이 바뀌면 여기만 고친다.
const CONFIG = {
  farms: [
    {
      id: 'farm-a',
      name: '파일럿 농가 A',
      crop: '단감',
      harvestPeriod: '2026년 11월 7일 ~ 11월 22일',
      weekends: [
        { id: '2026-11-07', label: '11월 7일(토) ~ 8일(일)' },
        { id: '2026-11-14', label: '11월 14일(토) ~ 15일(일)' },
        { id: '2026-11-21', label: '11월 21일(토) ~ 22일(일)' },
      ],
    },
  ],
  maxPeoplePerSlot: 10, // 회당 인원 상한
  slotsPerDay: 1,       // 하루 1회 운영
  daysPerWeekend: 2,
  goal: { teamsPerFarm: 10, paidRate: 0.5 },
};

const STORAGE_KEY = 'farmcare.dylan.applications.v1';
const MAX_CHILD_AGE = 18;
const PHONE_RE = /^01[016789]\d{7,8}$/;

// 점검용: index.html?simulate=save-fail 로 열면 저장이 항상 실패한다.
const SIMULATE_SAVE_FAIL = new URLSearchParams(location.search).get('simulate') === 'save-fail';

// ---------- 저장소 ----------

function loadApplications() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) return [];
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error('저장된 데이터 형식이 올바르지 않습니다.');
  return parsed;
}

function saveApplications(apps) {
  if (SIMULATE_SAVE_FAIL) throw new Error('저장 실패 시뮬레이션');
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}

// ---------- 공통 ----------

const $ = (id) => document.getElementById(id);

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  Object.assign(node, props);
  for (const child of [].concat(children)) {
    node.append(child instanceof Node ? child : String(child));
  }
  return node;
}

function findFarm(id) {
  return CONFIG.farms.find((f) => f.id === id);
}

function weekendLabel(farm, weekendId) {
  return farm?.weekends.find((w) => w.id === weekendId)?.label ?? weekendId;
}

function formatPhone(digits) {
  return digits.length === 11
    ? `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
    : `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function formatAges(ages) {
  return ages.length ? ages.map((a) => `${a}세`).join(', ') : '없음';
}

function formatDateTime(iso) {
  return new Date(iso).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' });
}

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// ---------- 신청 화면 ----------

const form = $('apply-form');

function renderFarmInfo() {
  const farm = findFarm(form.farm.value);
  $('farm-name').textContent = farm.name;
  $('farm-crop').textContent = farm.crop;
  $('farm-period').textContent = farm.harvestPeriod;
  $('weekend-options').replaceChildren(
    ...farm.weekends.map((w) =>
      el('label', {}, [el('input', { type: 'radio', name: 'weekend', value: w.id }), w.label])
    )
  );
}

function initApplyView() {
  form.farm.replaceChildren(...CONFIG.farms.map((f) => el('option', { value: f.id }, f.name)));
  $('farm-field').hidden = CONFIG.farms.length < 2;
  form.people.max = CONFIG.maxPeoplePerSlot;
  $('people-hint').textContent = `한 가족 최대 ${CONFIG.maxPeoplePerSlot}명`;
  $('max-people').textContent = CONFIG.maxPeoplePerSlot;
  renderFarmInfo();

  form.farm.addEventListener('change', renderFarmInfo);
  form.addEventListener('submit', onSubmit);
  $('apply-again').addEventListener('click', () => {
    form.reset();
    renderFarmInfo();
    $('success').hidden = true;
    form.hidden = false;
  });
}

function parseChildAges(text) {
  const trimmed = text.trim();
  if (trimmed === '없음' || trimmed === '0명') return { ages: [] };
  const parts = trimmed.split(/[,\s]+/).filter(Boolean);
  if (!parts.length) return { error: '아이 나이를 입력해 주세요. 아이가 없으면 "없음"이라고 적어 주세요.' };
  const ages = [];
  for (const p of parts) {
    const n = Number(p.replace(/세$/, ''));
    if (!Number.isInteger(n) || n < 0 || n > MAX_CHILD_AGE) {
      return { error: `"${p}"은(는) 올바른 나이가 아닙니다. 0~${MAX_CHILD_AGE} 사이 숫자로 적어 주세요.` };
    }
    ages.push(n);
  }
  return { ages };
}

// 입력을 검사해 { values, errors } 를 돌려준다. errors 는 필드 이름 → 메시지.
function validate() {
  const errors = {};
  const farm = findFarm(form.farm.value);
  const weekendId = form.querySelector('input[name="weekend"]:checked')?.value ?? '';

  if (!weekendId) errors.weekend = '희망 주말을 골라 주세요.';

  const peopleText = form.people.value.trim();
  const people = Number(peopleText);
  if (!peopleText) {
    errors.people = '가족 인원을 입력해 주세요.';
  } else if (!Number.isInteger(people) || people < 1) {
    errors.people = '가족 인원은 1 이상의 숫자로 입력해 주세요.';
  } else if (people > CONFIG.maxPeoplePerSlot) {
    errors.people = `한 가족은 최대 ${CONFIG.maxPeoplePerSlot}명까지 신청할 수 있습니다.`;
  }

  const { ages, error: agesError } = parseChildAges(form.childAges.value);
  if (agesError) {
    errors.childAges = agesError;
  } else if (!errors.people && ages.length >= people) {
    errors.childAges = '어린이는 보호자와 함께해야 합니다. 성인이 1명 이상 포함되도록 인원과 나이를 확인해 주세요.';
  }

  const phone = form.phone.value.replace(/\D/g, '');
  if (!phone) {
    errors.phone = '연락처를 입력해 주세요.';
  } else if (!PHONE_RE.test(phone)) {
    errors.phone = '휴대폰 번호 형식이 올바르지 않습니다. 예: 010-1234-5678';
  }

  if (!form.safety.checked) errors.safety = '안전 수칙에 동의해야 신청할 수 있습니다.';

  return {
    errors,
    values: { farmId: farm.id, weekendId, people, childAges: ages ?? [], phone },
  };
}

const FIELD_LABELS = {
  weekend: '희망 주말',
  people: '가족 인원',
  childAges: '아이 나이',
  phone: '연락처',
  safety: '안전 수칙 동의',
};

function showErrors(errors) {
  for (const name of Object.keys(FIELD_LABELS)) {
    $(`err-${name}`).textContent = errors[name] ?? '';
    const input = name === 'weekend' ? null : form[name];
    if (input) input.setAttribute('aria-invalid', String(Boolean(errors[name])));
  }

  const names = Object.keys(errors);
  const summary = $('error-summary');
  if (!names.length) {
    summary.hidden = true;
    return;
  }
  summary.replaceChildren(
    '아래 항목을 확인해 주세요.',
    el('ul', {}, names.map((n) => el('li', {}, `${FIELD_LABELS[n]}: ${errors[n]}`)))
  );
  summary.hidden = false;
  const first = names[0] === 'weekend' ? form.querySelector('input[name="weekend"]') : form[names[0]];
  first?.focus();
}

function showSaveFailure() {
  const summary = $('error-summary');
  summary.replaceChildren('제출되지 않았습니다. 다시 시도해 주세요. (입력하신 내용은 그대로 남아 있습니다)');
  summary.hidden = false;
  summary.scrollIntoView({ block: 'center' });
}

function onSubmit(event) {
  event.preventDefault();
  const { values, errors } = validate();
  showErrors(errors);
  if (Object.keys(errors).length) return;

  const application = {
    id: newId(),
    submittedAt: new Date().toISOString(),
    ...values,
    safetyAgreed: true,
    paid: false,
  };

  try {
    const apps = loadApplications();
    apps.push(application);
    saveApplications(apps);
  } catch (err) {
    console.error(err);
    showSaveFailure(); // 입력값은 건드리지 않고, 성공 화면도 띄우지 않는다.
    return;
  }

  const farm = findFarm(application.farmId);
  $('success-summary').replaceChildren(
    el('dt', {}, '희망 주말'), el('dd', {}, weekendLabel(farm, application.weekendId)),
    el('dt', {}, '가족 인원'), el('dd', {}, `${application.people}명`),
    el('dt', {}, '아이 나이'), el('dd', {}, formatAges(application.childAges)),
    el('dt', {}, '연락처'), el('dd', {}, formatPhone(application.phone))
  );
  form.hidden = true;
  $('success').hidden = false;
  $('success').scrollIntoView({ block: 'start' });
}

// ---------- 팀 화면 ----------

function showTeamError(message) {
  const box = $('team-error');
  box.textContent = message;
  box.hidden = !message;
}

// 같은 농가·같은 주말에 같은 연락처로 들어온 신청은 중복으로 표시한다(접수는 그대로 둔다).
function duplicateKeys(apps) {
  const counts = new Map();
  for (const a of apps) {
    const key = `${a.farmId}|${a.weekendId}|${a.phone}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return new Set([...counts].filter(([, n]) => n > 1).map(([k]) => k));
}

function stat(label, value, goalText, met) {
  return el('div', { className: `stat${met ? ' met' : ''}` }, [
    el('div', { className: 'label' }, label),
    el('div', { className: 'value' }, value),
    el('div', { className: 'goal' }, goalText),
  ]);
}

function renderFarmSection(farm, apps, dupes) {
  const paidCount = apps.filter((a) => a.paid).length;
  const rate = apps.length ? paidCount / apps.length : 0;
  const capacity = CONFIG.maxPeoplePerSlot * CONFIG.slotsPerDay * CONFIG.daysPerWeekend;

  const stats = el('div', { className: 'stats' }, [
    stat('사전 신청', `${apps.length}팀`, `목표 ${CONFIG.goal.teamsPerFarm}팀 (2주 안)`, apps.length >= CONFIG.goal.teamsPerFarm),
    stat('결제 완료', `${paidCount}팀`, '입금 확인 기준', false),
    stat('결제 전환율', apps.length ? `${Math.round(rate * 100)}%` : '-', `목표 ${CONFIG.goal.paidRate * 100}% (결제 완료 ÷ 사전 신청)`, apps.length > 0 && rate >= CONFIG.goal.paidRate),
  ]);

  const weekendRows = farm.weekends.map((w) => {
    const list = apps.filter((a) => a.weekendId === w.id);
    const people = list.reduce((sum, a) => sum + a.people, 0);
    return el('tr', {}, [
      el('td', {}, w.label),
      el('td', {}, `${list.length}팀`),
      el('td', { className: people > capacity ? 'over' : '' }, `${people}명 / ${capacity}명`),
    ]);
  });
  const weekendTable = el('div', { className: 'table-wrap' }, el('table', {}, [
    el('thead', {}, el('tr', {}, [el('th', {}, '주말'), el('th', {}, '신청'), el('th', {}, '신청 인원 / 수용 인원')])),
    el('tbody', {}, weekendRows),
  ]));
  const capacityNote = el('p', { className: 'note' },
    `수용 인원 = 회당 ${CONFIG.maxPeoplePerSlot}명 × 하루 ${CONFIG.slotsPerDay}회 × ${CONFIG.daysPerWeekend}일. 넘치면 빨간색으로 표시됩니다. 사전 신청은 막지 않습니다.`);

  const sorted = [...apps].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  const rows = sorted.map((a) => {
    const isDupe = dupes.has(`${a.farmId}|${a.weekendId}|${a.phone}`);
    const checkbox = el('input', { type: 'checkbox', checked: a.paid });
    checkbox.setAttribute('aria-label', `${formatPhone(a.phone)} 결제 완료`);
    checkbox.addEventListener('change', () => togglePaid(a.id, checkbox));
    return el('tr', {}, [
      el('td', {}, formatDateTime(a.submittedAt)),
      el('td', {}, weekendLabel(farm, a.weekendId)),
      el('td', {}, `${a.people}명`),
      el('td', {}, formatAges(a.childAges)),
      el('td', {}, [formatPhone(a.phone), isDupe ? ' ' : '', isDupe ? el('span', { className: 'badge' }, '중복') : '']),
      el('td', {}, el('label', {}, [checkbox, ' 결제 완료'])),
    ]);
  });
  const appTable = rows.length
    ? el('div', { className: 'table-wrap' }, el('table', {}, [
        el('thead', {}, el('tr', {}, ['제출 시각', '희망 주말', '인원', '아이 나이', '연락처', '결제'].map((h) => el('th', {}, h)))),
        el('tbody', {}, rows),
      ]))
    : el('p', { className: 'empty' }, '아직 신청이 없습니다.');

  return el('div', { className: 'card' }, [
    el('h2', {}, `${farm.name} · ${farm.crop}`),
    stats,
    el('h3', {}, '주말별 신청'),
    weekendTable,
    capacityNote,
    el('h3', {}, '신청 목록'),
    appTable,
  ]);
}

function renderTeamView() {
  let apps;
  try {
    apps = loadApplications();
  } catch (err) {
    console.error(err);
    showTeamError('신청 목록을 불러오지 못했습니다. 페이지를 새로고침해 주세요.');
    $('team-content').replaceChildren();
    return;
  }
  showTeamError('');
  const dupes = duplicateKeys(apps);
  $('team-content').replaceChildren(
    ...CONFIG.farms.map((farm) => renderFarmSection(farm, apps.filter((a) => a.farmId === farm.id), dupes))
  );
}

function togglePaid(id, checkbox) {
  try {
    const apps = loadApplications();
    const target = apps.find((a) => a.id === id);
    if (!target) throw new Error('신청을 찾을 수 없습니다.');
    target.paid = checkbox.checked;
    saveApplications(apps);
  } catch (err) {
    console.error(err);
    checkbox.checked = !checkbox.checked; // 저장 못 했으면 화면도 되돌린다.
    showTeamError('결제 상태를 저장하지 못했습니다. 다시 시도해 주세요.');
    return;
  }
  renderTeamView();
}

// ---------- 화면 전환 ----------

function route() {
  const view = location.hash === '#team' ? 'team' : 'apply';
  $('apply-view').hidden = view !== 'apply';
  $('team-view').hidden = view !== 'team';
  document.querySelectorAll('[data-nav]').forEach((a) => a.classList.toggle('active', a.dataset.nav === view));
  if (view === 'team') renderTeamView();
}

initApplyView();
window.addEventListener('hashchange', route);
// 다른 탭에서 신청이 들어오면 팀 화면을 새로 그린다.
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY && location.hash === '#team') renderTeamView();
});
route();

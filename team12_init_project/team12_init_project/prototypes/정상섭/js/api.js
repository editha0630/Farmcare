// 데이터 저장소와 이야기하는 부분.
// config.js 에 Supabase 주소가 있으면 Supabase를, 없으면 이 브라우저 안의 데모 저장소를 쓴다.
// 두 저장소는 같은 규칙(신청 마감, 같은 번호 2건, 정원 5팀)을 따른다.
(function () {
  const cfg = window.APP_CONFIG;
  const isDemo = !cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY;

  function normalizePhone(raw) {
    return String(raw || '').replace(/[^0-9]/g, '');
  }

  // ─── Supabase 모드 ───────────────────────────────
  function createSupabaseApi() {
    const client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

    async function rpc(name, params) {
      const { data, error } = await client.rpc(name, params);
      if (error) throw error;
      return data;
    }

    return {
      isDemo: false,

      getAvailability: () => rpc('get_availability'),

      createBooking: (b) => rpc('create_booking', {
        p_slot_id: b.slotId,
        p_name: b.name,
        p_phone: b.phone,
        p_adults: b.adults,
        p_children: b.children,
        p_infants: b.infants,
        p_depositor: b.depositor,
        p_heard_from: b.heardFrom,
        p_privacy_agreed: b.privacyAgreed,
      }),

      async signIn(email, password) {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },

      async signOut() {
        await client.auth.signOut();
      },

      async getSession() {
        const { data } = await client.auth.getSession();
        return data.session ? { email: data.session.user.email } : null;
      },

      isOperator: () => rpc('is_operator'),

      async listBookings() {
        const { data, error } = await client
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: true });
        if (error) throw error;
        return data;
      },

      setStatus: (id, status) => rpc('set_booking_status', { p_id: id, p_status: status }),
    };
  }

  // ─── 데모 모드 (이 브라우저의 localStorage에만 저장) ───────────
  function createDemoApi() {
    const KEY = 'farmcare-demo-bookings-v1';
    const SESSION_KEY = 'farmcare-demo-session-v1';
    const SLOTS = [
      { id: '1114-10', label: '11/14(토) 오전 10:00', starts_at: '2026-11-14T10:00:00+09:00', capacity: 5 },
      { id: '1114-14', label: '11/14(토) 오후 2:00', starts_at: '2026-11-14T14:00:00+09:00', capacity: 5 },
      { id: '1115-10', label: '11/15(일) 오전 10:00', starts_at: '2026-11-15T10:00:00+09:00', capacity: 5 },
      { id: '1115-14', label: '11/15(일) 오후 2:00', starts_at: '2026-11-15T14:00:00+09:00', capacity: 5 },
    ];
    const HEARD_FROM = ['지인 소개', 'SNS', '지역 커뮤니티', '기타'];
    let memory = [];
    let memorySession = null;

    function load() {
      try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return memory; }
    }
    function save(list) {
      memory = list;
      try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* 저장 불가 환경: 메모리에만 */ }
    }
    function active(list) {
      return list.filter((b) => b.status !== 'cancelled');
    }
    function delay(v) {
      return new Promise((resolve) => setTimeout(() => resolve(v), 250));
    }

    return {
      isDemo: true,

      async getAvailability() {
        const list = active(load());
        return delay(SLOTS.map((s) => ({
          ...s,
          remaining: Math.max(s.capacity - list.filter((b) => b.slot_id === s.id).length, 0),
        })));
      },

      async createBooking(b) {
        if (Date.now() > new Date(cfg.BOOKING_CLOSES_AT).getTime()) return delay({ ok: false, code: 'closed' });
        const phone = normalizePhone(b.phone);
        if (!/^01[0-9]{8,9}$/.test(phone)) return delay({ ok: false, code: 'invalid_phone' });
        const slot = SLOTS.find((s) => s.id === b.slotId);
        if (!slot) return delay({ ok: false, code: 'bad_slot' });

        const valid = b.name.trim() && b.depositor.trim() && b.adults >= 1 && b.children >= 0
          && b.adults + b.children <= 4 && b.infants >= 0 && b.infants <= 4
          && HEARD_FROM.includes(b.heardFrom) && b.privacyAgreed === true;
        if (!valid) return delay({ ok: false, code: 'invalid' });

        const list = load();
        if (active(list).filter((x) => x.phone === phone).length >= 2) return delay({ ok: false, code: 'phone_limit' });
        if (active(list).filter((x) => x.slot_id === slot.id).length >= slot.capacity) return delay({ ok: false, code: 'full' });

        const now = new Date();
        const booking = {
          id: 'demo-' + now.getTime() + '-' + Math.random().toString(36).slice(2, 7),
          created_at: now.toISOString(),
          slot_id: slot.id,
          name: b.name.trim(),
          phone,
          adults: b.adults,
          children: b.children,
          infants: b.infants,
          depositor: b.depositor.trim(),
          heard_from: b.heardFrom,
          privacy_agreed: true,
          status: 'pending',
          status_changed_at: null,
        };
        list.push(booking);
        save(list);
        return delay({
          ok: true,
          id: booking.id,
          slot_label: slot.label,
          created_at: booking.created_at,
          deadline: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        });
      },

      async signIn(email, password) {
        const op = cfg.DEMO_OPERATOR;
        if (email !== op.email || password !== op.password) throw new Error('Invalid login credentials');
        memorySession = { email };
        try { sessionStorage.setItem(SESSION_KEY, email); } catch (e) { /* 메모리에만 */ }
      },

      async signOut() {
        memorySession = null;
        try { sessionStorage.removeItem(SESSION_KEY); } catch (e) { /* 무시 */ }
      },

      async getSession() {
        try {
          const email = sessionStorage.getItem(SESSION_KEY);
          if (email) return { email };
        } catch (e) { /* 무시 */ }
        return memorySession;
      },

      isOperator: async () => true,

      listBookings: async () => delay(load()),

      async setStatus(id, status) {
        const list = load();
        const b = list.find((x) => x.id === id);
        if (!b) return delay({ ok: false, code: 'not_found' });
        if (b.status === 'cancelled' && status !== 'cancelled') {
          const others = active(list);
          if (others.filter((x) => x.phone === b.phone).length >= 2) return delay({ ok: false, code: 'phone_limit' });
          const slot = SLOTS.find((s) => s.id === b.slot_id);
          if (others.filter((x) => x.slot_id === b.slot_id).length >= slot.capacity) return delay({ ok: false, code: 'full' });
        }
        b.status = status;
        b.status_changed_at = new Date().toISOString();
        save(list);
        return delay({ ok: true });
      },
    };
  }

  // ─── 화면에서 함께 쓰는 도구 ─────────────────────
  const fmt = {
    won: (n) => n.toLocaleString('ko-KR') + '원',
    // 예: "10월 30일(금) 21:25" — 항상 한국 시간으로 보여준다
    kst(iso) {
      const parts = {};
      new Intl.DateTimeFormat('ko-KR', {
        timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric', weekday: 'short',
        hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
      }).formatToParts(new Date(iso)).forEach((p) => { parts[p.type] = p.value; });
      return `${parts.month}월 ${parts.day}일(${parts.weekday}) ${parts.hour}:${parts.minute}`;
    },
    phone(p) {
      return p.length === 11 ? `${p.slice(0, 3)}-${p.slice(3, 7)}-${p.slice(7)}` : p;
    },
  };

  const ERROR_MESSAGES = {
    closed: '예약 신청이 마감되었습니다. (11/11 23:59 마감)',
    full: '방금 이 회차의 자리가 모두 찼습니다. 다른 회차를 골라주세요.',
    phone_limit: '이 전화번호로 이미 예약이 2건 있습니다. 변경은 문자로 문의해 주세요.',
    invalid_phone: '휴대폰 번호를 다시 확인해 주세요. (예: 010-1234-5678)',
    invalid: '입력한 내용을 다시 확인해 주세요.',
    bad_slot: '회차를 다시 골라주세요.',
    not_found: '예약을 찾을 수 없습니다. 새로고침해 주세요.',
    forbidden: '운영자로 등록된 계정만 바꿀 수 있습니다.',
  };

  window.FarmApi = isDemo ? createDemoApi() : createSupabaseApi();
  window.FarmUtil = { fmt, normalizePhone, ERROR_MESSAGES };
})();

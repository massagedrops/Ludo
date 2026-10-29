/* Royal Ludo – UI + game flow (port of LudoGameViewModel and the Compose screens) */
(function () {
  'use strict';
  const E = window.LudoEngine;
  const $ = (s, r = document) => r.querySelector(s);
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- storage ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem('rl_' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('rl_' + k, JSON.stringify(v)); } catch (e) { /* private mode */ } }
  };
  const S = {
    lang: store.get('lang', (navigator.language || '').startsWith('bn') ? 'bn' : 'en'),
    sound: store.get('sound', true),
    vib: store.get('vib', true),
    name: store.get('name', 'Royal King'),
    avatar: store.get('avatar', 0),
    coins: store.get('coins', 1000),
    played: store.get('played', 0),
    won: store.get('won', 0),
    captures: store.get('captures', 0),
    tokensHome: store.get('tokensHome', 0),
    lastClaim: store.get('lastClaim', '')
  };
  const save = k => store.set(k, S[k]);
  const today = () => new Date().toISOString().slice(0, 10);

  /* ---------- i18n ---------- */
  const STR = {
    en: {
      app_name: 'Royal Ludo', tagline: 'The Ultimate Classic Board Experience',
      play_online: 'Play Online with Friends', how_to_play: 'How to Play', settings: 'Settings', profile: 'Player Profile',
      select_mode: 'Select Game Mode', pass_and_play: 'Pass & Play (Local)', vs_computer: 'VS Computer (Smart AI)',
      vs_sub: 'Play with 1-3 intelligent AI opponents', pp_sub: '2, 3, or 4 players on one phone', online_sub: 'Room system & multiplayer lobby',
      players_count: 'Number of Players', n_players: n => n + ' Players', player_config: 'Player Configuration',
      human: 'Human', bot: 'Bot (AI)', start_game: 'Start Match', roll_dice: 'Roll Dice', rolling: 'Rolling...',
      tap_to_move: 'Tap a highlighted token to move', rolled_six: 'Rolled a 6! Roll again!',
      token_captured: 'Token captured! Bonus roll!', token_home: 'Token reached Home! Bonus roll!',
      three_sixes: 'Three consecutive 6s! Turn forfeited!', no_moves: 'No valid moves. Next player!',
      winner: 'Winner!', congratulations: 'Congratulations! Victory is yours!', play_again: 'Play Again', main_menu: 'Main Menu',
      pause: 'Pause', resume: 'Resume', restart: 'Restart', sound_sfx: 'Sound Effects', vibration: 'Vibration Haptics',
      language: 'Language / ভাষা', save: 'Save', saved: 'Saved!', coins: 'Coins', stats: 'Game Statistics',
      matches_played: 'Matches Played', matches_won: 'Matches Won', win_rate: 'Win Rate', total_captures: 'Total Captures',
      tokens_finished: 'Tokens Finished', daily_bonus: 'Daily Bonus', claim_bonus: 'Claim Free (+200 Coins)', bonus_claimed: 'Claimed Today!',
      bonus_got: '+200 coins added!', select_avatar: 'Select Avatar', your_name: 'Your name',
      turn_roll: n => n + ' – roll the dice', turn_bot: n => n + ' is playing…', bot_short: 'Bot',
      install: '📲 Install App on Your Phone', installed_ok: 'Installed! Open it from your home screen.',
      ios_hint: 'To install on iPhone: tap the Share button, then “Add to Home Screen”.',
      android_hint: 'To install: open the browser menu (⋮) and choose “Install app” / “Add to Home screen”.',
      online_title: 'Play Online', online_soon: 'Coming soon',
      create_room: 'Create Room', join_room: 'Join a Room', enter_code: 'Enter room code', join: 'Join', or_: 'or',
      invite: 'Invite friends', copy_link: 'Copy link', link_copied: 'Link copied!', whatsapp: 'WhatsApp',
      share_msg: 'Come play Royal Ludo with me! Room code: ', room_code: 'Room Code', lobby: 'Game Lobby', host: 'Host', you: 'You',
      waiting: 'Waiting for player…', add_bot: '+ Add bot', remove_bot: 'Remove bot', start_online: 'Start Match',
      need_two: 'You need at least 2 players', connecting: 'Connecting…', not_found: 'Room not found. Check the code.',
      room_full: 'Room is full', game_started: 'That game has already started', host_left: 'The host left the game',
      net_error: 'Connection problem. Check your internet and try again.', no_lib: 'Online mode could not load. Check your internet.',
      left_bot: n => n + ' left – a bot took over', back_lobby: 'Back to Lobby', waiting_host: 'Waiting for the host…',
      online_note: 'Needs internet. The host must keep the app open while everyone plays.', leave: 'Leave room', won_it: n => n + ' wins!',
      online_desc: 'Online rooms need a backend server (for example Firebase) to sync moves between phones. This version plays fully offline – vs the computer or with friends passing one phone.',
      play_vs_cpu_now: 'Play vs Computer now', back: 'Back', coins_won: n => '+' + n + ' coins!',
      avatars: ['Crown', 'Lion', 'Griffin', 'Castle', 'Knight', 'Sorcerer'],
      rules: [
        ['1. Opening & Base Release', 'You must roll a 6 to bring a token out of your starting yard onto the main track.'],
        ['2. Movement & Track', 'Tokens travel clockwise along the 52-square outer track before heading down your home column.'],
        ['3. Safe Squares (Stars)', 'Squares with Stars and starting track positions are safe. Opponents cannot capture tokens resting on safe squares.'],
        ['4. Capturing & Extra Rolls', "Landing on an opponent's token sends it back to their yard and rewards you an extra turn! Rolling a 6 or finishing a token also awards a bonus roll."],
        ['5. Winning the Crown', 'Exact roll is required to enter the center home triangle. The first player to bring all 4 tokens to home wins!']
      ]
    },
    bn: {
      app_name: 'রয়্যাল লুডো', tagline: 'সেরা ক্লাসিক বোর্ড গেমের অভিজ্ঞতা',
      play_online: 'বন্ধুদের সাথে অনলাইন খেলুন', how_to_play: 'খেলার নিয়ম', settings: 'সেটিংস', profile: 'প্লেয়ার প্রোফাইল',
      select_mode: 'খেলার মোড নির্বাচন করুন', pass_and_play: 'পাস অ্যান্ড প্লে (লোকাল)', vs_computer: 'বনাম কম্পিউটার (এআই)',
      vs_sub: '১-৩ জন স্মার্ট এআই প্রতিপক্ষের সাথে খেলুন', pp_sub: 'একটি ফোনে ২, ৩ বা ৪ জন খেলুন', online_sub: 'রুম সিস্টেম ও মাল্টিপ্লেয়ার লবি',
      players_count: 'খেলোয়াড় সংখ্যা', n_players: n => ({ 2: '২', 3: '৩', 4: '৪' }[n]) + ' খেলোয়াড়', player_config: 'খেলোয়াড় কনফিগারেশন',
      human: 'মানুষ', bot: 'বট (এআই)', start_game: 'ম্যাচ শুরু করুন', roll_dice: 'ডাইস রোল করুন', rolling: 'ঘুরছে...',
      tap_to_move: 'চালানোর জন্য হাইলাইট করা ঘুঁটি চাপুন', rolled_six: 'ছক্কা পড়েছে! আবার চালুন!',
      token_captured: 'ঘুঁটি কাটা পড়েছে! অতিরিক্ত চাল!', token_home: 'ঘুঁটি ঘরে পৌঁছেছে! অতিরিক্ত চাল!',
      three_sixes: 'টানা ৩টি ছক্কা! চাল বাতিল!', no_moves: 'কোনো বৈধ চাল নেই। পরবর্তী খেলোয়াড়!',
      winner: 'বিজয়ী!', congratulations: 'অভিনন্দন! আপনি জিতেছেন!', play_again: 'আবার খেলুন', main_menu: 'মূল মেনু',
      pause: 'বিরতি', resume: 'চালিয়ে যান', restart: 'পুনরায় শুরু', sound_sfx: 'সাউন্ড এফেক্টস', vibration: 'কম্পন',
      language: 'ভাষা (Language)', save: 'সংরক্ষণ করুন', saved: 'সংরক্ষিত হয়েছে!', coins: 'কয়েন', stats: 'খেলার পরিসংখ্যান',
      matches_played: 'মোট খেলা ম্যাচ', matches_won: 'বিজয়ী ম্যাচ', win_rate: 'জয়ের হার', total_captures: 'মোট ঘুঁটি কাটা',
      tokens_finished: 'ঘরে তোলা ঘুঁটি', daily_bonus: 'দৈনিক বোনাস', claim_bonus: 'বোনাস নিন (+২০০ কয়েন)', bonus_claimed: 'বোনাস নেওয়া হয়েছে!',
      bonus_got: '+২০০ কয়েন যোগ হয়েছে!', select_avatar: 'অ্যাভাটার বেছে নিন', your_name: 'আপনার নাম',
      turn_roll: n => n + ' – ডাইস রোল করুন', turn_bot: n => n + ' খেলছে…', bot_short: 'বট',
      install: '📲 ফোনে অ্যাপ ইন্সটল করুন', installed_ok: 'ইন্সটল হয়েছে! হোম স্ক্রিন থেকে খুলুন।',
      ios_hint: 'আইফোনে ইন্সটল করতে: Share বাটন চেপে “Add to Home Screen” বেছে নিন।',
      android_hint: 'ইন্সটল করতে: ব্রাউজার মেনু (⋮) থেকে “Install app” / “Add to Home screen” চাপুন।',
      online_title: 'অনলাইনে খেলুন', online_soon: 'শীঘ্রই আসছে',
      create_room: 'রুম তৈরি করুন', join_room: 'রুমে যোগ দিন', enter_code: 'রুম কোড লিখুন', join: 'যোগ দিন', or_: 'অথবা',
      invite: 'বন্ধুদের ডাকুন', copy_link: 'লিংক কপি', link_copied: 'লিংক কপি হয়েছে!', whatsapp: 'হোয়াটসঅ্যাপ',
      share_msg: 'আমার সাথে রয়্যাল লুডো খেলতে আসো! রুম কোড: ', room_code: 'রুম কোড', lobby: 'গেম লবি', host: 'হোস্ট', you: 'আপনি',
      waiting: 'খেলোয়াড়ের অপেক্ষায়…', add_bot: '+ বট যোগ করুন', remove_bot: 'বট সরান', start_online: 'ম্যাচ শুরু করুন',
      need_two: 'কমপক্ষে ২ জন খেলোয়াড় লাগবে', connecting: 'সংযোগ হচ্ছে…', not_found: 'রুম পাওয়া যায়নি। কোড ঠিক আছে কিনা দেখুন।',
      room_full: 'রুম ভর্তি', game_started: 'ওই গেম আগেই শুরু হয়ে গেছে', host_left: 'হোস্ট গেম ছেড়ে চলে গেছে',
      net_error: 'সংযোগে সমস্যা। ইন্টারনেট দেখে আবার চেষ্টা করুন।', no_lib: 'অনলাইন মোড লোড হয়নি। ইন্টারনেট চেক করুন।',
      left_bot: n => n + ' চলে গেছে – বট তার জায়গা নিয়েছে', back_lobby: 'লবিতে ফিরুন', waiting_host: 'হোস্টের অপেক্ষায়…',
      online_note: 'ইন্টারনেট লাগবে। সবাই খেলার সময় হোস্টকে অ্যাপ খোলা রাখতে হবে।', leave: 'রুম ছাড়ুন', won_it: n => n + ' জিতেছে!',
      online_desc: 'অনলাইন রুমে ফোনগুলোর মধ্যে চাল সিঙ্ক করতে একটি ব্যাকএন্ড সার্ভার (যেমন Firebase) লাগে। এই ভার্সন সম্পূর্ণ অফলাইনে চলে – কম্পিউটারের সাথে বা একটি ফোন ঘুরিয়ে বন্ধুদের সাথে।',
      play_vs_cpu_now: 'এখনই কম্পিউটারের সাথে খেলুন', back: 'ফিরে যান', coins_won: n => '+' + n + ' কয়েন!',
      avatars: ['মুকুট', 'সিংহ', 'গ্রিফিন', 'দুর্গ', 'নাইট', 'জাদুকর'],
      rules: [
        ['১. খেলা শুরু ও ঘুঁটি বের করা', 'ঘুঁটি ঘরের বাইরে মূল ট্র্যাকে আনতে অবশ্যই ডাইসে ৬ (ছক্কা) ফেলতে হবে।'],
        ['২. পথচলা ও দিক', 'ঘুঁটিগুলো বোর্ডের চারপাশে ঘড়ির কাঁটার দিকে ৫২টি ঘরে ভ্রমণ করে।'],
        ['৩. নিরাপদ ঘর (স্টার)', 'তারকাচিহ্নিত নিরাপদ ঘরে এবং হোম স্ট্রেচে প্রতিপক্ষ আপনার ঘুঁটি কাটতে পারবে না।'],
        ['৪. ঘুঁটি কাটা ও অতিরিক্ত চাল', 'প্রতিপক্ষের ঘুঁটির উপর পড়লে সেটি কেটে ঘরে ফেরত পাঠানো হয় এবং আপনি একটি অতিরিক্ত চাল পান। ৬ ফেললেও অতিরিক্ত চাল পাওয়া যায়।'],
        ['৫. জয়লাভ ও নিখুঁত চাল', 'হোমে পৌঁছাতে নিখুঁত ডাইস মান প্রয়োজন। যার ৪টি ঘুঁটি সবার আগে কেন্দ্রে পৌঁছাবে সে বিজয়ী হবে।']
      ]
    }
  };
  const t = (k, ...a) => { const v = STR[S.lang][k] ?? STR.en[k] ?? k; return typeof v === 'function' ? v(...a) : v; };
  const cname = c => E.COLORS[c][S.lang];
  const AVATARS = ['👑', '🦁', '🛡️', '🏰', '🤴', '🧙'];

  /* ---------- audio / haptics ---------- */
  let actx = null;
  function tone(freq, dur, type = 'sine', vol = 0.18, delay = 0, slideTo) {
    if (!S.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      const o = actx.createOscillator(), g = actx.createGain(), t0 = actx.currentTime + delay;
      o.type = type; o.frequency.setValueAtTime(freq, t0);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
      g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(actx.destination); o.start(t0); o.stop(t0 + dur + 0.02);
    } catch (e) { /* audio unavailable */ }
  }
  const vibrate = ms => { if (S.vib && navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) { /* ignore */ } } };
  const sfx = {
    dice() { for (let i = 0; i < 5; i++) tone(300 + Math.random() * 300, 0.05, 'square', 0.07, i * 0.07); vibrate(30); },
    hop() { tone(520, 0.06, 'triangle', 0.14); },
    capture() { tone(500, 0.25, 'sawtooth', 0.13, 0, 120); vibrate([60, 40, 90]); },
    star() { tone(880, 0.1, 'sine', 0.15); tone(1320, 0.14, 'sine', 0.13, 0.09); vibrate(25); },
    home() { [523, 659, 784].forEach((f, i) => tone(f, 0.14, 'triangle', 0.16, i * 0.1)); vibrate(70); },
    victory() { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, 0.2, 'triangle', 0.17, i * 0.13)); vibrate([80, 50, 80, 50, 160]); }
  };

  /* ---------- navigation ---------- */
  let current = 'home';
  function go(name, push = true) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    current = name;
    const el = $('#s-' + name);
    renderers[name]();
    el.classList.add('active'); el.scrollTop = 0;
    document.documentElement.lang = S.lang;
    if (push && name !== 'home') { try { history.pushState({ s: name }, ''); } catch (e) { /* ignore */ } }
  }
  window.addEventListener('popstate', () => {
    if (current === 'game') { if (G && !G.winner) { pause(true); try { history.pushState({ s: 'game' }, ''); } catch (e) { /* */ } } else go('home', false); }
    else if (current !== 'home') go('home', false);
  });
  function toast(msg) {
    const el = $('#toast'); el.textContent = msg; el.classList.add('show');
    clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 2200);
  }
  const topbar = (title, backTo = 'home') => `<div class="topbar"><button class="back" data-go="${backTo}" aria-label="${t('back')}">←</button><h2>${title}</h2></div>`;

  /* ---------- PWA install ---------- */
  let deferredPrompt = null;
  const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; if (current === 'home') renderers.home(); });
  window.addEventListener('appinstalled', () => { deferredPrompt = null; toast(t('installed_ok')); if (current === 'home') renderers.home(); });
  async function doInstall() {
    if (deferredPrompt) { deferredPrompt.prompt(); try { await deferredPrompt.userChoice; } catch (e) { /* */ } deferredPrompt = null; renderers.home(); }
    else toast(/iphone|ipad|ipod/i.test(navigator.userAgent) ? t('ios_hint') : t('android_hint'));
  }
  function installBlock() {
    if (isStandalone()) return '';
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    return `<button class="install" data-act="install">${t('install')}</button>` +
      (ios ? `<div class="hint">${t('ios_hint')}</div>` : '');
  }

  /* ---------- screens ---------- */
  const claimable = () => S.lastClaim !== today();
  const renderers = {
    home() {
      $('#s-home').innerHTML = `<div class="wrap">
        <div class="row between">
          <div class="chip">🪙 <span id="coins">${S.coins}</span></div>
          <button class="chip btn" data-act="lang">🌐 ${S.lang === 'en' ? 'বাংলা' : 'English'}</button>
        </div>
        <img class="logo" src="icons/icon-192.png" alt="Royal Ludo" width="110" height="110">
        <h1 class="title">${t('app_name')}</h1>
        <p class="tagline">${t('tagline')}</p>
        <button class="bonus ${claimable() ? '' : 'done'}" data-act="bonus"><span class="ic">🎁</span>
          <span><b>${t('daily_bonus')}</b><br><small class="gold">${claimable() ? t('claim_bonus') : t('bonus_claimed')}</small></span></button>
        <button class="menu-btn" style="--accent:var(--green)" data-act="setup-cpu"><span class="ic">🤖</span><span><b>${t('vs_computer')}</b><small>${t('vs_sub')}</small></span><span class="go">▶</span></button>
        <button class="menu-btn" style="--accent:var(--blue)" data-act="setup-pp"><span class="ic">👥</span><span><b>${t('pass_and_play')}</b><small>${t('pp_sub')}</small></span><span class="go">▶</span></button>
        <button class="menu-btn" style="--accent:var(--gold)" data-go="online"><span class="ic">📡</span><span><b>${t('play_online')}</b><small>${t('online_sub')}</small></span><span class="go">▶</span></button>
        <div class="small-row">
          <button class="small-card" data-go="howto"><span>❓</span>${t('how_to_play')}</button>
          <button class="small-card" data-go="profile"><span>👤</span>${t('profile')}</button>
          <button class="small-card" data-go="settings"><span>⚙️</span>${t('settings')}</button>
        </div>
        ${installBlock()}
      </div>`;
    },

    setup() {
      const su = SU;
      const colors = SETUP_COLORS[su.count];
      $('#s-setup').innerHTML = `<div class="wrap">${topbar(t('player_config'))}
        <h3>${t('select_mode')}</h3>
        <div class="seg">
          <button class="${su.mode === 'cpu' ? 'on' : ''}" data-mode="cpu">🤖 ${t('vs_computer')}</button>
          <button class="${su.mode === 'pp' ? 'on' : ''}" data-mode="pp">👥 ${t('pass_and_play')}</button>
        </div>
        <h3>${t('players_count')}</h3>
        <div class="seg">${[2, 3, 4].map(n => `<button class="${su.count === n ? 'on' : ''}" data-count="${n}">${t('n_players', n)}</button>`).join('')}</div>
        <h3>${t('player_config')}</h3>
        ${colors.map((c, i) => `<div class="pcfg" style="--c:${E.COLORS[c].base}">
            <span class="dot" style="background:${E.COLORS[c].base}">${esc(cname(c).slice(0, 1))}</span>
            <input data-name="${i}" maxlength="14" value="${esc(su.cfg[i].name)}" placeholder="${esc(defaultName(i))}" aria-label="name">
            <button class="type ${su.cfg[i].type === 'bot' ? 'bot' : ''}" data-type="${i}">${su.cfg[i].type === 'bot' ? '🤖 ' + t('bot') : '🙂 ' + t('human')}</button>
          </div>`).join('')}
        <button class="primary" data-act="start">▶ ${t('start_game')}</button>
      </div>`;
    },

    game() { /* built by startMatch */ },

    howto() {
      $('#s-howto').innerHTML = `<div class="wrap">${topbar(t('how_to_play'))}
        ${t('rules').map(r => `<div class="card rule"><b>${r[0]}</b><p>${r[1]}</p></div>`).join('')}</div>`;
    },

    profile() {
      const wr = S.played ? Math.floor(S.won * 100 / S.played) : 0;
      $('#s-profile').innerHTML = `<div class="wrap">${topbar(t('profile'))}
        <div class="card" style="text-align:center">
          <div class="bigav" id="bigav">${AVATARS[S.avatar]}</div>
          <div class="muted" style="font-size:13px">${t('select_avatar')}</div>
          <div class="avatars">${AVATARS.map((a, i) => `<button class="${i === S.avatar ? 'on' : ''}" data-av="${i}" aria-label="${t('avatars')[i]}">${a}</button>`).join('')}</div>
          <input class="field" id="pname" maxlength="16" value="${esc(S.name)}" placeholder="${t('your_name')}">
          <button class="primary" style="margin-top:14px" data-act="saveprofile">${t('save')}</button>
        </div>
        <h3>${t('stats')}</h3>
        <div class="stats">
          <div class="stat"><b>🪙 ${S.coins}</b><small>${t('coins')}</small></div>
          <div class="stat"><b>${S.played}</b><small>${t('matches_played')}</small></div>
          <div class="stat"><b>${S.won}</b><small>${t('matches_won')}</small></div>
          <div class="stat"><b>${wr}%</b><small>${t('win_rate')}</small></div>
          <div class="stat"><b>${S.captures}</b><small>${t('total_captures')}</small></div>
          <div class="stat"><b>${S.tokensHome}</b><small>${t('tokens_finished')}</small></div>
        </div></div>`;
    },

    settings() {
      $('#s-settings').innerHTML = `<div class="wrap">${topbar(t('settings'))}
        <div class="setrow"><span>🌐 ${t('language')}</span><button class="chip btn" data-act="lang">${S.lang === 'en' ? 'বাংলা' : 'English'}</button></div>
        <div class="setrow"><span>🔊 ${t('sound_sfx')}</span><button class="sw ${S.sound ? 'on' : ''}" data-act="sound" aria-label="${t('sound_sfx')}"></button></div>
        <div class="setrow"><span>📳 ${t('vibration')}</span><button class="sw ${S.vib ? 'on' : ''}" data-act="vib" aria-label="${t('vibration')}"></button></div>
        ${installBlock()}
        <p class="muted" style="text-align:center;margin-top:22px;font-size:12px">Royal Ludo • v1.0</p></div>`;
    },

    online() { renderOnline(); }
  };

  /* ---------- setup state ---------- */
  const SETUP_COLORS = { 2: [0, 2], 3: [0, 1, 2], 4: [0, 1, 2, 3] };
  const SU = { mode: 'cpu', count: 4, cfg: [] };
  const defaultName = i => {
    const c = SETUP_COLORS[SU.count][i];
    return (SU.mode === 'cpu' ? 'Bot ' : 'Player ') + E.COLORS[c].en;
  };
  function setupDefaults() {
    SU.cfg = [0, 1, 2, 3].map(i => {
      if (SU.mode === 'cpu') return i === 0 ? { type: 'human', name: S.name } : { type: 'bot', name: '' };
      return { type: 'human', name: i === 0 ? S.name : '' };
    });
  }
  // when 3 players: colors are 0,1,2 (cfg index maps in order). When 2: red + yellow -> cfg[0], cfg[1].

  /* ---------- game ---------- */
  let G = null;
  let matchSeq = 0;
  const cur = () => G.players[G.turn];
  const isMine = p => !G.online ? p.type === 'human' : (G.online.host ? (p.type === 'human' && !p.remote) : p.color === G.online.myColor);
  const fx = n => { sfx[n](); if (G && G.online && G.online.host) G.fxq.push(n); };
  const pace = async ms => { await sleep(ms); while (G && G.paused) await sleep(120); };

  function startMatch() {
    const colors = SETUP_COLORS[SU.count];
    const players = colors.map((c, i) => ({
      id: 'p' + i, color: c, name: SU.cfg[i].name.trim() || defaultName(i), type: SU.cfg[i].type,
      tokens: [0, 1, 2, 3].map(id => ({ id, p: -1 })), caps: 0
    }));
    G = { id: ++matchSeq, mode: SU.mode, players, turn: 0, dice: 1, phase: 'roll', sixes: 0, ann: null, winner: null, paused: false, tokEls: {}, fxq: [], online: null };
    buildGameScreen();
    go('game');
    triggerBot();
  }

  function buildGameScreen() {
    const s = $('#s-game');
    s.innerHTML = `<div class="wrap">
      <div class="row between"><button class="back" data-act="pause" aria-label="${t('pause')}">⏸</button>
        <div class="gold" style="font-weight:800;font-size:18px">${t('app_name')}</div><div style="width:40px"></div></div>
      <div class="pcards" id="pcards" style="grid-template-columns:repeat(${G.players.length},1fr)"></div>
      <div class="boardwrap"><div class="board" id="board">${boardSVG()}</div></div>
      <div class="ann" id="ann"></div>
      <div class="status" id="status"></div>
      <div class="dicezone"><div class="dice" id="dice" data-act="roll">${'<b></b>'.repeat(9)}</div>
        <button class="rollbtn" id="rollbtn" data-act="roll">🎲 ${t('roll_dice')}</button></div>
      <div class="gbar"><span class="chip">🪙 <span id="gcoins">${S.coins}</span></span><span></span></div>
    </div>
    <div class="overlay" id="pause-ov"><div class="dialog"><h2>⏸ ${t('pause')}</h2>
      <button class="primary" data-act="resume">▶ ${t('resume')}</button>
      ${G.online ? '' : `<button class="primary sec" data-act="restart">🔄 ${t('restart')}</button>`}
      <button class="primary sec" data-act="menu">🏠 ${G.online ? t('leave') : t('main_menu')}</button></div></div>
    <div class="overlay" id="win-ov"><div class="dialog"><div class="crown">👑</div><h2>${t('winner')}</h2>
      <div id="win-name" style="font-size:20px;font-weight:800;margin-bottom:6px"></div>
      <p id="win-msg" class="muted" style="margin-bottom:6px"></p><p id="win-coins" class="gold" style="font-weight:800"></p>
      ${!G.online ? `<button class="primary" data-act="restart">🔄 ${t('play_again')}</button>`
        : G.online.host ? `<button class="primary" data-act="tolobby">↩ ${t('back_lobby')}</button>` : `<p class="muted" style="margin-top:12px">${t('waiting_host')}</p>`}
      <button class="primary sec" data-act="menu">🏠 ${G.online ? t('leave') : t('main_menu')}</button></div></div>`;

    // tokens
    const board = $('#board'); G.tokEls = {};
    G.players.forEach(p => p.tokens.forEach(tk => {
      const c = E.COLORS[p.color], el = document.createElement('div');
      el.className = 'token'; el.style.cssText = `--l:${c.light};--b:${c.base};--d:${c.dark}`;
      el.innerHTML = '<i></i>';
      el.addEventListener('click', () => onTokenClick(p.color, tk.id));
      board.appendChild(el); G.tokEls[p.color + '_' + tk.id] = el;
    }));
    renderGame();
  }

  function boardSVG() {
    const C = E.COLORS, W = '#F8FAFC', B = '#CBD5E1';
    let s = '<svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">';
    const yards = [[0, 0, 0], [9, 0, 1], [9, 9, 2], [0, 9, 3]];
    yards.forEach(([x, y, ci]) => {
      const col = C[ci].base;
      s += `<rect x="${x}" y="${y}" width="6" height="6" fill="${col}"/>`;
      s += `<rect x="${x + .75}" y="${y + .75}" width="4.5" height="4.5" rx=".4" fill="#fff"/>`;
      [.28, .72].forEach(a => [.28, .72].forEach(b => {
        const cx = x + .75 + 4.5 * b, cy = y + .75 + 4.5 * a;
        s += `<circle cx="${cx}" cy="${cy}" r=".38" fill="${col}" fill-opacity=".25" stroke="${col}" stroke-width=".06"/>`;
      }));
    });
    const tile = (r, c) => {
      if (r === 6 && c === 1) return C[0].base; if (r === 7 && c >= 1 && c <= 5) return C[0].base;
      if (r === 1 && c === 8) return C[1].base; if (c === 7 && r >= 1 && r <= 5) return C[1].base;
      if (r === 8 && c === 13) return C[2].base; if (r === 7 && c >= 9 && c <= 13) return C[2].base;
      if (r === 13 && c === 6) return C[3].base; if (c === 7 && r >= 9 && r <= 13) return C[3].base;
      return W;
    };
    for (let r = 0; r < 15; r++) for (let c = 0; c < 15; c++) {
      const inYard = (r <= 5 || r >= 9) && (c <= 5 || c >= 9), inCenter = r >= 6 && r <= 8 && c >= 6 && c <= 8;
      if (inYard || inCenter) continue;
      s += `<rect x="${c}" y="${r}" width="1" height="1" fill="${tile(r, c)}" stroke="${B}" stroke-width=".04"/>`;
    }
    s += `<polygon points="6,6 6,9 7.5,7.5" fill="${C[0].base}"/><polygon points="6,6 9,6 7.5,7.5" fill="${C[1].base}"/>` +
         `<polygon points="9,6 9,9 7.5,7.5" fill="${C[2].base}"/><polygon points="6,9 9,9 7.5,7.5" fill="${C[3].base}"/>` +
         `<line x1="6" y1="6" x2="9" y2="9" stroke="#FFD700" stroke-width=".08"/><line x1="6" y1="9" x2="9" y2="6" stroke="#FFD700" stroke-width=".08"/>`;
    E.STAR_CELLS.forEach(([r, c]) => {
      const cx = c + .5, cy = r + .5, pts = [];
      for (let i = 0; i < 10; i++) { const rad = i % 2 ? .17 : .38, a = -Math.PI / 2 + i * Math.PI / 5; pts.push((cx + rad * Math.cos(a)).toFixed(3) + ',' + (cy + rad * Math.sin(a)).toFixed(3)); }
      s += `<polygon points="${pts.join(' ')}" fill="#FFD700" stroke="#D97706" stroke-width=".03"/>`;
    });
    return s + '</svg>';
  }

  const OFFS = {
    1: [[0, 0]], 2: [[-.14, -.14], [.14, .14]], 3: [[-.14, -.14], [.14, -.14], [0, .14]],
    4: [[-.14, -.14], [.14, -.14], [-.14, .14], [.14, .14]]
  };
  function layoutTokens() {
    const groups = {};
    G.players.forEach(p => p.tokens.forEach(tk => {
      const c = E.coordOf(p.color, tk.id, tk.p), k = c[0] + '_' + c[1];
      (groups[k] = groups[k] || []).push({ p, tk, c });
    }));
    Object.values(groups).forEach(list => {
      const n = Math.min(list.length, 4);
      list.forEach((o, i) => {
        const el = G.tokEls[o.p.color + '_' + o.tk.id], off = OFFS[n][i % 4];
        el.style.left = (o.c[1] * 100 / 15) + '%'; el.style.top = (o.c[0] * 100 / 15) + '%';
        const sc = o.tk.p === 56 ? .6 : (n > 1 ? .82 : 1);
        el.style.transform = `translate(${off[0] * 100}%,${off[1] * 100}%) scale(${sc})`;
      });
    });
  }

  const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
  function renderGame() {
    if (!G || !$('#pcards')) return;
    const p = cur(), c = E.COLORS[p.color];
    $('#pcards').innerHTML = G.players.map((pl, i) => {
      const cc = E.COLORS[pl.color], home = pl.tokens.filter(x => x.p === 56).length;
      return `<div class="pcard ${i === G.turn ? 'act' : ''}" style="--c:${cc.base}">
        <span class="dot" style="background:${cc.base}">${pl.type === 'bot' ? '🤖' : esc(cname(pl.color).slice(0, 1))}</span>
        <div><div class="nm">${esc(pl.name)}</div><div class="sub">🏠 ${home}/4${G.online && pl.color === G.online.myColor ? ' • ' + t('you') : ''}</div></div></div>`;
    }).join('');
    const dice = $('#dice'); dice.style.setProperty('--c', c.base);
    dice.classList.toggle('roll', G.phase === 'rolling');
    [...dice.children].forEach((b, i) => b.classList.toggle('on', PIPS[G.dice].includes(i)));
    const humanTurn = isMine(p);
    $('#rollbtn').disabled = !(G.phase === 'roll' && humanTurn && !G.paused && !G.winner);
    $('#rollbtn').textContent = G.phase === 'rolling' ? t('rolling') : '🎲 ' + t('roll_dice');
    $('#ann').textContent = G.ann ? t(G.ann) : '';
    $('#status').textContent = G.winner ? '' :
      G.phase === 'select' && humanTurn ? t('tap_to_move') :
      humanTurn ? t('turn_roll', p.name) : t('turn_bot', p.name);
    $('#gcoins').textContent = S.coins;
    layoutTokens();
    if (G.online && G.online.host) pushState();
    G.players.forEach(pl => pl.tokens.forEach(tk => {
      G.tokEls[pl.color + '_' + tk.id].classList.toggle('hl', !!tk.hl && isMine(pl));
    }));
  }

  function triggerBot() {
    if (!G || G.winner) return;
    if (cur().type !== 'bot') return;
    const id = G.id;
    (async () => {
      await pace(650);
      if (!G || G.id !== id || G.winner || G.phase !== 'roll' || cur().type !== 'bot') return;
      rollDice();
    })();
  }

  async function rollDice() {
    if (!G || G.phase !== 'roll' || G.paused || G.winner) return;
    const id = G.id, alive = () => G && G.id === id;
    G.phase = 'rolling'; G.ann = null; fx('dice'); renderGame();
    for (let i = 0; i < 5; i++) { await pace(70); if (!alive()) return; G.dice = 1 + Math.floor(Math.random() * 6); renderGame(); }
    const final = 1 + Math.floor(Math.random() * 6);
    G.dice = final;
    G.sixes = final === 6 ? G.sixes + 1 : 0;

    if (G.sixes >= 3) {
      G.phase = 'transition'; G.ann = 'three_sixes'; G.sixes = 0; fx('capture'); renderGame();
      await pace(1200); if (!alive()) return; advanceTurn(); return;
    }
    const p = cur(), moves = E.getValidMoves(p, final, G.players);
    if (!moves.length) {
      G.phase = 'transition'; G.ann = 'no_moves'; renderGame();
      await pace(1100); if (!alive()) return; advanceTurn(); return;
    }
    p.tokens.forEach(tk => { tk.hl = moves.some(m => m.tokenId === tk.id); });
    G.phase = 'select'; G.ann = final === 6 ? 'rolled_six' : null; G.moves = moves; renderGame();
    if (p.type === 'bot') {
      await pace(550); if (!alive()) return;
      const best = E.chooseBestMove(moves, G.players);
      if (best) executeMove(best);
    }
  }

  function tryPick(p, tokenId) {
    const tk = p.tokens[tokenId];
    if (!tk || !tk.hl) return;
    const m = E.getMove(p, tk, G.dice, G.players);
    if (m) executeMove(m);
  }
  function onTokenClick(color, tokenId) {
    if (!G || G.phase !== 'select' || G.paused) return;
    if (G.online && !G.online.host) { if (color === G.online.myColor && OL.conn && OL.conn.open) OL.conn.send({ t: 'pick', id: tokenId }); return; }
    const p = cur();
    if (p.color !== color || !isMine(p)) return;
    tryPick(p, tokenId);
  }

  async function executeMove(m) {
    const id = G.id, alive = () => G && G.id === id;
    G.phase = 'moving';
    const p = cur(), tk = p.tokens[m.tokenId];
    p.tokens.forEach(x => { x.hl = false; });
    const el = G.tokEls[p.color + '_' + tk.id]; el.classList.add('mv');
    for (let s = m.from + 1; s <= m.to; s++) { tk.p = s; renderGame(); fx('hop'); await pace(150); if (!alive()) return; }
    el.classList.remove('mv');

    let captured = false;
    m.captured.forEach(cp => {
      const victim = G.players.find(x => x.color === cp.color);
      if (victim) { victim.tokens[cp.id].p = -1; captured = true; }
    });
    if (captured) { p.caps += m.captured.length; fx('capture'); }
    if (m.reachesHome) fx('home');
    else if (m.to >= 0 && m.to <= 50 && E.SAFE.has(E.globalIdx(p.color, m.to)) && !captured) fx('star');

    if (p.tokens.every(x => x.p === 56)) { finishMatch(p); return; }

    const bonus = G.dice === 6 || captured || m.reachesHome;
    G.ann = captured ? 'token_captured' : m.reachesHome ? 'token_home' : G.dice === 6 ? 'rolled_six' : null;
    renderGame();
    await pace(350); if (!alive()) return;
    if (bonus) { G.phase = 'roll'; renderGame(); triggerBot(); }
    else advanceTurn();
  }

  function advanceTurn() {
    G.turn = (G.turn + 1) % G.players.length;
    G.phase = 'roll'; G.sixes = 0; G.ann = null;
    G.players.forEach(pl => pl.tokens.forEach(x => { x.hl = false; }));
    renderGame(); triggerBot();
  }

  function finishMatch(winner) {
    G.winner = winner; G.phase = 'roll';
    fx('victory');
    renderGame();
    showWin(winner);
  }

  function showWin(winner) {
    const humanWon = G.online ? winner.color === G.online.myColor : winner.type === 'human';
    const mine = G.players.filter(isMine);
    S.played++; if (humanWon) { S.won++; S.coins += 500; }
    S.captures += mine.reduce((a, x) => a + x.caps, 0);
    S.tokensHome += mine.reduce((a, x) => a + x.tokens.filter(y => y.p === 56).length, 0);
    ['played', 'won', 'coins', 'captures', 'tokensHome'].forEach(save);
    renderGame();
    $('#win-name').textContent = winner.name;
    $('#win-name').style.color = E.COLORS[winner.color].light;
    $('#win-msg').textContent = humanWon ? t('congratulations') : '';
    $('#win-coins').textContent = humanWon ? t('coins_won', 500) : '';
    $('#win-ov').classList.add('show');
    confetti();
  }

  function pause(on) {
    if (!G || G.winner) return;
    if (G.online) { $('#pause-ov').classList.toggle('show', on); return; }
    G.paused = on; $('#pause-ov').classList.toggle('show', on); renderGame();
    if (!on) { if (G.phase === 'roll') triggerBot(); }
  }

  /* ---------- confetti ---------- */
  function confetti() {
    const cv = $('#confetti'), ctx = cv.getContext('2d');
    cv.width = innerWidth; cv.height = innerHeight;
    const cols = ['#FFD700', '#E63946', '#10B981', '#3B82F6', '#F59E0B', '#fff'];
    const ps = Array.from({ length: 120 }, () => ({
      x: Math.random() * cv.width, y: -20 - Math.random() * cv.height * .5, w: 6 + Math.random() * 6, h: 8 + Math.random() * 8,
      vy: 2 + Math.random() * 3.5, vx: -1.5 + Math.random() * 3, r: Math.random() * 6, vr: -.2 + Math.random() * .4, c: cols[(Math.random() * cols.length) | 0]
    }));
    let frames = 0;
    (function tick() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      ps.forEach(p => { p.x += p.vx; p.y += p.vy; p.r += p.vr; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore(); });
      if (++frames < 260) requestAnimationFrame(tick); else ctx.clearRect(0, 0, cv.width, cv.height);
    })();
  }


  /* ---------- online play (WebRTC via PeerJS, host-authoritative) ---------- */
  const CFG = window.LUDO_CONFIG || {};
  const SLOT_COLORS = [0, 2, 1, 3];                  // Red (host), Yellow, Green, Blue – 2 players sit opposite
  const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const PEER_SRC = ['https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js', 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js'];
  let peerLoading = null;
  function loadPeerLib() {
    if (window.Peer) return Promise.resolve(true);
    if (peerLoading) return peerLoading;
    peerLoading = (async () => {
      for (const src of (CFG.peerSrc ? [CFG.peerSrc] : PEER_SRC)) {
        const ok = await new Promise(res => { const sc = document.createElement('script'); sc.src = src; sc.onload = () => res(!!window.Peer); sc.onerror = () => res(false); document.head.appendChild(sc); });
        if (ok) return true;
      }
      return false;
    })();
    peerLoading.then(ok => { if (!ok) peerLoading = null; });
    return peerLoading;
  }
  const freshOL = () => ({ state: 'menu', host: false, code: '', peer: null, conn: null, slots: [], myColor: 0, inGame: false });
  let OL = freshOL();
  const newCode = () => Array.from({ length: 5 }, () => CODE_CHARS[(Math.random() * CODE_CHARS.length) | 0]).join('');
  const peerId = code => 'royalludo-' + code;
  const roomLink = () => location.origin + location.pathname.replace(/index\.html$/, '') + '?room=' + OL.code;
  function mkPeer(id) {
    const o = Object.assign({ debug: 0 }, CFG.peer || {});
    if (CFG.ice) o.config = { iceServers: CFG.ice };
    return new Peer(id, o);
  }
  function teardownOnline() {
    try { OL.slots.forEach(s => { if (s.conn) { s.conn.__gone = true; s.conn.close(); } }); } catch (e) { /* */ }
    try { if (OL.conn) { OL.conn.__gone = true; OL.conn.close(); } } catch (e) { /* */ }
    try { if (OL.peer) OL.peer.destroy(); } catch (e) { /* */ }
    OL = freshOL();
  }
  function onlineProblem(key) {
    teardownOnline(); toast(t(key));
    if (current === 'online') renderOnline();
  }

  /* --- host side --- */
  async function createRoom() {
    if (!(await loadPeerLib())) return toast(t('no_lib'));
    teardownOnline();
    OL.state = 'connecting'; OL.host = true; OL.code = newCode(); renderOnline();
    const open = attempt => {
      const peer = mkPeer(peerId(OL.code)); OL.peer = peer;
      peer.on('open', () => {
        OL.state = 'lobby'; OL.myColor = 0;
        OL.slots = SLOT_COLORS.map((c, i) => ({ color: c, kind: i === 0 ? 'host' : 'empty', name: i === 0 ? S.name : '' }));
        renderOnline();
      });
      peer.on('connection', conn => {
        conn.on('open', () => admitGuest(conn));
        conn.on('data', m => onHostData(conn, m));
        conn.on('close', () => guestGone(conn));
        conn.on('error', () => guestGone(conn));
      });
      peer.on('error', err => {
        if (err && err.type === 'unavailable-id' && attempt < 4) { try { peer.destroy(); } catch (e) { /* */ } OL.code = newCode(); open(attempt + 1); }
        else onlineProblem('net_error');
      });
      peer.on('disconnected', () => { try { peer.reconnect(); } catch (e) { /* */ } });
    };
    open(0);
  }
  const lobbyView = () => OL.slots.map(s => ({ color: s.color, kind: s.kind, name: s.name }));
  function broadcastLobby() {
    OL.slots.forEach(s => { if (s.kind === 'guest' && s.conn && s.conn.open) s.conn.send({ t: 'lobby', code: OL.code, slots: lobbyView(), you: s.color }); });
    if (current === 'online') renderOnline();
  }
  function admitGuest(conn) {
    const reject = reason => { try { conn.send({ t: 'reject', reason }); } catch (e) { /* */ } setTimeout(() => { try { conn.close(); } catch (e) { /* */ } }, 400); };
    if (OL.inGame) return reject('game_started');
    const slot = OL.slots.find(x => x.kind === 'empty');
    if (!slot) return reject('room_full');
    slot.kind = 'guest'; slot.name = String((conn.metadata && conn.metadata.name) || 'Player').slice(0, 16); slot.conn = conn; conn.slotColor = slot.color;
    broadcastLobby();
  }
  function guestGone(conn) {
    if (conn.__gone) return; conn.__gone = true;
    const slot = OL.slots.find(x => x.conn === conn); if (!slot) return;
    const name = slot.name;
    if (OL.inGame && G && G.online) {
      slot.kind = 'bot'; slot.conn = null;
      const pl = G.players.find(x => x.color === slot.color);
      if (pl) {
        pl.type = 'bot'; pl.remote = false; toast(t('left_bot', name));
        if (G.winner) { renderGame(); return; }
        renderGame();
        if (cur() === pl) {
          if (G.phase === 'roll') triggerBot();
          else if (G.phase === 'select') { const best = E.chooseBestMove(G.moves || [], G.players); if (best) executeMove(best); }
        }
      }
    } else { slot.kind = 'empty'; slot.conn = null; slot.name = ''; broadcastLobby(); }
  }
  function onHostData(conn, m) {
    if (!m || !G || !G.online || !G.online.host) return;
    const p = cur();
    if (!p.remote || p.color !== conn.slotColor) return;
    if (m.t === 'roll' && G.phase === 'roll') rollDice();
    else if (m.t === 'pick' && G.phase === 'select') tryPick(p, m.id | 0);
  }
  function toggleBot(i) {
    if (!OL.host || OL.inGame) return;
    const s = OL.slots[i]; if (!s) return;
    if (s.kind === 'empty') { s.kind = 'bot'; s.name = 'Bot ' + E.COLORS[s.color].en; }
    else if (s.kind === 'bot') { s.kind = 'empty'; s.name = ''; }
    broadcastLobby();
  }
  function startOnline() {
    if (!OL.host || OL.inGame) return;
    const occ = OL.slots.filter(s => s.kind !== 'empty').sort((a, b) => a.color - b.color);
    if (occ.length < 2) return toast(t('need_two'));
    OL.inGame = true;
    const players = occ.map((s, i) => ({
      id: 'p' + i, color: s.color, name: s.name || E.COLORS[s.color].en, type: s.kind === 'bot' ? 'bot' : 'human', remote: s.kind === 'guest',
      tokens: [0, 1, 2, 3].map(id => ({ id, p: -1 })), caps: 0
    }));
    G = { id: ++matchSeq, mode: 'online', players, turn: 0, dice: 1, phase: 'roll', sixes: 0, ann: null, winner: null, paused: false, tokEls: {},
          fxq: [], online: { host: true, myColor: 0 } };
    buildGameScreen(); go('game'); triggerBot();
    try { if (navigator.wakeLock) navigator.wakeLock.request('screen').catch(() => {}); } catch (e) { /* */ }
  }
  function backToLobby() {
    if (!OL.host) return;
    stopMatch(); OL.inGame = false;
    OL.slots.forEach(s => { if (s.kind === 'bot' && s.conn === null && s.name && !/^Bot /.test(s.name)) { s.kind = 'empty'; s.name = ''; } });
    broadcastLobby(); go('online', false);
  }
  function snapshot() {
    return { t: 'state', gid: G.id, turn: G.turn, dice: G.dice, phase: G.phase, ann: G.ann, winner: G.winner ? G.winner.color : null, fx: G.fxq.splice(0),
      players: G.players.map(p => ({ color: p.color, name: p.name, type: p.type, remote: !!p.remote, caps: p.caps, tokens: p.tokens.map(x => ({ id: x.id, p: x.p, hl: !!x.hl })) })) };
  }
  function pushState() {
    const m = snapshot();
    OL.slots.forEach(s => { if (s.kind === 'guest' && s.conn && s.conn.open) { try { s.conn.send(m); } catch (e) { /* */ } } });
  }

  /* --- guest side --- */
  async function joinRoom(code) {
    code = String(code || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (code.length < 4) return toast(t('enter_code'));
    OL.state = 'connecting'; OL.host = false; OL.code = code; renderOnline();
    if (!(await loadPeerLib())) return onlineProblem('no_lib');
    teardownOnline();
    OL.state = 'connecting'; OL.host = false; OL.code = code; renderOnline();
    const peer = mkPeer(undefined); OL.peer = peer;
    const timer = setTimeout(() => onlineProblem('net_error'), 20000);
    peer.on('open', () => {
      const conn = peer.connect(peerId(code), { reliable: true, metadata: { name: S.name } });
      OL.conn = conn;
      conn.on('open', () => { clearTimeout(timer); OL.state = 'lobby'; renderOnline(); });
      conn.on('data', onGuestData);
      conn.on('close', hostGone);
      conn.on('error', hostGone);
    });
    peer.on('error', err => { clearTimeout(timer); onlineProblem(err && err.type === 'peer-unavailable' ? 'not_found' : 'net_error'); });
  }
  function hostGone() {
    if (OL.conn && OL.conn.__gone) return;
    const inGame = !!G; stopMatch(); teardownOnline(); toast(t('host_left'));
    if (inGame || current === 'online') go('home', false);
  }
  function onGuestData(m) {
    if (!m) return;
    if (m.t === 'lobby') {
      OL.slots = m.slots; OL.myColor = m.you; OL.code = m.code || OL.code;
      if (G) stopMatch();
      go('online', false);
    } else if (m.t === 'reject') {
      onlineProblem(m.reason === 'game_started' ? 'game_started' : 'room_full');
    } else if (m.t === 'state') onState(m);
  }
  function onState(m) {
    const mk = q => ({ id: 'p' + q.color, color: q.color, name: q.name, type: q.type, remote: q.remote, caps: q.caps, tokens: q.tokens.map(x => ({ id: x.id, p: x.p, hl: x.hl })) });
    if (!G || G.id !== m.gid) {
      G = { id: m.gid, mode: 'online', players: m.players.map(mk), turn: m.turn, dice: m.dice, phase: m.phase, sixes: 0, ann: m.ann, winner: null, paused: false,
            tokEls: {}, fxq: [], online: { host: false, myColor: OL.myColor } };
      buildGameScreen(); go('game');
    } else {
      m.players.forEach((q, i) => { const p = G.players[i]; p.name = q.name; p.type = q.type; p.remote = q.remote; p.caps = q.caps; q.tokens.forEach(x => { p.tokens[x.id].p = x.p; p.tokens[x.id].hl = x.hl; }); });
    }
    G.turn = m.turn; G.dice = m.dice; G.phase = m.phase; G.ann = m.ann;
    (m.fx || []).forEach(n => { if (sfx[n]) sfx[n](); });
    const w = m.winner != null && !G.winner ? G.players.find(p => p.color === m.winner) : null;
    if (w) G.winner = w;
    renderGame();
    if (w) showWin(w);
  }

  /* --- online screen --- */
  function copyLink() {
    const link = roomLink();
    if (navigator.share) { navigator.share({ title: 'Royal Ludo', text: t('share_msg') + OL.code, url: link }).catch(() => {}); return; }
    try { navigator.clipboard.writeText(link).then(() => toast(t('link_copied')), () => toast(link)); } catch (e) { toast(link); }
  }
  function renderOnline() {
    const el = $('#s-online');
    if (OL.state === 'connecting') {
      el.innerHTML = `<div class="wrap">${topbar(t('online_title'))}<div class="card" style="text-align:center;margin-top:30px"><div style="font-size:46px">📡</div><p style="margin-top:10px;font-weight:700">${t('connecting')}</p></div></div>`;
      return;
    }
    if (OL.state === 'lobby') {
      const isHost = OL.host, occ = OL.slots.filter(s => s.kind !== 'empty').length;
      el.innerHTML = `<div class="wrap"><div class="topbar"><button class="back" data-act="leave-online" aria-label="${t('leave')}">←</button><h2>${t('lobby')}</h2></div>
        <div class="card" style="text-align:center"><div class="muted" style="font-size:12px">${t('room_code')}</div>
          <div style="font-size:40px;font-weight:800;letter-spacing:8px;color:var(--gold);margin:4px 0 10px">${esc(OL.code)}</div>
          <div class="seg"><button data-act="copylink">🔗 ${t('copy_link')}</button><button data-act="whatsapp">💬 ${t('whatsapp')}</button></div></div>
        <h3>${t('invite')}</h3>
        ${OL.slots.map((s, i) => {
          const c = E.COLORS[s.color];
          const tag = s.kind === 'host' ? t('host') : s.kind === 'bot' ? '🤖 ' + t('bot') : s.kind === 'guest' ? '🙂' : t('waiting');
          const you = s.color === OL.myColor && s.kind !== 'empty' ? ` <span class="gold">(${t('you')})</span>` : '';
          const btn = isHost && s.kind === 'empty' ? `<button class="type" style="--c:${c.base}" data-slotbot="${i}">${t('add_bot')}</button>`
                    : isHost && s.kind === 'bot' ? `<button class="type bot" data-slotbot="${i}">${t('remove_bot')}</button>` : '';
          return `<div class="pcfg" style="--c:${c.base}"><span class="dot" style="background:${s.kind === 'empty' ? '#334155' : c.base}">${esc(cname(s.color).slice(0, 1))}</span>
            <div style="flex:1;min-width:0"><div style="font-weight:700;overflow:hidden;text-overflow:ellipsis">${s.kind === 'empty' ? '—' : esc(s.name)}${you}</div><div class="muted" style="font-size:12px">${tag}</div></div>${btn}</div>`;
        }).join('')}
        ${isHost ? `<button class="primary" data-act="start-online" ${occ < 2 ? 'style="filter:grayscale(.8) brightness(.7)"' : ''}>▶ ${t('start_online')}</button>`
                 : `<p class="muted" style="text-align:center;margin-top:22px">${t('waiting_host')}</p>`}
        <p class="muted" style="text-align:center;margin-top:14px;font-size:12px;line-height:1.5">${t('online_note')}</p></div>`;
      return;
    }
    el.innerHTML = `<div class="wrap">${topbar(t('online_title'))}
      <div class="card" style="text-align:center;margin-top:6px"><div style="font-size:46px">📡</div>
        <button class="primary" data-act="create">➕ ${t('create_room')}</button></div>
      <p class="muted" style="text-align:center;margin:14px 0 0">${t('or_')}</p>
      <div class="card" style="margin-top:10px"><b>${t('join_room')}</b>
        <input class="field" id="codein" maxlength="8" autocapitalize="characters" autocomplete="off" placeholder="${t('enter_code')}" value="${esc(OL.code || '')}" style="text-transform:uppercase;letter-spacing:4px;text-align:center;font-weight:800">
        <button class="primary" style="margin-top:12px" data-act="join">${t('join')}</button></div>
      <p class="muted" style="text-align:center;margin-top:16px;font-size:12px;line-height:1.5">${t('online_note')}</p></div>`;
  }

  /* ---------- events ---------- */
  function stopMatch() { if (G) G.id = -1; G = null; try { $('#confetti').getContext('2d').clearRect(0, 0, 9999, 9999); } catch (e) { /* */ } }
  function endMatch() { const wasOnline = !!(G && G.online); stopMatch(); if (wasOnline) teardownOnline(); }

  document.addEventListener('click', e => {
    const el = e.target.closest('[data-go],[data-act],[data-mode],[data-count],[data-type],[data-av],[data-slotbot]');
    if (!el) return;
    const d = el.dataset;
    if (d.go) {
      if (current === 'game') endMatch();
      if (current === 'online' && d.go === 'home') teardownOnline();
      if (d.go === 'online' && OL.state === 'menu') { /* fresh menu */ }
      if (d.go === 'home') { go('home', false); } else go(d.go);
      return;
    }
    if (d.mode) { SU.mode = d.mode; setupDefaults(); renderers.setup(); return; }
    if (d.count) { SU.count = +d.count; renderers.setup(); return; }
    if (d.type !== undefined) { const i = +d.type; SU.cfg[i].type = SU.cfg[i].type === 'bot' ? 'human' : 'bot'; renderers.setup(); return; }
    if (d.slotbot !== undefined) { toggleBot(+d.slotbot); return; }
    if (d.av !== undefined) {
      S.avatar = +d.av; $('#bigav').textContent = AVATARS[S.avatar];
      document.querySelectorAll('[data-av]').forEach(b => b.classList.toggle('on', +b.dataset.av === S.avatar)); return;
    }
    switch (d.act) {
      case 'lang': S.lang = S.lang === 'en' ? 'bn' : 'en'; save('lang'); renderers[current] && renderers[current](); document.documentElement.lang = S.lang; break;
      case 'sound': S.sound = !S.sound; save('sound'); renderers.settings(); if (S.sound) sfx.star(); break;
      case 'vib': S.vib = !S.vib; save('vib'); renderers.settings(); vibrate(40); break;
      case 'bonus':
        if (claimable()) { S.coins += 200; S.lastClaim = today(); save('coins'); save('lastClaim'); sfx.star(); toast(t('bonus_got')); renderers.home(); }
        else toast(t('bonus_claimed'));
        break;
      case 'install': doInstall(); break;
      case 'setup-cpu': SU.mode = 'cpu'; SU.count = 4; setupDefaults(); go('setup'); break;
      case 'setup-pp': SU.mode = 'pp'; SU.count = 4; setupDefaults(); go('setup'); break;
      case 'start': startMatch(); break;
      case 'roll':
        if (!G) break;
        if (G.online && !G.online.host) { if (G.phase === 'roll' && cur().color === G.online.myColor && OL.conn && OL.conn.open) OL.conn.send({ t: 'roll' }); }
        else if (isMine(cur())) rollDice();
        break;
      case 'create': createRoom(); break;
      case 'join': joinRoom(($('#codein') || {}).value || ''); break;
      case 'copylink': copyLink(); break;
      case 'whatsapp': window.open('https://wa.me/?text=' + encodeURIComponent(t('share_msg') + OL.code + '\n' + roomLink()), '_blank'); break;
      case 'start-online': startOnline(); break;
      case 'leave-online': teardownOnline(); go('online', false); break;
      case 'tolobby': backToLobby(); break;
      case 'pause': pause(true); break;
      case 'resume': pause(false); break;
      case 'restart': $('#win-ov') && $('#win-ov').classList.remove('show'); endMatch(); startMatch(); break;
      case 'menu': endMatch(); go('home', false); break;
      case 'saveprofile': {
        const v = ($('#pname').value || '').trim() || 'Royal King';
        S.name = v.slice(0, 16); save('name'); save('avatar'); toast(t('saved')); break;
      }
    }
  });
  document.addEventListener('input', e => {
    const i = e.target.dataset && e.target.dataset.name;
    if (i !== undefined && i !== '') SU.cfg[+i].name = e.target.value;
  });
  // unlock audio on first touch (mobile autoplay policy)
  addEventListener('pointerdown', () => { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); } catch (e) { /* */ } }, { once: true });

  /* ---------- boot ---------- */
  setupDefaults();
  go('home', false);
  (function () {
    let room = ''; try { room = new URLSearchParams(location.search).get('room') || ''; } catch (e) { /* */ }
    if (room) { go('online', false); joinRoom(room); }
  })();
  try { history.replaceState({ s: 'home' }, ''); } catch (e) { /* */ }
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
  window.__ludo = { get G() { return G; }, get OL() { return OL; }, S, E }; // handy for debugging/tests
})();
/* ===== Entry Fee Modal ===== */
function deductEntryFee(balance, fee) {
  if (balance < fee) {
    alert("আপনার কয়েন যথেষ্ট নেই!");
    return null;
  }
  return balance - fee;
}

function openOnlineMode() {
  document.getElementById("entryFeeModal").style.display = "block";
}

function closeFeeModal() {
  document.getElementById("entryFeeModal").style.display = "none";
}

function selectFee(feeAmount) {
  var S = window.__ludo.S;
  var newBalance = deductEntryFee(S.coins, feeAmount);
  if (newBalance === null) return;

  S.coins = newBalance;
  try { localStorage.setItem("rl_coins", JSON.stringify(S.coins)); } catch (e) {}

  closeFeeModal();
  window.__feePaid = true;
  document.querySelector('.menu-btn[data-go="online"]').click();
}

// হোমের "অনলাইন" বাটনে চাপলে আগে ফি বক্স দেখাবে
document.addEventListener("click", function (e) {
  var b = e.target.closest('.menu-btn[data-go="online"]');
  if (!b) return;
  if (window.__feePaid) { window.__feePaid = false; return; }
  e.stopPropagation();
  e.preventDefault();
  openOnlineMode();
}, true);

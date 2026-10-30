(function(){
  'use strict';
  var doc = document.documentElement;
  doc.classList.add('js');
  var WA = 'https://wa.me/77769786778';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ASSET_V = ((document.currentScript && document.currentScript.src.match(/[?&]v=([^&]+)/)) || [])[1] || '';
  /* Переход по якорю или со смещением - интро и проявления не проигрываем */
  var skipIntro = !!location.hash || window.scrollY > 80;
  if (skipIntro) doc.classList.add('no-intro');

  /* Ссылки WhatsApp с готовым текстом (собираются заранее, не в момент клика) */
  function buildWa(){
    document.querySelectorAll('[data-wa]').forEach(function(a){
      a.href = WA + '?text=' + encodeURIComponent(a.getAttribute('data-wa'));
    });
  }
  buildWa();

  /* Шапка */
  var hdr = document.querySelector('.hdr');
  function onHdr(){ hdr.classList.toggle('is-solid', window.scrollY > 40); }
  onHdr();
  window.addEventListener('scroll', onHdr, {passive:true});

  /* Мобильное меню */
  var burger = document.querySelector('.burger');
  var mnav = document.getElementById('mnav');
  function setMenu(open){
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    mnav.setAttribute('aria-hidden', open ? 'false' : 'true');
  }
  burger.addEventListener('click', function(){ setMenu(!document.body.classList.contains('menu-open')); });
  mnav.addEventListener('click', function(e){ if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') { setMenu(false); closeModal(); } });
  var mq = window.matchMedia('(min-width: 1181px)'); /* порог бургера, см. styles.css */
  (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))(function(){ if (mq.matches) setMenu(false); });

  /* Липкая панель: после ~55% первого экрана, прячется на контактах */
  var mbar = document.querySelector('.mbar');
  var contacts = document.getElementById('kontakty');
  var atContacts = false;
  function onBar(){ mbar.classList.toggle('is-on', window.scrollY > window.innerHeight * 0.55 && !atContacts); }
  if ('IntersectionObserver' in window){
    new IntersectionObserver(function(en){ atContacts = en[0].isIntersecting; onBar(); }, {threshold:0.25}).observe(contacts);
  }
  window.addEventListener('scroll', onBar, {passive:true});
  onBar();

  /* Языки. Казахский словарь - отдельный файл assets/lang/kk.js, грузится только по выбору */
  var I18N = {};
  var LANG = 'ru';
  var RU = null;
  var ATTRS = ['aria-label', 'alt', 'data-wa', 'placeholder'];
  function snapshot(){
    if (RU) return;
    RU = {meta: {title: document.title, desc: document.querySelector('meta[name="description"]').getAttribute('content')}};
    document.querySelectorAll('[data-i]').forEach(function(el){ el._ru = el.innerHTML; });
    document.querySelectorAll('[data-a]').forEach(function(el){
      el._ruA = {};
      ATTRS.forEach(function(a){ if (el.hasAttribute(a)) el._ruA[a] = el.getAttribute(a); });
    });
  }
  function T(key){ var d = I18N[LANG]; return d && d[key] != null ? d[key] : null; }
  function loadLang(lang, done){
    if (I18N[lang] || lang !== 'kk') return done();
    var sc = document.createElement('script');
    sc.src = 'assets/lang/kk.js' + (ASSET_V ? '?v=' + ASSET_V : '');
    sc.onload = function(){ if (window.SITE_KK) I18N.kk = window.SITE_KK; done(); };
    sc.onerror = function(){ done(); };
    document.head.appendChild(sc);
  }
  function applyLang(lang){
    if (lang !== 'ru' && !I18N[lang]) lang = 'ru';
    snapshot();
    LANG = lang;
    doc.lang = lang === 'kk' ? 'kk' : 'ru';
    document.querySelectorAll('[data-i]').forEach(function(el){
      var v = T(el.getAttribute('data-i')); el.innerHTML = v != null ? v : el._ru;
    });
    document.querySelectorAll('[data-a]').forEach(function(el){
      var k = el.getAttribute('data-a');
      Object.keys(el._ruA).forEach(function(a){ var v = T(k + '.' + a); el.setAttribute(a, v != null ? v : el._ruA[a]); });
    });
    document.title = T('meta.title') || RU.meta.title;
    document.querySelector('meta[name="description"]').setAttribute('content', T('meta.desc') || RU.meta.desc);
    document.querySelectorAll('.lang-b').forEach(function(b){ b.setAttribute('aria-pressed', b.getAttribute('data-lang') === lang ? 'true' : 'false'); });
    buildWa();
    if (typeof renderCap === 'function') renderCap();
    try { localStorage.setItem('psyrod-lang', lang); } catch (e) {}
  }
  function setLang(lang){ loadLang(lang, function(){ applyLang(lang); }); }
  document.querySelectorAll('.lang-b').forEach(function(b){
    b.addEventListener('click', function(){ setLang(b.getAttribute('data-lang')); });
  });

  /* Интро героя */
  var hero = document.querySelector('.hero');
  if (skipIntro) hero.classList.add('is-in');
  else requestAnimationFrame(function(){ requestAnimationFrame(function(){ hero.classList.add('is-in'); }); });

  /* Родовое древо: семь поколений */
  var svg = document.querySelector('.tree');
  var NS = 'http://www.w3.org/2000/svg';
  var GEN = 7, W = 1000, H = 720, BOTTOM = 660, STEP = 86;
  var radius = [10, 6.5, 5.6, 4.8, 4, 3.3, 2.7, 2.2];
  function pos(g, i){
    var n = Math.pow(2, g);
    var span = g === 0 ? 0 : W * (0.16 + 0.82 * Math.pow(g / GEN, 0.9));
    var x = n === 1 ? W / 2 : (W - span) / 2 + (i + 0.5) * span / n;
    return [x, BOTTOM - g * STEP];
  }
  var groups = [];
  for (var g = 1; g <= GEN; g++){
    var grp = document.createElementNS(NS, 'g');
    grp.setAttribute('class', 'gen g' + g);
    var links = '', n = Math.pow(2, g);
    for (var i = 0; i < n; i++){
      var c = pos(g - 1, i >> 1), p = pos(g, i);
      var mid = (c[1] + p[1]) / 2;
      var path = document.createElementNS(NS, 'path');
      path.setAttribute('class', 'lk');
      path.setAttribute('pathLength', '1');
      path.setAttribute('d', 'M' + c[0].toFixed(1) + ' ' + c[1] + 'C' + c[0].toFixed(1) + ' ' + mid + ' ' + p[0].toFixed(1) + ' ' + mid + ' ' + p[0].toFixed(1) + ' ' + p[1]);
      grp.appendChild(path);
    }
    for (var j = 0; j < n; j++){
      var q = pos(g, j);
      var dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('class', 'nd');
      dot.setAttribute('cx', q[0].toFixed(1)); dot.setAttribute('cy', q[1]);
      dot.setAttribute('r', radius[g]);
      grp.appendChild(dot);
    }
    svg.appendChild(grp);
    groups.push(grp);
  }
  var y0 = pos(0, 0);
  var ring = document.createElementNS(NS, 'circle');
  ring.setAttribute('class', 'you-ring'); ring.setAttribute('cx', y0[0]); ring.setAttribute('cy', y0[1]); ring.setAttribute('r', 18);
  var you = document.createElementNS(NS, 'circle');
  you.setAttribute('class', 'nd you'); you.setAttribute('cx', y0[0]); you.setAttribute('cy', y0[1]); you.setAttribute('r', radius[0]);
  var yt = document.createElementNS(NS, 'text');
  yt.setAttribute('class', 'you-t'); yt.setAttribute('x', y0[0]); yt.setAttribute('y', y0[1] + 50); yt.textContent = 'вы'; yt.setAttribute('data-you', '');
  svg.appendChild(ring); svg.appendChild(you); svg.appendChild(yt);

  var rod = document.querySelector('.rod');
  var track = document.querySelector('.rod-track');
  var numEl = document.querySelector('[data-num]');
  var capEl = document.querySelector('[data-cap]');
  var totals = [1, 3, 7, 15, 31, 63, 127, 255];
  var caps = [
    'это вы',
    'вы, мама и папа',
    'вы, родители, бабушки и дедушки',
    'вы и три поколения за вами',
    'вы и четыре поколения за вами',
    'вы и пять поколений за вами',
    'вы и шесть поколений за вами',
    'человек: вы и семь поколений за вами, из них 128 предков в седьмом колене'
  ];
  var level = -1, shown = 1, numRaf = 0;
  function countTo(target){
    cancelAnimationFrame(numRaf);
    var from = shown, t0 = performance.now(), dur = reduce ? 1 : 700;
    function tick(t){
      var k = Math.min(1, (t - t0) / dur);
      k = 1 - Math.pow(1 - k, 3);
      shown = Math.round(from + (target - from) * k);
      numEl.textContent = shown;
      if (k < 1) numRaf = requestAnimationFrame(tick);
    }
    numRaf = requestAnimationFrame(tick);
  }
  function renderCap(){
    if (level < 0) return;
    var kc = T('js.caps');
    capEl.textContent = (kc || caps)[level];
    yt.textContent = T('js.you') || 'вы';
  }
  function setLevel(l){
    if (l === level) return;
    level = l;
    groups.forEach(function(gr, idx){ gr.classList.toggle('on', idx < l); });
    countTo(totals[l]);
    renderCap();
    rod.classList.toggle('is-done', l === GEN);
  }
  var ticking = false;
  function onRod(){
    ticking = false;
    var r = track.getBoundingClientRect();
    var vh = window.innerHeight;
    if (r.bottom < -vh || r.top > vh * 1.5) return;
    var span = track.offsetHeight - vh;
    var p = Math.min(1, Math.max(0, -r.top / span));
    var l = p < 0.1 ? 2 : Math.min(GEN, 3 + Math.floor((p - 0.1) / 0.13));
    if (r.top > vh * 0.5) l = 2;
    setLevel(l);
  }
  window.addEventListener('scroll', function(){ if (!ticking){ ticking = true; requestAnimationFrame(onRod); } }, {passive:true});
  function treeFit(){ svg.setAttribute('preserveAspectRatio', window.innerWidth < 861 ? 'xMidYMax meet' : 'xMidYMid meet'); }
  treeFit();
  var lastW = window.innerWidth;
  window.addEventListener('resize', function(){ onRod(); if (window.innerWidth === lastW) return; lastW = window.innerWidth; treeFit(); });
  onRod();
  if (level < 0) setLevel(2);

  /* Видео: немая петля в кадре, полный ролик по клику */
  var cards = document.querySelectorAll('.vcard');
  if ('IntersectionObserver' in window && !reduce){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        var card = en.target, v = card.querySelector('video');
        if (en.isIntersecting){
          if (!v.getAttribute('src')) v.setAttribute('src', card.getAttribute('data-loop'));
          v.play().catch(function(){});
        } else if (v.getAttribute('src')){
          v.pause(); v.removeAttribute('src'); v.load(); card.classList.remove('is-live');
        }
      });
    }, {threshold:0.55});
    cards.forEach(function(card){
      var v = card.querySelector('video');
      v.addEventListener('playing', function(){ card.classList.add('is-live'); });
      io.observe(card);
    });
  }
  var modal = document.getElementById('vmodal');
  var mv = modal.querySelector('video');
  var lastFocus = null;
  function openModal(src){
    lastFocus = document.activeElement;
    mv.src = src;
    modal.classList.add('is-open');
    mv.play().catch(function(){});
    modal.querySelector('.vmodal-x').focus();
  }
  function closeModal(){
    if (!modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    mv.pause(); mv.removeAttribute('src'); mv.load();
    if (lastFocus) lastFocus.focus();
  }
  cards.forEach(function(card){
    card.addEventListener('click', function(){ openModal(card.getAttribute('data-video')); });
  });
  modal.addEventListener('click', function(e){ if (e.target === modal || e.target.closest('.vmodal-x')) closeModal(); });

  /* Лента: стрелки */
  var lane = document.querySelector('.lane');
  var nav = document.querySelector('.lane-nav');
  var prev = nav.querySelector('[data-dir="-1"]'), next = nav.querySelector('[data-dir="1"]');
  function laneState(){
    var max = lane.scrollWidth - lane.clientWidth;
    nav.hidden = max < 4;
    prev.disabled = lane.scrollLeft < 4;
    next.disabled = lane.scrollLeft > max - 4;
  }
  nav.addEventListener('click', function(e){
    var b = e.target.closest('.lane-btn'); if (!b) return;
    var card = lane.querySelector('.vcard');
    var gap = parseFloat(getComputedStyle(lane).columnGap) || 0;
    lane.scrollBy({left: (card.offsetWidth + gap) * Number(b.getAttribute('data-dir')), behavior: 'smooth'});
  });
  lane.addEventListener('scroll', laneState, {passive:true});
  window.addEventListener('resize', laneState);
  laneState();

  /* Тихое проявление медиа */
  var rv = document.querySelectorAll('.split-media, .lane-wrap, .rows, .steps');
  if ('IntersectionObserver' in window && !reduce && !skipIntro){
    var io2 = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if (en.isIntersecting){ en.target.classList.add('is-in'); io2.unobserve(en.target); } });
    }, {threshold:0.15});
    rv.forEach(function(el){ el.classList.add('rv'); io2.observe(el); });
  }

  /* Форма: заявка уходит в WhatsApp */
  var form = document.getElementById('lead-form');
  var thanks = document.getElementById('form-thanks');
  form.addEventListener('submit', function(e){
    e.preventDefault();
    if (form.elements.website.value) return; /* ловушка для ботов */
    var name = form.elements.name, phone = form.elements.phone;
    var ok = true;
    [name, phone].forEach(function(f){ f.parentNode.classList.remove('is-err'); });
    if (!name.value.trim()){ name.parentNode.classList.add('is-err'); ok = false; }
    if (phone.value.replace(/\D/g, '').length < 10){ phone.parentNode.classList.add('is-err'); ok = false; }
    if (!ok){ (name.value.trim() ? phone : name).focus(); return; }
    var L = T('js.form') || {hello: 'Здравствуйте, Венера! Хочу записаться.', name: 'Имя', phone: 'Телефон', service: 'Направление'};
    var sel = form.elements.service;
    var text = L.hello + '\n' + L.name + ': ' + name.value.trim() + '\n' + L.phone + ': ' + phone.value.trim() + '\n' + L.service + ': ' + sel.options[sel.selectedIndex].text;
    window.open(WA + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
    thanks.hidden = false;
  });

  /* Стартовый язык: ?lang= в адресе главнее сохранённого выбора, по языку браузера не угадываем */
  var forced = (location.search.match(/[?&]lang=(ru|kk)/) || [])[1];
  var saved = null;
  try { saved = localStorage.getItem('psyrod-lang'); } catch (e) {}
  var startLang = forced || (saved === 'kk' ? 'kk' : 'ru');
  if (startLang === 'kk') setLang('kk');
})();

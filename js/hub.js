/* Islamic Projects hub — the living bits: greeting, sky, moon, Ramadan
   countdown, project filter and a hadith of the day. Arabic and English. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var now = new Date();
  var hour = now.getHours();
  function ar() { return Sakina.lang() === 'ar'; }
  function num(n) { return Sakina.num(n); }
  function T(en, arText) { return ar() ? arText : en; }

  /* The arch shows the sky you would see right now */
  var sky = hour >= 4 && hour < 7 ? 'dawn' : hour >= 7 && hour < 16 ? 'day' : hour >= 16 && hour < 20 ? 'dusk' : 'night';
  $('sky').setAttribute('data-sky', sky);

  /* Umm al-Qura date and tonight's moon */
  var MONTHS = {
    en: ['Muḥarram', 'Ṣafar', 'Rabīʿ al-Awwal', 'Rabīʿ al-Thānī', 'Jumādā al-Ūlā', 'Jumādā al-Ākhirah', 'Rajab', 'Shaʿbān', 'Ramaḍān', 'Shawwāl', 'Dhū al-Qaʿdah', 'Dhū al-Ḥijjah'],
    ar: ['محرّم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوّال', 'ذو القعدة', 'ذو الحجة']
  };
  var PHASES = {
    en: ['New crescent', 'Waxing crescent', 'First quarter', 'Waxing gibbous', 'Full moon', 'Waning gibbous', 'Last quarter', 'Waning crescent'],
    ar: ['هلال أول الشهر', 'هلال متزايد', 'التربيع الأول', 'أحدب متزايد', 'بدر', 'أحدب متناقص', 'التربيع الأخير', 'هلال متناقص']
  };
  var fmt = null;
  try { fmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { day: 'numeric', month: 'numeric', year: 'numeric' }); } catch (e) { fmt = null; }
  function hijri(date) {
    if (!fmt) return null;
    var out = {};
    fmt.formatToParts(date).forEach(function (p) { if (p.type === 'day' || p.type === 'month' || p.type === 'year') out[p.type] = parseInt(p.value, 10); });
    return out.day && out.month && out.year > 1000 ? out : null;
  }
  function phaseIndex(d) { return d <= 3 ? 0 : d <= 6 ? 1 : d <= 8 ? 2 : d <= 13 ? 3 : d <= 15 ? 4 : d <= 21 ? 5 : d <= 23 ? 6 : 7; }
  function moonOffset(day, size) { return (day <= 15 ? -Math.round(size * day / 15) : Math.round(size * (30 - day) / 15)) + 'px'; }

  var today = hijri(now);
  var ramadanIn = null, ramadanNow = false;
  if (today) {
    var big = $('bigMoon');
    var setBig = function () { big.style.setProperty('--x', moonOffset(today.day, big.offsetWidth || 56)); };
    setBig();
    window.addEventListener('resize', setBig, { passive: true });
    $('smallMoon').style.setProperty('--x', moonOffset(today.day, 34));
    // Days until the next 1 Ramaḍān, walking the Umm al-Qura calendar
    if (today.month === 9) ramadanNow = true;
    else {
      for (var i = 1; i <= 400; i++) {
        var h = hijri(new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, 12));
        if (h && h.month === 9 && h.day === 1) { ramadanIn = i; break; }
      }
    }
  } else {
    $('moonChip').hidden = true;
  }

  var STAR = '<svg width="13" height="13" viewBox="-12 -12 24 24" aria-hidden="true"><path fill="currentColor" d="M11 0L7.78 3.22L7.78 7.78L3.22 7.78L0 11L-3.22 7.78L-7.78 7.78L-7.78 3.22L-11 0L-7.78 -3.22L-7.78 -7.78L-3.22 -7.78L0 -11L3.22 -7.78L7.78 -7.78L7.78 -3.22Z"/></svg>';
  function daysAr(n) { return n === 1 ? 'يوم واحد' : n === 2 ? 'يومين' : n <= 10 ? num(n) + ' أيام' : num(n) + ' يومًا'; }

  /* Text that depends on the language */
  function renderText() {
    var greeting = hour >= 4 && hour < 11 ? T('Ṣabāḥ al-khayr — good morning', 'صباح الخير')
      : hour >= 11 && hour < 17 ? T('As-salāmu ʿalaykum — peace be upon you', 'السلام عليكم ورحمة الله')
      : hour >= 17 && hour < 21 ? T('Masāʾ al-khayr — good evening', 'مساء الخير')
      : T('Laylah hādiʾah — a calm night to you', 'ليلة هادئة مباركة');
    $('greeting').textContent = greeting;
    if (today) {
      var names = ar() ? MONTHS.ar : MONTHS.en;
      $('hijriToday').textContent = num(today.day) + ' ' + names[today.month - 1] + ' ' + num(today.year) + T('', ' هـ');
      $('moonPhase').textContent = T(PHASES.en[phaseIndex(today.day)] + ' tonight', 'القمر الليلة: ' + PHASES.ar[phaseIndex(today.day)]);
      var chip = $('ramadanChip');
      if (ramadanNow) { chip.innerHTML = STAR + T('Ramaḍān Mubārak', 'رمضان مبارك'); chip.hidden = false; }
      else if (ramadanIn) { chip.innerHTML = STAR + T('Ramaḍān in ' + ramadanIn + (ramadanIn === 1 ? ' day' : ' days'), 'رمضان بعد ' + daysAr(ramadanIn)); chip.hidden = false; }
    }
    showDaily();
  }

  /* Filter the doors */
  var grid = $('grid');
  var chips = document.querySelectorAll('[data-filter]');
  Array.prototype.forEach.call(chips, function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.getAttribute('data-filter');
      Array.prototype.forEach.call(chips, function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
      grid.classList.toggle('is-filtered', f !== 'all');
      Array.prototype.forEach.call(grid.children, function (card) {
        var show = f === 'all' || card.getAttribute('data-group') === f;
        card.classList.toggle('is-hidden', !show);
        if (show) { card.style.animation = 'none'; void card.offsetWidth; card.style.animation = ''; }
      });
    });
  });

  /* Hadith of the day — the Hadith Generator's list, one per day */
  var list = [
    { id: 12, topic: 'Worship', topic_ar: 'العبادة', text: 'The most beloved of deeds to Allah are those done consistently, even if small.', text_ar: 'أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ', narrator: 'Aisha', narrator_ar: 'عائشة', reference: 'Sahih al-Bukhari 6465, Sahih Muslim 782', reference_ar: 'صحيح البخاري ٦٤٦٥، صحيح مسلم ٧٨٢' }
  ];
  var dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  var daily = null;
  function showDaily() {
    daily = list[dayOfYear % list.length];
    var arabic = ar();
    $('dailyTopic').textContent = arabic ? (daily.topic_ar || daily.topic) : daily.topic;
    var q = $('dailyText');
    q.textContent = arabic ? '«' + (daily.text_ar || daily.text) + '»' : '“' + daily.text + '”';
    q.classList.toggle('sk-ar', arabic);
    $('dailyAr').textContent = daily.text_ar || '';
    $('dailyAr').hidden = arabic || !daily.text_ar;
    $('dailyNarrator').textContent = arabic ? (daily.narrator_ar || daily.narrator) : daily.narrator;
    $('dailyRef').textContent = arabic ? (daily.reference_ar || daily.reference) : daily.reference;
    $('dailyLink').href = 'https://husseinbenz.github.io/hadith-generator/?id=' + daily.id + (arabic ? '&lang=ar' : '');
  }
  if (window.fetch) {
    fetch('https://husseinbenz.github.io/hadith-generator/data/hadiths.json')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) { if (data && data.length) { list = data; showDaily(); } })
      .catch(function () { /* keep the built-in hadith */ });
  }
  $('copyDaily').addEventListener('click', function () {
    if (!daily) return;
    var text = ar()
      ? '«' + (daily.text_ar || daily.text) + '»\n— الراوي: ' + (daily.narrator_ar || daily.narrator) + ' (' + (daily.reference_ar || daily.reference) + ')'
      : '“' + daily.text + '”\n— Narrated by ' + daily.narrator + ' (' + daily.reference + ')';
    Sakina.copy(text).then(function () { Sakina.toast(T('Copied with its reference', 'نُسخ الحديث مع مصدره')); });
  });

  renderText();
  document.addEventListener('sakina:lang', renderText);
})();

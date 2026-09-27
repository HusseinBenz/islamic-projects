/* Islamic Projects hub — the living bits: greeting, sky, moon, Ramadan
   countdown, project filter and a hadith of the day. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var now = new Date();
  var hour = now.getHours();

  /* Greeting follows the hour */
  var greeting = hour >= 4 && hour < 11 ? 'Ṣabāḥ al-khayr — good morning'
    : hour < 17 && hour >= 11 ? 'As-salāmu ʿalaykum — peace be upon you'
    : hour >= 17 && hour < 21 ? 'Masāʾ al-khayr — good evening'
    : 'Laylah hādiʾah — a calm night to you';
  $('greeting').textContent = greeting;

  /* The arch shows the sky you would see right now */
  var sky = hour >= 4 && hour < 7 ? 'dawn' : hour >= 7 && hour < 16 ? 'day' : hour >= 16 && hour < 20 ? 'dusk' : 'night';
  $('sky').setAttribute('data-sky', sky);

  /* Umm al-Qura date and tonight's moon */
  var MONTHS = ['Muḥarram', 'Ṣafar', 'Rabīʿ al-Awwal', 'Rabīʿ al-Thānī', 'Jumādā al-Ūlā', 'Jumādā al-Ākhirah', 'Rajab', 'Shaʿbān', 'Ramaḍān', 'Shawwāl', 'Dhū al-Qaʿdah', 'Dhū al-Ḥijjah'];
  var fmt = null;
  try { fmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { day: 'numeric', month: 'numeric', year: 'numeric' }); } catch (e) { fmt = null; }
  function hijri(date) {
    if (!fmt) return null;
    var parts = fmt.formatToParts(date), out = {};
    parts.forEach(function (p) { if (p.type === 'day' || p.type === 'month' || p.type === 'year') out[p.type] = parseInt(p.value, 10); });
    return out.day && out.month && out.year > 1000 ? out : null;
  }
  function phaseName(d) {
    if (d <= 3) return 'New crescent';
    if (d <= 6) return 'Waxing crescent';
    if (d <= 8) return 'First quarter';
    if (d <= 13) return 'Waxing gibbous';
    if (d <= 15) return 'Full moon';
    if (d <= 21) return 'Waning gibbous';
    if (d <= 23) return 'Last quarter';
    return 'Waning crescent';
  }
  function moonOffset(day, size) {
    return (day <= 15 ? -Math.round(size * day / 15) : Math.round(size * (30 - day) / 15)) + 'px';
  }
  var today = hijri(now);
  if (today) {
    $('hijriToday').textContent = today.day + ' ' + MONTHS[today.month - 1] + ' ' + today.year;
    $('moonPhase').textContent = phaseName(today.day) + ' tonight';
    var big = $('bigMoon');
    var setBig = function () { big.style.setProperty('--x', moonOffset(today.day, big.offsetWidth || 56)); };
    setBig();
    window.addEventListener('resize', setBig, { passive: true });
    $('smallMoon').style.setProperty('--x', moonOffset(today.day, 34));

    /* Days until the next 1 Ramaḍān, found by walking the Umm al-Qura calendar */
    if (!(today.month === 9)) {
      for (var i = 1; i <= 400; i++) {
        var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, 12);
        var h = hijri(d);
        if (h && h.month === 9 && h.day === 1) {
          var chip = $('ramadanChip');
          chip.innerHTML = '<svg width="13" height="13" viewBox="-12 -12 24 24" aria-hidden="true"><path fill="currentColor" d="M11 0L7.78 3.22L7.78 7.78L3.22 7.78L0 11L-3.22 7.78L-7.78 7.78L-7.78 3.22L-11 0L-7.78 -3.22L-7.78 -7.78L-3.22 -7.78L0 -11L3.22 -7.78L7.78 -7.78L7.78 -3.22Z"/></svg>Ramaḍān in ' + i + (i === 1 ? ' day' : ' days');
          chip.hidden = false;
          break;
        }
      }
    } else {
      var chipNow = $('ramadanChip');
      chipNow.textContent = 'Ramaḍān Mubārak';
      chipNow.hidden = false;
    }
  } else {
    $('moonChip').hidden = true;
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

  /* Hadith of the day — same list as the Hadith Generator, one per day */
  var fallback = [
    { topic: 'Intentions', text: 'Actions are judged by intentions, and every person will be rewarded according to what they intended.', narrator: 'Umar ibn al-Khattab', reference: 'Sahih al-Bukhari 1, Sahih Muslim 1907' },
    { topic: 'Charity', text: 'Smiling at your brother is charity.', narrator: 'Abu Dharr', reference: 'Sunan al-Tirmidhi 1956' },
    { topic: 'Worship', text: 'The most beloved of deeds to Allah are those done consistently, even if small.', narrator: 'Aisha', reference: 'Sahih al-Bukhari 6465, Sahih Muslim 782' },
    { topic: 'Contentment', text: 'Richness is not having many possessions; rather, true richness is the richness of the soul.', narrator: 'Abu Hurayrah', reference: 'Sahih al-Bukhari 6446, Sahih Muslim 1051' },
    { topic: 'Speech', text: 'Whoever believes in Allah and the Last Day should speak good or remain silent.', narrator: 'Abu Hurayrah', reference: 'Sahih al-Bukhari 6018, Sahih Muslim 47' },
    { topic: 'Charity', text: 'A good word is charity.', narrator: 'Abu Hurayrah', reference: 'Sahih al-Bukhari 2989, Sahih Muslim 1009' },
    { topic: 'Modesty', text: 'Modesty is a branch of faith.', narrator: 'Abu Hurayrah', reference: 'Sahih al-Bukhari 9, Sahih Muslim 35' }
  ];
  var dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  var daily = null;
  function showDaily(list) {
    daily = list[dayOfYear % list.length];
    $('dailyTopic').textContent = daily.topic;
    $('dailyText').textContent = '“' + daily.text + '”';
    $('dailyNarrator').textContent = daily.narrator;
    $('dailyRef').textContent = daily.reference;
  }
  showDaily(fallback);
  if (window.fetch) {
    fetch('https://husseinbenz.github.io/hadith-generator/data/hadiths.json')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (list) { if (list && list.length) showDaily(list); })
      .catch(function () { /* keep the built-in list */ });
  }
  $('copyDaily').addEventListener('click', function () {
    if (!daily) return;
    Sakina.copy('“' + daily.text + '”\n— Narrated by ' + daily.narrator + ' (' + daily.reference + ')').then(function () {
      Sakina.toast('Copied with its reference');
    });
  });
})();

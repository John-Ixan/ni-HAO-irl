const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const intro = document.querySelector('#intro');
const site = document.querySelector('#site');
const skipIntro = document.querySelector('#skip-intro');
let introTimers = [];
let previousFocus = null;
let introActive = false;
let introLeaving = false;
let motionPaused = false;

function clearIntroTimers() {
  introTimers.forEach(clearTimeout);
  introTimers = [];
}

function finishIntro({ immediate = false } = {}) {
  if (!introActive || (introLeaving && !immediate)) return;
  clearIntroTimers();
  introLeaving = true;
  site.classList.add('site-enter');
  const hide = () => {
    introActive = false;
    introLeaving = false;
    intro.hidden = true;
    intro.classList.remove('running', 'is-leaving');
    site.inert = false;
    document.body.classList.remove('intro-playing');
    const previousRect = previousFocus?.getBoundingClientRect();
    if (previousFocus && previousFocus !== document.body && previousRect.top >= 0 && previousRect.bottom <= window.innerHeight) previousFocus.focus({ preventScroll: true });
    else document.querySelector('#main').focus({ preventScroll: true });
  };
  if (immediate || motionPreference.matches) hide();
  else {
    intro.classList.add('is-leaving');
    introTimers.push(setTimeout(hide, 800));
  }
}

function playIntro() {
  clearIntroTimers();
  if (motionPreference.matches) {
    intro.hidden = true;
    site.inert = false;
    document.body.classList.remove('intro-playing');
    return;
  }
  previousFocus = document.activeElement;
  introActive = true;
  introLeaving = false;
  window.scrollTo({ top: 0, behavior: 'instant' });
  site.classList.remove('site-enter');
  site.inert = true;
  document.body.classList.add('intro-playing');
  intro.hidden = false;
  intro.classList.remove('running', 'is-leaving');
  void intro.offsetWidth;
  intro.classList.add('running');
  skipIntro.focus({ preventScroll: true });
  introTimers.push(setTimeout(() => finishIntro(), 2950));
}

skipIntro.addEventListener('click', () => finishIntro());
document.querySelectorAll('[data-replay]').forEach(button => button.addEventListener('click', playIntro));
document.addEventListener('keydown', event => {
  if (introActive && event.key === 'Escape') finishIntro({ immediate: true });
  if (introActive && event.key === 'Tab') {
    event.preventDefault();
    skipIntro.focus();
  }
});
motionPreference.addEventListener('change', () => {
  if (motionPreference.matches) finishIntro({ immediate: true });
  document.body.classList.toggle('js-motion', !motionPreference.matches);
  updateReplayControls();
});

function updateReplayControls() {
  document.querySelector('#motion-toggle').hidden = motionPreference.matches;
  document.querySelectorAll('[data-replay]').forEach(button => {
    button.hidden = motionPreference.matches;
  });
}

document.querySelector('#motion-toggle').addEventListener('click', event => {
  motionPaused = !motionPaused;
  document.body.classList.toggle('motion-paused', motionPaused);
  const button = event.currentTarget;
  button.setAttribute('aria-pressed', String(motionPaused));
  button.setAttribute('aria-label', motionPaused ? 'Resume background motion' : 'Pause background motion');
  button.title = button.getAttribute('aria-label');
  button.querySelector('span').textContent = motionPaused ? '▷' : 'Ⅱ';
  world.style.setProperty('--px', '0px');
  world.style.setProperty('--py', '0px');
});

if (!motionPreference.matches) document.body.classList.add('js-motion');
updateReplayControls();
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
} else document.querySelectorAll('.reveal').forEach(element => element.classList.add('visible'));

const world = document.querySelector('#character-world');
world.addEventListener('pointermove', event => {
  if (motionPreference.matches || motionPaused || event.pointerType !== 'mouse') return;
  const rect = world.getBoundingClientRect();
  world.style.setProperty('--px', `${((event.clientX - rect.left) / rect.width - 0.5) * 10}px`);
  world.style.setProperty('--py', `${((event.clientY - rect.top) / rect.height - 0.5) * 10}px`);
});
world.addEventListener('pointerleave', () => {
  world.style.setProperty('--px', '0px');
  world.style.setProperty('--py', '0px');
});
document.querySelectorAll('[data-character]').forEach(tile => tile.addEventListener('click', () => {
  document.querySelector('#world-caption').replaceChildren();
  const dot = document.createElement('span');
  dot.className = 'caption-dot';
  document.querySelector('#world-caption').append(dot, tile.dataset.character === 'ni' ? '你 · nǐ · you. Every hello starts with someone.' : '好 · hǎo · good. Together, 你好 means hello.');
  tile.classList.remove('bop');
  void tile.offsetWidth;
  tile.classList.add('bop');
  setTimeout(() => tile.classList.remove('bop'), 560);
}));

const phrases = {
  hello: { hanzi: '你好', pinyin: 'nǐ hǎo', meaning: 'Hello. A small word with big possibilities.', context: 'FOR EVERY NEW BEGINNING', number: '001' },
  thanks: { hanzi: '谢谢', pinyin: 'xièxie', meaning: 'Thank you. A little kindness goes a long way.', context: 'FOR THE EVERYDAY GOOD STUFF', number: '002' },
  go: { hanzi: '走吧', pinyin: 'zǒu ba', meaning: 'Let’s go. There’s a whole world out there.', context: 'FOR YOUR NEXT LITTLE ADVENTURE', number: '003' }
};
let selectedPhrase = 'hello';
const tabs = [...document.querySelectorAll('[data-phrase]')];
const audioStatus = document.querySelector('#audio-status');
const hearButton = document.querySelector('#hear-phrase');
const synth = window.speechSynthesis;
let speechSequence = 0;

function selectPhrase(tab) {
  selectedPhrase = tab.dataset.phrase;
  if (synth) synth.cancel();
  speechSequence++;
  hearButton.querySelector('span').textContent = 'Hear it';
  hearButton.disabled = false;
  audioStatus.textContent = '';
  tabs.forEach(item => {
    item.setAttribute('aria-selected', String(item === tab));
    item.tabIndex = item === tab ? 0 : -1;
  });
  document.querySelector('#phrase-panel').setAttribute('aria-labelledby', tab.id);
  const phrase = phrases[selectedPhrase];
  ['hanzi', 'pinyin', 'meaning', 'context', 'number'].forEach(key => {
    document.querySelector(`#phrase-${key}`).textContent = phrase[key];
  });
  const content = document.querySelector('.phrase-content');
  content.classList.remove('phrase-change');
  void content.offsetWidth;
  content.classList.add('phrase-change');
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectPhrase(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      tabs[next].focus();
      selectPhrase(tabs[next]);
    }
  });
});

function findMandarinVoice() {
  const voices = synth?.getVoices() || [];
  return voices.find(voice => /^zh[-_](CN|Hans|SG)/i.test(voice.lang)) || voices.find(voice => /^zh[-_](TW|Hant)/i.test(voice.lang));
}
if (synth) synth.getVoices();
hearButton.addEventListener('click', () => {
  const voice = findMandarinVoice();
  if (!synth || !voice) {
    audioStatus.textContent = 'Mandarin audio isn’t available in this browser. The pinyin above is here to help.';
    return;
  }
  synth.cancel();
  const sequence = ++speechSequence;
  const utterance = new SpeechSynthesisUtterance(phrases[selectedPhrase].hanzi);
  utterance.lang = voice.lang;
  utterance.voice = voice;
  utterance.rate = 0.78;
  hearButton.disabled = true;
  hearButton.querySelector('span').textContent = 'Listening…';
  audioStatus.textContent = '';
  const reset = () => {
    if (sequence !== speechSequence) return;
    hearButton.disabled = false;
    hearButton.querySelector('span').textContent = 'Hear it';
  };
  utterance.onend = reset;
  utterance.onerror = () => {
    if (sequence === speechSequence) audioStatus.textContent = 'Audio couldn’t play this time. Try again in a moment.';
    reset();
  };
  synth.speak(utterance);
  setTimeout(reset, 8000);
});
window.addEventListener('pagehide', () => { if (synth) synth.cancel(); });
playIntro();

/**
 * accessibility.js
 * Desafio do Cafezal — Manejo de Cafezais em Produção
 *
 * Responsável por: modo escuro, alto contraste, tamanho da fonte,
 * redução de movimento, preferências e armazenamento das configurações.
 *
 * Também sincroniza os toggles de áudio do painel (#a11y-voice, #a11y-sfx,
 * #a11y-ambience) com o módulo Audio, que é o dono real dessas preferências.
 *
 * Chave única compartilhada: `cafezal:prefs` (read-merge-write).
 *
 * Não toca em #screen-root. Não renderiza telas.
 *
 * Autor do projeto: Dirceu Nogueira de Sales Duarte Junior
 * Apoio: Inteligência Artificial generativa (ferramenta de apoio)
 */

(function () {
  'use strict';

  /* ============================================================
   * 1. CONSTANTES
   * ============================================================ */

  var PREFS_KEY = 'cafezal:prefs';

  var THEMES = ['light', 'dark'];

  var FONT_LADDER = ['sm', 'md', 'lg', 'xl'];
  var FONT_DEFAULT_INDEX = 1; // 'md'

  var FONT_LABELS = {
    sm: 'Pequeno',
    md: 'Padrão',
    lg: 'Grande',
    xl: 'Muito grande'
  };

  var ROOT_CLASSES = {
    themeDark:    'theme-dark',
    contrastHigh: 'contrast-high',
    reduceMotion: 'reduce-motion',
    fontPrefix:   'font-'
  };

  /* ============================================================
   * 2. ESTADO INTERNO
   * ============================================================ */

  var prefs = {
    theme: 'light',
    contrast: false,
    reduceMotion: false,
    fontScale: 'md',
    voice: false,
    sfx: false,
    ambience: false
  };

  var gestureUnlockBound = false;

  /* ============================================================
   * 3. HELPERS DE PREFERÊNCIAS
   * ============================================================ */

  function readRawPrefs() {
    try {
      var raw = window.localStorage.getItem(PREFS_KEY);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
      return parsed;
    } catch (e) {
      return {};
    }
  }

  function writePrefs(patch) {
    try {
      var current = readRawPrefs();
      Object.keys(patch).forEach(function (k) {
        current[k] = patch[k];
      });
      window.localStorage.setItem(PREFS_KEY, JSON.stringify(current));
      return true;
    } catch (e) {
      return false;
    }
  }

  function matchesMedia(query) {
    if (!window.matchMedia) return false;
    try {
      return !!window.matchMedia(query).matches;
    } catch (e) {
      return false;
    }
  }

  /* ============================================================
   * 4. CARREGAMENTO INICIAL
   * ============================================================ */

  function loadPrefs() {
    var raw = readRawPrefs();
    var hasSaved = Object.keys(raw).length > 0;
    var firstVisit = !hasSaved;

    // Tema
    if (typeof raw.theme === 'string' && THEMES.indexOf(raw.theme) !== -1) {
      prefs.theme = raw.theme;
    } else if (firstVisit) {
      prefs.theme = matchesMedia('(prefers-color-scheme: dark)') ? 'dark' : 'light';
    }

    // Alto contraste
    if (typeof raw.contrast === 'boolean') {
      prefs.contrast = raw.contrast;
    }

    // Redução de movimento
    if (typeof raw.reduceMotion === 'boolean') {
      prefs.reduceMotion = raw.reduceMotion;
    } else if (firstVisit) {
      prefs.reduceMotion = matchesMedia('(prefers-reduced-motion: reduce)');
    }

    // Tamanho da fonte
    if (typeof raw.fontScale === 'string' && FONT_LADDER.indexOf(raw.fontScale) !== -1) {
      prefs.fontScale = raw.fontScale;
    }

    // Áudio (espelhado — dono real é Audio)
    if (typeof raw.voice === 'boolean')    prefs.voice = raw.voice;
    if (typeof raw.sfx === 'boolean')      prefs.sfx = raw.sfx;
    if (typeof raw.ambience === 'boolean') prefs.ambience = raw.ambience;

    // Se primeira visita com detecção automática, persiste para não reavaliar
    if (firstVisit) {
      writePrefs({
        theme: prefs.theme,
        contrast: prefs.contrast,
        reduceMotion: prefs.reduceMotion,
        fontScale: prefs.fontScale
      });
    }

    return prefs;
  }

  /* ============================================================
   * 5. APLICAÇÃO DE CLASSES EM <html>
   * ============================================================ */

  function applyTheme() {
    var root = document.documentElement;
    if (prefs.theme === 'dark') {
      root.classList.add(ROOT_CLASSES.themeDark);
    } else {
      root.classList.remove(ROOT_CLASSES.themeDark);
    }
    root.setAttribute('data-theme', prefs.theme);
  }

  function applyContrast() {
    var root = document.documentElement;
    if (prefs.contrast) {
      root.classList.add(ROOT_CLASSES.contrastHigh);
      root.setAttribute('data-contrast', 'high');
    } else {
      root.classList.remove(ROOT_CLASSES.contrastHigh);
      root.removeAttribute('data-contrast');
    }
  }

  function applyReduceMotion() {
    var root = document.documentElement;
    if (prefs.reduceMotion) {
      root.classList.add(ROOT_CLASSES.reduceMotion);
      root.setAttribute('data-motion', 'reduced');
    } else {
      root.classList.remove(ROOT_CLASSES.reduceMotion);
      root.removeAttribute('data-motion');
    }
  }

  function applyFontScale() {
    var root = document.documentElement;
    FONT_LADDER.forEach(function (s) {
      root.classList.remove(ROOT_CLASSES.fontPrefix + s);
    });
    root.classList.add(ROOT_CLASSES.fontPrefix + prefs.fontScale);
    root.setAttribute('data-font-scale', prefs.fontScale);
  }

  /* ============================================================
   * 6. SINCRONIZAÇÃO DOS TOGGLES DO PAINEL
   * ============================================================ */

  function syncToggle(btn, isOn) {
    if (!btn) return;
    btn.setAttribute('aria-pressed', isOn ? 'true' : 'false');
    btn.setAttribute('data-on', isOn ? 'true' : 'false');
    if (isOn) btn.classList.add('is-on');
    else btn.classList.remove('is-on');

    var stateEl = btn.querySelector('.toggle-state');
    if (stateEl) {
      stateEl.textContent = isOn ? 'Ligado' : 'Desligado';
    }
  }

  function syncFontStatus() {
    var statusEl = document.getElementById('a11y-font-status');
    if (statusEl) {
      statusEl.textContent = FONT_LABELS[prefs.fontScale] || FONT_LABELS.md;
    }

    var upBtn = document.getElementById('a11y-font-up');
    var downBtn = document.getElementById('a11y-font-down');

    var idx = FONT_LADDER.indexOf(prefs.fontScale);
    if (idx === -1) idx = FONT_DEFAULT_INDEX;
    var atMax = idx >= FONT_LADDER.length - 1;
    var atMin = idx <= 0;

    if (upBtn) {
      if (atMax) {
        upBtn.disabled = true;
        upBtn.setAttribute('aria-disabled', 'true');
      } else {
        upBtn.disabled = false;
        upBtn.removeAttribute('aria-disabled');
      }
    }

    if (downBtn) {
      if (atMin) {
        downBtn.disabled = true;
        downBtn.setAttribute('aria-disabled', 'true');
      } else {
        downBtn.disabled = false;
        downBtn.removeAttribute('aria-disabled');
      }
    }
  }

  function readAudioState() {
    var A = window.Audio;
    if (!A) {
      return {
        voice: prefs.voice,
        sfx: prefs.sfx,
        ambience: prefs.ambience
      };
    }
    return {
      voice: typeof A.isVoiceOn    === 'function' ? !!A.isVoiceOn()    : prefs.voice,
      sfx:   typeof A.isSfxOn      === 'function' ? !!A.isSfxOn()      : prefs.sfx,
      ambience: typeof A.isAmbienceOn === 'function' ? !!A.isAmbienceOn() : prefs.ambience
    };
  }

  function syncAllToggles() {
    syncToggle(document.getElementById('a11y-theme'),    prefs.theme === 'dark');
    syncToggle(document.getElementById('a11y-contrast'), !!prefs.contrast);
    syncToggle(document.getElementById('a11y-motion'),   !!prefs.reduceMotion);

    var audioState = readAudioState();
    syncToggle(document.getElementById('a11y-voice'),    audioState.voice);
    syncToggle(document.getElementById('a11y-sfx'),      audioState.sfx);
    syncToggle(document.getElementById('a11y-ambience'), audioState.ambience);

    // Espelha o estado real do Audio em nosso prefs local
    prefs.voice    = audioState.voice;
    prefs.sfx      = audioState.sfx;
    prefs.ambience = audioState.ambience;

    syncFontStatus();
  }

  /* ============================================================
   * 7. AÇÕES (chamadas pelos botões)
   * ============================================================ */

  function dispatchChange(key, value) {
    try {
      var evt = new CustomEvent('cafezal:prefs-changed', {
        detail: { key: key, value: value, prefs: A11y.getPrefs() }
      });
      document.dispatchEvent(evt);
    } catch (e) {
      // Browsers muito antigos não suportam CustomEvent — silencioso
    }
  }

  function setTheme(theme) {
    if (THEMES.indexOf(theme) === -1) return prefs.theme;
    prefs.theme = theme;
    applyTheme();
    writePrefs({ theme: prefs.theme });
    syncAllToggles();
    dispatchChange('theme', prefs.theme);
    return prefs.theme;
  }

  function toggleTheme() {
    return setTheme(prefs.theme === 'dark' ? 'light' : 'dark');
  }

  function toggleContrast() {
    prefs.contrast = !prefs.contrast;
    applyContrast();
    writePrefs({ contrast: prefs.contrast });
    syncAllToggles();
    dispatchChange('contrast', prefs.contrast);
    return prefs.contrast;
  }

  function toggleReduceMotion() {
    prefs.reduceMotion = !prefs.reduceMotion;
    applyReduceMotion();
    writePrefs({ reduceMotion: prefs.reduceMotion });
    syncAllToggles();
    dispatchChange('reduceMotion', prefs.reduceMotion);
    return prefs.reduceMotion;
  }

  function toggleVoice() {
    var A = window.Audio;
    var newVal = !prefs.voice;
    if (A && typeof A.setVoice === 'function') {
      A.setVoice(newVal); // persiste por conta própria
    } else {
      writePrefs({ voice: newVal });
    }
    prefs.voice = newVal;
    syncAllToggles();
    dispatchChange('voice', newVal);
    return newVal;
  }

  function toggleSfx() {
    var A = window.Audio;
    var newVal = !prefs.sfx;
    if (A && typeof A.setSfx === 'function') {
      A.setSfx(newVal);
    } else {
      writePrefs({ sfx: newVal });
    }
    prefs.sfx = newVal;
    syncAllToggles();
    dispatchChange('sfx', newVal);
    return newVal;
  }

  function toggleAmbience() {
    var A = window.Audio;
    var newVal = !prefs.ambience;
    if (A && typeof A.setAmbience === 'function') {
      A.setAmbience(newVal);
    } else {
      writePrefs({ ambience: newVal });
    }
    prefs.ambience = newVal;
    syncAllToggles();
    dispatchChange('ambience', newVal);
    return newVal;
  }

  function setFontScale(scale) {
    if (FONT_LADDER.indexOf(scale) === -1) return prefs.fontScale;
    prefs.fontScale = scale;
    applyFontScale();
    writePrefs({ fontScale: prefs.fontScale });
    syncFontStatus();
    dispatchChange('fontScale', prefs.fontScale);
    return prefs.fontScale;
  }

  function stepFont(direction) {
    var idx = FONT_LADDER.indexOf(prefs.fontScale);
    if (idx === -1) idx = FONT_DEFAULT_INDEX;

    if (direction === 'up') {
      idx = Math.min(FONT_LADDER.length - 1, idx + 1);
    } else if (direction === 'down') {
      idx = Math.max(0, idx - 1);
    } else { // 'reset'
      idx = FONT_DEFAULT_INDEX;
    }

    return setFontScale(FONT_LADDER[idx]);
  }

  /* ============================================================
   * 8. GESTO DO USUÁRIO — DESBLOQUEIO DO AUDIOCONTEXT
   * ============================================================ */

  function ensureGestureUnlock() {
    var A = window.Audio;
    if (A && typeof A.unlock === 'function') {
      try { A.unlock(); } catch (e) { /* silencioso */ }
    }
  }

  function bindFirstGestureUnlock() {
    if (gestureUnlockBound) return;
    gestureUnlockBound = true;

    function handler() {
      ensureGestureUnlock();
      document.removeEventListener('pointerdown', handler, true);
      document.removeEventListener('keydown', handler, true);
      document.removeEventListener('click', handler, true);
      document.removeEventListener('touchstart', handler, true);
    }

    document.addEventListener('pointerdown', handler, true);
    document.addEventListener('keydown', handler, true);
    document.addEventListener('click', handler, true);
    document.addEventListener('touchstart', handler, true);
  }

  /* ============================================================
   * 9. LIGAÇÃO DE EVENTOS NOS BOTÕES
   * ============================================================ */

  function bindToggle(id, handler) {
    var btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      try { handler(); } catch (err) { /* silencioso */ }
    });
  }

  function bindControls() {
    bindToggle('a11y-theme',    toggleTheme);
    bindToggle('a11y-contrast', toggleContrast);
    bindToggle('a11y-motion',   toggleReduceMotion);
    bindToggle('a11y-voice',    toggleVoice);
    bindToggle('a11y-sfx',      toggleSfx);
    bindToggle('a11y-ambience', toggleAmbience);

    bindToggle('a11y-font-up',    function () { stepFont('up'); });
    bindToggle('a11y-font-down',  function () { stepFont('down'); });
    bindToggle('a11y-font-reset', function () { stepFont('reset'); });
  }

  /* ============================================================
   * 10. API PÚBLICA
   * ============================================================ */

  var A11y = {};

  /**
   * Inicializa o módulo:
   *  1. Lê prefs do localStorage
   *  2. Aplica classes em <html>
   *  3. Sincroniza Audio com as prefs lidas
   *  4. Liga eventos dos botões
   *  5. Registra desbloqueio do AudioContext no primeiro gesto
   *  6. Sincroniza toggles visuais
   */
  A11y.init = function () {
    loadPrefs();

    applyTheme();
    applyContrast();
    applyReduceMotion();
    applyFontScale();

    var A = window.Audio;
    if (A) {
      if (typeof A.setVoice    === 'function') A.setVoice(prefs.voice);
      if (typeof A.setSfx      === 'function') A.setSfx(prefs.sfx);
      if (typeof A.setAmbience === 'function') A.setAmbience(prefs.ambience);
    }

    bindControls();
    bindFirstGestureUnlock();
    syncAllToggles();

    return A11y.getPrefs();
  };

  A11y.setTheme = setTheme;
  A11y.toggleContrast = toggleContrast;
  A11y.toggleReduceMotion = toggleReduceMotion;
  A11y.setFontScale = setFontScale;

  /**
   * Aplica um conjunto parcial de preferências de uma só vez.
   * Aceita: { theme, contrast, reduceMotion, fontScale, voice, sfx, ambience }
   */
  A11y.applyPrefs = function (patch) {
    if (!patch || typeof patch !== 'object') return A11y.getPrefs();

    if (typeof patch.theme === 'string' && THEMES.indexOf(patch.theme) !== -1) {
      setTheme(patch.theme);
    }
    if (typeof patch.contrast === 'boolean' && patch.contrast !== prefs.contrast) {
      toggleContrast();
    }
    if (typeof patch.reduceMotion === 'boolean' && patch.reduceMotion !== prefs.reduceMotion) {
      toggleReduceMotion();
    }
    if (typeof patch.fontScale === 'string' && FONT_LADDER.indexOf(patch.fontScale) !== -1) {
      setFontScale(patch.fontScale);
    }
    if (typeof patch.voice === 'boolean' && patch.voice !== prefs.voice) {
      toggleVoice();
    }
    if (typeof patch.sfx === 'boolean' && patch.sfx !== prefs.sfx) {
      toggleSfx();
    }
    if (typeof patch.ambience === 'boolean' && patch.ambience !== prefs.ambience) {
      toggleAmbience();
    }

    return A11y.getPrefs();
  };

  /**
   * Retorna uma cópia profunda das preferências atuais.
   */
  A11y.getPrefs = function () {
    return {
      theme: prefs.theme,
      contrast: !!prefs.contrast,
      reduceMotion: !!prefs.reduceMotion,
      fontScale: prefs.fontScale,
      voice: !!prefs.voice,
      sfx: !!prefs.sfx,
      ambience: !!prefs.ambience
    };
  };

  /**
   * Resincroniza os toggles visuais com o estado atual.
   * Útil quando outros módulos alteram Audio por fora.
   */
  A11y.refresh = syncAllToggles;

  A11y.getFontLadder = function () {
    return FONT_LADDER.slice();
  };

  A11y.getPrefsKey = function () {
    return PREFS_KEY;
  };

  /* ============================================================
   * 11. EXPORTAÇÃO
   * ============================================================ */

  window.A11y = A11y;

})();
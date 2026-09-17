/**
 * audio.js
 * Desafio do Cafezal — Manejo de Cafezais em Produção
 *
 * Responsável por: Web Speech API (leitura em voz), efeitos sonoros
 * sintetizados via Web Audio API, som ambiente e controles de áudio.
 *
 * Zero assets externos: todos os efeitos são gerados por osciladores
 * e envelopes. Nenhum arquivo .mp3/.wav é necessário.
 *
 * Preferências persistem em `cafezal:prefs` (mesma chave usada por
 * accessibility.js — ambos usam read-merge-write para evitar conflito).
 *
 * Não toca no DOM. Não renderiza.
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

  /**
   * Partituras curtas de efeitos sonoros.
   * Cada nota tem: freq (Hz), t (início, s), d (duração, s),
   * type (oscilador), g (ganho de pico).
   */
  var TONES = {
    // Acerto: dois toques ascendentes alegres (C5 → G5)
    success: [
      { f: 523.25, t: 0.00, d: 0.12, type: 'sine',     g: 0.22 },
      { f: 783.99, t: 0.10, d: 0.22, type: 'sine',     g: 0.24 }
    ],
    // Erro: dois toques descendentes discretos (A3 → E3)
    error: [
      { f: 220.00, t: 0.00, d: 0.16, type: 'sine',     g: 0.20 },
      { f: 164.81, t: 0.13, d: 0.24, type: 'sine',     g: 0.20 }
    ],
    // Conquista: fanfarra curta (C5–E5–G5–C6)
    achievement: [
      { f: 523.25, t: 0.00, d: 0.12, type: 'triangle', g: 0.20 },
      { f: 659.25, t: 0.10, d: 0.12, type: 'triangle', g: 0.20 },
      { f: 783.99, t: 0.20, d: 0.12, type: 'triangle', g: 0.20 },
      { f: 1046.50, t: 0.30, d: 0.32, type: 'triangle', g: 0.24 }
    ],
    // Desbloqueio: sino curto (E5 → B5)
    unlock: [
      { f: 659.25, t: 0.00, d: 0.10, type: 'sine',     g: 0.18 },
      { f: 987.77, t: 0.08, d: 0.28, type: 'sine',     g: 0.20 }
    ],
    // Avanço: click curto (A4)
    advance: [
      { f: 440.00, t: 0.00, d: 0.08, type: 'sine',     g: 0.16 }
    ],
    // Conclusão: acorde longo (C5–E5–G5–C6–E6)
    complete: [
      { f: 523.25, t: 0.00, d: 0.15, type: 'triangle', g: 0.20 },
      { f: 659.25, t: 0.12, d: 0.15, type: 'triangle', g: 0.20 },
      { f: 783.99, t: 0.24, d: 0.15, type: 'triangle', g: 0.20 },
      { f: 1046.50, t: 0.36, d: 0.40, type: 'triangle', g: 0.24 },
      { f: 1318.51, t: 0.55, d: 0.60, type: 'sine',     g: 0.16 }
    ],
    // Boss: tema grave e imponente (D3 → A3 → D4)
    boss: [
      { f: 146.83, t: 0.00, d: 0.30, type: 'sawtooth', g: 0.14 },
      { f: 220.00, t: 0.20, d: 0.30, type: 'sawtooth', g: 0.14 },
      { f: 293.66, t: 0.42, d: 0.55, type: 'triangle', g: 0.18 }
    ]
  };

  /* ============================================================
   * 2. ESTADO INTERNO
   * ============================================================ */

  var voiceEnabled = false;
  var sfxEnabled = false;
  var ambienceEnabled = false;

  var audioCtx = null;
  var ambienceNodes = null;

  var cachedVoice = null;
  var voicesHookAttached = false;

  /* ============================================================
   * 3. PREFERÊNCIAS (cafezal:prefs)
   * ============================================================ */

  function readPrefs() {
    try {
      var raw = window.localStorage.getItem(PREFS_KEY);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      return (parsed && typeof parsed === 'object') ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function writePrefs(patch) {
    try {
      var current = readPrefs();
      Object.keys(patch).forEach(function (k) {
        current[k] = patch[k];
      });
      window.localStorage.setItem(PREFS_KEY, JSON.stringify(current));
      return true;
    } catch (e) {
      return false;
    }
  }

  function persistAudioPrefs() {
    writePrefs({
      voice: voiceEnabled,
      sfx: sfxEnabled,
      ambience: ambienceEnabled
    });
  }

  function loadAudioPrefs() {
    var prefs = readPrefs();
    if (typeof prefs.voice === 'boolean')    voiceEnabled = prefs.voice;
    if (typeof prefs.sfx === 'boolean')      sfxEnabled = prefs.sfx;
    if (typeof prefs.ambience === 'boolean') ambienceEnabled = prefs.ambience;
  }

  /* ============================================================
   * 4. WEB AUDIO API — CONTEXTO
   * ============================================================ */

  function ensureContext() {
    if (audioCtx) return audioCtx;
    var Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    try {
      audioCtx = new Ctor();
    } catch (e) {
      audioCtx = null;
    }
    return audioCtx;
  }

  function resumeIfSuspended() {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
      try { audioCtx.resume(); } catch (e) { /* silencioso */ }
    }
  }

  /* ============================================================
   * 5. SÍNTESE — EFEITOS SONOROS
   * ============================================================ */

  function playTone(ctx, freq, startTime, duration, type, gain) {
    var osc = ctx.createOscillator();
    var env = ctx.createGain();

    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    var safeGain = Math.max(gain || 0.2, 0.0001);
    var safeDur  = Math.max(duration || 0.1, 0.05);

    env.gain.setValueAtTime(0.0001, startTime);
    env.gain.exponentialRampToValueAtTime(safeGain, startTime + 0.012);
    env.gain.exponentialRampToValueAtTime(0.0001, startTime + safeDur);

    osc.connect(env);
    env.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + safeDur + 0.1);

    osc.onended = function () {
      try { osc.disconnect(); } catch (e) { /* silencioso */ }
      try { env.disconnect(); } catch (e) { /* silencioso */ }
    };
  }

  function playSequence(notes) {
    var ctx = ensureContext();
    if (!ctx) return false;
    var now = ctx.currentTime + 0.02;
    for (var i = 0; i < notes.length; i++) {
      var note = notes[i];
      playTone(ctx, note.f, now + note.t, note.d, note.type, note.g);
    }
    return true;
  }

  /* ============================================================
   * 6. SOM AMBIENTE — RUÍDO FILTRADO (vento entre folhas)
   * ============================================================ */

  function fadeGain(gainNode, target, duration, onDone) {
    if (!audioCtx || !gainNode) return;
    var now = audioCtx.currentTime;
    var current = gainNode.gain.value;
    var safeTarget = Math.max(target, 0.0001);
    try {
      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.setValueAtTime(Math.max(current, 0.0001), now);
      gainNode.gain.exponentialRampToValueAtTime(safeTarget, now + duration);
    } catch (e) { /* silencioso */ }
    if (onDone) {
      window.setTimeout(onDone, Math.ceil(duration * 1000) + 60);
    }
  }

  function startAmbience() {
    var ctx = ensureContext();
    if (!ctx) return false;
    resumeIfSuspended();
    if (ambienceNodes) return true;

    try {
      var bufferSize = Math.max(1, Math.floor(ctx.sampleRate * 2));
      var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      var data = buffer.getChannelData(0);
      for (var i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      var source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      var filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      filter.Q.value = 0.7;

      var gain = ctx.createGain();
      gain.gain.value = 0.0001;
      gain.connect(ctx.destination);

      source.connect(filter);
      filter.connect(gain);

      // LFO no cutoff — dá movimento lento ao "vento"
      var lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.07;
      var lfoGain = ctx.createGain();
      lfoGain.gain.value = 200;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      source.start();
      lfo.start();

      ambienceNodes = {
        source: source,
        filter: filter,
        gain: gain,
        lfo: lfo,
        lfoGain: lfoGain
      };

      fadeGain(gain, 0.035, 1.5);
      return true;
    } catch (e) {
      ambienceNodes = null;
      return false;
    }
  }

  function stopAmbience() {
    if (!ambienceNodes) return;
    var nodes = ambienceNodes;
    ambienceNodes = null;

    fadeGain(nodes.gain, 0.0001, 0.6, function () {
      try { nodes.source.stop(); } catch (e) { /* silencioso */ }
      try { nodes.lfo.stop(); }    catch (e) { /* silencioso */ }
      try { nodes.source.disconnect(); } catch (e) { /* silencioso */ }
      try { nodes.filter.disconnect(); } catch (e) { /* silencioso */ }
      try { nodes.gain.disconnect(); }   catch (e) { /* silencioso */ }
      try { nodes.lfo.disconnect(); }    catch (e) { /* silencioso */ }
      try { nodes.lfoGain.disconnect();} catch (e) { /* silencioso */ }
    });
  }

  /* ============================================================
   * 7. WEB SPEECH API — VOZ
   * ============================================================ */

  function pickVoice() {
    if (!('speechSynthesis' in window)) return null;
    if (cachedVoice) return cachedVoice;
    var voices = [];
    try { voices = window.speechSynthesis.getVoices() || []; }
    catch (e) { voices = []; }
    if (!voices.length) return null;

    // Preferência 1: pt-BR
    for (var i = 0; i < voices.length; i++) {
      var v = voices[i];
      if (v && v.lang && v.lang.toLowerCase().indexOf('pt-br') === 0) {
        cachedVoice = v;
        return v;
      }
    }
    // Preferência 2: qualquer pt-*
    for (var j = 0; j < voices.length; j++) {
      var w = voices[j];
      if (w && w.lang && w.lang.toLowerCase().indexOf('pt') === 0) {
        cachedVoice = w;
        return w;
      }
    }
    return null;
  }

  function attachVoicesHook() {
    if (voicesHookAttached) return;
    if (!('speechSynthesis' in window)) return;
    voicesHookAttached = true;
    try {
      window.speechSynthesis.onvoiceschanged = function () {
        cachedVoice = null;
        pickVoice();
      };
    } catch (e) { /* silencioso */ }
  }

  /* ============================================================
   * 8. API PÚBLICA
   * ============================================================ */

  var Audio = {};

  /* ---------- 8.1 Ciclo de vida ---------- */

  Audio.init = function () {
    loadAudioPrefs();
    attachVoicesHook();
    // A chamada inicial de pickVoice() pode falhar silenciosamente;
    // o hook onvoiceschanged resolve quando as vozes carregarem.
    pickVoice();
    // NÃO inicializamos AudioContext aqui (requer gesto do usuário).
    // NÃO iniciamos ambience aqui, mesmo se a preferência estiver ligada —
    // será iniciada no primeiro gesto via playSfx/setAmbience.
    return true;
  };

  /* ---------- 8.2 Voz ---------- */

  /**
   * Lê um texto em voz alta.
   * Se a voz estiver desligada, retorna false sem falar (salvo opts.force).
   *
   * opts (opcional): { rate, pitch, volume, force }
   */
  Audio.speak = function (text, opts) {
    if (!text) return false;
    if (!('speechSynthesis' in window)) return false;
    if (!voiceEnabled && !(opts && opts.force)) return false;

    var str = String(text).trim();
    if (!str) return false;

    try {
      window.speechSynthesis.cancel();
    } catch (e) { /* silencioso */ }

    var utter;
    try {
      utter = new SpeechSynthesisUtterance(str);
    } catch (e) {
      return false;
    }

    utter.lang   = 'pt-BR';
    utter.rate   = (opts && typeof opts.rate   === 'number') ? opts.rate   : 1.0;
    utter.pitch  = (opts && typeof opts.pitch  === 'number') ? opts.pitch  : 1.0;
    utter.volume = (opts && typeof opts.volume === 'number') ? opts.volume : 1.0;

    var v = pickVoice();
    if (v) utter.voice = v;

    try {
      window.speechSynthesis.speak(utter);
      return true;
    } catch (e) {
      return false;
    }
  };

  Audio.stopSpeak = function () {
    if (!('speechSynthesis' in window)) return false;
    try {
      window.speechSynthesis.cancel();
      return true;
    } catch (e) {
      return false;
    }
  };

  Audio.isSpeaking = function () {
    if (!('speechSynthesis' in window)) return false;
    try { return !!window.speechSynthesis.speaking; }
    catch (e) { return false; }
  };

  /* ---------- 8.3 Efeitos sonoros ---------- */

  /**
   * Toca um efeito sonoro.
   * Nomes aceitos: 'success' | 'error' | 'achievement' | 'unlock'
   *              | 'advance' | 'complete' | 'boss'
   */
  Audio.playSfx = function (name) {
    if (!sfxEnabled) return false;
    var notes = TONES[name];
    if (!notes) return false;
    var ctx = ensureContext();
    if (!ctx) return false;
    resumeIfSuspended();
    return playSequence(notes);
  };

  /* ---------- 8.4 Controles ---------- */

  Audio.setVoice = function (enabled) {
    voiceEnabled = !!enabled;
    if (!voiceEnabled) {
      try { window.speechSynthesis.cancel(); } catch (e) { /* silencioso */ }
    }
    persistAudioPrefs();
    return voiceEnabled;
  };

  Audio.setSfx = function (enabled) {
    sfxEnabled = !!enabled;
    persistAudioPrefs();
    return sfxEnabled;
  };

  Audio.setAmbience = function (enabled) {
    ambienceEnabled = !!enabled;
    if (ambienceEnabled) {
      startAmbience();
    } else {
      stopAmbience();
    }
    persistAudioPrefs();
    return ambienceEnabled;
  };

  /* ---------- 8.5 Consultas ---------- */

  Audio.isVoiceOn     = function () { return voiceEnabled; };
  Audio.isSfxOn       = function () { return sfxEnabled; };
  Audio.isAmbienceOn  = function () { return ambienceEnabled; };

  Audio.isSupported = function () {
    var hasSpeech = ('speechSynthesis' in window) &&
                    ('SpeechSynthesisUtterance' in window);
    var hasAudio  = !!(window.AudioContext || window.webkitAudioContext);
    return { speech: hasSpeech, audio: hasAudio };
  };

  /* ---------- 8.6 Retomar contexto após gesto ---------- */

  /**
   * Deve ser chamado por quem recebeu um gesto do usuário (clique/tecla),
   * para desbloquear o AudioContext em navegadores que exigem interação.
   * É idempotente.
   */
  Audio.unlock = function () {
    var ctx = ensureContext();
    if (!ctx) return false;
    resumeIfSuspended();
    if (ambienceEnabled && !ambienceNodes) {
      startAmbience();
    }
    return true;
  };

  /* ============================================================
   * 9. EXPORTAÇÃO
   * ============================================================ */

  window.Audio = Audio;

})();
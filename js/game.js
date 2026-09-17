/**
 * game.js
 * Desafio do Cafezal — Manejo de Cafezais em Produção
 *
 * Responsável por: estado do jogo, AURA, XP, nível, conquistas,
 * progresso, respostas, salvamento, carregamento e reset.
 *
 * Depende de (carregado antes, via defer):
 *   missions.js → window.MISSIONS, window.BOSS, window.ACHIEVEMENTS
 *
 * Não toca no DOM. Não renderiza telas. Apenas expõe a API pública
 * window.Game, consumida por app.js / audio.js / accessibility.js.
 *
 * Autor do projeto: Dirceu Nogueira de Sales Duarte Junior
 * Apoio: Inteligência Artificial generativa (ferramenta de apoio)
 */

(function () {
  'use strict';

  /* ============================================================
   * 1. CONSTANTES
   * ============================================================ */

  var STORAGE_KEY = 'cafezal:state';
  var STATE_VERSION = '1.0.1';
  var MAX_MISSION_ID = 10;
  var GLOSSARY_THRESHOLD = 5;
  var CONTENT_THEME_THRESHOLD = 3;

  var LEVELS = [
    { level: 1, min: 0,     label: 'Iniciante' },
    { level: 2, min: 1000,  label: 'Aprendiz' },
    { level: 3, min: 2500,  label: 'Praticante' },
    { level: 4, min: 4500,  label: 'Experiente' },
    { level: 5, min: 7000,  label: 'Mestre' },
    { level: 6, min: 10000, label: 'Lenda do Cafezal' }
  ];

  /* ============================================================
   * 2. ESTADO PRIVADO
   * ============================================================ */

  var state = null;

  /* ============================================================
   * 3. HELPERS INTERNOS
   * ============================================================ */

  function defaultState() {
    return {
      version: STATE_VERSION,
      currentMissionId: 1,
      completedMissions: [],
      aura: 0,
      xp: 0,
      level: 1,
      achievements: [],
      bossCompleted: false,
      bossScore: 0,
      answers: {},
      glossaryTermsOpened: [],
      contentThemesOpened: [],
      startedAt: null,
      lastSavedAt: null
    };
  }

  function isArray(a) {
    return Object.prototype.toString.call(a) === '[object Array]';
  }

  function isPlainObject(o) {
    return !!o && typeof o === 'object' && !isArray(o);
  }

  function safeNumber(n, fallback, min) {
    if (typeof n !== 'number' || !isFinite(n)) return fallback;
    if (typeof min === 'number' && n < min) return min;
    return n;
  }

  function ensureState() {
    if (!state) state = defaultState();
    return state;
  }

  function findMissionById(id) {
    if (!window.MISSIONS) return null;
    for (var i = 0; i < window.MISSIONS.length; i++) {
      if (window.MISSIONS[i].id === id) return window.MISSIONS[i];
    }
    return null;
  }

  function findAchievementById(id) {
    if (!window.ACHIEVEMENTS) return null;
    for (var i = 0; i < window.ACHIEVEMENTS.length; i++) {
      if (window.ACHIEVEMENTS[i].id === id) return window.ACHIEVEMENTS[i];
    }
    return null;
  }

  function levelForXp(xp) {
    var info = LEVELS[0];
    for (var i = 0; i < LEVELS.length; i++) {
      if (xp >= LEVELS[i].min) info = LEVELS[i];
    }
    return info;
  }

  function recalcLevel() {
    if (!state) return;
    state.level = levelForXp(state.xp).level;
  }

  function dedupeStringArray(arr) {
    if (!isArray(arr)) return [];
    var seen = {};
    return arr.filter(function (s) {
      if (typeof s !== 'string' || !s) return false;
      if (seen[s]) return false;
      seen[s] = true;
      return true;
    });
  }

  /* ============================================================
   * 4. SANITIZAÇÃO / MIGRAÇÃO DE ESTADO CARREGADO
   * ============================================================ */

  function sanitize(raw) {
    var base = defaultState();

    if (!isPlainObject(raw)) return base;

    if (isArray(raw.completedMissions)) {
      var seenM = {};
      base.completedMissions = raw.completedMissions.filter(function (n) {
        if (typeof n !== 'number' || n < 1 || n > MAX_MISSION_ID) return false;
        if (seenM[n]) return false;
        seenM[n] = true;
        return true;
      }).sort(function (a, b) { return a - b; });
    }

    base.achievements = dedupeStringArray(raw.achievements);

    if (isPlainObject(raw.answers)) {
      base.answers = {};
      Object.keys(raw.answers).forEach(function (k) {
        var v = raw.answers[k];
        if (typeof v === 'number' && v >= 0 && v <= 3) {
          base.answers[String(k)] = v;
        }
      });
    }

    base.glossaryTermsOpened = dedupeStringArray(raw.glossaryTermsOpened);
    base.contentThemesOpened = dedupeStringArray(raw.contentThemesOpened);

    var curr = safeNumber(raw.currentMissionId, 1, 1);
    if (curr > MAX_MISSION_ID + 1) curr = MAX_MISSION_ID + 1;
    base.currentMissionId = curr;

    if (base.completedMissions.length >= MAX_MISSION_ID && base.currentMissionId <= MAX_MISSION_ID) {
      base.currentMissionId = MAX_MISSION_ID + 1;
    }

    base.aura = safeNumber(raw.aura, 0, 0);
    base.xp = safeNumber(raw.xp, 0, 0);
    base.level = levelForXp(base.xp).level;
    base.bossCompleted = !!raw.bossCompleted;
    base.bossScore = safeNumber(raw.bossScore, 0, 0);
    base.startedAt = typeof raw.startedAt === 'number' ? raw.startedAt : null;
    base.lastSavedAt = typeof raw.lastSavedAt === 'number' ? raw.lastSavedAt : null;

    base.version = STATE_VERSION;

    return base;
  }

  /* ============================================================
   * 5. CONQUISTAS
   * ============================================================ */

  function hasAchievement(id) {
    return ensureState().achievements.indexOf(id) !== -1;
  }

  function grantAchievement(id) {
    if (!id) return false;
    if (hasAchievement(id)) return false;
    if (!findAchievementById(id)) return false;
    state.achievements.push(id);
    return true;
  }

  /**
   * Verifica conquistas de marco. Retorna array em ordem de prioridade
   * decrescente (guardiao-do-cafezal > mestre-do-talhao > aura-maxima).
   */
  function checkMilestoneAchievements(missionId) {
    var unlocked = [];

    if (missionId >= MAX_MISSION_ID && !hasAchievement('guardiao-do-cafezal')) {
      var allIds = [1,2,3,4,5,6,7,8,9,10];
      var okAll = allIds.every(function (id) {
        return state.completedMissions.indexOf(id) !== -1;
      });
      if (okAll && grantAchievement('guardiao-do-cafezal')) {
        unlocked.push('guardiao-do-cafezal');
      }
    }

    if (missionId >= 5 && !hasAchievement('mestre-do-talhao')) {
      var baseIds = [1,2,3,4,5];
      var okBase = baseIds.every(function (id) {
        return state.completedMissions.indexOf(id) !== -1;
      });
      if (okBase && grantAchievement('mestre-do-talhao')) {
        unlocked.push('mestre-do-talhao');
      }
    }

    if (state.aura >= 100 && !hasAchievement('aura-maxima')) {
      if (grantAchievement('aura-maxima')) unlocked.push('aura-maxima');
    }

    return unlocked;
  }

  /* ============================================================
   * 6. API PÚBLICA
   * ============================================================ */

  var Game = {};

  /* ---------- 6.1 Ciclo de vida ---------- */

  Game.init = function () {
    var loaded = Game.load();
    if (!loaded) state = defaultState();
    recalcLevel();
    return loaded;
  };

  Game.load = function () {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        state = defaultState();
        return false;
      }
      var parsed = JSON.parse(raw);
      state = sanitize(parsed);
      return true;
    } catch (e) {
      state = defaultState();
      return false;
    }
  };

  Game.save = function () {
    ensureState();
    if (!state.startedAt && (state.aura > 0 || state.xp > 0 || state.completedMissions.length > 0)) {
      state.startedAt = Date.now();
    }
    state.lastSavedAt = Date.now();
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      return false;
    }
  };

  Game.reset = function () {
    state = defaultState();
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (e) { /* silencioso */ }
    return true;
  };

  /* ---------- 6.2 Leitura ---------- */

  Game.getState = function () {
    ensureState();
    return JSON.parse(JSON.stringify(state));
  };

  /* ---------- 6.3 Progressão ---------- */

  Game.completeMission = function (missionId, optionIndex) {
    ensureState();

    var mission = findMissionById(missionId);
    if (!mission) return null;

    if (typeof optionIndex !== 'number' ||
        optionIndex < 0 ||
        optionIndex >= mission.options.length) {
      return null;
    }

    if (state.completedMissions.indexOf(missionId) !== -1) {
      return {
        correct: true,
        alreadyCompleted: true,
        reward: null,
        achievement: null
      };
    }

    var option = mission.options[optionIndex];
    var isCorrect = !!(option && option.correct);

    if (!isCorrect) {
      return {
        correct: false,
        alreadyCompleted: false,
        reward: null,
        achievement: null
      };
    }

    state.completedMissions.push(missionId);
    state.completedMissions.sort(function (a, b) { return a - b; });
    state.answers[String(missionId)] = optionIndex;

    if (missionId === state.currentMissionId) {
      state.currentMissionId = missionId + 1;
    }

    var reward = mission.reward || { aura: 0, xp: 0 };
    state.aura += reward.aura;
    state.xp += reward.xp;
    recalcLevel();

    var unlocked = null;

    if (mission.achievement && grantAchievement(mission.achievement)) {
      unlocked = mission.achievement;
    }

    var milestones = checkMilestoneAchievements(missionId);
    if (!unlocked && milestones.length > 0) {
      unlocked = milestones[0];
    }

    if (!unlocked && !hasAchievement('perfeccionista')) {
      if (grantAchievement('perfeccionista')) unlocked = 'perfeccionista';
    }

    Game.save();

    return {
      correct: true,
      alreadyCompleted: false,
      reward: { aura: reward.aura, xp: reward.xp },
      achievement: unlocked
    };
  };

  Game.setBossResult = function (score) {
    ensureState();

    var safeScore = safeNumber(score, 0, 0);

    if (state.bossCompleted) {
      return {
        achievement: null,
        reward: null,
        alreadyCompleted: true
      };
    }

    state.bossCompleted = true;
    state.bossScore = safeScore;

    var finalReward = (window.BOSS && window.BOSS.finalReward) || { aura: 0, xp: 0 };
    state.aura += finalReward.aura;
    state.xp += finalReward.xp;
    recalcLevel();

    var unlocked = null;

    if (window.BOSS && window.BOSS.achievement) {
      if (grantAchievement(window.BOSS.achievement)) unlocked = window.BOSS.achievement;
    }

    if (!unlocked && state.aura >= 100 && !hasAchievement('aura-maxima')) {
      if (grantAchievement('aura-maxima')) unlocked = 'aura-maxima';
    }

    Game.save();

    return {
      achievement: unlocked,
      reward: { aura: finalReward.aura, xp: finalReward.xp },
      alreadyCompleted: false
    };
  };

  /* ---------- 6.3b Exploração (glossário / conteúdos) ---------- */

  /**
   * Marca um termo do glossário como aberto.
   * Retorna { alreadyOpened, unlocked, count }.
   * Desbloqueia 'curioso' após GLOSSARY_THRESHOLD termos ÚNICOS.
   */
  Game.markGlossaryTermOpened = function (termId) {
    ensureState();

    if (!termId || typeof termId !== 'string') {
      return {
        alreadyOpened: false,
        unlocked: false,
        count: state.glossaryTermsOpened.length
      };
    }

    if (!isArray(state.glossaryTermsOpened)) state.glossaryTermsOpened = [];

    if (state.glossaryTermsOpened.indexOf(termId) !== -1) {
      return {
        alreadyOpened: true,
        unlocked: false,
        count: state.glossaryTermsOpened.length
      };
    }

    state.glossaryTermsOpened.push(termId);

    var unlocked = false;
    if (state.glossaryTermsOpened.length >= GLOSSARY_THRESHOLD &&
        !hasAchievement('curioso')) {
      if (grantAchievement('curioso')) unlocked = true;
    }

    Game.save();

    return {
      alreadyOpened: false,
      unlocked: unlocked,
      count: state.glossaryTermsOpened.length
    };
  };

  /**
   * Marca um tema de conteúdos como aberto.
   * Retorna { alreadyOpened, unlocked, count }.
   * Desbloqueia 'estudioso' após CONTENT_THEME_THRESHOLD temas ÚNICOS.
   */
  Game.markContentThemeOpened = function (themeId) {
    ensureState();

    if (!themeId || typeof themeId !== 'string') {
      return {
        alreadyOpened: false,
        unlocked: false,
        count: state.contentThemesOpened.length
      };
    }

    if (!isArray(state.contentThemesOpened)) state.contentThemesOpened = [];

    if (state.contentThemesOpened.indexOf(themeId) !== -1) {
      return {
        alreadyOpened: true,
        unlocked: false,
        count: state.contentThemesOpened.length
      };
    }

    state.contentThemesOpened.push(themeId);

    var unlocked = false;
    if (state.contentThemesOpened.length >= CONTENT_THEME_THRESHOLD &&
        !hasAchievement('estudioso')) {
      if (grantAchievement('estudioso')) unlocked = true;
    }

    Game.save();

    return {
      alreadyOpened: false,
      unlocked: unlocked,
      count: state.contentThemesOpened.length
    };
  };

  /* ---------- 6.4 Ajustes pontuais ---------- */

  Game.addAura = function (n) {
    ensureState();
    if (typeof n !== 'number' || !isFinite(n)) return;
    state.aura = Math.max(0, state.aura + n);
    if (state.aura >= 100) grantAchievement('aura-maxima');
    Game.save();
  };

  Game.addXp = function (n) {
    ensureState();
    if (typeof n !== 'number' || !isFinite(n)) return;
    state.xp = Math.max(0, state.xp + n);
    recalcLevel();
    Game.save();
  };

  Game.unlockAchievement = function (id) {
    ensureState();
    if (!id) return false;
    if (grantAchievement(id)) {
      Game.save();
      return true;
    }
    return false;
  };

  /* ---------- 6.5 Consultas ---------- */

  Game.isMissionUnlocked = function (missionId) {
    ensureState();
    if (typeof missionId !== 'number') return false;
    if (missionId < 1 || missionId > MAX_MISSION_ID) return false;
    if (state.completedMissions.indexOf(missionId) !== -1) return true;
    return missionId <= state.currentMissionId;
  };

  Game.isMissionCompleted = function (missionId) {
    ensureState();
    return state.completedMissions.indexOf(missionId) !== -1;
  };

  Game.isBossUnlocked = function () {
    ensureState();
    return state.completedMissions.length >= MAX_MISSION_ID;
  };

  Game.isBossCompleted = function () {
    ensureState();
    return !!state.bossCompleted;
  };

  Game.getProgressPercent = function () {
    ensureState();
    return Math.round((state.completedMissions.length / MAX_MISSION_ID) * 100);
  };

  Game.getLevelFromXp = function (xp) {
    return levelForXp(safeNumber(xp, 0, 0));
  };

  Game.getLevelTable = function () {
    return JSON.parse(JSON.stringify(LEVELS));
  };

  Game.getStorageKey = function () {
    return STORAGE_KEY;
  };

  Game.getVersion = function () {
    return STATE_VERSION;
  };

  /* ============================================================
   * 7. EXPORTAÇÃO
   * ============================================================ */

  window.Game = Game;

})();
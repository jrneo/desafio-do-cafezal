/**
 * app.js
 * Desafio do Cafezal — Manejo de Cafezais em Produção
 *
 * Responsável por: navegação, renderização das telas, montagem da
 * interface e interação entre os módulos.
 *
 * Depende de (carregados antes, via defer):
 *   missions.js  →  window.MISSIONS, window.BOSS, window.GLOSSARY,
 *                   window.ACHIEVEMENTS, window.CONTENT_THEMES
 *   game.js      →  window.Game
 *   audio.js     →  window.Audio
 *   accessibility.js → window.A11y
 *
 * Autor do projeto: Dirceu Nogueira de Sales Duarte Junior
 * Apoio: Inteligência Artificial generativa (ferramenta de apoio)
 */

(function () {
  'use strict';

  /* ============================================================
   * 1. CONSTANTES
   * ============================================================ */

  var SCREENS = {
    HOME: 'home',
    MAP: 'map',
    MISSION: 'mission',
    BOSS: 'boss',
    CONTENTS: 'contents',
    GLOSSARY: 'glossary',
    ACHIEVEMENTS: 'achievements',
    ABOUT: 'about',
    TRANSPARENCY: 'transparency',
    FINAL: 'final'
  };

  var PHASE = {
    INTRO: 'intro',
    QUESTION: 'question',
    FEEDBACK: 'feedback',
    RESULT: 'result'
  };

  var LEVELS = [
    { level: 1, min: 0,     label: 'Iniciante' },
    { level: 2, min: 1000,  label: 'Aprendiz' },
    { level: 3, min: 2500,  label: 'Praticante' },
    { level: 4, min: 4500,  label: 'Experiente' },
    { level: 5, min: 7000,  label: 'Mestre' },
    { level: 6, min: 10000, label: 'Lenda do Cafezal' }
  ];

  var STATUS_META = {
    locked:    { icon: '🔒', label: 'Bloqueada',   disabled: true  },
    available: { icon: '▶️', label: 'Disponível',  disabled: false },
    current:   { icon: '🔥', label: 'Missão atual', disabled: false },
    completed: { icon: '✅', label: 'Concluída',   disabled: false }
  };

  /* ============================================================
   * 2. ESTADO INTERNO DA UI
   * ============================================================ */

  var ui = {
    currentScreen: null,
    mission: {
      id: null,
      phase: PHASE.INTRO,
      selectedOption: null,
      wasCorrect: false,
      reward: null
    },
    boss: {
      phase: PHASE.INTRO,
      decisionIndex: 0,
      selectedOption: null,
      wasCorrect: false,
      correctCount: 0
    },
    a11yReturnFocus: null
  };

  var screenRoot = null;

  /* ============================================================
   * 3. HELPERS DE DOM
   * ============================================================ */

  function qs(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }

  function qsa(sel, ctx) {
    return Array.prototype.slice.call(
      (ctx || document).querySelectorAll(sel)
    );
  }

  function appendChildren(parent, children) {
    if (children == null || children === false) return;
    var list = Array.isArray(children) ? children : [children];
    list.forEach(function (child) {
      if (child == null || child === false) return;
      if (Array.isArray(child)) {
        appendChildren(parent, child);
      } else if (child instanceof Node) {
        parent.appendChild(child);
      } else {
        parent.appendChild(document.createTextNode(String(child)));
      }
    });
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        var val = attrs[key];
        if (val == null || val === false) return;
        if (key === 'class') node.className = val;
        else if (key === 'text') node.textContent = val;
        else if (key === 'dataset') {
          Object.keys(val).forEach(function (d) { node.dataset[d] = val[d]; });
        } else {
          node.setAttribute(key, val);
        }
      });
    }
    appendChildren(node, children);
    return node;
  }

  function clearNode(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function buttonEl(icon, label, action, variant, extraAttrs) {
    var attrs = {
      type: 'button',
      class: 'btn btn-' + (variant || 'secondary'),
      'data-action': action
    };
    if (extraAttrs) {
      Object.keys(extraAttrs).forEach(function (k) { attrs[k] = extraAttrs[k]; });
    }
    return el('button', attrs, [
      icon ? el('span', { class: 'btn-icon', 'aria-hidden': 'true', text: icon }) : null,
      el('span', { class: 'btn-label', text: label })
    ]);
  }

  /**
   * Avatar do Seu Zé do Café — usado na intro de missões e do boss.
   */
  function characterAvatarEl() {
    return el('div', { class: 'character-avatar', 'aria-hidden': 'true' }, [
      el('img', {
        src: 'assets/images/seu-ze.svg',
        alt: '',
        width: '64',
        height: '64'
      })
    ]);
  }

  /* ============================================================
   * 4. ACESSO SEGURO AOS MÓDULOS
   * ============================================================ */

  function getGame()  { return window.Game  || null; }
  function getAudio() { return window.Audio || null; }
  function getA11y()  { return window.A11y  || null; }

  function getState() {
    var G = getGame();
    if (G && typeof G.getState === 'function') {
      try { return G.getState(); } catch (e) { /* fallback */ }
    }
    return {
      currentMissionId: 1,
      completedMissions: [],
      aura: 0,
      xp: 0,
      level: 1,
      achievements: [],
      bossCompleted: false,
      bossScore: 0,
      answers: {}
    };
  }

  function findMission(id) {
    if (!window.MISSIONS) return null;
    for (var i = 0; i < window.MISSIONS.length; i++) {
      if (window.MISSIONS[i].id === id) return window.MISSIONS[i];
    }
    return null;
  }

  function findAchievement(id) {
    if (!window.ACHIEVEMENTS) return null;
    for (var i = 0; i < window.ACHIEVEMENTS.length; i++) {
      if (window.ACHIEVEMENTS[i].id === id) return window.ACHIEVEMENTS[i];
    }
    return null;
  }

  function getLevelInfo(xp) {
    var info = LEVELS[0];
    for (var i = 0; i < LEVELS.length; i++) {
      if (xp >= LEVELS[i].min) info = LEVELS[i];
    }
    return info;
  }

  /* ============================================================
   * 5. HUD, ANÚNCIOS E TOASTS
   * ============================================================ */

  function updateHUD() {
    var state = getState();
    var auraEl  = qs('#hud-aura');
    var xpEl    = qs('#hud-xp');
    var levelEl = qs('#hud-level');
    var info = getLevelInfo(state.xp);

    if (auraEl)  auraEl.textContent  = String(state.aura);
    if (xpEl)    xpEl.textContent    = String(state.xp);
    if (levelEl) {
      levelEl.textContent = String(info.level);
      levelEl.setAttribute('title', info.label);
    }
  }

  function announce(text, priority) {
    if (!text) return;
    var region = qs(priority === 'assertive' ? '#alert-region' : '#live-region');
    if (!region) return;
    clearNode(region);
    window.setTimeout(function () {
      region.textContent = text;
    }, 60);
  }

  function showToast(text, type) {
    var region = qs('#toast-region');
    if (!region) return;
    var toast = el('div', {
      class: 'toast toast-' + (type || 'info'),
      role: 'status'
    }, [
      el('span', { class: 'toast-text', text: text })
    ]);
    region.appendChild(toast);
    window.setTimeout(function () {
      toast.classList.add('toast-out');
      window.setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 400);
    }, 3200);
  }

  function speak(text) {
    if (!text) return;
    var A = getAudio();
    if (A && typeof A.speak === 'function') {
      try { A.speak(text); } catch (e) { /* silencioso */ }
    }
  }

  function playSfx(name) {
    var A = getAudio();
    if (A && typeof A.playSfx === 'function') {
      try { A.playSfx(name); } catch (e) { /* silencioso */ }
    }
  }

  /**
   * Anúncio centralizado de conquista desbloqueada.
   * Usado por missões, boss, glossário e conteúdos.
   */
  function handleAchievementUnlock(achievementId) {
    if (!achievementId) return;
    var ach = findAchievement(achievementId);
    if (!ach) return;
    window.setTimeout(function () {
      showToast('🏆 Conquista: ' + ach.name, 'achievement');
      announce('Conquista desbloqueada: ' + ach.name, 'assertive');
      speak('Conquista desbloqueada: ' + ach.name);
      playSfx('achievement');
    }, 500);
  }

  /* ============================================================
   * 6. MONTAGEM E FOCO
   * ============================================================ */

  function mountScreen(section) {
    if (!screenRoot) return;
    clearNode(screenRoot);
    screenRoot.appendChild(section);
    focusScreen();
  }

  function focusScreen() {
    if (!screenRoot) return;
    var heading = qs('h1, h2', screenRoot);
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      try { heading.focus({ preventScroll: false }); }
      catch (e) { heading.focus(); }
    } else {
      screenRoot.focus();
    }
  }

  /* ============================================================
   * 7. NAVEGAÇÃO
   * ============================================================ */

  function navigate(screen) {
    ui.currentScreen = screen;
    switch (screen) {
      case SCREENS.HOME:         renderHome();         break;
      case SCREENS.MAP:          renderMap();          break;
      case SCREENS.CONTENTS:     renderContents();     break;
      case SCREENS.GLOSSARY:     renderGlossary();     break;
      case SCREENS.ACHIEVEMENTS: renderAchievements(); break;
      case SCREENS.ABOUT:        renderAbout();        break;
      case SCREENS.TRANSPARENCY: renderTransparency(); break;
      case SCREENS.FINAL:        renderFinal();        break;
      default:
        renderHome();
    }
  }

  /* ============================================================
   * 8. TELA: HOME
   * ============================================================ */

  function renderHome() {
    var state = getState();
    var hasProgress = state.completedMissions.length > 0 ||
                      state.aura > 0 ||
                      state.xp > 0;

    var mainActions = [];
    if (hasProgress) {
      mainActions.push(buttonEl('▶️', 'Continuar Jornada', 'continue-journey', 'primary'));
    } else {
      mainActions.push(buttonEl('▶️', 'Começar Jornada', 'start-journey', 'primary'));
    }

    var navActions = [
      buttonEl('🗺️', 'Mapa da Jornada', 'go-map', 'secondary'),
      buttonEl('📖', 'Conteúdos', 'go-contents', 'secondary'),
      buttonEl('📚', 'Glossário', 'go-glossary', 'secondary'),
      buttonEl('🏆', 'Conquistas', 'go-achievements', 'secondary'),
      buttonEl('♿', 'Acessibilidade', 'open-a11y', 'secondary'),
      buttonEl('ℹ️', 'Sobre o LDI', 'go-about', 'secondary')
    ];

    var section = el('section', {
      class: 'screen screen-home',
      'data-screen': SCREENS.HOME,
      'aria-labelledby': 'home-title'
    }, [
      el('div', { class: 'home-hero' }, [
        el('p', { class: 'home-kicker', text: '☕ Livro Digital Interativo' }),
        el('h1', { id: 'home-title', class: 'home-title', text: 'Desafio do Cafezal' }),
        el('p', { class: 'home-subtitle', text: 'Manejo de Cafezais em Produção' }),
        el('p', { class: 'home-tagline', text: 'Manejar. Decidir. Farmar Aura.' })
      ]),
      el('div', { class: 'home-intro' }, [
        el('p', {
          text: 'Você vai entrar em uma jornada por um cafezal em produção. ' +
                'Cada missão é uma decisão real de manejo, baseada no Manual do ' +
                'Café da EMATER-MG. Escolha com atenção — cada decisão conta.'
        })
      ]),
      el('nav', {
        class: 'home-actions home-actions-primary',
        'aria-label': 'Ações principais'
      }, mainActions),
      el('nav', {
        class: 'home-actions home-actions-secondary',
        'aria-label': 'Explorar conteúdo'
      }, navActions)
    ]);

    mountScreen(section);
  }

  /* ============================================================
   * 9. TELA: MAPA
   * ============================================================ */

  function getMissionStatus(id) {
    var state = getState();
    if (state.completedMissions.indexOf(id) !== -1) return 'completed';
    if (id === state.currentMissionId) return 'current';
    if (id < state.currentMissionId) return 'available';
    return 'locked';
  }

  function getBossStatus() {
    var state = getState();
    if (state.bossCompleted) return 'completed';
    if (state.completedMissions.length >= 10 ||
        state.currentMissionId > 10) return 'available';
    return 'locked';
  }

  function renderMissionCard(mission, status) {
    var meta = STATUS_META[status] || STATUS_META.locked;
    var inner = [
      el('div', { class: 'mission-card-icon', 'aria-hidden': 'true', text: mission.icon }),
      el('div', { class: 'mission-card-body' }, [
        el('p', { class: 'mission-card-number', text: 'Missão ' + mission.id }),
        el('h2', { class: 'mission-card-title', text: mission.title }),
        el('p', { class: 'mission-card-category', text: mission.category }),
        el('p', { class: 'mission-card-status' }, [
          el('span', { 'aria-hidden': 'true', text: meta.icon + ' ' }),
          el('span', { text: meta.label })
        ])
      ])
    ];

    var card;
    if (meta.disabled) {
      card = el('div', {
        class: 'mission-card mission-card-' + status,
        'aria-disabled': 'true'
      }, inner);
    } else {
      card = el('button', {
        type: 'button',
        class: 'mission-card mission-card-' + status,
        'data-action': 'open-mission',
        'data-mission-id': String(mission.id),
        'aria-label': 'Missão ' + mission.id + ': ' + mission.title + '. ' + meta.label
      }, inner);
    }

    return el('li', { class: 'mission-list-item' }, card);
  }

  function renderBossCard(status) {
    var meta = STATUS_META[status] || STATUS_META.locked;
    var inner = [
      el('div', { class: 'mission-card-icon', 'aria-hidden': 'true', text: '👑' }),
      el('div', { class: 'mission-card-body' }, [
        el('p', { class: 'mission-card-number', text: 'Boss Final' }),
        el('h2', { class: 'mission-card-title', text: 'Dia na Fazenda' }),
        el('p', { class: 'mission-card-category', text: 'Desafio integrador' }),
        el('p', { class: 'mission-card-status' }, [
          el('span', { 'aria-hidden': 'true', text: meta.icon + ' ' }),
          el('span', { text: meta.label })
        ])
      ])
    ];

    var card;
    if (meta.disabled) {
      card = el('div', {
        class: 'mission-card mission-card-boss mission-card-' + status,
        'aria-disabled': 'true'
      }, inner);
    } else {
      card = el('button', {
        type: 'button',
        class: 'mission-card mission-card-boss mission-card-' + status,
        'data-action': 'open-boss',
        'aria-label': 'Boss Final: Dia na Fazenda. ' + meta.label
      }, inner);
    }

    return el('li', { class: 'mission-list-item' }, card);
  }

  function renderMap() {
    var state = getState();
    var completedCount = state.completedMissions.length;
    var progressPct = Math.min(100, Math.round((completedCount / 10) * 100));

    var items = [];
    (window.MISSIONS || []).forEach(function (m) {
      items.push(renderMissionCard(m, getMissionStatus(m.id)));
    });
    items.push(renderBossCard(getBossStatus()));

    var section = el('section', {
      class: 'screen screen-map',
      'data-screen': SCREENS.MAP,
      'aria-labelledby': 'map-title'
    }, [
      el('header', { class: 'screen-header' }, [
        el('h1', { id: 'map-title', text: '🗺️ Mapa da Jornada' }),
        el('p', {
          class: 'screen-subtitle',
          text: 'Suas missões pelo cafezal em produção'
        })
      ]),
      el('div', {
        class: 'progress-bar',
        role: 'progressbar',
        'aria-valuemin': '0',
        'aria-valuemax': '10',
        'aria-valuenow': String(completedCount),
        'aria-label': 'Progresso da jornada: ' + completedCount + ' de 10 missões concluídas'
      }, [
        el('div', { class: 'progress-fill', style: 'width: ' + progressPct + '%' }),
        el('span', { class: 'progress-label', text: completedCount + '/10' })
      ]),
      el('ol', { class: 'mission-list', 'aria-label': 'Missões da jornada' }, items),
      el('div', { class: 'screen-actions' }, [
        buttonEl('🏠', 'Início', 'go-home', 'secondary')
      ])
    ]);

    mountScreen(section);
  }

  /* ============================================================
   * 10. TELA: MISSÃO
   * ============================================================ */

  function renderMission(id) {
    var mission = findMission(id);
    if (!mission) {
      renderNotFound('Missão não encontrada.');
      return;
    }

    var state = getState();
    var alreadyCompleted = state.completedMissions.indexOf(id) !== -1;
    var prevAnswer = state.answers ? state.answers[id] : undefined;

    ui.mission.id = id;
    ui.mission.reward = null;

    if (alreadyCompleted && typeof prevAnswer === 'number') {
      ui.mission.phase = PHASE.FEEDBACK;
      ui.mission.selectedOption = prevAnswer;
      ui.mission.wasCorrect = !!mission.options[prevAnswer].correct;
      renderMissionFeedback(mission);
    } else {
      ui.mission.phase = PHASE.INTRO;
      ui.mission.selectedOption = null;
      ui.mission.wasCorrect = false;
      renderMissionIntro(mission);
    }
  }

  function renderMissionHeader(mission, phaseLabel) {
    return el('header', { class: 'mission-header' }, [
      el('p', { class: 'mission-header-meta' }, [
        el('span', { class: 'mission-header-number', text: 'Missão ' + mission.id }),
        el('span', { class: 'mission-header-sep', text: ' • ', 'aria-hidden': 'true' }),
        el('span', { class: 'mission-header-phase', text: phaseLabel })
      ]),
      el('h1', { class: 'mission-header-title' }, [
        el('span', { class: 'mission-header-icon', 'aria-hidden': 'true', text: mission.icon + ' ' }),
        el('span', { text: mission.title })
      ]),
      el('p', { class: 'mission-header-category', text: mission.category })
    ]);
  }

  function renderMissionIntro(mission) {
    var section = el('section', {
      class: 'screen screen-mission screen-mission-intro',
      'data-screen': SCREENS.MISSION
    }, [
      renderMissionHeader(mission, 'Introdução'),
      el('div', { class: 'character-card' }, [
        characterAvatarEl(),
        el('div', { class: 'character-info' }, [
          el('p', { class: 'character-name', text: 'Seu Zé do Café' }),
          el('p', { class: 'character-line', text: mission.characterIntro })
        ])
      ]),
      el('div', { class: 'screen-actions' }, [
        buttonEl('▶️', 'Começar missão', 'mission-start', 'primary'),
        buttonEl('🗺️', 'Voltar ao mapa', 'go-map', 'secondary')
      ])
    ]);

    mountScreen(section);
    speak(mission.characterIntro);
  }

  function renderMissionQuestion(mission) {
    var optionEls = mission.options.map(function (opt, i) {
      return el('li', { class: 'option-item' }, [
        el('button', {
          type: 'button',
          class: 'option-btn',
          'data-action': 'mission-answer',
          'data-option-index': String(i)
        }, [
          el('span', { class: 'option-letter', 'aria-hidden': 'true', text: String.fromCharCode(65 + i) + '.' }),
          el('span', { class: 'option-text', text: opt.text })
        ])
      ]);
    });

    var section = el('section', {
      class: 'screen screen-mission screen-mission-question',
      'data-screen': SCREENS.MISSION
    }, [
      renderMissionHeader(mission, 'Desafio'),
      el('div', { class: 'question-card' }, [
        el('h2', { class: 'question-text', text: mission.question }),
        el('ul', { class: 'option-list', 'aria-label': 'Alternativas' }, optionEls)
      ]),
      el('div', { class: 'screen-actions' }, [
        buttonEl('🗺️', 'Voltar ao mapa', 'go-map', 'secondary')
      ])
    ]);

    mountScreen(section);
    speak(mission.question);
  }

  function renderMissionFeedback(mission) {
    var chosenIndex = ui.mission.selectedOption;
    var correctIndex = 0;
    for (var i = 0; i < mission.options.length; i++) {
      if (mission.options[i].correct) { correctIndex = i; break; }
    }
    var wasCorrect = ui.mission.wasCorrect;
    var chosen = mission.options[chosenIndex];

    var feedbackTitle = wasCorrect
      ? '✅ Boa decisão!'
      : '❌ Essa escolha merece revisão';
    var feedbackClass = wasCorrect ? 'feedback-correct' : 'feedback-incorrect';

    var children = [
      renderMissionHeader(mission, 'Feedback'),
      el('div', { class: 'feedback-card ' + feedbackClass }, [
        el('h2', { class: 'feedback-title', text: feedbackTitle }),
        el('p', { class: 'feedback-text', text: chosen.feedback })
      ])
    ];

    if (!wasCorrect && correctIndex !== chosenIndex) {
      var correctOpt = mission.options[correctIndex];
      children.push(el('div', { class: 'feedback-card feedback-correct' }, [
        el('h3', { class: 'feedback-title feedback-title-sub', text: '💡 A resposta correta era:' }),
        el('p', { class: 'feedback-correct-text', text: correctOpt.text }),
        el('p', { class: 'feedback-text', text: correctOpt.feedback })
      ]));
    }

    if (wasCorrect && ui.mission.reward) {
      children.push(el('div', { class: 'reward-card' }, [
        el('p', { class: 'reward-title', text: '🏆 Recompensa' }),
        el('ul', { class: 'reward-list' }, [
          el('li', { text: '✨ +' + ui.mission.reward.aura + ' AURA' }),
          el('li', { text: '⭐ +' + ui.mission.reward.xp + ' XP' })
        ])
      ]));
    }

    children.push(el('div', { class: 'screen-actions' }, [
      buttonEl('▶️', 'Continuar', 'mission-continue', 'primary'),
      buttonEl('🗺️', 'Voltar ao mapa', 'go-map', 'secondary')
    ]));

    var section = el('section', {
      class: 'screen screen-mission screen-mission-feedback',
      'data-screen': SCREENS.MISSION
    }, children);

    mountScreen(section);

    var voiceLine = wasCorrect ? mission.successVoice : mission.errorVoice;
    speak(voiceLine);
    announce(wasCorrect ? 'Resposta correta.' : 'Resposta incorreta.', 'polite');
  }

  function selectMissionOption(index) {
    var mission = findMission(ui.mission.id);
    if (!mission) return;
    var option = mission.options[index];
    if (!option) return;

    ui.mission.selectedOption = index;
    ui.mission.wasCorrect = !!option.correct;

    var G = getGame();
    if (G && typeof G.completeMission === 'function') {
      try {
        var result = G.completeMission(mission.id, index);
        if (result && result.reward) ui.mission.reward = result.reward;
        if (result && result.achievement) {
          handleAchievementUnlock(result.achievement);
        }
      } catch (e) {
        /* fallback silencioso */
      }
    }

    playSfx(option.correct ? 'success' : 'error');
    updateHUD();
    renderMissionFeedback(mission);
  }

  function continueAfterMission() {
    var state = getState();
    if (state.completedMissions.length >= 10 && !state.bossCompleted) {
      showToast('👑 Boss Final desbloqueado! Volte ao mapa.', 'unlock');
      announce('Boss Final desbloqueado. Volte ao mapa para começar.', 'polite');
    }
    navigate(SCREENS.MAP);
  }

  /* ============================================================
   * 11. TELA: BOSS FINAL
   * ============================================================ */

  function renderBoss() {
    var boss = window.BOSS;
    if (!boss) {
      renderNotFound('Boss Final não encontrado.');
      return;
    }
    var state = getState();
    if (state.bossCompleted) {
      ui.boss.phase = PHASE.RESULT;
      renderFinal();
      return;
    }
    ui.boss.phase = PHASE.INTRO;
    ui.boss.decisionIndex = 0;
    ui.boss.correctCount = 0;
    ui.boss.selectedOption = null;
    ui.boss.wasCorrect = false;
    renderBossIntro();
  }

  function renderBossIntro() {
    var boss = window.BOSS;
    var section = el('section', {
      class: 'screen screen-boss screen-boss-intro',
      'data-screen': SCREENS.BOSS
    }, [
      el('header', { class: 'mission-header mission-header-boss' }, [
        el('p', { class: 'mission-header-meta' }, [
          el('span', { class: 'mission-header-number', text: 'Boss Final' }),
          el('span', { class: 'mission-header-sep', text: ' • ', 'aria-hidden': 'true' }),
          el('span', { class: 'mission-header-phase', text: 'Introdução' })
        ]),
        el('h1', { class: 'mission-header-title' }, [
          el('span', { class: 'mission-header-icon', 'aria-hidden': 'true', text: boss.icon + ' ' }),
          el('span', { text: boss.title })
        ]),
        el('p', { class: 'mission-header-category', text: boss.category })
      ]),
      el('div', { class: 'character-card' }, [
        characterAvatarEl(),
        el('div', { class: 'character-info' }, [
          el('p', { class: 'character-name', text: 'Seu Zé do Café' }),
          el('p', { class: 'character-line', text: boss.characterIntro })
        ])
      ]),
      el('div', { class: 'scenario-card' }, [
        el('p', { class: 'scenario-title', text: '📍 Cenário' }),
        el('p', { class: 'scenario-text', text: boss.scenario })
      ]),
      el('div', { class: 'screen-actions' }, [
        buttonEl('👑', 'Enfrentar o Boss', 'boss-start', 'primary'),
        buttonEl('🗺️', 'Voltar ao mapa', 'go-map', 'secondary')
      ])
    ]);

    mountScreen(section);
    speak(boss.characterIntro);
  }

  function renderBossDecision() {
    var boss = window.BOSS;
    var decision = boss.decisions[ui.boss.decisionIndex];
    if (!decision) {
      ui.boss.phase = PHASE.RESULT;
      renderBossResult();
      return;
    }

    var optionEls = decision.options.map(function (opt, i) {
      return el('li', { class: 'option-item' }, [
        el('button', {
          type: 'button',
          class: 'option-btn',
          'data-action': 'boss-answer',
          'data-option-index': String(i)
        }, [
          el('span', { class: 'option-letter', 'aria-hidden': 'true', text: String.fromCharCode(65 + i) + '.' }),
          el('span', { class: 'option-text', text: opt.text })
        ])
      ]);
    });

    var totalDecisions = boss.decisions.length;
    var currentNum = ui.boss.decisionIndex + 1;

    var section = el('section', {
      class: 'screen screen-boss screen-boss-decision',
      'data-screen': SCREENS.BOSS
    }, [
      el('header', { class: 'mission-header mission-header-boss' }, [
        el('p', { class: 'mission-header-meta' }, [
          el('span', { class: 'mission-header-number', text: 'Decisão ' + currentNum + ' de ' + totalDecisions }),
          el('span', { class: 'mission-header-sep', text: ' • ', 'aria-hidden': 'true' }),
          el('span', { class: 'mission-header-phase', text: 'Boss Final' })
        ]),
        el('h1', { class: 'mission-header-title' }, [
          el('span', { class: 'mission-header-icon', 'aria-hidden': 'true', text: '👑 ' }),
          el('span', { text: boss.title })
        ])
      ]),
      el('div', { class: 'question-card question-card-boss' }, [
        el('h2', { class: 'question-text', text: decision.prompt }),
        el('ul', { class: 'option-list', 'aria-label': 'Alternativas' }, optionEls)
      ])
    ]);

    mountScreen(section);
    speak(decision.prompt);
  }

  function renderBossFeedback() {
    var boss = window.BOSS;
    var decision = boss.decisions[ui.boss.decisionIndex];
    if (!decision) return;

    var chosenIndex = ui.boss.selectedOption;
    var chosen = decision.options[chosenIndex];
    var wasCorrect = ui.boss.wasCorrect;

    var feedbackTitle = wasCorrect
      ? '✅ Boa decisão!'
      : '❌ Essa escolha merece revisão';
    var feedbackClass = wasCorrect ? 'feedback-correct' : 'feedback-incorrect';

    var children = [
      el('header', { class: 'mission-header mission-header-boss' }, [
        el('p', { class: 'mission-header-meta' }, [
          el('span', { class: 'mission-header-number', text: 'Feedback' }),
          el('span', { class: 'mission-header-sep', text: ' • ', 'aria-hidden': 'true' }),
          el('span', { class: 'mission-header-phase', text: 'Boss Final' })
        ]),
        el('h1', { class: 'mission-header-title' }, [
          el('span', { class: 'mission-header-icon', 'aria-hidden': 'true', text: '👑 ' }),
          el('span', { text: boss.title })
        ])
      ]),
      el('div', { class: 'feedback-card ' + feedbackClass }, [
        el('h2', { class: 'feedback-title', text: feedbackTitle }),
        el('p', { class: 'feedback-text', text: chosen.feedback })
      ]),
      el('div', { class: 'screen-actions' }, [
        buttonEl('▶️', 'Continuar', 'boss-continue', 'primary')
      ])
    ];

    var section = el('section', {
      class: 'screen screen-boss screen-boss-feedback',
      'data-screen': SCREENS.BOSS
    }, children);

    mountScreen(section);

    speak(wasCorrect ? 'Boa decisão.' : 'Vamos revisar essa escolha.');
    announce(wasCorrect ? 'Decisão correta.' : 'Decisão incorreta.', 'polite');
  }

  function selectBossOption(index) {
    var boss = window.BOSS;
    var decision = boss.decisions[ui.boss.decisionIndex];
    if (!decision) return;
    var option = decision.options[index];
    if (!option) return;

    ui.boss.selectedOption = index;
    ui.boss.wasCorrect = !!option.correct;
    if (option.correct) ui.boss.correctCount += 1;

    playSfx(option.correct ? 'success' : 'error');
    renderBossFeedback();
  }

  function continueAfterBossDecision() {
    ui.boss.decisionIndex += 1;
    ui.boss.selectedOption = null;
    ui.boss.wasCorrect = false;

    var boss = window.BOSS;
    if (ui.boss.decisionIndex >= boss.decisions.length) {
      ui.boss.phase = PHASE.RESULT;
      renderBossResult();
    } else {
      ui.boss.phase = PHASE.QUESTION;
      renderBossDecision();
    }
  }

  function renderBossResult() {
    var boss = window.BOSS;
    var G = getGame();
    var score = ui.boss.correctCount * (boss.scoring && boss.scoring.perCorrect || 25);

    if (G && typeof G.setBossResult === 'function') {
      try { G.setBossResult(score); } catch (e) { /* silencioso */ }
    }

    var total = boss.decisions.length;
    var correct = ui.boss.correctCount;
    var message;
    if (correct === total) {
      message = 'Perfeito! Você tomou todas as decisões corretas. A Fazenda Boa Esperança está em boas mãos.';
    } else if (correct >= Math.ceil(total / 2)) {
      message = 'Bom trabalho! A maioria das decisões foi acertada. Revisar os conteúdos vai te deixar ainda mais afiado.';
    } else {
      message = 'Você terminou o desafio, mas algumas decisões pedem revisão. Volte aos conteúdos e tente de novo quando quiser.';
    }

    playSfx('complete');
    speak('Boss Final concluído. ' + message);

    var state = getState();

    var section = el('section', {
      class: 'screen screen-final screen-boss-result',
      'data-screen': SCREENS.FINAL,
      'aria-labelledby': 'final-title'
    }, [
      el('header', { class: 'screen-header screen-header-final' }, [
        el('h1', { id: 'final-title', text: '👑 Boss Final concluído' }),
        el('p', { class: 'screen-subtitle', text: boss.title })
      ]),
      el('div', { class: 'final-summary' }, [
        el('p', { class: 'final-message', text: message })
      ]),
      el('div', { class: 'final-stats' }, [
        statCard('🎯', 'Acertos', correct + '/' + total),
        statCard('✨', 'AURA total', String(state.aura)),
        statCard('⭐', 'XP total', String(state.xp)),
        statCard('🏅', 'Nível', String(getLevelInfo(state.xp).level))
      ]),
      el('div', { class: 'screen-actions screen-actions-stack' }, [
        buttonEl('📖', 'Revisar conteúdos', 'go-contents', 'primary'),
        buttonEl('🏆', 'Ver conquistas', 'go-achievements', 'secondary'),
        buttonEl('🗺️', 'Voltar ao mapa', 'go-map', 'secondary'),
        buttonEl('🏠', 'Início', 'go-home', 'secondary')
      ])
    ]);

    mountScreen(section);
    updateHUD();
  }

  function statCard(icon, label, value) {
    return el('div', { class: 'stat-card' }, [
      el('span', { class: 'stat-icon', 'aria-hidden': 'true', text: icon }),
      el('span', { class: 'stat-label', text: label }),
      el('span', { class: 'stat-value', text: value })
    ]);
  }

  /* ============================================================
   * 12. TELA: CONTEÚDOS
   * ============================================================ */

  function renderContents() {
    var themes = window.CONTENT_THEMES || [];

    var cards = themes.map(function (theme) {
      var details = el('details', { class: 'content-card' }, [
        el('summary', { class: 'content-card-summary' }, [
          el('span', { class: 'content-card-icon', 'aria-hidden': 'true', text: theme.icon + ' ' }),
          el('span', { class: 'content-card-title', text: theme.title }),
          el('span', { class: 'content-card-pages', text: theme.pages })
        ]),
        el('div', { class: 'content-card-body' }, [
          el('p', { class: 'content-card-summary-text', text: theme.summary }),
          theme.missionId ? el('p', { class: 'content-card-link' }, [
            el('button', {
              type: 'button',
              class: 'btn btn-link',
              'data-action': 'open-mission',
              'data-mission-id': String(theme.missionId)
            }, [
              el('span', { 'aria-hidden': 'true', text: '▶️ ' }),
              el('span', { text: 'Ir para a missão relacionada' })
            ])
          ]) : null
        ])
      ]);

      details.addEventListener('toggle', function () {
        if (!details.open) return;
        var G = getGame();
        if (!G || typeof G.markContentThemeOpened !== 'function') return;
        var result = G.markContentThemeOpened(theme.id);
        if (result && result.unlocked) {
          handleAchievementUnlock('estudioso');
        }
      });

      return el('li', { class: 'content-card-item' }, [details]);
    });

    var section = el('section', {
      class: 'screen screen-contents',
      'data-screen': SCREENS.CONTENTS,
      'aria-labelledby': 'contents-title'
    }, [
      el('header', { class: 'screen-header' }, [
        el('h1', { id: 'contents-title', text: '📖 Conteúdos' }),
        el('p', {
          class: 'screen-subtitle',
          text: 'Revisão dos temas do Manual do Café (EMATER-MG, 2016)'
        })
      ]),
      el('ul', { class: 'content-list' }, cards),
      el('div', { class: 'screen-actions' }, [
        buttonEl('🏠', 'Início', 'go-home', 'secondary')
      ])
    ]);

    mountScreen(section);
  }

  /* ============================================================
   * 13. TELA: GLOSSÁRIO
   * ============================================================ */

  function renderGlossary() {
    var glossary = window.GLOSSARY || [];

    var cards = glossary.map(function (item) {
      var details = el('details', { class: 'glossary-card' }, [
        el('summary', { class: 'glossary-summary' }, [
          el('span', { class: 'glossary-term', text: item.term })
        ]),
        el('div', { class: 'glossary-body' }, [
          el('p', { class: 'glossary-definition', text: item.definition })
        ])
      ]);

      details.addEventListener('toggle', function () {
        if (!details.open) return;
        var G = getGame();
        if (!G || typeof G.markGlossaryTermOpened !== 'function') return;
        var result = G.markGlossaryTermOpened(item.term);
        if (result && result.unlocked) {
          handleAchievementUnlock('curioso');
        }
      });

      return el('li', { class: 'glossary-item' }, [details]);
    });

    var section = el('section', {
      class: 'screen screen-glossary',
      'data-screen': SCREENS.GLOSSARY,
      'aria-labelledby': 'glossary-title'
    }, [
      el('header', { class: 'screen-header' }, [
        el('h1', { id: 'glossary-title', text: '📚 Glossário' }),
        el('p', {
          class: 'screen-subtitle',
          text: 'Termos técnicos do manual, com definições curtas'
        })
      ]),
      el('ul', { class: 'glossary-list' }, cards),
      el('div', { class: 'screen-actions' }, [
        buttonEl('🏠', 'Início', 'go-home', 'secondary')
      ])
    ]);

    mountScreen(section);
  }

  /* ============================================================
   * 14. TELA: CONQUISTAS
   * ============================================================ */

  function renderAchievements() {
    var state = getState();
    var all = window.ACHIEVEMENTS || [];

    var cards = all.map(function (ach) {
      var unlocked = state.achievements.indexOf(ach.id) !== -1;
      return el('li', {
        class: 'achievement-card ' + (unlocked ? 'achievement-unlocked' : 'achievement-locked')
      }, [
        el('span', { class: 'achievement-icon', 'aria-hidden': 'true', text: ach.icon }),
        el('div', { class: 'achievement-body' }, [
          el('h2', { class: 'achievement-name', text: ach.name }),
          el('p', { class: 'achievement-description', text: ach.description }),
          el('p', { class: 'achievement-status' }, [
            el('span', { 'aria-hidden': 'true', text: unlocked ? '✅ ' : '🔒 ' }),
            el('span', { text: unlocked ? 'Desbloqueada' : 'Bloqueada' })
          ])
        ])
      ]);
    });

    var section = el('section', {
      class: 'screen screen-achievements',
      'data-screen': SCREENS.ACHIEVEMENTS,
      'aria-labelledby': 'achievements-title'
    }, [
      el('header', { class: 'screen-header' }, [
        el('h1', { id: 'achievements-title', text: '🏆 Conquistas' }),
        el('p', {
          class: 'screen-subtitle',
          text: state.achievements.length + ' de ' + all.length + ' desbloqueadas'
        })
      ]),
      el('ul', { class: 'achievements-list' }, cards),
      el('div', { class: 'screen-actions' }, [
        buttonEl('🏠', 'Início', 'go-home', 'secondary')
      ])
    ]);

    mountScreen(section);
  }

  /* ============================================================
   * 15. TELA: SOBRE
   * ============================================================ */

  function renderAbout() {
    var section = el('section', {
      class: 'screen screen-about',
      'data-screen': SCREENS.ABOUT,
      'aria-labelledby': 'about-title'
    }, [
      el('header', { class: 'screen-header' }, [
        el('h1', { id: 'about-title', text: 'ℹ️ Sobre o LDI' }),
        el('p', { class: 'screen-subtitle', text: 'Ficha técnica' })
      ]),
      el('dl', { class: 'about-list' }, [
        definitionItem('Título', 'Desafio do Cafezal — Manejo de Cafezais em Produção'),
        definitionItem('Formato', 'Livro Digital Interativo (LDI) gamificado'),
        definitionItem('Autor e responsável', 'Dirceu Nogueira de Sales Duarte Junior'),
        definitionItem('Apoio no desenvolvimento',
          'Inteligência Artificial generativa, utilizada como ferramenta de apoio à ideação, organização, ' +
          'redação, programação, revisão e desenvolvimento da experiência interativa.'),
        definitionItem('Base técnica',
          'Manual do Café – Manejo de Cafezais em Produção. EMATER-MG, 2016. 72 p.'),
        definitionItem('Tecnologias',
          'HTML5, CSS3, JavaScript, Web Speech API, Web Audio API, LocalStorage e recursos de acessibilidade digital.'),
        definitionItem('Responsabilidade pelo conteúdo',
          'A seleção das fontes, definição dos objetivos pedagógicos, decisões de conteúdo, validação das ' +
          'informações e responsabilidade pelo produto final permanecem sob responsabilidade do autor.')
      ]),
      el('div', { class: 'screen-actions screen-actions-stack' }, [
        buttonEl('🧠', 'Transparência sobre IA', 'go-transparency', 'secondary'),
        buttonEl('🔁', 'Reiniciar jornada', 'reset-journey', 'danger'),
        buttonEl('🏠', 'Início', 'go-home', 'secondary')
      ])
    ]);

    mountScreen(section);
  }

  function definitionItem(term, def) {
    return el('div', { class: 'about-item' }, [
      el('dt', { class: 'about-term', text: term }),
      el('dd', { class: 'about-def', text: def })
    ]);
  }

  /* ============================================================
   * 16. TELA: TRANSPARÊNCIA SOBRE IA
   * ============================================================ */

  function renderTransparency() {
    var section = el('section', {
      class: 'screen screen-transparency',
      'data-screen': SCREENS.TRANSPARENCY,
      'aria-labelledby': 'transparency-title'
    }, [
      el('header', { class: 'screen-header' }, [
        el('h1', { id: 'transparency-title', text: '🧠 Transparência sobre o uso de Inteligência Artificial' })
      ]),
      el('div', { class: 'transparency-body' }, [
        el('p', {
          text: 'Ferramentas de Inteligência Artificial generativa foram utilizadas como apoio em etapas de ' +
                'ideação, organização, redação, programação, revisão e desenvolvimento deste Livro Digital ' +
                'Interativo.'
        }),
        el('p', {
          text: 'A autoria, a curadoria, a validação das informações e a responsabilidade final pelo produto ' +
                'permanecem integralmente com o autor do projeto, Dirceu Nogueira de Sales Duarte Junior.'
        }),
        el('p', {
          text: 'O conteúdo técnico foi baseado no Manual do Café – Manejo de Cafezais em Produção ' +
                '(EMATER-MG, 2016). Recomendações agronômicas específicas devem ser sempre validadas ' +
                'por profissional habilitado.'
        })
      ]),
      el('div', { class: 'screen-actions' }, [
        buttonEl('🏠', 'Início', 'go-home', 'secondary')
      ])
    ]);

    mountScreen(section);
  }

  /* ============================================================
   * 17. TELA: FINAL
   * ============================================================ */

  function renderFinal() {
    var state = getState();
    if (!state.bossCompleted) {
      navigate(SCREENS.MAP);
      return;
    }
    if (window.BOSS) {
      ui.boss.correctCount = state.bossScore && window.BOSS.scoring
        ? Math.round(state.bossScore / window.BOSS.scoring.perCorrect)
        : 0;
      renderBossResult();
    } else {
      navigate(SCREENS.MAP);
    }
  }

  /* ============================================================
   * 18. TELA AUXILIAR: NÃO ENCONTRADO
   * ============================================================ */

  function renderNotFound(message) {
    var section = el('section', {
      class: 'screen screen-error',
      'data-screen': 'error',
      role: 'alert'
    }, [
      el('h1', { text: 'Ops…' }),
      el('p', { text: message || 'Conteúdo não encontrado.' }),
      el('div', { class: 'screen-actions' }, [
        buttonEl('🗺️', 'Voltar ao mapa', 'go-map', 'primary'),
        buttonEl('🏠', 'Início', 'go-home', 'secondary')
      ])
    ]);
    mountScreen(section);
  }

  /* ============================================================
   * 19. AÇÕES DE JORNADA
   * ============================================================ */

  function startJourney() {
    var G = getGame();
    if (G && typeof G.reset === 'function') {
      try { G.reset(); } catch (e) { /* silencioso */ }
    }
    updateHUD();
    navigate(SCREENS.MAP);
  }

  function continueJourney() {
    var state = getState();
    if (state.bossCompleted) {
      navigate(SCREENS.FINAL);
      return;
    }
    if (state.completedMissions.length >= 10 || state.currentMissionId > 10) {
      renderBoss();
      return;
    }
    var nextId = state.currentMissionId;
    if (nextId && nextId >= 1 && nextId <= 10) {
      renderMission(nextId);
    } else {
      navigate(SCREENS.MAP);
    }
  }

  function resetJourney() {
    var confirmed = window.confirm(
      'Tem certeza? Todo o seu progresso, XP, Aura e conquistas serão apagados. ' +
      'Essa ação não pode ser desfeita.'
    );
    if (!confirmed) return;

    var G = getGame();
    if (G && typeof G.reset === 'function') {
      try { G.reset(); } catch (e) { /* silencioso */ }
    }
    updateHUD();
    showToast('Jornada reiniciada.', 'info');
    announce('Jornada reiniciada. Todo o progresso foi apagado.', 'polite');
    navigate(SCREENS.HOME);
  }

  /* ============================================================
   * 20. PAINEL DE ACESSIBILIDADE
   * ============================================================ */

  function openA11yPanel() {
    var panel = qs('#a11y-panel');
    var backdrop = qs('#a11y-backdrop');
    var opener = qs('#btn-open-a11y');
    if (!panel || !backdrop) return;

    ui.a11yReturnFocus = opener;
    backdrop.hidden = false;
    panel.hidden = false;
    if (opener) opener.setAttribute('aria-expanded', 'true');

    var first = panel.querySelector('button, [href], input, select, textarea');
    if (first) {
      window.setTimeout(function () { try { first.focus(); } catch (e) {} }, 30);
    }

    document.addEventListener('keydown', handleA11yKeydown);
    backdrop.addEventListener('click', closeA11yPanel);
  }

  function closeA11yPanel() {
    var panel = qs('#a11y-panel');
    var backdrop = qs('#a11y-backdrop');
    var opener = qs('#btn-open-a11y');
    if (!panel || !backdrop) return;

    panel.hidden = true;
    backdrop.hidden = true;
    if (opener) opener.setAttribute('aria-expanded', 'false');

    document.removeEventListener('keydown', handleA11yKeydown);
    backdrop.removeEventListener('click', closeA11yPanel);

    if (ui.a11yReturnFocus && typeof ui.a11yReturnFocus.focus === 'function') {
      try { ui.a11yReturnFocus.focus(); } catch (e) { /* silencioso */ }
    }
    ui.a11yReturnFocus = null;
  }

  function handleA11yKeydown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeA11yPanel();
      return;
    }
    if (e.key === 'Tab') {
      trapFocus(e);
    }
  }

  function trapFocus(e) {
    var panel = qs('#a11y-panel');
    if (!panel) return;
    var focusables = qsa(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      panel
    ).filter(function (n) {
      return !n.disabled && n.offsetParent !== null;
    });
    if (focusables.length === 0) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  /* ============================================================
   * 21. DELEGAÇÃO DE EVENTOS
   * ============================================================ */

  function bindEvents() {
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-action]');
      if (!trigger) return;
      var action = trigger.getAttribute('data-action');
      if (!action) return;
      e.preventDefault();
      handleAction(action, trigger);
    });

    var btnOpen = qs('#btn-open-a11y');
    if (btnOpen) {
      btnOpen.addEventListener('click', function (e) {
        e.preventDefault();
        openA11yPanel();
      });
    }

    var btnClose = qs('#btn-close-a11y');
    if (btnClose) {
      btnClose.addEventListener('click', function (e) {
        e.preventDefault();
        closeA11yPanel();
      });
    }
  }

  function handleAction(action, target) {
    switch (action) {
      case 'go-home':         navigate(SCREENS.HOME); break;
      case 'go-map':          navigate(SCREENS.MAP); break;
      case 'go-contents':     navigate(SCREENS.CONTENTS); break;
      case 'go-glossary':     navigate(SCREENS.GLOSSARY); break;
      case 'go-achievements': navigate(SCREENS.ACHIEVEMENTS); break;
      case 'go-about':        navigate(SCREENS.ABOUT); break;
      case 'go-transparency': navigate(SCREENS.TRANSPARENCY); break;
      case 'open-a11y':       openA11yPanel(); break;

      case 'start-journey':   startJourney(); break;
      case 'continue-journey': continueJourney(); break;
      case 'reset-journey':   resetJourney(); break;

      case 'open-mission': {
        var id = parseInt(target.getAttribute('data-mission-id'), 10);
        if (!isNaN(id)) renderMission(id);
        break;
      }

      case 'mission-start': {
        ui.mission.phase = PHASE.QUESTION;
        var m = findMission(ui.mission.id);
        if (m) renderMissionQuestion(m);
        break;
      }

      case 'mission-answer': {
        var idx = parseInt(target.getAttribute('data-option-index'), 10);
        if (!isNaN(idx)) selectMissionOption(idx);
        break;
      }

      case 'mission-continue': continueAfterMission(); break;

      case 'open-boss': renderBoss(); break;

      case 'boss-start': {
        ui.boss.phase = PHASE.QUESTION;
        ui.boss.decisionIndex = 0;
        ui.boss.correctCount = 0;
        renderBossDecision();
        break;
      }

      case 'boss-answer': {
        var bIdx = parseInt(target.getAttribute('data-option-index'), 10);
        if (!isNaN(bIdx)) selectBossOption(bIdx);
        break;
      }

      case 'boss-continue': continueAfterBossDecision(); break;

      default:
        break;
    }
  }

  /* ============================================================
   * 22. INICIALIZAÇÃO
   * ============================================================ */

  function init() {
    screenRoot = qs('#screen-root');
    if (!screenRoot) {
      return;
    }

    var G = getGame();
    if (G && typeof G.init === 'function') {
      try { G.init(); } catch (e) { /* silencioso */ }
    }
    var A = getAudio();
    if (A && typeof A.init === 'function') {
      try { A.init(); } catch (e) { /* silencioso */ }
    }
    var Acc = getA11y();
    if (Acc && typeof Acc.init === 'function') {
      try { Acc.init(); } catch (e) { /* silencioso */ }
    }

    bindEvents();
    updateHUD();
    navigate(SCREENS.HOME);
  }

  /* ============================================================
   * 23. API PÚBLICA
   * ============================================================ */

  window.App = {
    init: init,
    navigate: navigate,
    updateHUD: updateHUD,
    announce: announce,
    showToast: showToast,
    screens: SCREENS
  };

  /* ============================================================
   * 24. AUTO-INICIALIZAÇÃO
   * ============================================================ */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
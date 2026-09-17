# Changelog — Desafio do Cafezal

Todas as mudanças relevantes deste projeto são documentadas neste arquivo.
O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/)
e o versionamento segue [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [1.0.1] — 2026-09-17

### Corrigido
- Conquista **Curioso** agora conta termos **únicos** do glossário e persiste
  entre visitas. Antes, era contada apenas dentro de uma mesma sessão de
  renderização, o que impedia o desbloqueio por acúmulo.
- Conquista **Estudioso** deixou de ser concedida automaticamente ao abrir a
  tela de Conteúdos. Agora exige abertura de pelo menos **3 temas distintos**,
  alinhando-se à descrição da conquista.

### Adicionado
- Métodos `Game.markGlossaryTermOpened(termId)` e
  `Game.markContentThemeOpened(themeId)` no módulo `game.js`.
- Campos `glossaryTermsOpened` e `contentThemesOpened` no estado persistido.
- Sanitização e deduplicação desses campos em `Game.sanitize()`.
- 4 novos testes automatizados (total: **58**).
- Helper `handleAchievementUnlock()` em `app.js` — centraliza anúncio de
  conquista (toast + aria-live + voz + som).

### Alterado
- `docs/testes.html` — `App.screens` agora valida chaves em maiúsculas
  (`HOME`, `MAP`, ...), alinhado com a implementação real do `app.js`.

---

## [1.0.0] — 2026-09-17

### Adicionado
- Estrutura completa do Livro Digital Interativo (LDI) gamificado.
- 10 missões baseadas no *Manual do Café – Manejo de Cafezais em Produção*
  (EMATER-MG, 2016):
  1. Detetive do Solo (Amostragem de Solos)
  2. Olho na Folha (Amostragem Foliar)
  3. Raio-X da Nutrição (Nutrição Mineral)
  4. Sinais da Folha (Nutrição Mineral)
  5. Corrigindo o PH (Calagem)
  6. Perfurando o Subsolo (Gessagem)
  7. Nutrindo o Pé de Café (Adubação)
  8. Tesoura Afiada (Poda)
  9. Invasores do Talhão (Manejo do Mato)
  10. A Base de Tudo (Fertilidade do Solo)
- Boss Final **Dia na Fazenda** com 3 decisões sequenciais integrando calagem,
  adubação e análise foliar.
- Sistema de progressão com AURA, XP, 6 níveis e 9 conquistas.
- Glossário interativo com 16 termos técnicos.
- 8 temas de revisão em Conteúdos.
- Mapa da jornada com 4 estados por missão (bloqueada, disponível, atual,
  concluída).
- Painel de acessibilidade completo:
  - Modo escuro / modo claro
  - Alto contraste (WCAG AAA)
  - Redução de animações
  - 4 níveis de tamanho de fonte
  - Leitura em voz alta (Web Speech API)
  - Efeitos sonoros sintetizados (Web Audio API)
  - Som ambiente (ruído filtrado)
- Persistência via `localStorage` nas chaves `cafezal:state` e `cafezal:prefs`.
- Navegação por teclado completa, com foco visível e trap de foco no painel.
- Regiões `aria-live` para anúncios dinâmicos.
- Página de testes automatizados (`docs/testes.html`) — 54 testes.
- Página de referências (`docs/referencias.html`) — ficha técnica, transparência
  sobre IA, referências bibliográficas, licenças.
- Identidade visual própria: favicon SVG, avatar do Seu Zé do Café, logo.

### Notas técnicas
- Sem dependências externas: nenhum framework, CDN, fonte remota ou arquivo
  de áudio.
- HTML5 + CSS3 + JavaScript puro.
- Design responsivo (mobile-first, breakpoints em 600px e 900px).
- Respeita `prefers-reduced-motion` e `prefers-color-scheme` na primeira visita.

### Base técnica e autoria
- **Autor e responsável:** Dirceu Nogueira de Sales Duarte Junior
- **Apoio no desenvolvimento:** Inteligência Artificial generativa, utilizada
  como ferramenta de apoio à ideação, organização, redação, programação,
  revisão e desenvolvimento da experiência interativa.
- **Base técnica:** MESQUITA, Carlos Magno de et al. *Manual do café: manejo de
  cafezais em produção*. Belo Horizonte: EMATER-MG, 2016. 72 p.
- **Licença do conteúdo técnico:** o manual é de domínio público institucional
  (EMATER-MG), citado com atribuição.
- **Recursos visuais e sonoros:** produções originais do projeto, sem material
  de terceiros.
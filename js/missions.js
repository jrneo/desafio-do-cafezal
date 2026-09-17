/**
 * missions.js
 * Desafio do Cafezal — Manejo de Cafezais em Produção
 *
 * Arquivo de DADOS. Nenhuma lógica de aplicação aqui.
 * Base técnica: MESQUITA, Carlos Magno de et al.
 * Manual do café: manejo de cafezais em produção.
 * Belo Horizonte: EMATER-MG, 2016. 72 p.
 *
 * Autor do projeto: Dirceu Nogueira de Sales Duarte Junior
 * Apoio: Inteligência Artificial generativa (ferramenta de apoio)
 *
 * ATENÇÃO: todo conteúdo técnico abaixo foi redigido a partir
 * do manual da EMATER-MG. Recomendações agronômicas específicas
 * devem ser sempre validadas por profissional habilitado.
 */

window.MISSIONS = [

  /* ============================================================
   * MISSÃO 1 — AMOSTRAGEM DE SOLOS
   * ============================================================ */
  {
    id: 1,
    title: "Detetive do Solo",
    icon: "🔎",
    category: "Amostragem de Solos",
    source: {
      title: "Manual do Café – Manejo de Cafezais em Produção",
      institution: "EMATER-MG",
      year: 2016,
      pages: "p. 7–9"
    },
    characterIntro:
      "Fala, futuro cafeicultor! Antes de sair adubando por aí, precisa saber o que o solo tá pedindo. Bora aprender a tirar uma amostra que represente o talhão de verdade?",
    question:
      "Você vai fazer a amostragem de solo de um talhão de café em produção. Qual procedimento está correto segundo o manual da EMATER-MG?",
    options: [
      {
        text: "Coletar uma única amostra simples no centro do talhão e enviar ao laboratório.",
        correct: false,
        feedback:
          "Uma única amostra simples não representa a gleba. O manual recomenda que a amostra composta seja formada por, pelo menos, 20 amostras simples, retiradas em zigue-zague por toda a área."
      },
      {
        text: "Formar uma amostra composta com pelo menos 20 amostras simples, retiradas na camada de 0 a 20 cm, percorrendo o talhão em zigue-zague.",
        correct: true,
        feedback:
          "Isso mesmo! O manual orienta que a amostra composta seja constituída de, no mínimo, 20 amostras simples por gleba, na camada de 0 a 20 cm (camada arável), percorrendo toda a área em zigue-zague. O volume final deve ser de, pelo menos, 500 g de terra."
      },
      {
        text: "Coletar amostras apenas nos locais próximos a formigueiros e cupinzeiros, que são pontos representativos.",
        correct: false,
        feedback:
          "Ao contrário: o manual recomenda evitar locais próximos a cupinzeiros, formigueiros, árvores, caminhos, locais de descarga de corretivos e fertilizantes, manchas de solo — qualquer ponto discrepante das características predominantes do terreno."
      },
      {
        text: "Fazer a amostragem logo após a última adubação, para captar o efeito imediato dos fertilizantes.",
        correct: false,
        feedback:
          "A amostragem deve ser feita antes da arruação e pelo menos 60 dias após a última adubação, para que os fertilizantes já tenham reagido com o solo. Repetir anualmente."
      }
    ],
    reward: { aura: 10, xp: 1000 },
    achievement: "detetive-do-solo",
    successVoice:
      "Boa! Você mandou bem na amostragem. Amostra composta, zigue-zague, 20 subamostras. Farmou Aura!",
    errorVoice:
      "Essa escolha merece uma revisão. Lembra: amostra composta precisa de várias subamostras em zigue-zague.",
    successSound: "success",
    errorSound: "error"
  },

  /* ============================================================
   * MISSÃO 2 — AMOSTRAGEM FOLIAR
   * ============================================================ */
  {
    id: 2,
    title: "Olho na Folha",
    icon: "🍃",
    category: "Amostragem Foliar",
    source: {
      title: "Manual do Café – Manejo de Cafezais em Produção",
      institution: "EMATER-MG",
      year: 2016,
      pages: "p. 10"
    },
    characterIntro:
      "Olho no talhão! A análise foliar completa o que a análise de solo mostra. Mas tem que coletar a folha certa, na hora certa. Vamo nessa?",
    question:
      "Para a análise foliar do cafeeiro, qual é o procedimento correto de coleta segundo o manual da EMATER-MG?",
    options: [
      {
        text: "Coletar folhas do terço inferior da planta, incluindo as mais velhas, em qualquer época do ano.",
        correct: false,
        feedback:
          "O manual orienta coletar no terço médio da planta, o 3º ou 4º par de folhas a partir da extremidade do ramo, em época específica (fase de chumbinho/chumbão)."
      },
      {
        text: "Coletar, no mínimo, 100 folhas na gleba, em pelo menos 25 plantas, caminhando em zigue-zague, pegando o 3º ou 4º par de folhas a partir da extremidade do ramo, no terço médio da planta.",
        correct: true,
        feedback:
          "Exato! O manual recomenda: selecionar ao acaso um ramo no terço médio da planta; coletar o 3º ou 4º par de folhas a partir da extremidade; no mínimo 100 folhas por gleba, em pelo menos 25 plantas, caminhando em zigue-zague e coletando nos dois lados da planta."
      },
      {
        text: "Coletar apenas as folhas que apresentam sintomas visíveis de deficiência, para facilitar o diagnóstico.",
        correct: false,
        feedback:
          "A análise foliar serve justamente para detectar deficiências antes dos sintomas visíveis. Coletar só folhas doentes compromete o diagnóstico do estado nutricional real da planta."
      },
      {
        text: "Enviar as folhas ao laboratório sem identificação, pois o laboratório faz a triagem pela espécie.",
        correct: false,
        feedback:
          "A amostra deve ser identificada com nome do produtor, da propriedade e da lavoura ou talhão. O manual destaca a importância da identificação para a interpretação correta dos resultados."
      }
    ],
    reward: { aura: 10, xp: 1000 },
    achievement: "olho-na-folha",
    successVoice:
      "Mandou bem! Folha certa, planta certa, época certa. A análise foliar vai te dar um retrato fiel da nutrição do cafeeiro.",
    errorVoice:
      "Essa escolha custou Aura. Revisa aí: a folha é o 3º ou 4º par do ramo, no terço médio, e a amostragem é em zigue-zague.",
    successSound: "success",
    errorSound: "error"
  },

  /* ============================================================
   * MISSÃO 3 — NUTRIÇÃO MINERAL (PARTE 1)
   * ============================================================ */
  {
    id: 3,
    title: "Raio-X da Nutrição",
    icon: "🧪",
    category: "Nutrição Mineral do Cafeeiro",
    source: {
      title: "Manual do Café – Manejo de Cafezais em Produção",
      institution: "EMATER-MG",
      year: 2016,
      pages: "p. 11–23"
    },
    characterIntro:
      "O cafeeiro precisa de nutrientes na medida certa. Nem mais, nem menos. Bora entender quem são os macronutrientes e os micronutrientes?",
    question:
      "Segundo o manual da EMATER-MG, quais são os macronutrientes essenciais para o cafeeiro?",
    options: [
      {
        text: "Boro, zinco, cobre, ferro, manganês, cloro e molibdênio.",
        correct: false,
        feedback:
          "Esses são os micronutrientes, demandados em menor quantidade pela planta. O manual os distingue dos macronutrientes."
      },
      {
        text: "Nitrogênio, fósforo, potássio, cálcio, magnésio e enxofre.",
        correct: true,
        feedback:
          "Correto! O manual classifica como macronutrientes: nitrogênio (N), fósforo (P), potássio (K), cálcio (Ca), magnésio (Mg) e enxofre (S) — demandados em maior quantidade pelo cafeeiro."
      },
      {
        text: "Apenas nitrogênio, fósforo e potássio, que são os únicos exigidos pela planta.",
        correct: false,
        feedback:
          "O manual lista seis macronutrientes: N, P, K, Ca, Mg e S. Além deles, há os micronutrientes (B, Zn, Cu, Fe, Mn, Cl e Mo), também essenciais, mas em menor quantidade."
      },
      {
        text: "Todos os elementos químicos presentes no solo, independentemente da quantidade absorvida.",
        correct: false,
        feedback:
          "O manual define como essenciais apenas os elementos que a planta precisa para completar seu ciclo de vida. Nem todo elemento presente no solo é essencial ao cafeeiro."
      }
    ],
    reward: { aura: 10, xp: 1000 },
    achievement: null,
    successVoice:
      "Boa decisão! Macronutrientes: N, P, K, Ca, Mg e S. Agora você sabe quem são os pesados da nutrição do café.",
    errorVoice:
      "Revisa aí: macronutrientes são aqueles que a planta demanda em maior quantidade. São seis, não três.",
    successSound: "success",
    errorSound: "error"
  },

  /* ============================================================
   * MISSÃO 4 — NUTRIÇÃO MINERAL (PARTE 2)
   * ============================================================ */
  {
    id: 4,
    title: "Sinais da Folha",
    icon: "🍂",
    category: "Nutrição Mineral do Cafeeiro",
    source: {
      title: "Manual do Café – Manejo de Cafezais em Produção",
      institution: "EMATER-MG",
      year: 2016,
      pages: "p. 11–23"
    },
    characterIntro:
      "Olho vivo nos sinais! Às vezes a planta tá gritando por um nutriente e a gente não percebe. Vamos entender a diferença entre extração e exportação?",
    question:
      "No contexto da nutrição do cafeeiro, qual é a diferença entre extração e exportação de nutrientes segundo o manual?",
    options: [
      {
        text: "Extração é o que a planta retira do solo e fica contida em todas as suas partes; exportação é a parte da extração que deixa o local como componente de frutos e troncos.",
        correct: true,
        feedback:
          "Isso mesmo! O manual define: extração é a quantidade de nutrientes que a planta retira do solo e fica contida em todas as suas partes (raízes, caule, ramos, folhas, flores e frutos). Exportação é a parte da extração que deixa o local como componente de partes vegetais, como frutos e troncos, no caso de podas."
      },
      {
        text: "Extração é o que a planta perde por lixiviação; exportação é o que ela absorve pelas raízes.",
        correct: false,
        feedback:
          "O manual não usa esses termos dessa forma. Extração é a retirada de nutrientes do solo pela planta como um todo; exportação é a porção que sai da área via frutos, troncos ou podas."
      },
      {
        text: "Extração é a aplicação de fertilizantes; exportação é a colheita dos grãos.",
        correct: false,
        feedback:
          "Extração e exportação são conceitos nutricionais, não operações agrícolas. O manual os define em relação ao movimento dos nutrientes entre solo, planta e produto colhido."
      },
      {
        text: "Extração e exportação são sinônimos e podem ser usados indistintamente.",
        correct: false,
        feedback:
          "O manual distingue claramente os dois conceitos. Extração é tudo que a planta retira do solo; exportação é a parte que deixa a área de produção."
      }
    ],
    reward: { aura: 10, xp: 1000 },
    achievement: null,
    successVoice:
      "Boa! Agora você sabe: extração é tudo que a planta tira do solo. Exportação é o que sai da área. Menos exportação, menos reposição.",
    errorVoice:
      "Essa escolha merece uma revisão. Lembra: extração é tudo; exportação é a parte que sai da propriedade.",
    successSound: "success",
    errorSound: "error"
  },

  /* ============================================================
   * MISSÃO 5 — CALAGEM
   * ============================================================ */
  {
    id: 5,
    title: "Corrigindo o PH",
    icon: "⚗️",
    category: "Calagem e Gessagem",
    source: {
      title: "Manual do Café – Manejo de Cafezais em Produção",
      institution: "EMATER-MG",
      year: 2016,
      pages: "p. 27–41"
    },
    characterIntro:
      "Solo ácido não segura nutriente direito. A calagem é a base de tudo. Mas tem que fazer na hora certa e do jeito certo. Vamo entender?",
    question:
      "Qual é a finalidade principal da calagem no cafezal, segundo o manual da EMATER-MG?",
    options: [
      {
        text: "Fornecer exclusivamente nitrogênio e fósforo para as plantas.",
        correct: false,
        feedback:
          "A calagem não tem essa função. O calcário é um corretivo de acidez que fornece cálcio e magnésio, não nitrogênio e fósforo."
      },
      {
        text: "Corrigir a acidez do solo, fornecer cálcio e/ou magnésio e neutralizar efeitos tóxicos do alumínio, ferro e manganês.",
        correct: true,
        feedback:
          "Exato! O manual define calagem como a aplicação de um corretivo no solo com a finalidade de corrigir a acidez, fornecer cálcio e/ou magnésio (macronutrientes essenciais) e neutralizar os efeitos prejudiciais do alumínio, do ferro e do manganês quando em níveis tóxicos."
      },
      {
        text: "Aumentar a acidez do solo para liberar micronutrientes.",
        correct: false,
        feedback:
          "É o contrário. A calagem corrige a acidez, elevando o pH e melhorando a disponibilidade de nutrientes. A acidez excessiva é prejudicial à maioria das culturas."
      },
      {
        text: "Substituir completamente a adubação, fornecendo todos os nutrientes necessários.",
        correct: false,
        feedback:
          "A calagem corrige a acidez e fornece Ca e Mg, mas não substitui a adubação. Ela é uma etapa anterior e complementar ao programa de adubação."
      }
    ],
    reward: { aura: 15, xp: 1500 },
    achievement: null,
    successVoice:
      "Boa! Calagem é a base: corrige acidez, fornece cálcio e magnésio, tira o alumínio tóxico do caminho. Solo equilibrado, café feliz.",
    errorVoice:
      "Essa escolha custou Aura. Revisa: calagem corrige acidez, não acidifica. Ela prepara o solo para a adubação.",
    successSound: "success",
    errorSound: "error"
  },

  /* ============================================================
   * MISSÃO 6 — GESSAGEM
   * ============================================================ */
  {
    id: 6,
    title: "Perfurando o Subsolo",
    icon: "🕳️",
    category: "Calagem e Gessagem",
    source: {
      title: "Manual do Café – Manejo de Cafezais em Produção",
      institution: "EMATER-MG",
      year: 2016,
      pages: "p. 27–41"
    },
    characterIntro:
      "A calagem age na superfície, mas tem camada mais profunda que precisa de atenção. É aí que entra a gessagem. Sabe a diferença?",
    question:
      "Sobre a gessagem no cafezal, qual afirmação está correta segundo o manual?",
    options: [
      {
        text: "O gesso agrícola corrige o pH do solo da mesma forma que o calcário.",
        correct: false,
        feedback:
          "O gesso não corrige o pH. O manual esclarece que o gesso agrícola (sulfato de cálcio dihidratado) não é um corretivo da acidez de solo, pois não corrige o pH."
      },
      {
        text: "O gesso fornece cálcio em profundidade, reduz o alumínio tóxico e fornece enxofre, mas não corrige o pH.",
        correct: true,
        feedback:
          "Correto! O manual explica que o gesso promove redução do teor de alumínio tóxico e fornece cálcio, favorecendo o desenvolvimento radicular em maiores profundidades. Também fornece enxofre. Mas não corrige o pH — para isso serve o calcário."
      },
      {
        text: "O gesso pode ser usado isoladamente, sem calagem, sem nenhum risco.",
        correct: false,
        feedback:
          "O manual alerta: o uso de gesso isoladamente, na ausência de calagem simultânea, pode provocar perda de bases, especialmente magnésio e potássio, devido ao carreamento para camadas mais profundas, fora do alcance das raízes."
      },
      {
        text: "A gessagem deve ser feita apenas em solos argilosos, nunca em solos arenosos.",
        correct: false,
        feedback:
          "O manual não faz essa restrição. A necessidade de gesso pode ser determinada por três critérios: com base na necessidade de calcário (NC), pelo fósforo remanescente (P-rem) ou pela granulometria do solo (teor de argila)."
      }
    ],
    reward: { aura: 15, xp: 1500 },
    achievement: null,
    successVoice:
      "Mandou bem! Gesso é para o subsolo: cálcio, enxofre, menos alumínio tóxico. Mas pH quem corrige é o calcário.",
    errorVoice:
      "Revisa aí: gesso não corrige pH. Ele atua em profundidade, fornecendo cálcio e enxofre e reduzindo alumínio tóxico.",
    successSound: "success",
    errorSound: "error"
  },

  /* ============================================================
   * MISSÃO 7 — ADUBAÇÃO
   * ============================================================ */
  {
    id: 7,
    title: "Nutrindo o Pé de Café",
    icon: "🌱",
    category: "Adubação do Cafeeiro",
    source: {
      title: "Manual do Café – Manejo de Cafezais em Produção",
      institution: "EMATER-MG",
      year: 2016,
      pages: "p. 42–53"
    },
    characterIntro:
      "Agora que o solo tá corrigido, é hora de alimentar o cafeeiro. Mas adubação não é chute: é planejamento. Bora ver como parcelar?",
    question:
      "Segundo o manual da EMATER-MG, como deve ser feita a adubação do cafeeiro em produção?",
    options: [
      {
        text: "Aplicar toda a dose de uma vez, no início do período chuvoso, para simplificar o manejo.",
        correct: false,
        feedback:
          "O manual recomenda parcelamento. A aplicação única pode causar perdas de nutrientes e não acompanha a demanda da planta ao longo do ciclo."
      },
      {
        text: "Parcelar a adubação ao longo do período chuvoso, com base na análise de solo e na expectativa de produção, ajustando conforme a análise foliar.",
        correct: true,
        feedback:
          "Isso! O manual orienta que a adubação deve ser planejada com base na análise de solo e na produção esperada, parcelada ao longo do período chuvoso. A análise foliar complementa, indicando ajustes para mais ou para menos."
      },
      {
        text: "Adubar apenas quando a planta mostrar sintomas visíveis de deficiência.",
        correct: false,
        feedback:
          "O manual alerta que, quando os sintomas aparecem, a produção pode já ter sido comprometida. A adubação deve ser preventiva, baseada nas análises de solo e foliar."
      },
      {
        text: "Usar sempre a mesma fórmula NPK, independentemente do resultado da análise de solo.",
        correct: false,
        feedback:
          "O manual é claro: a recomendação depende da análise de solo. Não existe fórmula única. Cada gleba pode ter necessidades diferentes."
      }
    ],
    reward: { aura: 15, xp: 1500 },
    achievement: null,
    successVoice:
      "Boa decisão! Adubação é planejada, parcelada e baseada em análise. Nada de chute. Farmou Aura!",
    errorVoice:
      "Essa escolha merece uma revisão. Adubação de produção: análise de solo, parcelamento e ajuste pela folha.",
    successSound: "success",
    errorSound: "error"
  },

  /* ============================================================
   * MISSÃO 8 — PODA
   * ============================================================ */
  {
    id: 8,
    title: "Tesoura Afiada",
    icon: "✂️",
    category: "Poda do Cafeeiro",
    source: {
      title: "Manual do Café – Manejo de Cafezais em Produção",
      institution: "EMATER-MG",
      year: 2016,
      pages: "p. 54–65"
    },
    characterIntro:
      "Lavoura velha, ramo ladrão demais, planta fechada... Hora de podar. Mas cada tipo de poda tem sua hora e seu objetivo. Vamo entender a diferença entre recepa e esqueletamento?",
    question:
      "Qual é a diferença entre recepa e esqueletamento, segundo o manual da EMATER-MG?",
    options: [
      {
        text: "Recepa é a poda mais severa, cortando o ramo ortotrópico a 20–40 cm (baixa) ou 40–100 cm (alta) do solo; esqueletamento é uma poda drástica que corta os ramos laterais de 20 a 50 cm a partir do tronco, dando formato cônico.",
        correct: true,
        feedback:
          "Correto! O manual descreve a recepa como poda drástica, com corte do ramo ortotrópico a 20–40 cm do solo (recepa baixa) ou 40–100 cm (recepa alta). O esqueletamento corta os ramos laterais de 20 a 50 cm a partir do tronco, dando à planta um formato cônico."
      },
      {
        text: "Recepa e esqueletamento são a mesma coisa, só mudam o nome conforme a região.",
        correct: false,
        feedback:
          "São técnicas diferentes. A recepa corta o tronco principal (ramo ortotrópico) em altura baixa ou alta. O esqueletamento corta os ramos laterais, preservando parte da estrutura da planta."
      },
      {
        text: "Recepa é uma poda leve, que só remove as pontas dos ramos; esqueletamento remove o tronco inteiro.",
        correct: false,
        feedback:
          "Está invertido. A recepa é drástica (corta o tronco). O esqueletamento é também drástico, mas atua nos ramos laterais, não no tronco."
      },
      {
        text: "A poda aumenta diretamente a produtividade do cafeeiro no mesmo ano.",
        correct: false,
        feedback:
          "O manual esclarece que a poda não aumenta a produtividade. Ela serve para regularizar a safra, corrigir a arquitetura da planta, melhorar a entrada de luz e facilitar o controle fitossanitário."
      }
    ],
    reward: { aura: 15, xp: 1500 },
    achievement: null,
    successVoice:
      "Boa! Recepa corta o tronco; esqueletamento corta os laterais. Cada uma tem seu momento. Poda bem feita, lavoura equilibrada.",
    errorVoice:
      "Essa escolha custou Aura. Revisa: recepa é no tronco; esqueletamento é nos ramos laterais. E poda não aumenta produtividade, regulariza safra.",
    successSound: "success",
    errorSound: "error"
  },

  /* ============================================================
   * MISSÃO 9 — MANEJO DO MATO
   * ============================================================ */
  {
    id: 9,
    title: "Invasores do Talhão",
    icon: "🌿",
    category: "Manejo do Mato em Cafezais",
    source: {
      title: "Manual do Café – Manejo de Cafezais em Produção",
      institution: "EMATER-MG",
      year: 2016,
      pages: "p. 66–68"
    },
    characterIntro:
      "Mato no cafezal: vilão ou aliado? Depende de como você maneja. Bora entender quando ele compete e quando ele ajuda?",
    question:
      "Sobre o manejo do mato no cafezal, qual afirmação está correta segundo o manual da EMATER-MG?",
    options: [
      {
        text: "O mato é sempre prejudicial e deve ser eliminado completamente do cafezal.",
        correct: false,
        feedback:
          "O manual esclarece que o mato, se manejado adequadamente, pode trazer benefícios: cobertura do solo, maior infiltração de água, redução da erosão, reciclagem de nutrientes, abrigo a inimigos naturais das pragas."
      },
      {
        text: "O mato compete por água, luz e nutrientes, mas, se bem manejado, pode promover cobertura do solo, reduzir erosão, reciclar nutrientes e abrigar inimigos naturais das pragas.",
        correct: true,
        feedback:
          "Isso! O manual reconhece os dois lados: o mato compete com o cafeeiro, mas, se manejado corretamente, traz benefícios como cobertura do solo, maior infiltração de água, redução da erosão, manutenção da temperatura e umidade, reciclagem de nutrientes e abrigo a inimigos naturais."
      },
      {
        text: "O mato só causa prejuízo quando está na linha de plantio; nas entrelinhas, nunca atrapalha.",
        correct: false,
        feedback:
          "O manual considera a distribuição da infestação (linha ou entrelinhas), mas não isenta as entrelinhas de manejo. O grau de prejuízo depende da espécie, intensidade, duração, idade e estado nutricional do cafeeiro, além da época do ano."
      },
      {
        text: "A roçada é a única forma de manejo do mato recomendada pelo manual.",
        correct: false,
        feedback:
          "O manual cita roçadeiras, trinchas, capinas com enxadas e controle químico (herbicidas pós-emergentes e/ou pré-emergentes). A escolha depende do tipo de mato e do sistema de manejo."
      }
    ],
    reward: { aura: 15, xp: 1500 },
    achievement: null,
    successVoice:
      "Boa! Mato bem manejado é aliado: cobre o solo, recicla nutriente, abriga inimigo natural. Mato largado é competidor. Olho no talhão!",
    errorVoice:
      "Revisa aí: o mato não é só vilão. Bem manejado, ele ajuda na conservação do solo e no controle biológico.",
    successSound: "success",
    errorSound: "error"
  },

  /* ============================================================
   * MISSÃO 10 — FERTILIDADE DO SOLO
   * ============================================================ */
  {
    id: 10,
    title: "A Base de Tudo",
    icon: "🧬",
    category: "Fertilidade do Solo",
    source: {
      title: "Manual do Café – Manejo de Cafezais em Produção",
      institution: "EMATER-MG",
      year: 2016,
      pages: "p. 24–26"
    },
    characterIntro:
      "Fertilidade do solo não é só ter nutriente. É ter nutriente disponível, na quantidade certa, na hora certa. Vamo fechar essa base?",
    question:
      "Segundo o manual, o que é fertilidade do solo no contexto do cafeeiro?",
    options: [
      {
        text: "É a quantidade total de nutrientes presentes no solo, independentemente de estarem disponíveis ou não para a planta.",
        correct: false,
        feedback:
          "O manual não define fertilidade apenas como teor total. A disponibilidade dos nutrientes, que varia com o pH e outras condições, é parte fundamental do conceito."
      },
      {
        text: "É a capacidade do solo de fornecer nutrientes em quantidade e proporção adequadas, considerando também as condições que afetam sua disponibilidade, como acidez e matéria orgânica.",
        correct: true,
        feedback:
          "Correto. O manual trata a fertilidade do solo de forma integrada: não é só teor de nutriente, mas a capacidade de fornecê-los de forma equilibrada. O pH, a matéria orgânica, a CTC e a textura influenciam diretamente essa disponibilidade."
      },
      {
        text: "É a capacidade do solo de reter água, apenas.",
        correct: false,
        feedback:
          "A retenção de água é uma característica física importante, mas não define fertilidade sozinha. O manual aborda fertilidade em termos de disponibilidade equilibrada de nutrientes."
      },
      {
        text: "É a quantidade de adubo que o produtor aplica por hectare.",
        correct: false,
        feedback:
          "Adubação é uma prática de manejo; fertilidade é uma propriedade do solo. A adubação busca corrigir ou manter a fertilidade, mas não é a fertilidade em si."
      }
    ],
    reward: { aura: 20, xp: 2000 },
    achievement: "mestre-do-talhao",
    successVoice:
      "Fechou! Fertilidade é equilíbrio: nutriente disponível, pH adequado, matéria orgânica ativa. Agora você tem a base do manejo.",
    errorVoice:
      "Essa escolha merece uma revisão. Fertilidade não é só teor de nutriente: é disponibilidade, equilíbrio e condições do solo.",
    successSound: "success",
    errorSound: "error"
  }
];


/* ==============================================================
 * BOSS FINAL — DIA NA FAZENDA
 * ============================================================== */
window.BOSS = {
  id: "boss",
  title: "Dia na Fazenda",
  icon: "👑",
  category: "Desafio Integrador",
  source: {
    title: "Manual do Café – Manejo de Cafezais em Produção",
    institution: "EMATER-MG",
    year: 2016,
    pages: "p. 7–68 (capítulos integrados)"
  },
  characterIntro:
    "Chegou a hora, futuro mestre do cafezal! Você vai passar um dia na Fazenda Boa Esperança e tomar decisões que afetam a lavoura inteira. Cada escolha conta. Vamo nessa?",
  scenario:
    "A Fazenda Boa Esperança tem 20 hectares de café em produção. O produtor te chamou para ajudar a planejar a safra. O solo foi analisado, mas os resultados acabaram de chegar. Você tem três decisões importantes para tomar antes da próxima chuva.",
  decisions: [
    {
      id: "boss-d1",
      prompt:
        "DECISÃO 1 — O resultado da análise de solo mostrou pH 4,8 e saturação por bases de 38%. O produtor pergunta: por onde começar?",
      options: [
        {
          text: "Aplicar calcário para corrigir a acidez e elevar a saturação por bases, antes de qualquer adubação.",
          correct: true,
          feedback:
            "Boa! O manual indica que a calagem é a base do manejo. Corrigir a acidez e elevar a saturação por bases prepara o solo para receber os adubos com eficiência. Com pH 4,8 e V% 38%, a correção é necessária antes da adubação."
        },
        {
          text: "Aplicar adubo NPK imediatamente, sem mexer na acidez.",
          correct: false,
          feedback:
            "Adubar em solo ácido pode ser desperdício. Com pH baixo e saturação por bases baixa, muitos nutrientes ficam indisponíveis. O manual recomenda corrigir a acidez primeiro."
        },
        {
          text: "Aplicar gesso isoladamente, sem calagem.",
          correct: false,
          feedback:
            "O manual alerta que gesso isolado, sem calagem, pode provocar perda de bases (Mg e K). A gessagem é complementar à calagem, não substituta."
        }
      ]
    },
    {
      id: "boss-d2",
      prompt:
        "DECISÃO 2 — A calagem foi feita. Agora o produtor quer saber como planejar a adubação da safra que vem. A produção esperada é de 40 sacas/ha.",
      options: [
        {
          text: "Aplicar toda a dose de NPK de uma vez, no início das chuvas, para simplificar.",
          correct: false,
          feedback:
            "O manual recomenda parcelamento. Aplicação única pode causar perdas e não acompanha a demanda da planta. O parcelamento ao longo do período chuvoso é a prática indicada."
        },
        {
          text: "Parcelar a adubação ao longo do período chuvoso, com base na análise de solo e na produção esperada, ajustando conforme a análise foliar.",
          correct: true,
          feedback:
            "Exato! O manual orienta que a adubação seja planejada com base na análise de solo e na produção esperada, parcelada ao longo do período chuvoso. A análise foliar complementa, indicando ajustes."
        },
        {
          text: "Não adubar, pois o calcário já forneceu tudo que a planta precisa.",
          correct: false,
          feedback:
            "O calcário fornece Ca e Mg e corrige acidez, mas não fornece N, P, K e outros nutrientes em quantidade suficiente. A adubação é indispensável."
        }
      ]
    },
    {
      id: "boss-d3",
      prompt:
        "DECISÃO 3 — No meio do ano, o produtor percebe que algumas plantas estão com folhas amareladas e crescimento reduzido, de forma generalizada no talhão. O que você recomenda?",
      options: [
        {
          text: "Ignorar, pois é normal na época seca.",
          correct: false,
          feedback:
            "Sintomas generalizados de amarelecimento e crescimento reduzido podem indicar distúrbio nutricional. O manual alerta que deficiências generalizadas na lavoura merecem investigação, não podem ser ignoradas."
        },
        {
          text: "Fazer análise foliar para diagnosticar o estado nutricional e ajustar a adubação, se necessário.",
          correct: true,
          feedback:
            "Isso! O manual destaca que a análise foliar é a ferramenta indicada para diagnosticar o estado nutricional da planta. Sintomas generalizados no talhão sugerem distúrbio nutricional, e a análise foliar permite identificar a causa e corrigir."
        },
        {
          text: "Aplicar mais calcário, pois o problema é acidez.",
          correct: false,
          feedback:
            "A calagem já foi feita na decisão 1. Aplicar mais calcário sem análise pode desequilibrar o solo. A análise foliar é o caminho para identificar o problema real."
        }
      ]
    }
  ],
  scoring: { perCorrect: 25, maxScore: 75 },
  finalReward: { aura: 50, xp: 5000 },
  achievement: "lenda-do-cafezal",
  successVoice:
    "Parabéns! Você passou o dia na Fazenda Boa Esperança e tomou decisões sólidas. Calagem, adubação parcelada e análise foliar: o tripé do manejo. Você é oficialmente uma Lenda do Cafezal!",
  errorVoice:
    "Quase lá! Algumas decisões podem ser revistas. Relembra: corrigir o solo primeiro, parcelar a adubação e diagnosticar com análise foliar.",
  successSound: "success",
  errorSound: "error"
};


/* ==============================================================
 * GLOSSÁRIO
 * ============================================================== */
window.GLOSSARY = [
  {
    term: "Amostra composta",
    definition:
      "Amostra de solo formada pela reunião de várias amostras simples, retiradas em pontos diferentes de uma gleba homogênea. Representa a área como um todo. O manual recomenda pelo menos 20 amostras simples por gleba."
  },
  {
    term: "Amostra simples",
    definition:
      "Porção de solo retirada em um único ponto da gleba. Várias amostras simples compõem uma amostra composta."
  },
  {
    term: "Análise foliar",
    definition:
      "Análise química de folhas do cafeeiro que permite diagnosticar o estado nutricional da planta, indicando se os teores de macro e micronutrientes estão adequados, deficientes, tóxicos ou em desequilíbrio."
  },
  {
    term: "Calagem",
    definition:
      "Aplicação de calcário ao solo com a finalidade de corrigir a acidez, fornecer cálcio e/ou magnésio e neutralizar os efeitos tóxicos do alumínio, ferro e manganês."
  },
  {
    term: "Gessagem",
    definition:
      "Aplicação de gesso agrícola (sulfato de cálcio dihidratado) ao solo, visando fornecer cálcio em profundidade, reduzir o alumínio tóxico e fornecer enxofre. Não corrige o pH."
  },
  {
    term: "Talhão",
    definition:
      "Subdivisão da lavoura cafeeira com características homogêneas de solo, topografia, idade das plantas e histórico de manejo. O manual recomenda que o talhão tenha no máximo 10 ha."
  },
  {
    term: "Manejo do mato",
    definition:
      "Conjunto de práticas para controlar as plantas espontâneas no cafezal. Pode ser feito com roçadeiras, trinchas, capinas e herbicidas. O mato bem manejado pode trazer benefícios ao solo e ao controle biológico."
  },
  {
    term: "Nutrição mineral",
    definition:
      "Conjunto de processos pelos quais o cafeeiro absorve, transporta e utiliza os nutrientes minerais essenciais ao seu desenvolvimento, classificados em macronutrientes e micronutrientes."
  },
  {
    term: "Fertilidade do solo",
    definition:
      "Capacidade do solo de fornecer nutrientes em quantidade e proporção adequadas às plantas, considerando não apenas o teor total, mas também a disponibilidade, influenciada pelo pH, matéria orgânica, CTC e textura."
  },
  {
    term: "Macronutrientes",
    definition:
      "Nutrientes demandados em maior quantidade pelo cafeeiro: nitrogênio (N), fósforo (P), potássio (K), cálcio (Ca), magnésio (Mg) e enxofre (S)."
  },
  {
    term: "Micronutrientes",
    definition:
      "Nutrientes demandados em menor quantidade pelo cafeeiro: boro (B), zinco (Zn), cobre (Cu), ferro (Fe), manganês (Mn), cloro (Cl) e molibdênio (Mo)."
  },
  {
    term: "Extração de nutrientes",
    definition:
      "Quantidade total de nutrientes que a planta retira do solo e que fica contida em todas as suas partes: raízes, caule, ramos, folhas, flores e frutos."
  },
  {
    term: "Exportação de nutrientes",
    definition:
      "Parte da extração que deixa o local de produção como componente de partes vegetais, como frutos e troncos (no caso de podas)."
  },
  {
    term: "Recepa",
    definition:
      "Poda drástica do cafeeiro que consiste em cortar o ramo ortotrópico (tronco) a 20–40 cm do solo (recepa baixa) ou 40–100 cm (recepa alta). A planta fica uma safra sem produção."
  },
  {
    term: "Esqueletamento",
    definition:
      "Poda drástica que consiste no corte dos ramos laterais do cafeeiro de 20 a 50 cm a partir do tronco, dando à planta um formato cônico."
  },
  {
    term: "Desponte",
    definition:
      "Poda leve que consiste no corte da parte superior do cafeeiro, geralmente de 50 a 80 cm a partir do tronco, para controlar a altura da planta."
  }
];


/* ==============================================================
 * CONQUISTAS
 * ============================================================== */
window.ACHIEVEMENTS = [
  {
    id: "detetive-do-solo",
    name: "Detetive do Solo",
    icon: "🔎",
    description: "Concluiu a missão de Amostragem de Solos."
  },
  {
    id: "olho-na-folha",
    name: "Olho na Folha",
    icon: "🍃",
    description: "Concluiu a missão de Amostragem Foliar."
  },
  {
    id: "mestre-do-talhao",
    name: "Mestre do Talhão",
    icon: "🌱",
    description: "Concluiu as missões 1 a 5 (base do manejo)."
  },
  {
    id: "guardiao-do-cafezal",
    name: "Guardião do Cafezal",
    icon: "☕",
    description: "Concluiu todas as 10 missões principais."
  },
  {
    id: "lenda-do-cafezal",
    name: "Lenda do Cafezal",
    icon: "👑",
    description: "Concluiu o Boss Final — Dia na Fazenda."
  },
  {
    id: "aura-maxima",
    name: "Aura em Alta",
    icon: "✨",
    description: "Acumulou 100 pontos de AURA ou mais."
  },
  {
    id: "perfeccionista",
    name: "Sem Erros",
    icon: "🎯",
    description: "Concluiu uma missão sem errar nenhuma alternativa."
  },
  {
    id: "estudioso",
    name: "Estudioso",
    icon: "📖",
    description: "Visitou a tela de Conteúdos para revisão."
  },
  {
    id: "curioso",
    name: "Curioso",
    icon: "🧠",
    description: "Abriu 5 termos do glossário interativo."
  }
];


/* ==============================================================
 * TEMAS DE CONTEÚDO PARA REVISÃO
 * ============================================================== */
window.CONTENT_THEMES = [
  {
    id: "tema-1",
    title: "Amostragem de Solos",
    icon: "🔎",
    pages: "p. 7–9",
    summary:
      "Critérios para coleta de amostra representativa: época, divisão da área em glebas homogêneas, local de coleta sob a copa, número de subamostras (mínimo 20), procedimentos com trado ou cavadeira e identificação da amostra.",
    missionId: 1
  },
  {
    id: "tema-2",
    title: "Amostragem Foliar",
    icon: "🍃",
    pages: "p. 10",
    summary:
      "Coleta do 3º ou 4º par de folhas a partir da extremidade do ramo, no terço médio da planta, em pelo menos 25 plantas, totalizando no mínimo 100 folhas por gleba. Época: fase de chumbinho/chumbão (novembro a meados de dezembro).",
    missionId: 2
  },
  {
    id: "tema-3",
    title: "Nutrição Mineral do Cafeeiro",
    icon: "🧪",
    pages: "p. 11–23",
    summary:
      "Macronutrientes (N, P, K, Ca, Mg, S) e micronutrientes (B, Zn, Cu, Fe, Mn, Cl, Mo). Conceitos de extração e exportação de nutrientes. Sintomas de deficiência e excesso. Métodos de interpretação da análise foliar.",
    missionId: 3
  },
  {
    id: "tema-4",
    title: "Fertilidade do Solo",
    icon: "🧬",
    pages: "p. 24–26",
    summary:
      "Interpretação de análise de solo: pH, acidez ativa e trocável, saturação por bases (V%), CTC, matéria orgânica, macro e micronutrientes. Classes de interpretação e implicações para calagem e adubação.",
    missionId: 10
  },
  {
    id: "tema-5",
    title: "Calagem e Gessagem",
    icon: "⚗️",
    pages: "p. 27–41",
    summary:
      "Calagem: correção da acidez, fornecimento de Ca e Mg, neutralização de Al tóxico. Cálculo da necessidade de calcário (NC). Gessagem: fornecimento de Ca em profundidade, redução de Al tóxico, fornecimento de S. Métodos de cálculo da necessidade de gesso.",
    missionId: 5
  },
  {
    id: "tema-6",
    title: "Adubação do Cafeeiro",
    icon: "🌱",
    pages: "p. 42–53",
    summary:
      "Planejamento da adubação com base na análise de solo e produção esperada. Parcelamento ao longo do período chuvoso. Ajustes com base na análise foliar. Recomendações para macro e micronutrientes.",
    missionId: 7
  },
  {
    id: "tema-7",
    title: "Poda do Cafeeiro",
    icon: "✂️",
    pages: "p. 54–65",
    summary:
      "Tipos de poda: recepa (baixa e alta), esqueletamento, decote, desponte. Objetivos: regularização da safra, correção da arquitetura, melhoria da luminosidade e arejamento, facilitação do controle fitossanitário.",
    missionId: 8
  },
  {
    id: "tema-8",
    title: "Manejo do Mato em Cafezais",
    icon: "🌿",
    pages: "p. 66–68",
    summary:
      "Competição por água, luz e nutrientes. Benefícios do manejo adequado: cobertura do solo, infiltração de água, redução de erosão, reciclagem de nutrientes, abrigo a inimigos naturais. Métodos: roçadeira, trincha, capina, herbicidas.",
    missionId: 9
  }
];
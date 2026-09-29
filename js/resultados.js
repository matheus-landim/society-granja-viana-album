// Tabela de resultados do campeonato, rodada a rodada. Curadoria manual —
// os ids de "timeA"/"timeB" são os mesmos ids usados em COUNTRIES
// (js/countries.js). "penaltiA"/"penaltiB" guardam o placar dos pênaltis
// quando o jogo foi decidido assim. "vantagemA" marca o time que tinha a
// vantagem do empate naquela rodada.

var RESULTADOS = [
  {
    rodada: "1ª Rodada",
    data: "16/08/2026",
    jogos: [
      { hora: "13:30", timeA: "uruguai", golsA: 1, timeB: "alemanha", golsB: 1 },
      { hora: "13:30", timeA: "belgica", golsA: 3, timeB: "holanda", golsB: 3 },
      { hora: "14:25", timeA: "portugal", golsA: 1, timeB: "suecia", golsB: 2 },
      { hora: "14:25", timeA: "croacia", golsA: 1, timeB: "argentina", golsB: 1 },
      { hora: "15:20", timeA: "brasil", golsA: 2, timeB: "japao", golsB: 0 },
      { hora: "16:15", timeA: "mexico", golsA: 4, timeB: "espanha", golsB: 1 },
      { hora: "17:10", timeA: "colombia", golsA: 1, timeB: "inglaterra", golsB: 3 },
      { hora: "18:00", timeA: "eua", golsA: 1, timeB: "franca", golsB: 0 }
    ]
  },
  {
    rodada: "2ª Rodada",
    data: "23/08/2026",
    jogos: [
      { hora: "13:30", timeA: "inglaterra", golsA: 1, timeB: "franca", golsB: 3 },
      { hora: "14:25", timeA: "colombia", golsA: 1, timeB: "eua", golsB: 3 },
      { hora: "15:20", timeA: "espanha", golsA: 0, timeB: "japao", golsB: 1 },
      { hora: "16:15", timeA: "mexico", golsA: 5, timeB: "brasil", golsB: 0 },
      { hora: "17:10", timeA: "portugal", golsA: 6, timeB: "argentina", golsB: 2 },
      { hora: "17:10", timeA: "suecia", golsA: 2, timeB: "croacia", golsB: 2 },
      { hora: "18:00", timeA: "uruguai", golsA: 1, timeB: "holanda", golsB: 4 },
      { hora: "18:00", timeA: "alemanha", golsA: 7, timeB: "belgica", golsB: 4 }
    ]
  },
  {
    rodada: "3ª Rodada",
    data: "13/09/2026",
    jogos: [
      { hora: "13:30", timeA: "croacia", golsA: 2, timeB: "portugal", golsB: 1 },
      { hora: "13:30", timeA: "suecia", golsA: 1, timeB: "argentina", golsB: 2 },
      { hora: "14:25", timeA: "alemanha", golsA: 4, timeB: "holanda", golsB: 5 },
      { hora: "14:25", timeA: "belgica", golsA: 4, timeB: "uruguai", golsB: 1 },
      { hora: "15:20", timeA: "eua", golsA: 1, timeB: "inglaterra", golsB: 1 },
      { hora: "16:15", timeA: "franca", golsA: 2, timeB: "colombia", golsB: 2 },
      { hora: "17:10", timeA: "brasil", golsA: 3, timeB: "espanha", golsB: 0 },
      { hora: "18:00", timeA: "mexico", golsA: 3, timeB: "japao", golsB: 2 }
    ]
  },
  {
    rodada: "Semifinal",
    data: "20/09/2026",
    observacao: "Times em negrito têm a vantagem do empate.",
    jogos: [
      { hora: "13:30", timeA: "franca", golsA: 4, timeB: "inglaterra", golsB: 0, vantagemA: true },
      { hora: "14:20", timeA: "eua", golsA: 2, timeB: "colombia", golsB: 1, vantagemA: true },
      { hora: "15:10", timeA: "mexico", golsA: 2, timeB: "espanha", golsB: 0, vantagemA: true },
      { hora: "15:50", timeA: "brasil", golsA: 3, timeB: "japao", golsB: 3, vantagemA: true },
      { hora: "16:30", timeA: "holanda", golsA: 5, timeB: "uruguai", golsB: 1, vantagemA: true },
      { hora: "16:30", timeA: "alemanha", golsA: 2, timeB: "belgica", golsB: 3, vantagemA: true },
      { hora: "17:20", timeA: "croacia", golsA: 2, timeB: "portugal", golsB: 1, vantagemA: true },
      { hora: "17:20", timeA: "suecia", golsA: 3, timeB: "argentina", golsB: 4, vantagemA: true }
    ]
  },
  {
    rodada: "Final",
    data: "27/09/2026",
    jogos: [
      { hora: "13:30", timeA: "suecia", golsA: 3, timeB: "portugal", golsB: 2 },
      { hora: "13:30", timeA: "uruguai", golsA: 1, timeB: "alemanha", golsB: 6 },
      { hora: "14:25", timeA: "colombia", golsA: 2, penaltiA: 3, timeB: "inglaterra", golsB: 2, penaltiB: 4 },
      { hora: "14:25", timeA: "espanha", golsA: 2, penaltiA: 4, timeB: "japao", golsB: 2, penaltiB: 3 },
      { hora: "15:15", timeA: "eua", golsA: 0, timeB: "franca", golsB: 2 },
      { hora: "16:10", timeA: "mexico", golsA: 2, penaltiA: 5, timeB: "brasil", golsB: 2, penaltiB: 4 },
      { hora: "17:00", timeA: "croacia", golsA: 1, penaltiA: 2, timeB: "argentina", golsB: 1, penaltiB: 3 },
      { hora: "17:50", timeA: "holanda", golsA: 1, timeB: "belgica", golsB: 2 }
    ]
  }
];

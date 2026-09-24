// Dados dos 16 países/páginas do álbum.
// "codigo" é o código usado para buscar a bandeira real em flagcdn.com.
// "cores" define o degradê de fundo da página (baseado na bandeira real).
// "faixa" define as 3 cores da faixinha decorativa no topo de cada figurinha.
var COUNTRIES = [
  { id: "alemanha", nome: "Alemanha", codigo: "de", cores: ["#1a1a1a", "#dd0000", "#ffce00"] },
  { id: "argentina", nome: "Argentina", codigo: "ar", cores: ["#75aadb", "#ffffff", "#f6b40e"] },
  { id: "belgica", nome: "Bélgica", codigo: "be", cores: ["#1a1a1a", "#ffd90c", "#ed2939"] },
  { id: "brasil", nome: "Brasil", codigo: "br", cores: ["#009739", "#fedd00", "#012169"] },
  { id: "colombia", nome: "Colômbia", codigo: "co", cores: ["#fcd116", "#003893", "#ce1126"] },
  { id: "croacia", nome: "Croácia", codigo: "hr", cores: ["#ff0000", "#ffffff", "#171796"] },
  { id: "espanha", nome: "Espanha", codigo: "es", cores: ["#aa151b", "#f1bf00", "#aa151b"] },
  { id: "eua", nome: "Estados Unidos", codigo: "us", cores: ["#3c3b6e", "#b22234", "#ffffff"] },
  { id: "franca", nome: "França", codigo: "fr", cores: ["#0055a4", "#ffffff", "#ef4135"] },
  { id: "holanda", nome: "Holanda", codigo: "nl", cores: ["#ae1c28", "#ffffff", "#21468b"] },
  { id: "inglaterra", nome: "Inglaterra", codigo: "gb-eng", cores: ["#ffffff", "#ce1124", "#012169"] },
  { id: "japao", nome: "Japão", codigo: "jp", cores: ["#ffffff", "#bc002d", "#ffffff"] },
  { id: "mexico", nome: "México", codigo: "mx", cores: ["#006341", "#ffffff", "#ce1126"] },
  { id: "portugal", nome: "Portugal", codigo: "pt", cores: ["#006600", "#ff0000", "#ffcc00"] },
  { id: "suecia", nome: "Suécia", codigo: "se", cores: ["#006aa7", "#fecc02", "#006aa7"] },
  { id: "uruguai", nome: "Uruguai", codigo: "uy", cores: ["#0038a8", "#ffffff", "#fcd116"] }
];

function bandeiraUrl(country) {
  return "https://flagcdn.com/" + country.codigo + ".svg";
}

function getCountry(id) {
  for (var i = 0; i < COUNTRIES.length; i++) {
    if (COUNTRIES[i].id === id) return COUNTRIES[i];
  }
  return null;
}

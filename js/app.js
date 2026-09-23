// Navegação entre as 16 páginas do álbum + renderização da página atual.

window.paginaAtual = null; // { countryId, figurinhas, capaUrl, capaPath }

var placeholderSVG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
    '<rect width="200" height="200" fill="#e7e7ef"/>' +
    '<circle cx="100" cy="78" r="38" fill="#c3c3d6"/>' +
    '<ellipse cx="100" cy="190" rx="70" ry="55" fill="#c3c3d6"/>' +
    "</svg>"
  );

function montarNav() {
  var nav = document.getElementById("country-nav");
  nav.innerHTML = "";
  COUNTRIES.forEach(function (c) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "nav-item";
    btn.dataset.id = c.id;
    btn.innerHTML = '<span class="nav-flag">' + c.bandeira + "</span>" + c.nome;
    btn.addEventListener("click", function () {
      irParaPais(c.id);
    });
    nav.appendChild(btn);
  });
}

function irParaPais(id) {
  window.location.hash = id;
}

function paisAtualIndex() {
  var id = (window.location.hash || "#brasil").replace("#", "");
  var idx = COUNTRIES.findIndex(function (c) {
    return c.id === id;
  });
  return idx === -1 ? 0 : idx;
}

function aplicarTemaPagina(country) {
  var pagina = document.getElementById("pagina");
  pagina.style.setProperty("--c1", country.cores[0]);
  pagina.style.setProperty("--c2", country.cores[1]);
  pagina.style.setProperty("--c3", country.cores[2]);
  document.getElementById("pagina-bandeira").textContent = country.bandeira;
  document.getElementById("pagina-titulo").textContent = country.nome;
  document.title = country.nome + " — Álbum Society Granja Viana";

  document.querySelectorAll(".nav-item").forEach(function (btn) {
    btn.classList.toggle("ativo", btn.dataset.id === country.id);
  });
}

function renderCapa(pagina) {
  var img = document.getElementById("capa-img");
  img.src = pagina.capaUrl || placeholderSVG;
  img.crossOrigin = "anonymous";
}

function criarCardFigurinha(fig, countryId, countryNome) {
  var card = document.createElement("article");
  card.className = "figurinha-card";
  card.dataset.id = fig.id;

  var logado = !!currentUser;

  card.innerHTML =
    '<div class="figurinha-foto">' +
      '<img src="' + (fig.fotoUrl || placeholderSVG) + '" crossorigin="anonymous" alt="Foto do jogador">' +
      '<label class="somente-edicao upload-btn upload-btn-sm">📷<input type="file" accept="image/*" class="input-foto-figurinha" hidden></label>' +
    "</div>" +
    '<input class="figurinha-nome" placeholder="Nome do jogador" value="' + escapeAttr(fig.nome) + '" ' + (logado ? "" : "readonly") + ">" +
    '<input class="figurinha-numero" placeholder="Nº" maxlength="3" value="' + escapeAttr(fig.numero) + '" ' + (logado ? "" : "readonly") + ">" +
    '<div class="figurinha-acoes">' +
      '<button type="button" class="btn-exportar-figurinha" title="Salvar esta figurinha">⬇ Salvar figurinha</button>' +
      '<button type="button" class="somente-edicao btn-remover-figurinha" title="Remover figurinha">🗑</button>' +
    "</div>";

  card.querySelector(".input-foto-figurinha").addEventListener("change", function (e) {
    var file = e.target.files[0];
    if (!file) return;
    var pagina = window.paginaAtual;
    enviarFotoFigurinha(countryId, fig.id, file).then(function (res) {
      fig.fotoUrl = res.fotoUrl;
      fig.fotoPath = res.fotoPath;
      renderGrid(pagina, countryId, countryNome);
    });
  });

  card.querySelector(".figurinha-nome").addEventListener("change", function (e) {
    fig.nome = e.target.value;
    editarCampoFigurinha(fig.id, "nome", fig.nome);
  });

  card.querySelector(".figurinha-numero").addEventListener("change", function (e) {
    fig.numero = e.target.value;
    editarCampoFigurinha(fig.id, "numero", fig.numero);
  });

  card.querySelector(".btn-remover-figurinha").addEventListener("click", function () {
    if (!confirm("Remover esta figurinha?")) return;
    var pagina = window.paginaAtual;
    removerFigurinha(fig).then(function () {
      pagina.figurinhas = pagina.figurinhas.filter(function (f) {
        return f.id !== fig.id;
      });
      renderGrid(pagina, countryId, countryNome);
    });
  });

  card.querySelector(".btn-exportar-figurinha").addEventListener("click", function () {
    var nomeAtual = card.querySelector(".figurinha-nome").value || "jogador";
    exportarFigurinha(card, countryNome, nomeAtual);
  });

  return card;
}

function escapeAttr(v) {
  return String(v || "").replace(/"/g, "&quot;");
}

function renderGrid(pagina, countryId, countryNome) {
  var grid = document.getElementById("grid-figurinhas");
  grid.innerHTML = "";
  pagina.figurinhas.forEach(function (fig) {
    grid.appendChild(criarCardFigurinha(fig, countryId, countryNome));
  });

  var vazio = document.getElementById("grid-vazio");
  vazio.hidden = pagina.figurinhas.length !== 0;
}

function renderPagina(pagina) {
  var country = getCountry(pagina.countryId);
  aplicarTemaPagina(country);
  renderCapa(pagina);
  renderGrid(pagina, pagina.countryId, country.nome);
}

function carregarEExibir(countryId) {
  document.getElementById("pagina").classList.add("carregando");
  carregarPagina(countryId).then(function (dados) {
    window.paginaAtual = Object.assign({ countryId: countryId }, dados);
    renderPagina(window.paginaAtual);
    document.getElementById("pagina").classList.remove("carregando");
  });
}

function initEventosPagina() {
  document.getElementById("prev-country").addEventListener("click", function () {
    var idx = paisAtualIndex();
    var novo = (idx - 1 + COUNTRIES.length) % COUNTRIES.length;
    irParaPais(COUNTRIES[novo].id);
  });

  document.getElementById("next-country").addEventListener("click", function () {
    var idx = paisAtualIndex();
    var novo = (idx + 1) % COUNTRIES.length;
    irParaPais(COUNTRIES[novo].id);
  });

  document.getElementById("btn-add-figurinha").addEventListener("click", function () {
    var pagina = window.paginaAtual;
    adicionarFigurinhaVazia(pagina.countryId).then(function (nova) {
      pagina.figurinhas.push(nova);
      renderGrid(pagina, pagina.countryId, getCountry(pagina.countryId).nome);
    });
  });

  document.getElementById("capa-input").addEventListener("change", function (e) {
    var file = e.target.files[0];
    if (!file) return;
    var pagina = window.paginaAtual;
    enviarCapa(pagina.countryId, file).then(function (res) {
      pagina.capaUrl = res.capaUrl;
      pagina.capaPath = res.capaPath;
      renderCapa(pagina);
    });
  });

  document.getElementById("btn-exportar-selecao").addEventListener("click", function () {
    var country = getCountry(window.paginaAtual.countryId);
    exportarSelecao(document.getElementById("grid-figurinhas"), country.nome);
  });

  document.getElementById("btn-exportar-pagina").addEventListener("click", function () {
    var country = getCountry(window.paginaAtual.countryId);
    exportarPagina(document.getElementById("pagina"), country.nome);
  });

  window.addEventListener("hashchange", function () {
    var idx = paisAtualIndex();
    carregarEExibir(COUNTRIES[idx].id);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  montarNav();
  initEventosPagina();
  if (!window.location.hash) window.location.hash = "brasil";
  var idx = paisAtualIndex();
  carregarEExibir(COUNTRIES[idx].id);
});

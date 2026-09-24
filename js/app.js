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

function montarSeletorPaises() {
  var nav = document.getElementById("country-flags");
  nav.innerHTML = "";

  COUNTRIES.forEach(function (c) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "country-flag-btn";
    btn.dataset.id = c.id;
    btn.title = c.nome;
    btn.innerHTML = '<img src="' + bandeiraUrl(c) + '" alt="' + c.nome + '">';
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
  document.getElementById("pagina-bandeira").src = bandeiraUrl(country);
  document.getElementById("pagina-bandeira").alt = "Bandeira de " + country.nome;
  document.getElementById("hero-bandeira-img").src = bandeiraUrl(country);
  document.getElementById("hero-bandeira-img").alt = "Bandeira de " + country.nome;
  document.getElementById("pagina-titulo").textContent = country.nome;
  document.title = country.nome + " — Álbum Society Granja Viana";

  document.querySelectorAll(".country-flag-btn").forEach(function (btn) {
    btn.classList.toggle("ativo", btn.dataset.id === country.id);
  });
}

function renderCapa(pagina) {
  var secao = document.getElementById("hero-foto-adicional");
  var img = document.getElementById("capa-img");
  var country = getCountry(pagina.countryId);

  // Sem foto do time e ninguém logado pra enviar uma: esconde a seção.
  if (!pagina.capaUrl && !currentUser) {
    secao.hidden = true;
    return;
  }

  secao.hidden = false;
  img.src = pagina.capaUrl || placeholderSVG;
  document.getElementById("hero-legenda-bandeira").src = bandeiraUrl(country);
  document.getElementById("hero-legenda-nome").textContent = country.nome;
}

function criarCardFigurinha(fig, countryId, countryNome) {
  var card = document.createElement("article");
  card.className = "figurinha-card";
  card.dataset.id = fig.id;

  var logado = !!currentUser;

  card.innerHTML =
    '<div class="figurinha-foto">' +
      '<img src="' + (fig.fotoUrl || placeholderSVG) + '" alt="Foto do jogador">' +
      '<span class="figurinha-baixar-dica" aria-hidden="true">⬇</span>' +
      '<label class="somente-edicao upload-btn upload-btn-sm">📷<input type="file" accept="image/*" class="input-foto-figurinha" hidden></label>' +
    "</div>" +
    '<div class="figurinha-info">' +
      '<span class="figurinha-numero-tag">Nº ' + escapeAttr(fig.numero) + "</span>" +
      '<input class="figurinha-nome" placeholder="Nome do jogador" value="' + escapeAttr(fig.nome) + '" ' + (logado ? "" : "readonly") + ">" +
      (logado
        ? '<input class="figurinha-numero-input somente-edicao" placeholder="Nº da camisa" maxlength="3" value="' + escapeAttr(fig.numero) + '">'
        : "") +
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

  var numeroInput = card.querySelector(".figurinha-numero-input");
  if (numeroInput) {
    numeroInput.addEventListener("change", function (e) {
      fig.numero = e.target.value;
      editarCampoFigurinha(fig.id, "numero", fig.numero);
      card.querySelector(".figurinha-numero-tag").textContent = "Nº " + fig.numero;
    });
  }

  // Clique na figurinha (fora dos campos de edição) baixa a foto do jogador.
  card.addEventListener("click", function (e) {
    if (e.target.closest(".somente-edicao") || e.target.tagName === "INPUT") return;
    var nomeAtual = card.querySelector(".figurinha-nome").value || "jogador";
    exportarFigurinha(fig.fotoUrl || placeholderSVG, countryNome, nomeAtual);
  });

  return card;
}

function escapeAttr(v) {
  return String(v || "").replace(/"/g, "&quot;");
}

function criarCardAdicionar(pagina, countryId, countryNome) {
  var card = document.createElement("button");
  card.type = "button";
  card.className = "figurinha-add";
  card.innerHTML = '<span class="figurinha-add-icon">+</span><span class="figurinha-add-texto">Adicionar jogador</span>';
  card.addEventListener("click", function () {
    var maiorOrdem = pagina.figurinhas.reduce(function (max, f) { return Math.max(max, f.ordem); }, 0);
    adicionarFigurinha(countryId, maiorOrdem + 1).then(function (novaFig) {
      pagina.figurinhas.push(novaFig);
      renderGrid(pagina, countryId, countryNome);
    });
  });
  return card;
}

function renderGrid(pagina, countryId, countryNome) {
  var grid = document.getElementById("grid-figurinhas");
  grid.innerHTML = "";
  var logado = !!currentUser;

  // Pra quem não está logado, esconde as figurinhas ainda sem jogador
  // (sem nome nem foto). Quem está logado vê tudo, pra poder completar.
  var visiveis = logado
    ? pagina.figurinhas
    : pagina.figurinhas.filter(function (fig) { return fig.nome || fig.fotoUrl; });

  visiveis.forEach(function (fig) {
    grid.appendChild(criarCardFigurinha(fig, countryId, countryNome));
  });

  if (logado) {
    grid.appendChild(criarCardAdicionar(pagina, countryId, countryNome));
  }
}

function renderPatrocinadores(patrocinadores) {
  var secao = document.getElementById("patrocinadores-secao");
  var grid = document.getElementById("patrocinadores-grid");

  if (!patrocinadores || !patrocinadores.length) {
    secao.hidden = true;
    return;
  }

  secao.hidden = false;
  grid.innerHTML = "";
  patrocinadores.forEach(function (p) {
    var item = document.createElement(p.link ? "a" : "div");
    item.className = "patrocinador-item";
    if (p.link) {
      item.href = p.link;
      item.target = "_blank";
      item.rel = "noopener";
    }
    item.innerHTML =
      '<img src="' + (p.logoUrl || placeholderSVG) + '" alt="' + escapeAttr(p.nome) + '">';
    item.title = p.nome;
    grid.appendChild(item);
  });
}

function renderPagina(pagina) {
  var country = getCountry(pagina.countryId);
  aplicarTemaPagina(country);
  renderCapa(pagina);
  renderGrid(pagina, pagina.countryId, country.nome);
}

var inicioCarregamento = Date.now();
var TEMPO_MINIMO_LOADING = 700; // ms — pra dar tempo da pessoa perceber a tela

function esconderTelaCarregamento() {
  var overlay = document.getElementById("loading-overlay");
  if (!overlay) return;
  var espera = Math.max(0, TEMPO_MINIMO_LOADING - (Date.now() - inicioCarregamento));
  setTimeout(function () {
    overlay.classList.add("loading-overlay-escondido");
    setTimeout(function () {
      overlay.hidden = true;
    }, 300);
  }, espera);
}

function carregarEExibir(countryId) {
  document.getElementById("pagina").classList.add("carregando");
  carregarPagina(countryId).then(function (dados) {
    window.paginaAtual = Object.assign({ countryId: countryId }, dados);
    renderPagina(window.paginaAtual);
    document.getElementById("pagina").classList.remove("carregando");
    esconderTelaCarregamento();
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

  window.addEventListener("hashchange", function () {
    var idx = paisAtualIndex();
    carregarEExibir(COUNTRIES[idx].id);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  montarSeletorPaises();
  initEventosPagina();
  if (!window.location.hash) window.location.hash = "brasil";
  var idx = paisAtualIndex();
  carregarEExibir(COUNTRIES[idx].id);

  // Lista de patrocinadores é a mesma em toda página, carrega uma vez só.
  carregarPatrocinadores().then(renderPatrocinadores);
});

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
      '<button type="button" class="somente-edicao figurinha-excluir" title="Excluir jogador">🗑</button>' +
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

  card.querySelector(".figurinha-excluir").addEventListener("click", function () {
    if (!confirm("Excluir esse jogador? A foto e os dados dele serão apagados.")) return;
    var pagina = window.paginaAtual;
    excluirFigurinha(fig.id, fig.fotoPath).then(function () {
      pagina.figurinhas = pagina.figurinhas.filter(function (f) { return f.id !== fig.id; });
      renderGrid(pagina, countryId, countryNome);
    });
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

function renderPatrocinador(patrocinador) {
  var secao = document.getElementById("patrocinadores-secao");
  var container = document.getElementById("patrocinadores-grid");

  if (!patrocinador) {
    secao.hidden = true;
    return;
  }

  secao.hidden = false;
  container.innerHTML = "";
  var item = document.createElement(patrocinador.link ? "a" : "div");
  item.className = "patrocinador-item";
  if (patrocinador.link) {
    item.href = patrocinador.link;
    item.target = "_blank";
    item.rel = "noopener";
  }
  var instagramBadge = patrocinador.link
    ? '<span class="patrocinador-instagram" aria-hidden="true">' +
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.2c3.2 0 3.58.01 4.85.07 1.17.05 1.97.24 2.43.4a4.9 4.9 0 011.77 1.15 4.9 4.9 0 011.15 1.77c.16.46.35 1.26.4 2.43.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.24 1.97-.4 2.43a4.9 4.9 0 01-1.15 1.77 4.9 4.9 0 01-1.77 1.15c-.46.16-1.26.35-2.43.4-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.97-.24-2.43-.4a4.9 4.9 0 01-1.77-1.15 4.9 4.9 0 01-1.15-1.77c-.16-.46-.35-1.26-.4-2.43C2.21 15.58 2.2 15.2 2.2 12s.01-3.58.07-4.85c.05-1.17.24-1.97.4-2.43a4.9 4.9 0 011.15-1.77A4.9 4.9 0 015.59 1.8c.46-.16 1.26-.35 2.43-.4C9.29 2.34 9.67 2.33 12 2.33m0-1.8c-3.24 0-3.65.01-4.92.07-1.27.06-2.14.26-2.9.56a6.7 6.7 0 00-2.42 1.58 6.7 6.7 0 00-1.58 2.42c-.3.76-.5 1.63-.56 2.9C-.44 9.35-.45 9.76-.45 13s.01 3.65.07 4.92c.06 1.27.26 2.14.56 2.9a6.7 6.7 0 001.58 2.42 6.7 6.7 0 002.42 1.58c.76.3 1.63.5 2.9.56 1.27.06 1.68.07 4.92.07s3.65-.01 4.92-.07c1.27-.06 2.14-.26 2.9-.56a6.7 6.7 0 002.42-1.58 6.7 6.7 0 001.58-2.42c.3-.76.5-1.63.56-2.9.06-1.27.07-1.68.07-4.92s-.01-3.65-.07-4.92c-.06-1.27-.26-2.14-.56-2.9a6.7 6.7 0 00-1.58-2.42A6.7 6.7 0 0019.82.63c-.76-.3-1.63-.5-2.9-.56C15.65.01 15.24 0 12 0z"/><path d="M12 6.87A5.13 5.13 0 1012 17.13 5.13 5.13 0 0012 6.87zm0 8.46a3.33 3.33 0 110-6.66 3.33 3.33 0 010 6.66z"/><circle cx="17.34" cy="6.66" r="1.2"/></svg>' +
      "</span>"
    : "";
  item.innerHTML =
    '<span class="patrocinador-foto">' +
      '<img src="' + (patrocinador.logoUrl || placeholderSVG) + '" alt="' + escapeAttr(patrocinador.nome) + '">' +
      instagramBadge +
    "</span>" +
    '<span class="patrocinador-nome">' + escapeAttr(patrocinador.nome) + "</span>";
  container.appendChild(item);
}

function renderPagina(pagina) {
  var country = getCountry(pagina.countryId);
  aplicarTemaPagina(country);
  renderCapa(pagina);
  renderGrid(pagina, pagina.countryId, country.nome);
  renderPatrocinador(pagina.patrocinador);
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

// Se a pessoa trocar de país várias vezes rápido, cada clique dispara um
// carregamento novo. Esse número marca qual é o mais recente, pra
// ignorar respostas antigas que cheguem fora de ordem — e o try/finally
// garante que a página nunca fique travada em "carregando" pra sempre,
// mesmo se algum carregamento falhar.
var numeroDoCarregamento = 0;

function carregarEExibir(countryId) {
  var esteCarregamento = ++numeroDoCarregamento;
  document.getElementById("pagina").classList.add("carregando");

  carregarPagina(countryId)
    .then(function (dados) {
      if (esteCarregamento !== numeroDoCarregamento) return; // já tem um mais novo em andamento
      window.paginaAtual = Object.assign({ countryId: countryId }, dados);
      renderPagina(window.paginaAtual);
    })
    .catch(function (erro) {
      console.error("Não consegui carregar a página de " + countryId + ":", erro);
    })
    .finally(function () {
      if (esteCarregamento === numeroDoCarregamento) {
        document.getElementById("pagina").classList.remove("carregando");
      }
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
});

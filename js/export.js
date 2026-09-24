// Exportação de imagens (figurinha individual / seleção / página inteira)
// no formato de card para Instagram: logo da escola + foto + legenda + @handle.

var LOGO_URL = "assets/logo-gremio-cotia.png";
var INSTA_LEGENDA = "Eu participei do Campeonato Interno 2026";
var INSTA_HANDLE = "@gremio_cotia";

var logoPronto = (function () {
  var img = new Image();
  img.src = LOGO_URL;
  if (img.decode) {
    return img.decode().then(function () { return img; }).catch(function () { return null; });
  }
  return new Promise(function (resolve) {
    img.onload = function () { resolve(img); };
    img.onerror = function () { resolve(null); };
  });
})();

// Mostra o modal de confirmação e resolve true/false conforme o botão clicado.
function confirmarDownload() {
  return new Promise(function (resolve) {
    var modal = document.getElementById("confirmar-download-modal");
    if (!modal) { resolve(true); return; }

    var btnSim = document.getElementById("btn-confirmar-download");
    var btnNao = document.getElementById("btn-cancelar-download");
    var resolvido = false;

    function finalizar(valor) {
      if (resolvido) return;
      resolvido = true;
      btnSim.removeEventListener("click", aoConfirmar);
      btnNao.removeEventListener("click", aoCancelar);
      modal.removeEventListener("close", aoFechar);
      modal.close();
      resolve(valor);
    }
    function aoConfirmar() { finalizar(true); }
    function aoCancelar() { finalizar(false); }
    function aoFechar() { finalizar(false); }

    btnSim.addEventListener("click", aoConfirmar);
    btnNao.addEventListener("click", aoCancelar);
    modal.addEventListener("close", aoFechar);
    modal.showModal();
  });
}

function desenharTextoCentralizado(ctx, texto, x, y, maxLargura, fonte, cor) {
  ctx.font = fonte;
  ctx.fillStyle = cor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (ctx.measureText(texto).width <= maxLargura) {
    ctx.fillText(texto, x, y);
    return;
  }

  var palavras = texto.split(" ");
  var linha1 = "";
  var linha2 = "";
  for (var i = 0; i < palavras.length; i++) {
    var tentativa = (linha1 ? linha1 + " " : "") + palavras[i];
    if (!linha1 || ctx.measureText(tentativa).width <= maxLargura) {
      linha1 = tentativa;
    } else {
      linha2 = palavras.slice(i).join(" ");
      break;
    }
  }
  if (linha2) {
    ctx.fillText(linha1, x, y - 24);
    ctx.fillText(linha2, x, y + 24);
  } else {
    ctx.fillText(linha1, x, y);
  }
}

// Desenha uma imagem "cover" (preenche todo o retângulo, cortando o excesso).
// Só usado pra coisas que não têm rosto/conteúdo importante nas bordas (o logo).
function desenharImagemCover(ctx, img, x, y, w, h) {
  var escala = Math.max(w / img.width, h / img.height);
  var wDesenho = img.width * escala;
  var hDesenho = img.height * escala;
  var offsetX = x + (w - wDesenho) / 2;
  var offsetY = y + (h - hDesenho) / 2;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, offsetX, offsetY, wDesenho, hDesenho);
  ctx.restore();
}

// Desenha uma imagem "contain" (cabe inteira dentro do retângulo, sem
// cortar nada — usado pra seleção/página, onde tem várias figurinhas juntas).
function desenharImagemContain(ctx, img, x, y, w, h) {
  var escala = Math.min(w / img.width, h / img.height);
  var wDesenho = img.width * escala;
  var hDesenho = img.height * escala;
  var offsetX = x + (w - wDesenho) / 2;
  var offsetY = y + (h - hDesenho) / 2;
  ctx.drawImage(img, offsetX, offsetY, wDesenho, hDesenho);
}

// Desenha uma imagem "cover" preenchendo o retângulo de ponta a ponta, mas
// ancorada no topo (só corta embaixo) — usado pra uma foto de jogador,
// preenche igual ao post de referência sem cortar o rosto.
function desenharImagemCoverTopo(ctx, img, x, y, w, h) {
  var escala = Math.max(w / img.width, h / img.height);
  var wDesenho = img.width * escala;
  var hDesenho = img.height * escala;
  var offsetX = x + (w - wDesenho) / 2;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, offsetX, y, wDesenho, hDesenho);
  ctx.restore();
}

// Carrega uma imagem (URL da foto do jogador, por exemplo) pronta pra desenhar.
function carregarImagem(url) {
  return new Promise(function (resolve) {
    var img = new Image();
    img.crossOrigin = "anonymous";
    img.onerror = function () { resolve(img); };
    if (img.decode) {
      img.src = url;
      img.decode().then(function () { resolve(img); }).catch(function () { resolve(img); });
    } else {
      img.onload = function () { resolve(img); };
      img.src = url;
    }
  });
}

// Monta o card final igual a um post real do Instagram: cabeçalho pequeno
// com o logo (em círculo) + @gremio_cotia, a foto numa área central, e a
// legenda numa faixa embaixo.
// modo "cover-topo": preenche de ponta a ponta (uma foto só, tipo o post de
// referência). modo "contain" (padrão): mostra tudo sem cortar (seleção/página).
function montarCardInstagram(imagemOuCanvas, modo) {
  return logoPronto.then(function (logoImg) {
    var TAM = 1080;
    var cabecalhoAltura = 130;
    var out = document.createElement("canvas");
    out.width = TAM;
    out.height = TAM;
    var ctx = out.getContext("2d");

    // Cabeçalho estilo post do Instagram
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, TAM, TAM);

    var raioLogo = 42;
    var cxLogo = 76;
    var cyLogo = cabecalhoAltura / 2;

    if (logoImg) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cxLogo, cyLogo, raioLogo, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      desenharImagemCover(ctx, logoImg, cxLogo - raioLogo, cyLogo - raioLogo, raioLogo * 2, raioLogo * 2);
      ctx.restore();
      ctx.strokeStyle = "#e0e0e0";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cxLogo, cyLogo, raioLogo, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.font = "700 36px 'Poppins', 'Segoe UI', sans-serif";
    ctx.fillStyle = "#0d1b2a";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(INSTA_HANDLE, cxLogo + raioLogo + 24, cyLogo);

    // "..." de menu, só pra lembrar a cara de um post mesmo
    ctx.fillStyle = "#8a8a8a";
    var pontosX = TAM - 70;
    [-16, 0, 16].forEach(function (dx) {
      ctx.beginPath();
      ctx.arc(pontosX + dx, cabecalhoAltura / 2, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.strokeStyle = "#efefef";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, cabecalhoAltura);
    ctx.lineTo(TAM, cabecalhoAltura);
    ctx.stroke();

    // Área da foto
    var faixaAltura = 130;
    var fotoY = cabecalhoAltura;
    var fotoAltura = TAM - cabecalhoAltura - faixaAltura;
    if (modo === "cover-topo") {
      desenharImagemCoverTopo(ctx, imagemOuCanvas, 0, fotoY, TAM, fotoAltura);
    } else {
      ctx.fillStyle = "#f2f2f2";
      ctx.fillRect(0, fotoY, TAM, fotoAltura);
      desenharImagemContain(ctx, imagemOuCanvas, 0, fotoY, TAM, fotoAltura);
    }

    // Legenda numa faixa sólida no rodapé
    var faixaY = TAM - faixaAltura;
    ctx.fillStyle = "#0d1b2a";
    ctx.fillRect(0, faixaY, TAM, faixaAltura);
    desenharTextoCentralizado(
      ctx, INSTA_LEGENDA, TAM / 2, faixaY + faixaAltura / 2, TAM - 100,
      "700 34px 'Poppins', 'Segoe UI', sans-serif", "#ffffff"
    );

    return out;
  });
}

function baixarCanvas(imagemOuCanvas, nomeArquivo, modo) {
  montarCardInstagram(imagemOuCanvas, modo).then(function (canvasFinal) {
    canvasFinal.toBlob(function (blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = nomeArquivo;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 2000);
    }, "image/png", 0.95);
  });
}

function capturarElemento(el) {
  document.body.classList.add("capturando");
  return html2canvas(el, {
    useCORS: true,
    allowTaint: false,
    backgroundColor: "#ffffff",
    scale: Math.min(2, window.devicePixelRatio || 1.5)
  }).finally(function () {
    document.body.classList.remove("capturando");
  });
}

function slugify(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "figurinha";
}

// Exporta só a foto real do jogador (sem a moldura/inputs do card), igual
// a um post do Instagram: logo + @gremio_cotia no topo, foto de ponta a
// ponta, legenda embaixo.
function exportarFigurinha(fotoUrl, countryNome, nomeJogador) {
  confirmarDownload().then(function (ok) {
    if (!ok) return;
    carregarImagem(fotoUrl).then(function (img) {
      baixarCanvas(img, "figurinha-" + slugify(countryNome) + "-" + slugify(nomeJogador) + ".png", "cover-topo");
    });
  });
}

// Exporta a grade inteira de figurinhas (a "seleção") da página atual.
function exportarSelecao(gridEl, countryNome) {
  confirmarDownload().then(function (ok) {
    if (!ok) return;
    capturarElemento(gridEl).then(function (canvas) {
      baixarCanvas(canvas, "selecao-" + slugify(countryNome) + ".png", "contain");
    });
  });
}

// Exporta a página inteira (tema do país + toda a grade de figurinhas).
function exportarPagina(pageEl, countryNome) {
  confirmarDownload().then(function (ok) {
    if (!ok) return;
    capturarElemento(pageEl).then(function (canvas) {
      baixarCanvas(canvas, "pagina-" + slugify(countryNome) + ".png", "contain");
    });
  });
}

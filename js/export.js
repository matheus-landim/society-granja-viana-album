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

// Monta o card final no formato Instagram (1080x1080): logo da escola no
// topo, a imagem capturada (figurinha/seleção/página) no meio, e a legenda
// + @handle no rodapé.
function montarCardInstagram(canvasOriginal) {
  return logoPronto.then(function (logoImg) {
    var TAM = 1080;
    var out = document.createElement("canvas");
    out.width = TAM;
    out.height = TAM;
    var ctx = out.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, TAM, TAM);

    ctx.strokeStyle = "#0d1b2a";
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, TAM - 40, TAM - 40);

    var topo = 60;

    if (logoImg) {
      var logoLado = 210;
      ctx.drawImage(logoImg, (TAM - logoLado) / 2, topo, logoLado, logoLado);
      topo += logoLado + 26;
    } else {
      topo += 20;
    }

    ctx.strokeStyle = "#1e8bc3";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(TAM * 0.28, topo);
    ctx.lineTo(TAM * 0.72, topo);
    ctx.stroke();
    topo += 28;

    var baixoReservado = 190;
    var areaX = 70;
    var areaLargura = TAM - areaX * 2;
    var areaY = topo;
    var areaAltura = TAM - baixoReservado - areaY;

    var escala = Math.min(areaLargura / canvasOriginal.width, areaAltura / canvasOriginal.height);
    var wDesenho = canvasOriginal.width * escala;
    var hDesenho = canvasOriginal.height * escala;
    var xDesenho = areaX + (areaLargura - wDesenho) / 2;
    var yDesenho = areaY + (areaAltura - hDesenho) / 2;

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.25)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(xDesenho - 6, yDesenho - 6, wDesenho + 12, hDesenho + 12);
    ctx.restore();

    ctx.strokeStyle = "#0d1b2a";
    ctx.lineWidth = 3;
    ctx.strokeRect(xDesenho - 6, yDesenho - 6, wDesenho + 12, hDesenho + 12);
    ctx.drawImage(canvasOriginal, xDesenho, yDesenho, wDesenho, hDesenho);

    var legendaY = TAM - baixoReservado + 58;
    desenharTextoCentralizado(
      ctx, INSTA_LEGENDA, TAM / 2, legendaY, TAM - 140,
      "700 40px 'Poppins', 'Segoe UI', sans-serif", "#0d1b2a"
    );

    ctx.font = "600 32px 'Poppins', 'Segoe UI', sans-serif";
    ctx.fillStyle = "#1e8bc3";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(INSTA_HANDLE, TAM / 2, TAM - 58);

    return out;
  });
}

function baixarCanvas(canvasOriginal, nomeArquivo) {
  montarCardInstagram(canvasOriginal).then(function (canvasFinal) {
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

// Exporta apenas o cartão de uma figurinha (foto + nome + número).
function exportarFigurinha(cardEl, countryNome, nomeJogador) {
  confirmarDownload().then(function (ok) {
    if (!ok) return;
    capturarElemento(cardEl).then(function (canvas) {
      baixarCanvas(canvas, "figurinha-" + slugify(countryNome) + "-" + slugify(nomeJogador) + ".png");
    });
  });
}

// Exporta a grade inteira de figurinhas (a "seleção") da página atual.
function exportarSelecao(gridEl, countryNome) {
  confirmarDownload().then(function (ok) {
    if (!ok) return;
    capturarElemento(gridEl).then(function (canvas) {
      baixarCanvas(canvas, "selecao-" + slugify(countryNome) + ".png");
    });
  });
}

// Exporta a página inteira (tema do país + toda a grade de figurinhas).
function exportarPagina(pageEl, countryNome) {
  confirmarDownload().then(function (ok) {
    if (!ok) return;
    capturarElemento(pageEl).then(function (canvas) {
      baixarCanvas(canvas, "pagina-" + slugify(countryNome) + ".png");
    });
  });
}

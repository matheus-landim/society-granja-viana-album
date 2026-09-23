// Exportação de imagens (figurinha individual / seleção / página inteira)
// sempre com a marca d'água "Society Granja Viana" gravada na imagem final.

var MARCA_DAGUA = "Society Granja Viana";

function desenharMarcaDagua(canvas) {
  var ctx = canvas.getContext("2d");
  var w = canvas.width;
  var h = canvas.height;
  var faixaAltura = Math.max(28, Math.round(h * 0.055));

  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  ctx.fillRect(0, h - faixaAltura, w, faixaAltura);

  var fontSize = Math.max(14, Math.round(faixaAltura * 0.5));
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 " + fontSize + "px 'Poppins', 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(MARCA_DAGUA, w / 2, h - faixaAltura / 2);
  ctx.restore();

  return canvas;
}

function baixarCanvas(canvas, nomeArquivo) {
  desenharMarcaDagua(canvas);
  canvas.toBlob(function (blob) {
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
  capturarElemento(cardEl).then(function (canvas) {
    baixarCanvas(canvas, "figurinha-" + slugify(countryNome) + "-" + slugify(nomeJogador) + ".png");
  });
}

// Exporta a grade inteira de figurinhas (a "seleção") da página atual.
function exportarSelecao(gridEl, countryNome) {
  capturarElemento(gridEl).then(function (canvas) {
    baixarCanvas(canvas, "selecao-" + slugify(countryNome) + ".png");
  });
}

// Exporta a página inteira (tema do país + toda a grade de figurinhas).
function exportarPagina(pageEl, countryNome) {
  capturarElemento(pageEl).then(function (canvas) {
    baixarCanvas(canvas, "pagina-" + slugify(countryNome) + ".png");
  });
}

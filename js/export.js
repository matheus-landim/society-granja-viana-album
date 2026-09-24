// Exportação da foto de cada aluno no formato de card para Instagram:
// logo da escola + @handle no topo, foto preenchendo o resto do quadro.

var LOGO_URL = "assets/logo-gremio-cotia.png";
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
// cortar nada — garante que nenhum aluno fique sem cabeça no recorte).
function desenharImagemContain(ctx, img, x, y, w, h) {
  var escala = Math.min(w / img.width, h / img.height);
  var wDesenho = img.width * escala;
  var hDesenho = img.height * escala;
  var offsetX = x + (w - wDesenho) / 2;
  var offsetY = y + (h - hDesenho) / 2;
  ctx.drawImage(img, offsetX, offsetY, wDesenho, hDesenho);
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
// com o logo (em círculo) + @gremio_cotia, e a foto inteira (sem cortar
// nada, nunca — nem o jogador nem o rosto) preenchendo o resto do quadro.
function montarCardInstagram(imagemOuCanvas) {
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

    // Área da foto: mostra ela inteira, sem cortar nada.
    var fotoY = cabecalhoAltura;
    var fotoAltura = TAM - cabecalhoAltura;
    ctx.fillStyle = "#f2f2f2";
    ctx.fillRect(0, fotoY, TAM, fotoAltura);
    desenharImagemContain(ctx, imagemOuCanvas, 0, fotoY, TAM, fotoAltura);

    return out;
  });
}

function baixarCanvas(imagemOuCanvas, nomeArquivo) {
  montarCardInstagram(imagemOuCanvas).then(function (canvasFinal) {
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

function slugify(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "figurinha";
}

// Exporta só a foto real do jogador (sem a moldura/inputs do card), igual
// a um post do Instagram: logo + @gremio_cotia no topo, foto inteira
// (nunca cortada) embaixo.
function exportarFigurinha(fotoUrl, countryNome, nomeJogador) {
  confirmarDownload().then(function (ok) {
    if (!ok) return;
    carregarImagem(fotoUrl).then(function (img) {
      baixarCanvas(img, "figurinha-" + slugify(countryNome) + "-" + slugify(nomeJogador) + ".png");
    });
  });
}

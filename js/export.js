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

// Guarda a foto que está aberta no modal de zoom, pra saber o que baixar
// quando a pessoa clicar em "Baixar figurinha".
var zoomAtual = null;

// Abre o modal de zoom com a foto em tamanho grande. "nomeArquivo" já vem
// pronto (sem espaço/acento) pra virar o nome do arquivo baixado.
function abrirZoomFoto(fotoUrl, nomeArquivo, textoAlt) {
  var modal = document.getElementById("foto-zoom-modal");
  var img = document.getElementById("foto-zoom-img");
  if (!modal || !img) return;
  zoomAtual = { fotoUrl: fotoUrl, nomeArquivo: nomeArquivo };
  img.src = fotoUrl;
  img.alt = textoAlt || "Foto ampliada";
  modal.showModal();
}

document.addEventListener("DOMContentLoaded", function () {
  var modal = document.getElementById("foto-zoom-modal");
  if (!modal) return;

  document.getElementById("btn-fechar-zoom").addEventListener("click", function () {
    modal.close();
  });

  document.getElementById("btn-baixar-zoom").addEventListener("click", function () {
    if (!zoomAtual) return;
    carregarImagem(zoomAtual.fotoUrl).then(function (img) {
      baixarCanvas(img, zoomAtual.nomeArquivo + ".png");
    });
  });
});

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

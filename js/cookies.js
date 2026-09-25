// Aviso simples de cookies: mostra uma vez até a pessoa clicar em "Entendi".
document.addEventListener("DOMContentLoaded", function () {
  var aviso = document.getElementById("cookie-aviso");
  if (!aviso) return;

  var jaAceitou = false;
  try {
    jaAceitou = localStorage.getItem("cookies-aceitos") === "1";
  } catch (e) {
    jaAceitou = false;
  }

  if (!jaAceitou) aviso.hidden = false;

  document.getElementById("btn-aceitar-cookies").addEventListener("click", function () {
    aviso.hidden = true;
    try {
      localStorage.setItem("cookies-aceitos", "1");
    } catch (e) {
      // Sem acesso ao localStorage (modo privado, por exemplo): só esconde por essa visita.
    }
  });
});

// Login/logout com usuário fixo (sem cadastro).
// O "usuário" digitado é convertido num e-mail interno para o Firebase Auth.

var currentUser = null;

function usernameToEmail(username) {
  var clean = String(username || "").trim().toLowerCase().replace(/\s+/g, "");
  return clean + "@" + LOGIN_DOMAIN;
}

function login(username, password) {
  var email = usernameToEmail(username);
  return auth.signInWithEmailAndPassword(email, password);
}

function logout() {
  return auth.signOut();
}

auth.onAuthStateChanged(function (user) {
  currentUser = user;
  document.body.classList.toggle("logado", !!user);
  var loginBtn = document.getElementById("btn-login");
  var logoutBtn = document.getElementById("btn-logout");
  if (loginBtn) loginBtn.hidden = !!user;
  if (logoutBtn) logoutBtn.hidden = !user;
  if (typeof renderPagina === "function" && window.paginaAtual) {
    renderPagina(window.paginaAtual);
  }
});

document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("login-form");
  var erro = document.getElementById("login-erro");
  var modal = document.getElementById("login-modal");

  document.getElementById("btn-login").addEventListener("click", function () {
    modal.showModal();
  });

  document.getElementById("btn-logout").addEventListener("click", function () {
    logout();
  });

  document.getElementById("btn-fechar-login").addEventListener("click", function () {
    modal.close();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    erro.hidden = true;
    var username = document.getElementById("login-usuario").value;
    var senha = document.getElementById("login-senha").value;
    var btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.textContent = "Entrando...";
    login(username, senha)
      .then(function () {
        btn.disabled = false;
        btn.textContent = "Entrar";
        form.reset();
        modal.close();
      })
      .catch(function (err) {
        console.error(err);
        btn.disabled = false;
        btn.textContent = "Entrar";
        erro.hidden = false;
        erro.textContent = "Usuário ou senha incorretos.";
      });
  });
});

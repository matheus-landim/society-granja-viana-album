// Login/logout com usuário fixo (sem cadastro), via Supabase Auth.
// O "usuário" digitado é convertido num e-mail interno para o Supabase.

var currentUser = null;

function usernameToEmail(username) {
  var clean = String(username || "").trim().toLowerCase().replace(/\s+/g, "");
  return clean + "@" + LOGIN_DOMAIN;
}

function login(username, password) {
  return sbClient.auth.signInWithPassword({
    email: usernameToEmail(username),
    password: password
  });
}

function logout() {
  return sbClient.auth.signOut();
}

function aplicarEstadoAuth(session) {
  currentUser = session ? session.user : null;
  document.body.classList.toggle("logado", !!currentUser);
  var loginBtn = document.getElementById("btn-login");
  var logoutBtn = document.getElementById("btn-logout");
  if (loginBtn) loginBtn.hidden = !!currentUser;
  if (logoutBtn) logoutBtn.hidden = !currentUser;
  if (typeof renderPagina === "function" && window.paginaAtual) {
    renderPagina(window.paginaAtual);
  }
}

sbClient.auth.onAuthStateChange(function (_event, session) {
  aplicarEstadoAuth(session);
});

document.addEventListener("DOMContentLoaded", function () {
  sbClient.auth.getSession().then(function (res) {
    aplicarEstadoAuth(res.data.session);
  });

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
    login(username, senha).then(function (res) {
      btn.disabled = false;
      btn.textContent = "Entrar";
      if (res.error) {
        erro.hidden = false;
        erro.textContent = "Usuário ou senha incorretos.";
        return;
      }
      form.reset();
      modal.close();
    });
  });
});

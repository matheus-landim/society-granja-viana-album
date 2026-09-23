// ============================================================
// CONFIGURAÇÃO DO FIREBASE
// ============================================================
// Preencha com os dados do SEU projeto Firebase (veja o README.md,
// seção "Configurar o Firebase", para o passo a passo completo).
//
// Firebase Console > Configurações do projeto > Seus apps > app da Web
// ============================================================
var firebaseConfig = {
  apiKey: "COLE_AQUI_SUA_API_KEY",
  authDomain: "SEU-PROJETO.firebaseapp.com",
  projectId: "SEU-PROJETO",
  storageBucket: "SEU-PROJETO.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:xxxxxxxxxxxxxxxxxxxxxx"
};

// Sufixo usado para transformar o "usuário" digitado no login em um
// e-mail válido para o Firebase Authentication (ex: usuário "admin"
// vira "admin@society-granja-viana.app"). Não precisa mudar isso.
var LOGIN_DOMAIN = "society-granja-viana.app";

firebase.initializeApp(firebaseConfig);
var auth = firebase.auth();
var db = firebase.firestore();
var storage = firebase.storage();

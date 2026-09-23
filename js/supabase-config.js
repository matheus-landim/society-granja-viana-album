// ============================================================
// CONFIGURAÇÃO DO SUPABASE
// ============================================================
// Preencha com os dados do SEU projeto Supabase (veja o README.md,
// seção "Configurar o Supabase", para o passo a passo completo).
//
// Supabase Dashboard > Project Settings > API
// ============================================================
var SUPABASE_URL = "COLE_AQUI_A_URL_DO_SEU_PROJETO"; // ex: https://xxxxxxxx.supabase.co
var SUPABASE_ANON_KEY = "COLE_AQUI_A_ANON_PUBLIC_KEY";

// Sufixo usado para transformar o "usuário" digitado no login em um
// e-mail válido para o Supabase Auth (ex: usuário "admin" vira
// "admin@society-granja-viana.app"). Não precisa mudar isso.
var LOGIN_DOMAIN = "society-granja-viana.app";

var sbClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

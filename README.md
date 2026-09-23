# Álbum de Figurinhas — Society Granja Viana

Álbum de figurinhas digital para o campeonato interno, com uma página
temática para cada país/seleção: Alemanha, Argentina, Bélgica, Brasil,
Colômbia, Croácia, Espanha, Estados Unidos, França, Holanda, Inglaterra,
Japão, México, Portugal, Suécia e Uruguai.

- **Qualquer pessoa** pode abrir o link e folhear o álbum (setas ◀ ▶ ou o
  menu de países no topo).
- **Login único** (usuário/senha fixos, sem tela de cadastro) libera o modo
  de edição: enviar/trocar fotos, adicionar ou remover figurinhas, editar
  nome e número do jogador, trocar a foto de capa da página.
- **Exportar imagens**: qualquer visitante pode salvar uma figurinha
  individual, a seleção inteira (grade de figurinhas) ou a página inteira
  (com o tema do país) como PNG. Toda imagem exportada sai com a marca
  "**Society Granja Viana**" gravada no rodapé.

Site estático (HTML/CSS/JS puro, sem build). O armazenamento das fotos e
dos dados é feito no **Supabase** (Auth + Postgres + Storage), que tem
camada gratuita suficiente para esse uso. Um workflow do GitHub Actions
mantém o projeto Supabase ativo automaticamente (veja a seção
"Keep-alive" abaixo).

## 1. Criar o projeto no Supabase

1. Acesse https://supabase.com, crie uma conta e clique em **New project**.
2. Escolha um nome (ex: `society-granja-viana-album`), uma senha de banco
   (guarde-a, mas não é usada pelo site) e a região mais próxima
   (`South America (São Paulo)`).
3. Aguarde o projeto ficar pronto (leva 1-2 minutos).

## 2. Criar as tabelas, o bucket de fotos e as regras de segurança

1. No menu lateral, abra **SQL Editor > New query**.
2. Cole todo o conteúdo do arquivo `supabase/schema.sql` deste repositório
   e clique em **Run**. Isso cria:
   - as tabelas `paginas` e `figurinhas`;
   - o bucket de Storage `fotos` (público para leitura);
   - as regras de segurança (RLS): qualquer um pode **ler**, só quem
     estiver **logado** pode **editar**.

## 3. Ativar o login e criar o usuário único

1. Menu lateral → **Authentication → Providers** → confirme que
   **Email** está habilitado (vem ativado por padrão).
2. Em **Authentication → Providers → Email**, desligue a opção "Confirm
   email" (assim o usuário não precisa clicar em nenhum link de
   confirmação — é um login interno, sem cadastro público).
3. Menu lateral → **Authentication → Users** → **Add user** → **Create new
   user**.
   - **Email**: precisa terminar em `@society-granja-viana.app` (é o
     domínio interno usado pelo site) — ex: `admin@society-granja-viana.app`
   - **Password**: escolha uma senha forte
   - Marque **Auto Confirm User**
   - **Create user**

No site, quem for editar digita só `admin` no campo "Usuário" — o
`@society-granja-viana.app` é completado automaticamente pelo código.

## 4. Configurar o site

1. Menu lateral → **Project Settings (⚙️) → API**.
2. Copie a **Project URL** e a chave **anon public**.
3. Abra `js/supabase-config.js` neste repositório e cole os dois valores em
   `SUPABASE_URL` e `SUPABASE_ANON_KEY`.

## 5. Rodar localmente

Não tem build step, é só servir os arquivos estáticos:

```bash
python3 -m http.server 8080
```

Abra `http://localhost:8080`.

## 6. Publicar (hospedagem)

Qualquer host estático funciona:

- **Netlify / Vercel**: conecte este repositório e publique (sem comando
  de build, a pasta raiz já é o site).
- **GitHub Pages**: em Settings > Pages, publique a branch `main`, pasta raiz.
- **Cloudflare Pages**: mesma ideia, sem build.

## 7. Keep-alive (evitar o projeto Supabase pausar)

Projetos gratuitos do Supabase pausam automaticamente depois de cerca de
7 dias sem nenhuma requisição. Este repositório já vem com um workflow
(`.github/workflows/keep-supabase-alive.yml`) que faz uma consulta bem
leve ao banco a cada 3 dias, só para contar como atividade.

Para ativá-lo:

1. No GitHub, vá em **Settings > Secrets and variables > Actions >
   Variables** deste repositório.
2. Crie duas variáveis (não são secretas, são os mesmos valores públicos
   que já estão em `js/supabase-config.js`):
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
3. Pronto — o GitHub já roda o workflow sozinho no cronograma. Para testar
   na hora, vá em **Actions > Manter Supabase ativo > Run workflow**.

## Estrutura

```
index.html              Página única, com as 16 páginas do álbum controladas por JS
css/style.css            Tema visual, cores por país via CSS custom properties
js/supabase-config.js    Config do Supabase (preencher, passo 4)
js/countries.js          Lista dos 16 países + cores de cada bandeira
js/auth.js               Login/logout (usuário/senha fixo, sem cadastro)
js/album.js               Leitura/escrita das figurinhas e fotos no Supabase
js/export.js               Exportação de imagens (figurinha, seleção, página) com marca d'água
js/app.js                   Navegação entre países e renderização da página atual
supabase/schema.sql          Script único: tabelas + bucket + regras de segurança
.github/workflows/keep-supabase-alive.yml   Keep-alive automático (passo 7)
```

## Personalizações comuns

- **Trocar o texto da marca d'água**: edite a constante `MARCA_DAGUA` no
  topo de `js/export.js`.
- **Adicionar/remover um país**: edite o array `COUNTRIES` em
  `js/countries.js` (cada item tem `id`, `nome`, `bandeira` e as 3 `cores`
  usadas no degradê da página).
- **Trocar o login**: edite/crie o usuário em Supabase > Authentication >
  Users. Não existe tela de cadastro no site de propósito.

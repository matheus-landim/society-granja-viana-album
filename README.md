# Álbum de Figurinhas — Society Granja Viana

Álbum de figurinhas digital para o campeonato interno, com uma página
temática para cada país/seleção: Alemanha, Argentina, Bélgica, Brasil,
Colômbia, Croácia, Espanha, Estados Unidos, França, Holanda, Inglaterra,
Japão, México, Portugal, Suécia e Uruguai.

- **Tela inicial**: ao abrir o site (sem nenhum país selecionado na URL),
  aparece uma tela de boas-vindas com a explicação de como usar o álbum
  (tocar numa bandeira pra abrir a seleção, tocar numa figurinha pra ver
  a foto ampliada e baixar) e a grade com a bandeira de cada país. Tocar
  no logo/nome no topo volta pra essa tela a qualquer momento.
- **Qualquer pessoa** pode abrir o link e folhear o álbum (setas ◀ ▶ ou
  tocando na bandeira do país desejado, todas visíveis logo abaixo do
  cabeçalho). Uma tela de carregamento com o logo aparece enquanto os
  dados do Supabase não chegam.
- Cada página mostra só as figurinhas que já têm jogador (nome ou foto);
  slots vazios ficam escondidos para quem só está visitando, em estilo
  Panini: emblema do país, foto do time, faixa dourada com o nome, grade
  de figurinhas numeradas.
- **Login único** (usuário/senha fixos, sem tela de cadastro) libera o modo
  de edição: enviar/trocar a foto de cada jogador, editar nome e número
  da camisa, excluir um jogador (ícone 🗑 no canto da foto — apaga a foto
  do Storage e o registro), trocar a foto de capa da página, e adicionar
  mais jogadores (card "+ Adicionar jogador" no fim da grade) quando o
  time tiver mais de 11 jogadores.
- **Ver e baixar imagens**: qualquer visitante pode tocar numa figurinha
  para abrir a foto daquele aluno ampliada (zoom), com um botão "Baixar
  imagem" dentro do próprio zoom (não tem opção de baixar a seleção
  inteira). A imagem exportada sai como um card estilo Instagram: logo
  da Escola de Futebol Grêmio Cotia + `@gremio_cotia` no topo e a foto
  inteira (nunca cortada, nem o rosto) preenchendo o resto do quadro —
  tudo gravado na própria imagem.
- **Baixar PDF da página**: o botão "🖨️ Baixar PDF da página" (logo abaixo
  do título de cada seleção) abre a janela de impressão do navegador, já
  formatada pra caber numa folha A4 (é só escolher "Salvar como PDF" no
  destino). Sai só o conteúdo da página — sem menus, botões ou aviso de
  cookies.
- **Aba Momentos**: um botão fixo "📸 Momentos" ao lado das bandeiras, em
  qualquer página, abre uma galeria com fotos da comissão técnica
  (professores/árbitros) e dos momentos do campeonato. Toque numa foto
  pra ver ampliada e baixar, igual às figurinhas.
- **Patrocinadores**: cada seleção tem o seu próprio patrocinador (como
  na tradição do campeonato: Portugal/Fortland, Croácia/J Design,
  Bélgica/Amplios, Brasil/Society Granja Viana, etc), mostrado no fim da
  página. Fica escondido nas seleções sem patrocinador cadastrado.
- **Termos de Uso e Política de Privacidade**: páginas próprias
  (`termos.html` e `privacidade.html`, linkadas no rodapé) e um aviso de
  cookies que aparece na primeira visita, avisando que navegar no site
  implica aceitar o uso de cookies.

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
     estiver **logado** pode **editar**;
   - as 16 páginas já com as 11 figurinhas em branco de cada uma.

   > Se você já tinha rodado uma versão antiga deste script (sem as 11
   > figurinhas fixas), rode em vez disso o arquivo
   > `supabase/migracao-11-jogadores.sql` — ele atualiza o banco existente
   > para o novo formato.

3. Pra ativar o espaço dos patrocinadores, rode também o arquivo
   `supabase/patrocinadores.sql` (cria a tabela `patrocinadores`, com as
   mesmas regras de segurança: leitura pública, escrita só logado) e, em
   seguida, `supabase/patrocinador-por-pais.sql` (adiciona a coluna
   `country_id`, que faz cada seleção ter o seu próprio patrocinador).

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

Já vem pronto pra funcionar sozinho — o workflow usa os mesmos valores
públicos de `js/supabase-config.js` direto no arquivo (não precisa
configurar nenhuma secret). O GitHub já roda no cronograma automaticamente.
Para testar na hora, vá em **Actions > Manter Supabase ativo > Run workflow**.

Se você trocar de projeto Supabase no futuro, atualize a URL e a chave
tanto em `js/supabase-config.js` quanto em
`.github/workflows/keep-supabase-alive.yml`.

## Estrutura

```
index.html              Página única, com as 16 páginas do álbum controladas por JS
css/style.css            Tema visual, cores por país via CSS custom properties
js/supabase-config.js    Config do Supabase (preencher, passo 4)
js/countries.js          Lista dos 16 países + cores de cada bandeira
js/auth.js               Login/logout (usuário/senha fixo, sem cadastro)
js/album.js               Leitura/escrita das figurinhas e fotos no Supabase
js/export.js               Zoom da foto + exportação em card estilo Instagram (logo, @handle)
js/cookies.js               Aviso de cookies (mostra uma vez, guarda a escolha no localStorage)
js/momentos.js               Fotos da aba Momentos (comissão técnica + momentos do campeonato)
assets/logo-gremio-cotia.png  Logo usado no topo do card exportado
js/app.js                   Navegação entre países e renderização da página atual
termos.html                 Termos de Uso
privacidade.html            Política de Privacidade e cookies
supabase/schema.sql                        Script único: tabelas + bucket + regras + as 11 figurinhas de cada país
supabase/migracao-11-jogadores.sql          Migração para quem já tinha rodado uma versão antiga do schema
supabase/patrocinadores.sql                 Cria a tabela de patrocinadores (passo 2.3)
supabase/patrocinador-por-pais.sql          Um patrocinador por seleção, em vez de lista genérica (passo 2.3)
.github/workflows/keep-supabase-alive.yml   Keep-alive automático (passo 7)
```

## Personalizações comuns

- **Trocar o @ ou o logo do card exportado**: edite as constantes
  `INSTA_HANDLE` e `LOGO_URL` no topo de `js/export.js` (troque também o
  arquivo `assets/logo-gremio-cotia.png` se quiser usar outro logo).
- **Adicionar/remover um país**: edite o array `COUNTRIES` em
  `js/countries.js` (cada item tem `id`, `nome`, `codigo` — usado para
  buscar a bandeira real em flagcdn.com — e as 3 `cores` usadas nos
  detalhes da página) e ajuste a lista de países no `supabase/schema.sql`.
- **Mudar de 11 para outro número de jogadores**: ajuste o
  `generate_series(1, 11)` em `supabase/schema.sql` (ou na migração) para
  o número desejado.
- **Trocar o login**: edite/crie o usuário em Supabase > Authentication >
  Users. Não existe tela de cadastro no site de propósito.
- **Adicionar/editar o patrocinador de uma seleção**: não tem tela de
  edição no site — edite direto a tabela `patrocinadores` em Supabase >
  Table Editor (colunas `country_id` — o id do país, ex: `portugal` —,
  `nome`, `link`, `logo_url` e `ordem`). Cada `country_id` só pode
  aparecer uma vez (um patrocinador por seleção).
- **Adicionar/trocar fotos da aba Momentos**: também não tem tela de
  edição — suba a foto em Supabase > Storage > bucket `fotos` > pasta
  `momentos/`, pegue a URL pública e adicione (ou troque) uma entrada em
  `MOMENTOS.profs` ou `MOMENTOS.campeonato`, no arquivo `js/momentos.js`.

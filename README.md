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
dos dados é feito no **Firebase** (Auth + Firestore + Storage), que tem
camada gratuita suficiente para esse uso.

## 1. Criar o projeto no Firebase

1. Acesse https://console.firebase.google.com e crie um novo projeto
   (ex: `society-granja-viana-album`).
2. Em **Build > Authentication**, clique em "Get started" e ative o
   provedor **E-mail/senha**.
3. Ainda em Authentication, aba **Users**, clique em **Add user** e crie o
   login único do álbum. O e-mail precisa terminar com
   `@society-granja-viana.app` (é o domínio interno usado pelo app — veja
   `js/firebase-config.js`), por exemplo:
   - E-mail: `admin@society-granja-viana.app`
   - Senha: escolha uma senha forte

   Na tela de login do site, a pessoa vai digitar só `admin` no campo
   "Usuário" (o `@society-granja-viana.app` é adicionado automaticamente).
4. Em **Build > Firestore Database**, clique em "Create database" (modo
   produção, escolha a região mais próxima, ex: `southamerica-east1`).
5. Em **Build > Storage**, clique em "Get started" para criar o bucket de
   armazenamento das fotos.
6. Em **Configurações do projeto (⚙️) > Geral**, na seção "Seus apps",
   clique em **Web (`</>`)**, dê um nome ao app e copie o objeto
   `firebaseConfig` gerado.

## 2. Configurar o site

1. Abra `js/firebase-config.js` e cole os valores copiados no passo
   anterior dentro de `firebaseConfig`.
2. Publique as regras de segurança (protegem quem pode editar):
   - No Firebase Console, vá em **Firestore Database > Regras**, cole o
     conteúdo de `firebase/firestore.rules` e publique.
   - Vá em **Storage > Regras**, cole o conteúdo de
     `firebase/storage.rules` e publique.
3. Libere o CORS do Storage (necessário para os botões "Salvar
   seleção"/"Salvar página inteira" funcionarem, pois eles fotografam a
   tela e precisam ler as fotos do bucket). Com a
   [gcloud CLI](https://cloud.google.com/sdk/docs/install) instalada e
   logada no mesmo projeto:

   ```bash
   gsutil cors set firebase/cors.json gs://SEU-PROJETO.appspot.com
   ```

## 3. Rodar localmente

Não tem build step, é só servir os arquivos estáticos:

```bash
python3 -m http.server 8080
```

Abra `http://localhost:8080`.

## 4. Publicar (hospedagem)

Qualquer host estático funciona, por exemplo:

- **Firebase Hosting** (mais simples, já que você já tem o projeto):
  ```bash
  npm install -g firebase-tools
  firebase login
  firebase init hosting   # aponte a pasta pública para a raiz deste repo
  firebase deploy
  ```
- **Netlify / Vercel**: conecte este repositório e publique (não precisa
  de comando de build, a pasta raiz já é o site).
- **GitHub Pages**: em Settings > Pages, publique a branch principal, pasta
  raiz.

## Estrutura

```
index.html            Página única, com as 16 páginas do álbum controladas por JS
css/style.css          Tema visual, cores por país via CSS custom properties
js/firebase-config.js  Config do Firebase (preencher, passo 2)
js/countries.js        Lista dos 16 países + cores de cada bandeira
js/auth.js             Login/logout (usuário/senha fixo, sem cadastro)
js/album.js            Leitura/escrita das figurinhas e fotos no Firestore/Storage
js/export.js           Exportação de imagens (figurinha, seleção, página) com marca d'água
js/app.js              Navegação entre países e renderização da página atual
firebase/firestore.rules  Regras de segurança do banco
firebase/storage.rules    Regras de segurança das fotos
firebase/cors.json        Configuração de CORS do bucket de fotos
```

## Personalizações comuns

- **Trocar o texto da marca d'água**: edite a constante `MARCA_DAGUA` no
  topo de `js/export.js`.
- **Adicionar/remover um país**: edite o array `COUNTRIES` em
  `js/countries.js` (cada item tem `id`, `nome`, `bandeira` e as 3 `cores`
  usadas no degradê da página).
- **Trocar o login**: crie/edite o usuário em Firebase Console >
  Authentication > Users. Não existe tela de cadastro no site de propósito.

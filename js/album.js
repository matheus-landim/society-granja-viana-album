// Leitura/escrita dos dados de cada página (país) no Firestore + Storage.

function uuid() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return "f" + Date.now() + Math.random().toString(16).slice(2);
}

function paginaRef(countryId) {
  return db.collection("paginas").doc(countryId);
}

// Retorna a página com um formato padrão mesmo se ainda não existir no banco.
function carregarPagina(countryId) {
  return paginaRef(countryId)
    .get()
    .then(function (snap) {
      if (snap.exists) {
        var data = snap.data();
        return {
          capaUrl: data.capaUrl || null,
          capaPath: data.capaPath || null,
          figurinhas: data.figurinhas || []
        };
      }
      return { capaUrl: null, capaPath: null, figurinhas: [] };
    });
}

function salvarFigurinhas(countryId, figurinhas) {
  return paginaRef(countryId).set({ figurinhas: figurinhas }, { merge: true });
}

function salvarCapa(countryId, capaUrl, capaPath) {
  return paginaRef(countryId).set({ capaUrl: capaUrl, capaPath: capaPath }, { merge: true });
}

function adicionarFigurinhaVazia(countryId, figurinhas) {
  var nova = { id: uuid(), nome: "", numero: "", fotoUrl: null, fotoPath: null };
  var atualizadas = figurinhas.concat([nova]);
  return salvarFigurinhas(countryId, atualizadas).then(function () {
    return atualizadas;
  });
}

function removerFigurinha(countryId, figurinhas, figId) {
  var alvo = figurinhas.filter(function (f) {
    return f.id === figId;
  })[0];
  var atualizadas = figurinhas.filter(function (f) {
    return f.id !== figId;
  });
  var deletarFoto = alvo && alvo.fotoPath ? storage.ref(alvo.fotoPath).delete().catch(function () {}) : Promise.resolve();
  return deletarFoto.then(function () {
    return salvarFigurinhas(countryId, atualizadas);
  }).then(function () {
    return atualizadas;
  });
}

function editarCampoFigurinha(countryId, figurinhas, figId, campo, valor) {
  var atualizadas = figurinhas.map(function (f) {
    if (f.id !== figId) return f;
    var novo = Object.assign({}, f);
    novo[campo] = valor;
    return novo;
  });
  return salvarFigurinhas(countryId, atualizadas).then(function () {
    return atualizadas;
  });
}

function enviarFotoFigurinha(countryId, figurinhas, figId, file) {
  var path = "fotos/" + countryId + "/" + figId + "-" + Date.now() + ".jpg";
  var ref = storage.ref(path);
  return ref.put(file).then(function () {
    return ref.getDownloadURL();
  }).then(function (url) {
    var atualizadas = figurinhas.map(function (f) {
      if (f.id !== figId) return f;
      return Object.assign({}, f, { fotoUrl: url, fotoPath: path });
    });
    return salvarFigurinhas(countryId, atualizadas).then(function () {
      return atualizadas;
    });
  });
}

function enviarCapa(countryId, file) {
  var path = "fotos/" + countryId + "/_capa-" + Date.now() + ".jpg";
  var ref = storage.ref(path);
  return ref.put(file).then(function () {
    return ref.getDownloadURL();
  }).then(function (url) {
    return salvarCapa(countryId, url, path).then(function () {
      return { capaUrl: url, capaPath: path };
    });
  });
}

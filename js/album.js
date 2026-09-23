// Leitura/escrita dos dados de cada página (país) no Supabase
// (tabelas "paginas"/"figurinhas" + bucket de Storage "fotos").
// Cada país tem exatamente 11 figurinhas fixas (ordem 1 a 11), já
// semeadas pelo supabase/schema.sql.

function mapFigurinha(row) {
  return {
    id: row.id,
    ordem: row.ordem,
    nome: row.nome || "",
    numero: row.numero || "",
    fotoUrl: row.foto_url || null,
    fotoPath: row.foto_path || null
  };
}

function carregarPagina(countryId) {
  return Promise.all([
    sbClient.from("paginas").select("capa_url,capa_path").eq("country_id", countryId).maybeSingle(),
    sbClient.from("figurinhas").select("*").eq("country_id", countryId).order("ordem", { ascending: true })
  ]).then(function (resultados) {
    var paginaRes = resultados[0];
    var figurinhasRes = resultados[1];
    return {
      capaUrl: (paginaRes.data && paginaRes.data.capa_url) || null,
      capaPath: (paginaRes.data && paginaRes.data.capa_path) || null,
      figurinhas: (figurinhasRes.data || []).map(mapFigurinha)
    };
  });
}

function salvarCapa(countryId, capaUrl, capaPath) {
  return sbClient.from("paginas").update({ capa_url: capaUrl, capa_path: capaPath }).eq("country_id", countryId);
}

function editarCampoFigurinha(figId, campo, valor) {
  var patch = {};
  patch[campo] = valor;
  return sbClient.from("figurinhas").update(patch).eq("id", figId);
}

function enviarFotoFigurinha(countryId, figId, file) {
  var path = countryId + "/" + figId + "-" + Date.now() + ".jpg";
  return sbClient.storage
    .from("fotos")
    .upload(path, file, { upsert: true })
    .then(function (res) {
      if (res.error) throw res.error;
      var url = sbClient.storage.from("fotos").getPublicUrl(path).data.publicUrl;
      return sbClient
        .from("figurinhas")
        .update({ foto_url: url, foto_path: path })
        .eq("id", figId)
        .then(function () {
          return { fotoUrl: url, fotoPath: path };
        });
    });
}

function enviarCapa(countryId, file) {
  var path = countryId + "/_capa-" + Date.now() + ".jpg";
  return sbClient.storage
    .from("fotos")
    .upload(path, file, { upsert: true })
    .then(function (res) {
      if (res.error) throw res.error;
      var url = sbClient.storage.from("fotos").getPublicUrl(path).data.publicUrl;
      return salvarCapa(countryId, url, path).then(function () {
        return { capaUrl: url, capaPath: path };
      });
    });
}

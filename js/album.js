// Leitura/escrita dos dados de cada página (país) no Supabase
// (tabelas "paginas"/"figurinhas" + bucket de Storage "fotos").

function mapFigurinha(row) {
  return {
    id: row.id,
    nome: row.nome || "",
    numero: row.numero || "",
    fotoUrl: row.foto_url || null,
    fotoPath: row.foto_path || null
  };
}

// Retorna a página com um formato padrão mesmo se ainda não existir no banco
// (isso é normal: a linha só é criada quando alguém logado edita a página).
function carregarPagina(countryId) {
  return Promise.all([
    sbClient.from("paginas").select("capa_url,capa_path").eq("country_id", countryId).maybeSingle(),
    sbClient.from("figurinhas").select("*").eq("country_id", countryId).order("criado_em", { ascending: true })
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

// Garante que existe uma linha em "paginas" para este país antes de gravar
// algo relacionado a ela (foto de capa, ou a primeira figurinha).
function garantirLinhaPagina(countryId) {
  return sbClient.from("paginas").upsert({ country_id: countryId }, { onConflict: "country_id" });
}

function adicionarFigurinhaVazia(countryId) {
  return garantirLinhaPagina(countryId)
    .then(function () {
      return sbClient.from("figurinhas").insert({ country_id: countryId, nome: "", numero: "" }).select().single();
    })
    .then(function (res) {
      if (res.error) throw res.error;
      return mapFigurinha(res.data);
    });
}

function removerFigurinha(fig) {
  var deletarFoto = fig.fotoPath ? sbClient.storage.from("fotos").remove([fig.fotoPath]) : Promise.resolve();
  return Promise.resolve(deletarFoto).then(function () {
    return sbClient.from("figurinhas").delete().eq("id", fig.id);
  });
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
  return garantirLinhaPagina(countryId)
    .then(function () {
      return sbClient.storage.from("fotos").upload(path, file, { upsert: true });
    })
    .then(function (res) {
      if (res.error) throw res.error;
      var url = sbClient.storage.from("fotos").getPublicUrl(path).data.publicUrl;
      return sbClient
        .from("paginas")
        .update({ capa_url: url, capa_path: path })
        .eq("country_id", countryId)
        .then(function () {
          return { capaUrl: url, capaPath: path };
        });
    });
}

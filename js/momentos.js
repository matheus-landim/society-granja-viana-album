// Fotos da aba "Momentos": comissão técnica (professores) e momentos do
// campeonato. Curadoria manual — pra adicionar/trocar uma foto, é só subir
// o arquivo no bucket "fotos" do Supabase (pasta "momentos/") e colocar a
// URL pública aqui.
var MOMENTOS_BASE = "https://uggdjpzryotxiogysymi.supabase.co/storage/v1/object/public/fotos/momentos";

var MOMENTOS = {
  profs: [
    { url: MOMENTOS_BASE + "/profs-1.jpg", alt: "Professor orientando um jogador durante o jogo" },
    { url: MOMENTOS_BASE + "/profs-2.jpg", alt: "Árbitro do campeonato em campo" },
    { url: MOMENTOS_BASE + "/profs-3.jpg", alt: "Professor conferindo o horário à beira do campo" },
    { url: MOMENTOS_BASE + "/profs-4.jpg", alt: "Professor amparando um jogador" }
  ],
  campeonato: [
    { url: MOMENTOS_BASE + "/campeonato-1.jpg", alt: "Lance de um jogo do campeonato" }
  ]
};

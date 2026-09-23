-- Rode este script inteiro de uma vez no Supabase, em SQL Editor > New query.
-- Ele cria as tabelas do álbum (com 11 figurinhas fixas por país, já
-- semeadas), o bucket de fotos, e as regras de segurança (qualquer um
-- pode LER o álbum; só usuário autenticado pode EDITAR).

-- Tabela de páginas (uma linha por país)
create table if not exists paginas (
  country_id text primary key,
  capa_url text,
  capa_path text
);

-- Tabela de figurinhas (jogadores) de cada página.
-- "ordem" é a posição fixa (1 a 11) da figurinha na grade — não muda.
-- "numero" é a camisa do jogador, livre para editar (pode ser igual ou
-- diferente da ordem).
create table if not exists figurinhas (
  id uuid primary key default gen_random_uuid(),
  country_id text not null references paginas(country_id) on delete cascade,
  ordem int not null,
  nome text not null default '',
  numero text not null default '',
  foto_url text,
  foto_path text,
  criado_em timestamptz not null default now(),
  unique (country_id, ordem)
);

create index if not exists figurinhas_country_id_idx on figurinhas(country_id);

alter table paginas enable row level security;
alter table figurinhas enable row level security;

-- Leitura pública (qualquer visitante pode navegar pelo álbum)
create policy "paginas_select_publico" on paginas for select using (true);
create policy "figurinhas_select_publico" on figurinhas for select using (true);

-- Escrita só para quem estiver logado (o usuário único do álbum)
create policy "paginas_insert_autenticado" on paginas for insert with check (auth.role() = 'authenticated');
create policy "paginas_update_autenticado" on paginas for update using (auth.role() = 'authenticated');
create policy "paginas_delete_autenticado" on paginas for delete using (auth.role() = 'authenticated');

create policy "figurinhas_insert_autenticado" on figurinhas for insert with check (auth.role() = 'authenticated');
create policy "figurinhas_update_autenticado" on figurinhas for update using (auth.role() = 'authenticated');
create policy "figurinhas_delete_autenticado" on figurinhas for delete using (auth.role() = 'authenticated');

-- Bucket de Storage para as fotos (público para leitura)
insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', true)
on conflict (id) do nothing;

create policy "fotos_select_publico" on storage.objects for select using (bucket_id = 'fotos');
create policy "fotos_insert_autenticado" on storage.objects for insert with check (bucket_id = 'fotos' and auth.role() = 'authenticated');
create policy "fotos_update_autenticado" on storage.objects for update using (bucket_id = 'fotos' and auth.role() = 'authenticated');
create policy "fotos_delete_autenticado" on storage.objects for delete using (bucket_id = 'fotos' and auth.role() = 'authenticated');

-- Semente: cria as 16 páginas e 11 figurinhas em branco (ordem 1 a 11)
-- para cada uma delas.
insert into paginas (country_id) values
  ('alemanha'), ('argentina'), ('belgica'), ('brasil'), ('colombia'), ('croacia'),
  ('espanha'), ('eua'), ('franca'), ('holanda'), ('inglaterra'), ('japao'),
  ('mexico'), ('portugal'), ('suecia'), ('uruguai')
on conflict (country_id) do nothing;

insert into figurinhas (country_id, ordem, numero, nome)
select c.country_id, n, n::text, ''
from (values
  ('alemanha'), ('argentina'), ('belgica'), ('brasil'), ('colombia'), ('croacia'),
  ('espanha'), ('eua'), ('franca'), ('holanda'), ('inglaterra'), ('japao'),
  ('mexico'), ('portugal'), ('suecia'), ('uruguai')
) as c(country_id)
cross join generate_series(1, 11) as n
on conflict (country_id, ordem) do nothing;

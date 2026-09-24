-- Tabela de patrocinadores (lista única, aparece em todas as páginas).
create table if not exists patrocinadores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  link text,
  logo_url text,
  ordem int not null default 0,
  criado_em timestamptz not null default now()
);

create index if not exists patrocinadores_ordem_idx on patrocinadores(ordem);

alter table patrocinadores enable row level security;

drop policy if exists "patrocinadores_select_publico" on patrocinadores;
create policy "patrocinadores_select_publico" on patrocinadores for select using (true);

drop policy if exists "patrocinadores_insert_autenticado" on patrocinadores;
create policy "patrocinadores_insert_autenticado" on patrocinadores for insert with check (auth.role() = 'authenticated');
drop policy if exists "patrocinadores_update_autenticado" on patrocinadores;
create policy "patrocinadores_update_autenticado" on patrocinadores for update using (auth.role() = 'authenticated');
drop policy if exists "patrocinadores_delete_autenticado" on patrocinadores;
create policy "patrocinadores_delete_autenticado" on patrocinadores for delete using (auth.role() = 'authenticated');

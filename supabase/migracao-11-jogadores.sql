-- Rode isto UMA VEZ no SQL Editor do projeto que você já criou, para
-- migrar do esquema antigo (número livre de figurinhas, sem semente) para
-- o novo: exatamente 11 jogadores fixos por página, na ordem 1 a 11.
--
-- Como o álbum acabou de ser criado (provavelmente ainda sem fotos/nomes
-- reais cadastrados), este script apaga as figurinhas existentes e recria
-- as 11 de cada país do zero. Se você já tiver cadastrado jogadores de
-- verdade e não quiser perder, me avise antes de rodar isto.

alter table figurinhas add column if not exists ordem int;

delete from figurinhas;

alter table figurinhas alter column ordem set not null;

alter table figurinhas
  drop constraint if exists figurinhas_country_id_ordem_key,
  add constraint figurinhas_country_id_ordem_key unique (country_id, ordem);

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

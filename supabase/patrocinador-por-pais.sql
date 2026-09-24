-- Muda de "lista genérica de patrocinadores" (mesma faixa de logos em
-- todas as páginas) pra "um patrocinador por seleção" — como sempre foi
-- na tradição do campeonato (ex: Portugal/Fortland, Croácia/J Design,
-- Bélgica/Amplios, Brasil/Society Granja Viana).
--
-- Pré-requisito: já ter rodado supabase/patrocinadores.sql antes.

alter table patrocinadores add column if not exists country_id text references paginas(country_id);
alter table patrocinadores drop constraint if exists patrocinadores_country_id_key;
alter table patrocinadores add constraint patrocinadores_country_id_key unique (country_id);

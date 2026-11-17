-- 100 fonds d'invitation : 10 styles × 10 coloris. L'identifiant du fond devient « style--coloris »
-- (ex. wax--braise). La liste exacte des fonds est validée par l'application (config/themes.ts) ;
-- la base vérifie seulement le format.

alter table public.events drop constraint if exists events_theme_check;

-- Les anciens identifiants (4 fonds sans coloris) deviennent « <style>--origine »
update public.events
   set theme = theme || '--origine'
 where theme in ('faso-dan-fani', 'bogolan', 'tiebele', 'indigo');

alter table public.events alter column theme set default 'faso-dan-fani--origine';

alter table public.events
  add constraint events_theme_check
  check (char_length(theme) <= 40 and theme ~ '^[a-z]+(-[a-z]+)*--[a-z]+$');

-- Les images créées par l'IA ont été abandonnées : l'adresse d'image personnalisée n'est plus utilisée.
update public.events set cover_image_url = null where cover_image_url is not null;

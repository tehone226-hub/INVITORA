-- Nouvelle collection de fonds (17 novembre 2026) : les étoffes sont retirées.
-- 10 styles (aura, arche, feuillage, deco, marbre, ondes, confettis, etoiles, sahel, epure)
-- × 10 coloris (ivoire, rose, sauge, argile, azur, lavande, nuit, emeraude, bordeaux, cendre).
-- Les invitations déjà créées reçoivent le fond le plus proche de la nouvelle collection
-- (même correspondance que LEGACY_THEMES dans config/themes.ts).

update public.events
   set theme = case split_part(theme, '--', 1)
                 when 'faso-dan-fani' then 'feuillage--ivoire'
                 when 'bogolan'       then 'ondes--ivoire'
                 when 'tiebele'       then 'arche--argile'
                 when 'indigo'        then 'etoiles--nuit'
                 when 'wax'           then 'confettis--rose'
                 when 'senoufo'       then 'arche--argile'
                 when 'adinkra'       then 'epure--cendre'
                 when 'savane'        then 'sahel--argile'
                 when 'coton'         then 'aura--rose'
                 when 'ardoise'       then 'deco--emeraude'
               end
 where split_part(theme, '--', 1) in
       ('faso-dan-fani', 'bogolan', 'tiebele', 'indigo', 'wax', 'senoufo', 'adinkra', 'savane', 'coton', 'ardoise');

alter table public.events alter column theme set default 'feuillage--ivoire';

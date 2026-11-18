-- Collection de fonds du 17 novembre 2026 (images fournies par le porteur du projet).
-- Les invitations créées avec un fond des anciennes collections reçoivent le fond par défaut
-- de leur type d'événement (même choix que lib/event-types.ts).

update public.events
   set theme = case event_type
                 when 'mariage'      then 'jardin--ivoire'
                 when 'dot'          then 'vannerie--zebu'
                 when 'bapteme'      then 'arche--florale'
                 when 'anniversaire' then 'vannerie--indigo'
                 when 'funerailles'  then 'vannerie--sable'
                 when 'entreprise'   then 'vannerie--cacao'
                 when 'soutenance'   then 'shweshwe--marmites'
                 else 'dentelle--grenat'
               end
 where theme not in ('jardin--ivoire', 'arche--florale', 'dentelle--grenat', 'satin--bordeaux', 'broderie--rouge',
                     'vannerie--sable', 'vannerie--cacao', 'vannerie--indigo', 'vannerie--zebu',
                     'shweshwe--marmites', 'shweshwe--zebu');

alter table public.events alter column theme set default 'jardin--ivoire';

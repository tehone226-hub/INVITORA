import type { Metadata } from "next";
import { ProsePage } from "@/components/prose-page";

export const metadata: Metadata = { title: "Confidentialité" };

export default function PrivacyPage() {
  return (
    <ProsePage eyebrow="Vos données" title="Politique de confidentialité" intro="Invitora collecte le strict nécessaire pour faire fonctionner vos invitations.">
      <div>
        <h2>Données des organisateurs</h2>
        <ul className="mt-2">
          <li>Adresse e-mail (connexion par lien sécurisé ou par Google), nom et téléphone si vous les indiquez.</li>
          <li>Informations de vos événements : textes, date, lieu, programme, images.</li>
          <li>Historique de vos paiements (montant, formule, statut). Vos numéros Mobile Money ne sont pas conservés par Invitora : le paiement se fait sur la page sécurisée de SasPay.</li>
        </ul>
      </div>
      <div>
        <h2>Données des invités</h2>
        <p className="mt-1.5">
          Lorsqu&apos;un invité répond, nous enregistrons son nom, sa réponse, le nombre de personnes et, s&apos;il le souhaite, son téléphone et
          un message. Ces informations sont visibles uniquement par l&apos;organisateur de l&apos;événement.
        </p>
      </div>
      <div>
        <h2>Utilisation</h2>
        <p className="mt-1.5">
          Vos données servent uniquement à créer, afficher et partager vos invitations et à suivre les réponses. Elles ne sont jamais vendues.
          Les textes que vous saisissez peuvent être transmis à nos fournisseurs d&apos;intelligence artificielle (Anthropic, Google) pour rédiger
          vos invitations et créer les fonds d&apos;image.
        </p>
      </div>
      <div>
        <h2>Sécurité</h2>
        <p className="mt-1.5">
          Chaque invitation a une adresse unique impossible à deviner et n&apos;est pas indexée par les moteurs de recherche. L&apos;accès aux
          données est cloisonné : un organisateur ne voit que ses propres événements.
        </p>
      </div>
      <div>
        <h2>Durée de conservation et suppression</h2>
        <p className="mt-1.5">
          Vous pouvez archiver une invitation à tout moment depuis votre espace. Pour supprimer définitivement votre compte et vos données,
          contactez-nous depuis le centre d&apos;aide.
        </p>
      </div>
      <p className="text-sm text-ink/50">Dernière mise à jour : novembre 2026.</p>
    </ProsePage>
  );
}

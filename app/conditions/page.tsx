import type { Metadata } from "next";
import { PLAN_DURATION_MONTHS } from "@/config/plans";
import { ProsePage } from "@/components/prose-page";

export const metadata: Metadata = { title: "Conditions d'utilisation" };

export default function TermsPage() {
  return (
    <ProsePage eyebrow="Conditions" title="Conditions d'utilisation" intro="En utilisant Invitora, vous acceptez les conditions suivantes.">
      <div>
        <h2>Le service</h2>
        <p className="mt-1.5">
          Invitora permet de créer des invitations digitales, de les partager par lien et de recueillir les réponses des invités. La création et
          l&apos;aperçu sont gratuits ; le partage nécessite une formule payante.
        </p>
      </div>
      <div>
        <h2>Formules et paiement</h2>
        <ul className="mt-2">
          <li>Les prix sont indiqués en francs CFA (FCFA), toutes taxes comprises.</li>
          <li>Le paiement est unique, sans abonnement, et active la formule pour {PLAN_DURATION_MONTHS} mois sur l&apos;invitation choisie.</li>
          <li>La formule s&apos;active uniquement après confirmation du paiement par l&apos;opérateur.</li>
        </ul>
      </div>
      <div>
        <h2>Votre contenu</h2>
        <p className="mt-1.5">
          Vous restez responsable des textes, noms et images que vous publiez. Ils doivent respecter la loi et les personnes. Les textes proposés
          par l&apos;IA sont des suggestions : relisez-les avant de partager. Invitora peut désactiver une invitation au contenu illicite ou
          offensant.
        </p>
      </div>
      <div>
        <h2>Disponibilité</h2>
        <p className="mt-1.5">
          Nous faisons notre possible pour que le service soit disponible en permanence, sans pouvoir le garantir en cas de panne d&apos;un
          prestataire (hébergement, opérateur mobile, réseau).
        </p>
      </div>
      <p className="text-sm text-ink/50">Dernière mise à jour : novembre 2026.</p>
    </ProsePage>
  );
}

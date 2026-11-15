import type { Metadata } from "next";
import { PLAN_DURATION_MONTHS, PLANS, formatPrice } from "@/config/plans";
import { ButtonLink } from "@/components/button-link";
import { ProsePage } from "@/components/prose-page";

export const metadata: Metadata = {
  title: "Centre d'aide",
  description: "Questions fréquentes sur Invitora : création, paiement Orange Money et Moov Money, partage WhatsApp, réponses des invités.",
};

const FAQ = [
  {
    q: "Comment créer mon invitation ?",
    a: "Cliquez sur « Créer mon invitation », connectez-vous avec votre e-mail (un lien vous est envoyé, sans mot de passe), puis remplissez trois petites étapes : l'événement, le lieu et le style. L'IA rédige le titre, le message et le programme. Vous pouvez tout modifier ensuite.",
  },
  {
    q: "Est-ce gratuit ?",
    a: `La création et l'aperçu sont gratuits. Pour activer le lien et le partager à vos invités, choisissez une formule : Essentiel (${formatPrice(PLANS.essentiel.price)}), Célébration (${formatPrice(PLANS.celebration.price)}) ou Prestige Pro (${formatPrice(PLANS.prestige.price)}). C'est un paiement unique, sans abonnement.`,
  },
  {
    q: "Comment payer ?",
    a: "Par Orange Money ou Moov Money, sur la page de paiement sécurisée de notre partenaire SasPay. Validez le paiement sur votre téléphone : la formule s'active automatiquement dès que l'opérateur le confirme, en général en moins d'une minute.",
  },
  {
    q: "Combien de temps mon invitation reste-t-elle en ligne ?",
    a: `${PLAN_DURATION_MONTHS} mois après le paiement. Un nouveau paiement prolonge la durée.`,
  },
  {
    q: "Comment envoyer l'invitation à mes invités ?",
    a: "Depuis votre espace, cliquez sur « Partager sur WhatsApp » : choisissez un contact ou un groupe, le message et le lien sont déjà prêts. Vous pouvez aussi copier le lien et le coller où vous voulez.",
  },
  {
    q: "Comment mes invités répondent-ils ?",
    a: "Ils ouvrent le lien, sans application à installer ni compte à créer, et choisissent « Je serai présent(e) », « Peut-être » ou « Je ne pourrai pas venir ». Vous voyez les réponses arriver en temps réel et pouvez les exporter dans Excel.",
  },
  {
    q: "Mon invitation est-elle visible sur Google ?",
    a: "Non. Chaque invitation a une adresse unique impossible à deviner, et elle n'est jamais indexée par les moteurs de recherche. Seules les personnes qui ont reçu le lien peuvent l'ouvrir.",
  },
  {
    q: "Puis-je écrire l'invitation en mooré ou en dioula ?",
    a: "Oui : choisissez la langue au moment de la création. Relisez toujours le texte proposé par l'IA avant de le partager.",
  },
];

export default function HelpPage() {
  return (
    <ProsePage eyebrow="Centre d'aide" title="Questions fréquentes" intro="Tout ce qu'il faut savoir pour inviter vos proches en quelques minutes.">
      {FAQ.map((item) => (
        <div key={item.q}>
          <h2>{item.q}</h2>
          <p className="mt-1.5">{item.a}</p>
        </div>
      ))}
      <div className="rounded-2xl bg-sand/60 p-5">
        <h2>Besoin d&apos;aide ?</h2>
        <p className="mt-1.5">
          Le support WhatsApp arrive bientôt. En attendant, connectez-vous à votre espace : chaque étape y est expliquée.
        </p>
        <ButtonLink href="/tableau-de-bord" className="mt-4">
          Mon espace
        </ButtonLink>
      </div>
    </ProsePage>
  );
}

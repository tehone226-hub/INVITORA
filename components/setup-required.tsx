import { Notice } from "@/components/ui/notice";

/** Affiché quand la base Neon n'est pas encore branché (.env.local). */
export function SetupRequired({ what = "cette page" }: { what?: string }) {
  return (
    <section className="mx-auto w-full max-w-xl px-5 py-16">
      <Notice tone="warning" title="Configuration requise">
        <p className="mt-1">
          Pour utiliser {what}, la base de données Neon doit être branchée. Renseignez{" "}
          <code className="rounded bg-white/70 px-1">NEON_DATA_API_URL</code> et{" "}
          <code className="rounded bg-white/70 px-1">NEON_AUTH_BASE_URL</code> dans le fichier{" "}
          <code className="rounded bg-white/70 px-1">.env.local</code>, puis relancez le site. Le guide pas à pas est
          dans <code className="rounded bg-white/70 px-1">docs/MISE-EN-ROUTE.md</code>.
        </p>
      </Notice>
    </section>
  );
}

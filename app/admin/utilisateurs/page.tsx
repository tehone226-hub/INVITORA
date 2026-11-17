import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminSkeleton, FilterBar, Pill } from "@/components/admin/ui";
import { ActionButton } from "@/components/dashboard/action-button";
import { cleanSearch, listUsers } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { formatShortDate } from "@/lib/format";
import { setUserRole } from "../actions";

export const metadata: Metadata = { title: "Utilisateurs — Administration", robots: { index: false } };

export default function UsersPage(props: PageProps<"/admin/utilisateurs">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Users searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Users({ searchParams }: { searchParams: PageProps<"/admin/utilisateurs">["searchParams"] }) {
  const me = await requireAdmin();
  const q = cleanSearch((await searchParams).q);
  const users = await listUsers(q);

  return (
    <div className="space-y-5">
      <h1 className="text-[28px] leading-tight font-extrabold sm:text-[32px]">Utilisateurs</h1>
      <FilterBar basePath="/admin/utilisateurs" q={q} placeholder="Nom ou e-mail" />
      <div className="overflow-x-auto rounded-xl border border-ink/10 bg-white shadow-card">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-ink/10 bg-paper text-[11px] tracking-wider text-ink/55 uppercase">
            <tr>
              <th className="px-4 py-3 font-bold">Utilisateur</th>
              <th className="px-4 py-3 font-bold">Inscription</th>
              <th className="px-4 py-3 font-bold">Invitations</th>
              <th className="px-4 py-3 font-bold">Rôle</th>
              <th className="px-4 py-3 font-bold">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/8">
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink/55">
                  Aucun utilisateur trouvé.
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u.id} className="align-top">
                <td className="px-4 py-3">
                  <p className="font-bold">{u.full_name || "—"}</p>
                  <p className="text-ink/60">{u.email}</p>
                  {u.phone && <p className="text-xs text-ink/50">{u.phone}</p>}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{formatShortDate(u.created_at)}</td>
                <td className="px-4 py-3">{u.eventCount}</td>
                <td className="px-4 py-3">{u.role === "admin" ? <Pill tone="good">Admin</Pill> : <Pill>Organisateur</Pill>}</td>
                <td className="px-4 py-3 text-right">
                  {u.id !== me.id &&
                    (u.role === "admin" ? (
                      <ActionButton action={setUserRole.bind(null, u.id, "user")} confirm={`Retirer le rôle administrateur à ${u.email} ?`}>
                        Retirer admin
                      </ActionButton>
                    ) : (
                      <ActionButton action={setUserRole.bind(null, u.id, "admin")} confirm={`Donner le rôle administrateur à ${u.email} ?`}>
                        Rendre admin
                      </ActionButton>
                    ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

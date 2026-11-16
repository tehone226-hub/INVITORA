import { NextResponse, type NextRequest } from "next/server";
import { isBackendConfigured } from "@/lib/env";
import { getAuth } from "@/lib/neon/auth";

/** Déconnexion (formulaire POST, pour éviter les déconnexions par simple lien). */
export async function POST(request: NextRequest) {
  if (isBackendConfigured) {
    await getAuth().signOut();
  }
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}

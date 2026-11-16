import { getAuth } from "@/lib/neon/auth";

/**
 * Relais vers Neon Auth (retours OAuth, rafraîchissement de session).
 * Les gestionnaires sont créés à la demande : le build n'exige pas les variables d'environnement.
 */
type Ctx = { params: Promise<{ path: string[] }> };
const handlers = () => getAuth().handler() as unknown as Record<"GET" | "POST" | "PUT" | "PATCH" | "DELETE", (req: Request, ctx: Ctx) => Promise<Response>>;

export const GET = (req: Request, ctx: Ctx) => handlers().GET(req, ctx);
export const POST = (req: Request, ctx: Ctx) => handlers().POST(req, ctx);
export const PUT = (req: Request, ctx: Ctx) => handlers().PUT(req, ctx);
export const PATCH = (req: Request, ctx: Ctx) => handlers().PATCH(req, ctx);
export const DELETE = (req: Request, ctx: Ctx) => handlers().DELETE(req, ctx);

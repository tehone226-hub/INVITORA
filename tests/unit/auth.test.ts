import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("react", async (original) => ({ ...(await original<typeof import("react")>()), cache: <T>(fn: T) => fn }));
vi.mock("@/lib/neon/data", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/neon/auth", () => ({ getAuth: vi.fn() }));
vi.mock("@/lib/neon/sql", () => ({ db: vi.fn(), rows: vi.fn() }));
vi.mock("@/lib/env", () => ({ isBackendConfigured: false, publicEnv: {} }));

const { safeNextPath } = await import("@/lib/auth");

describe("redirection après connexion (anti-redirection ouverte)", () => {
  it("accepte les chemins internes", () => {
    expect(safeNextPath("/tableau-de-bord")).toBe("/tableau-de-bord");
    expect(safeNextPath("/tableau-de-bord/evenements/abc?x=1#y")).toBe("/tableau-de-bord/evenements/abc?x=1#y");
  });

  it.each([
    "//evil.com",
    "/\\evil.com",
    "/\t/evil.com",
    "/\n/evil.com",
    "/\u0000/evil.com",
    "https://evil.com",
    "javascript:alert(1)",
    "evil.com",
    "",
  ])("refuse %j", (value) => {
    expect(safeNextPath(value)).toBe("/tableau-de-bord");
  });

  it("refuse une valeur qui n'est pas du texte ou trop longue", () => {
    expect(safeNextPath(undefined)).toBe("/tableau-de-bord");
    expect(safeNextPath(42)).toBe("/tableau-de-bord");
    expect(safeNextPath("/" + "a".repeat(400))).toBe("/tableau-de-bord");
  });

  it("utilise le repli fourni", () => {
    expect(safeNextPath("//evil.com", "/")).toBe("/");
  });
});

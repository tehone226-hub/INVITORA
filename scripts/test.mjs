// Lance vitest depuis un chemin dont la lettre de disque est en majuscule.
// Sous Windows, un dossier ouvert en « c:\ » fait charger vitest deux fois
// (« failed to find the current suite »).
import { spawn } from "node:child_process";
import path from "node:path";

const cwd = process.platform === "win32" ? process.cwd().replace(/^[a-z]:/, (d) => d.toUpperCase()) : process.cwd();
const bin = path.join(cwd, "node_modules", "vitest", "vitest.mjs");
const child = spawn(process.execPath, [bin, "run", ...process.argv.slice(2)], { cwd, stdio: "inherit" });
child.on("exit", (code) => process.exit(code ?? 1));

// Checks that the important server files exist, are in the right folder, and export the right method.
// Run from the project folder:   node scripts/check-routes.mjs
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

// [file, methods the file must export, what it is for]
const ROUTES = [
  ["app/api/subscription/route.ts", ["GET"], "YOUR OWN plan (banner, account page, menu)"],
  ["app/api/admin/subscription/route.ts", ["POST"], "ADMIN: give / extend / end a plan"],
  ["app/api/admin/users/route.ts", ["GET"], "admin: list of users with plans"],
  ["app/api/admin/stats/route.ts", ["GET"], "admin: dashboard numbers"],
  ["app/api/usage/route.ts", ["GET"], "daily usage for the menu / dashboard"],
  ["app/api/me/route.ts", ["GET"], "who is logged in"],
  ["app/api/waitlist/route.ts", ["POST"], "waitlist form"],
  ["app/api/tools/magic/route.ts", ["POST"], "Magic blueprint"],
  ["app/api/tools/magic/image/route.ts", ["GET"], "image proxy"],
  ["app/api/tools/image/route.ts", ["POST"], "image tool"],
];

const FILES = [
  "lib/subscription.ts", "lib/use-subscription.ts", "lib/usage.ts", "lib/admin.ts",
  "lib/payment.ts", "components/magic/plan-banner.tsx", "components/magic/plan-card.tsx",
];

const read = (f) => (fs.existsSync(path.join(root, f)) ? fs.readFileSync(path.join(root, f), "utf8") : null);
let problems = 0;
const say = (ok, msg) => {
  if (!ok) problems++;
  console.log(`${ok ? "[OK]     " : "[PROBLEM]"} ${msg}`);
};

console.log(`Checking project in: ${root}\n`);

for (const [file, methods, what] of ROUTES) {
  const src = read(file);
  if (src === null) {
    say(false, `${file}  is MISSING  (${what})`);
    continue;
  }
  const missing = methods.filter((m) => !new RegExp(`export\\s+(async\\s+)?function\\s+${m}\\b`).test(src));
  if (missing.length) {
    const got = ["GET", "POST", "PUT", "DELETE"].filter((m) => new RegExp(`export\\s+(async\\s+)?function\\s+${m}\\b`).test(src));
    say(false, `${file}  must export ${missing.join("/")} but exports ${got.join("/") || "nothing"}  (${what})`);
  } else {
    say(true, `${file}  exports ${methods.join("/")}`);
  }
}

// The two files named "subscription/route.ts" are the ones that get mixed up. Say it plainly.
const admin = read("app/api/admin/subscription/route.ts");
const own = read("app/api/subscription/route.ts");
if (admin && admin.includes("getMySubscription")) {
  say(false, "app/api/admin/subscription/route.ts contains the USER route (getMySubscription). The two files are swapped or overwritten.");
}
if (own && own.includes("adminDb")) {
  say(false, "app/api/subscription/route.ts contains the ADMIN route (adminDb). The two files are swapped or overwritten.");
}

console.log("");
for (const f of FILES) say(read(f) !== null, `${f}  ${read(f) !== null ? "exists" : "is MISSING"}`);

// Empty or export-less route/page/layout files make `npm run build` fail ("... is not a module").
console.log("");
const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return walk(full);
    return ["route.ts", "page.tsx", "layout.tsx"].includes(e.name) ? [full] : [];
  });
const appDir = path.join(root, "app");
const specials = fs.existsSync(appDir) ? walk(appDir) : [];
const notModules = specials.filter((f) => !/^export\s/m.test(fs.readFileSync(f, "utf8")));
for (const f of notModules) {
  say(false, `${path.relative(root, f)}  is EMPTY or has no export. Delete it (it breaks the build).`);
}
if (notModules.length === 0) say(true, `${specials.length} route/page/layout files: all are real modules`);

console.log(
  problems === 0
    ? "\nAll good. If something still fails, restart `npm run dev` / redeploy and try again."
    : `\n${problems} problem(s) found. Fix each line marked [PROBLEM]: copy the file again from the zip into EXACTLY the path shown, or delete it if the line says so.`
);
process.exit(problems === 0 ? 0 : 1);

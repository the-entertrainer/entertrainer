import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
const root = resolve(".vercel/output/static");
test(
  "production cache contains the actual Velocity document, payload and all quality textures",
  { skip: !existsSync(`${root}/sw.js`) },
  () => {
    const sw = readFileSync(`${root}/sw.js`, "utf8");
    const entries = [...sw.matchAll(/url:"([^"]+)"/g)].map((match) => match[1]);
    assert.ok(
      entries.includes("engage/velocity"),
      "offline navigation needs its own prerendered document",
    );
    assert.ok(
      entries.includes("/"),
      "global fallback must refer to a cached document",
    );
    for (const file of readdirSync("public/velocity/textures"))
      assert.ok(
        entries.includes(`velocity/textures/${file}`),
        `uncached texture: ${file}`,
      );
    const html = readFileSync(`${root}/engage/velocity/index.html`, "utf8");
    for (const [, url] of html.matchAll(
      /(?:src|href)="(\/_nuxt\/[^"?]+\.(?:js|css))"/g,
    ))
      assert.ok(
        entries.includes(url.slice(1)),
        `uncached shell dependency: ${url}`,
      );
    if (existsSync(`${root}/engage/velocity/_payload.json`))
      assert.ok(
        entries.includes("engage/velocity/_payload.json"),
        "prerendered Nuxt payload must work offline",
      );
  },
);

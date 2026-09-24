import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import optimizer from "next/dist/server/image-optimizer.js";
const { imageOptimizer } = optimizer;
import config from "next/dist/server/config-shared.js";
const { defaultConfig } = config;
import { readFileSync } from "node:fs";
import semver from "next/dist/compiled/semver/index.js";
const lock = JSON.parse(
  readFileSync(new URL("../package-lock.json", import.meta.url), "utf8"),
);
const next = JSON.parse(
  readFileSync(
    new URL("../node_modules/next/package.json", import.meta.url),
    "utf8",
  ),
);

test("Next and sharp retain the patched AVIF dependency baseline", () => {
  // 16.3.4 restores AVIF support with sharp >= 0.35.4 (Next PR #97949).
  assert.equal(next.version, "16.3.4");
  assert.equal(lock.packages["node_modules/next"].version, "16.3.4");
  assert.ok(semver.gte(sharp.versions.sharp, "0.35.4"));
  assert.ok(semver.gte(lock.packages["node_modules/sharp"].version, "0.35.4"));
});

test("ordinary PNG and AVIF images still resize through Next image optimization", async () => {
  for (const format of ["png", "avif"]) {
    const buffer = await sharp({
      create: { width: 128, height: 96, channels: 3, background: "#336699" },
    })
      .toFormat(format)
      .toBuffer();
    for (const href of ["/image." + format, "/renamed.jpg?format=png"]) {
      const result = await imageOptimizer(
        { buffer, etag: "test", cacheControl: "max-age=0" },
        { href, width: 64, quality: 75, mimeType: "image/webp" },
        defaultConfig,
        { isDev: false, silent: true },
      );
      const metadata = await sharp(result.buffer).metadata();
      assert.equal(metadata.width, 64);
      assert.equal(metadata.format, "webp");
    }
  }
});

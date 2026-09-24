import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
const source = readFileSync(
  new URL("../public/sw.js", import.meta.url),
  "utf8",
);

function worker(fetcher, cached = new Response("fallback")) {
  const handlers = {};
  const entries = new Map();
  const deleted = [];
  let installed = false;
  const cache = {
    put: async (key, response) => entries.set(key, response),
    match: async () => cached,
  };
  runInNewContext(source, {
    URL,
    Response,
    fetch: fetcher,
    caches: {
      open: async () => cache,
      keys: async () => ["workbox-old", "pages", "unrelated-cache"],
      delete: async (key) => deleted.push(key),
    },
    self: {
      location: { origin: "https://example.test" },
      addEventListener: (name, handler) => {
        handlers[name] = handler;
      },
      skipWaiting: async () => {
        installed = true;
      },
      clients: { claim: async () => {} },
    },
  });
  return {
    entries,
    deleted,
    installed: () => installed,
    event: (name) => {
      let pending;
      handlers[name]({
        waitUntil: (promise) => {
          pending = promise;
        },
      });
      return pending;
    },
    request: (overrides = {}) => {
      let response;
      handlers.fetch({
        request: {
          url: "https://example.test/",
          method: "GET",
          mode: "navigate",
          ...overrides,
        },
        respondWith: (promise) => {
          response = promise;
        },
      });
      return response;
    },
  };
}
test("installation caches only a successful HTML fallback", async () => {
  const w = worker(
    async () =>
      new Response("<html>offline</html>", {
        headers: { "content-type": "text/html" },
      }),
  );
  await w.event("install");
  assert.equal(w.entries.size, 1);
  assert.equal(w.entries.has("/offline.html"), true);
  assert.equal(w.installed(), true);
});
test("failed installation never activates an unavailable fallback", async () => {
  for (const response of [
    new Response("error", { status: 502 }),
    new Response("{}"),
  ]) {
    const w = worker(async () => response);
    await assert.rejects(w.event("install"));
    assert.equal(w.installed(), false);
  }
});
test("gateway failures and network errors show the cached page", async () => {
  for (const status of [502, 503, 504, null]) {
    const w = worker(async () => {
      if (status === null) throw new Error("offline");
      return new Response("gateway", { status });
    });
    assert.equal(await (await w.request()).text(), "fallback");
  }
});
test("success, authorization failures and 404 retain their real responses", async () => {
  for (const status of [200, 401, 403, 404, 500]) {
    const w = worker(async () => new Response("original", { status }));
    const response = await w.request();
    assert.equal(response.status, status);
    assert.equal(await response.text(), "original");
  }
});
test("API, assets, external requests and submissions are not intercepted", () => {
  const w = worker(() => {
    throw new Error("must not fetch");
  });
  for (const request of [
    { url: "https://example.test/api/profile" },
    { mode: "cors" },
    { url: "https://other.test/" },
    { method: "POST" },
  ])
    assert.equal(w.request(request), undefined);
});
test("missing fallback retains gateway status", async () => {
  // Explicitly use null because undefined selects the default cached response.
  const empty = worker(
    async () => new Response("gateway", { status: 503 }),
    null,
  );
  assert.equal((await empty.request()).status, 503);
});
test("activation clears old worker/page caches and keeps unrelated caches", async () => {
  const w = worker(async () => new Response(""));
  await w.event("activate");
  assert.deepEqual(w.deleted, ["workbox-old", "pages"]);
});

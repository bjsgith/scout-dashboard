import assert from "node:assert/strict";
import test from "node:test";

import {
  configuredPort,
  isAllowedHost,
  isAllowedRequestHost,
} from "../lib/host-validation";

test("uses port 3000 by default and honors a custom PORT", () => {
  assert.equal(configuredPort({}), "3000");
  assert.equal(configuredPort({ PORT: "4317" }), "4317");
});

test("allows only the two supported loopback host names", () => {
  assert.equal(isAllowedHost("127.0.0.1:3000", "3000"), true);
  assert.equal(isAllowedHost("localhost:3000", "3000"), true);
  assert.equal(isAllowedHost("127.0.0.1:4317", "4317"), true);
  assert.equal(isAllowedHost("localhost:4317", "4317"), true);
});

test("rejects missing, malformed, foreign, and suffix-trick hosts", () => {
  const rejectedHosts = [
    null,
    "",
    "localhost",
    "localhost:",
    "localhost:3001",
    "LOCALHOST:3000",
    "[::1]:3000",
    "0.0.0.0:3000",
    "attacker.example:3000",
    "localhost.attacker.example:3000",
    "127.0.0.1.attacker.example:3000",
    "localhost:3000.attacker.example",
    "localhost:3000, attacker.example:3000",
  ];

  for (const host of rejectedHosts) {
    assert.equal(isAllowedHost(host, "3000"), false, String(host));
  }
});

test("rejects forwarded-host attempts even with a valid Host", () => {
  for (const [name, value] of [
    ["x-forwarded-host", "attacker.example:3000"],
    ["forwarded", "for=127.0.0.1;host=attacker.example:3000"],
  ]) {
    const headers = new Headers({ host: "localhost:3000", [name]: value });
    assert.equal(isAllowedRequestHost(headers, "3000"), false, name);
  }
});

test("accepts direct and Next-normalized requests with a valid raw Host", () => {
  const headers = new Headers({ host: "localhost:4317" });
  assert.equal(isAllowedRequestHost(headers, "4317"), true);

  headers.set("x-forwarded-host", "localhost:4317");
  assert.equal(isAllowedRequestHost(headers, "4317"), true);
});

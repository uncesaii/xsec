// Live HackerOne integration test. Hits the real API endpoint.
//
// Gated behind XSEC_H1_LIVE=1 so a default `pnpm test` never reaches
// the network even when local creds are present. When you do want to
// run it:
//
//   env XSEC_H1_LIVE=1 pnpm --filter @xsec/core test src/h1/client.live.test.ts
//
// or:
//
//   env XSEC_H1_LIVE=1 H1_API_IDENTIFIER=… H1_API_TOKEN=… \
//     pnpm --filter @xsec/core test src/h1/client.live.test.ts
//
// Without XSEC_H1_LIVE=1, every assertion in this file is skipped.

import { describe, it, expect } from "vitest";
import { H1Client } from "./client.js";
import { loadH1Credentials } from "./credentials.js";

const liveEnabled = process.env["XSEC_H1_LIVE"] === "1";

describe.skipIf(!liveEnabled)("h1 live — payments/balance", () => {
  it("returns 200 with the configured identifier", async () => {
    const creds = loadH1Credentials();
    const client = new H1Client(creds);
    const data = await client.get<{ data: { id: string } }>("/v1/hackers/payments/balance");
    expect(data.data).toBeDefined();
  }, 15_000);
});

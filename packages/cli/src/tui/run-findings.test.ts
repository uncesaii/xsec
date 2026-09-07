import { describe, expect, it } from "vitest";
import {
  type ChatEntry,
} from "./chat/types.js";
import {
  runFindingsFromEntries,
  runtimeFindingFromRun,
  type RunFinding,
} from "./chat-screen.js";

/** Minimal ChatEntry factory. Only the fields `runFindingsFromEntries` reads. */
function entry(
  text: string,
  extra: Partial<ChatEntry> = {},
): ChatEntry {
  return {
    id: `e-${Math.random().toString(36).slice(2, 10)}`,
    kind: "tool",
    text,
    turn: 1,
    success: true,
    ...extra,
  };
}

describe("runFindingsFromEntries", () => {
  it("returns an empty list when no save_finding entries exist", () => {
    const out = runFindingsFromEntries([
      entry("bash", { text: "bash" }),
      entry("save_finding", { success: false }),
    ]);
    expect(out).toEqual([]);
  });

  it("extracts title, severity, and persisted id from a save_finding tool call", () => {
    const out = runFindingsFromEntries([
      entry("save_finding", {
        toolArgs: "high wordpress: Outdated WordPress Version",
        detail: "saved F-abc123",
      }),
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      title: "Outdated WordPress Version",
      severity: "high",
      id: "F-abc123",
    });
  });

  it("carries category/location/description from rich card metadata", () => {
    // Live turn populates the rich-card fields on the entry; restored
    // sessions also go through restoredToolCardFields. Both paths end up
    // here, so a single test exercises the merge.
    const out = runFindingsFromEntries([
      entry("save_finding", {
        toolArgs: "medium security-misconfiguration: Missing security.txt",
        detail: "saved F-1",
        findingCategory: "security-misconfiguration",
        findingLocation: "https://smdc.com",
        findingDescription: "The site lacks a security.txt file at /.well-known/.",
      }),
    ]);
    expect(out[0]).toMatchObject({
      title: "Missing security.txt",
      severity: "medium",
      id: "F-1",
      category: "security-misconfiguration",
      location: "https://smdc.com",
      description: "The site lacks a security.txt file at /.well-known/.",
    });
  });

  it("skips failed save_finding calls (entry.success === false)", () => {
    const out = runFindingsFromEntries([
      entry("save_finding", {
        toolArgs: "low tool-misconfiguration: A finding",
        detail: "saved F-x",
        success: false,
      }),
    ]);
    expect(out).toEqual([]);
  });

  it("leaves id undefined when the result one-liner has no 'saved <id>'", () => {
    // A restored session whose result text was not stored has only the
    // toolArgs one-liner. The row stays non-clickable (no id) but the
    // title still shows.
    const out = runFindingsFromEntries([
      entry("save_finding", {
        toolArgs: "info other: Just a title",
        detail: "(restored, no result text)",
      }),
    ]);
    expect(out[0]).toMatchObject({
      title: "Just a title",
      severity: "info",
      id: undefined,
    });
  });
});

describe("RunFinding shape (right-pane in-memory handoff)", () => {
  // The point of the in-memory handoff is that the detail screen can
  // render a current-run finding without a DB round-trip. The slim shape
  // carries the four displayable fields; the rest of the Finding schema
  // is hydrated by the DB-backed loader on a restored session.
  it("carries the slim fields the detail screen renders", () => {
    const r: RunFinding = {
      title: "WAF Does Not Cover All Attack Vectors",
      severity: "medium",
      id: "F-2",
      category: "waf-bypass",
      location: "https://smdc.com",
      description: "Edge rules miss XSS payloads on /search.",
    };
    expect(Object.keys(r).sort()).toEqual([
      "category",
      "description",
      "id",
      "location",
      "severity",
      "title",
    ]);
  });
});

describe("runtimeFindingFromRun", () => {
  it("lifts a slim finding into a partial Finding for the detail screen", () => {
    const f = runtimeFindingFromRun({
      title: "Outdated WordPress Version",
      severity: "high",
      id: "F-abc",
      category: "wordpress",
      location: "https://smdc.com",
      description: "WP 7.0.2 has known vulns.",
    });
    expect(f.id).toBe("F-abc");
    expect(f.title).toBe("Outdated WordPress Version");
    expect(f.severity).toBe("high");
    expect(f.category).toBe("wordpress");
    expect(f.description).toBe("WP 7.0.2 has known vulns.");
    // Placeholders for the schema-required fields the screen tolerates
    // as em-dash / empty when missing.
    expect(f.status).toBe("discovered");
    expect(f.templateId).toBe("runtime-fallback");
    expect(f.evidence).toEqual({ request: "", response: "" });
  });

  it("falls back to 'pending' when no id is known yet", () => {
    const f = runtimeFindingFromRun({
      title: "Bare finding",
      severity: "low",
    });
    expect(f.id).toBe("pending");
    // "low" is a valid Severity, so it stays — the EM_DASH fallback is
    // only for the literal empty string the slim parsing can leave.
    expect(f.severity).toBe("low");
    expect(f.category).toBe("info");
  });
});

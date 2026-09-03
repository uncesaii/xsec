import type { ScanReport } from "@xsec/shared";

export function formatJson(report: ScanReport): string {
  return JSON.stringify(report, null, 2);
}

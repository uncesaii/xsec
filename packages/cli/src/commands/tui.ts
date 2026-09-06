import type { Command } from "commander";
import chalk from "chalk";

const BINARY_NAME = (() => {
  const argv1 = process.argv[1] ?? "";
  const base = argv1.split(/[\\/]/).pop() ?? "";
  const stem = base.replace(/\.(js|ts|mjs|cjs)$/i, "");
  if (stem === "x" || stem === "0") return stem;
  return "xsec";
})();

export function registerTuiCommand(program: Command): void {
  program
    .command("tui")
    .alias("watch")
    .description("Open the unified engagement control plane (Bun-only)")
    .action(async () => {
      const { isBunRuntime } = await import("../tui/runtime.js");
      if (isBunRuntime()) {
        // OpenTUI is Bun-specific; defer this module on Node so the fallback
        // remains usable in a plain npm install.
        const { showOpenTuiHome } = await import("../tui/run.js");
        await showOpenTuiHome();
        return;
      }

      // Node cannot host the OpenTUI control plane.
      console.log("");
      console.log(`  ${chalk.bold(`${BINARY_NAME} tui`)} — the engagement control plane needs Bun.`);
      console.log("");
      console.log(`  ${chalk.dim("Install the standalone binary (Bun runtime baked in):")}`);
      console.log(`    curl -fsSL https://raw.githubusercontent.com/uncesaii/xsec/main/install.sh | bash`);
      console.log("");
      process.exit(1);
    });
}

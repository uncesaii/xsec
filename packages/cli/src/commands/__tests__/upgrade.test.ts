import { describe, expect, it } from "vitest";
import { buildUpgradeEnv, UPGRADE_ENV_ALLOWLIST } from "../upgrade.js";

describe("buildUpgradeEnv", () => {
  it("never forwards provider keys or other ambient secrets", () => {
    const env = buildUpgradeEnv(
      {
        PATH: "/usr/bin",
        HOME: "/home/op",
        ANTHROPIC_API_KEY: "sk-ant-secret",
        OPENAI_API_KEY: "sk-secret",
        NVIDIA_API_KEY: "nvapi-secret",
        OPENROUTER_API_KEY: "sk-or-secret",
        ZEN_API_KEY: "zen-secret",
        AWS_SECRET_ACCESS_KEY: "aws-secret",
        GITHUB_TOKEN: "gh-secret",
        XSEC_CHATGPT_OAUTH_REFRESH_TOKEN: "refresh-secret",
      },
      {},
    );
    expect(env).toEqual({ PATH: "/usr/bin", HOME: "/home/op" });
    for (const value of Object.values(env)) {
      expect(value).not.toMatch(/secret/);
    }
  });

  it("carries the allowlisted shell/proxy vars the installer needs", () => {
    const env = buildUpgradeEnv(
      {
        PATH: "/usr/bin",
        HTTPS_PROXY: "http://proxy:8080",
        https_proxy: "http://proxy:8080",
        NO_PROXY: "localhost",
        TMPDIR: "/tmp",
        LANG: "en_US.UTF-8",
      },
      {},
    );
    expect(env).toMatchObject({
      PATH: "/usr/bin",
      HTTPS_PROXY: "http://proxy:8080",
      NO_PROXY: "localhost",
      TMPDIR: "/tmp",
      LANG: "en_US.UTF-8",
    });
  });

  it("applies --version/--install-dir overrides on top", () => {
    const env = buildUpgradeEnv(
      { PATH: "/usr/bin", XSEC_VERSION: "v0.1.0" },
      { version: "v0.14.0", installDir: "/opt/xsec" },
    );
    expect(env["XSEC_VERSION"]).toBe("v0.14.0");
    expect(env["XSEC_INSTALL_DIR"]).toBe("/opt/xsec");
  });

  it("omits allowlisted keys that are unset (no empty-string exports)", () => {
    const env = buildUpgradeEnv({ PATH: "/usr/bin" }, {});
    expect("HOME" in env).toBe(false);
    expect("XSEC_VERSION" in env).toBe(false);
  });

  it("stays a tight list — every entry is documented installer surface", () => {
    // If you add a var here, the upgrade child (and transitively
    // install.sh) can read it: keep it to shell/proxy/tmp/XSEC_* only.
    for (const key of UPGRADE_ENV_ALLOWLIST) {
      expect(key).toMatch(/^(PATH|HOME|USER|TERM|LANG|LC_ALL|TMPDIR|TMP|TEMP|HTTPS?_PROXY|NO_PROXY|https?_proxy|no_proxy|XSEC_(VERSION|INSTALL_DIR))$/);
    }
  });
});

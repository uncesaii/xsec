/**
 * Recently used models, persisted to `~/.xsec/recent-models.json`.
 *
 * Tracks the last 5 model IDs the operator selected so they appear
 * at the top of the /model picker.
 */

import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { homeStateDir } from "@xsec/shared";

const RECENT_MODELS_FILENAME = "recent-models.json";
const FILE_MODE = 0o600;
const DIR_MODE = 0o700;
const MAX_RECENT = 5;

export function recentModelsFilePath(homeDir?: string): string {
  return join(homeStateDir(homeDir), RECENT_MODELS_FILENAME);
}

export function loadRecentModels(homeDir?: string): string[] {
  const filePath = recentModelsFilePath(homeDir);
  try {
    const content = readFileSync(filePath, "utf8");
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return parsed.slice(0, MAX_RECENT);
    }
    return [];
  } catch {
    return [];
  }
}

export function saveRecentModels(ids: string[], homeDir?: string): boolean {
  const filePath = recentModelsFilePath(homeDir);
  try {
    const dir = dirname(filePath);
    mkdirSync(dir, { recursive: true, mode: DIR_MODE });
    const data = JSON.stringify(ids.slice(0, MAX_RECENT));
    writeFileSync(filePath, data, { mode: FILE_MODE });
    chmodSync(dir, DIR_MODE);
    return true;
  } catch {
    return false;
  }
}

export function addRecentModel(id: string, homeDir?: string): string[] {
  const recent = loadRecentModels(homeDir);
  const updated = [id, ...recent.filter((i) => i !== id)].slice(0, MAX_RECENT);
  saveRecentModels(updated, homeDir);
  return updated;
}
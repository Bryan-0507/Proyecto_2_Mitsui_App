import "server-only";
import { access } from "node:fs/promises";
import { join } from "node:path";

// artifacts/ is git-ignored and imported locally; pages check it before reading.
export async function hasArtifacts(files: string[]) {
  try {
    await Promise.all(files.map((file) => access(join(process.cwd(), "artifacts", file))));
    return true;
  } catch {
    return false;
  }
}

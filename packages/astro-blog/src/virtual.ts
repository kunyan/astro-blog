import type { ResolvedOptions } from "./options.js";

export function generateConfigSource(config: ResolvedOptions): string {
  return `export default ${JSON.stringify(config)};\n`;
}

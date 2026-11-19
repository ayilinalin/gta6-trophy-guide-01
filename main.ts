// Entry point for the GTA VI trophy guide (gta6-trophy-guide-01).
// Copies app/ and screenshots/ into MAKEFUN_OUTPUT_DIR (default /output) and writes
// /output/dossier.json via buildDossier from ./vendor/makefun-frontend.ts.
// Node 22, standard library only, erasable TypeScript: run as `node main.ts`.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = resolve(fileURLToPath(new URL('.', import.meta.url)));
const outputDir = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');

function emptyDirectory(dir: string): void {
  mkdirSync(dir, { recursive: true });
  for (const child of readdirSync(dir)) {
    rmSync(join(dir, child), { recursive: true, force: true });
  }
}

function copyEntry(name: string): void {
  const from = join(repoRoot, name);
  const to = join(outputDir, name);
  if (!existsSync(from)) throw new Error('missing in repo: ' + name);
  cpSync(from, to, { recursive: true });
}

emptyDirectory(outputDir);
copyEntry('app');
copyEntry('screenshots');

const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
  app_path_max_bytes: 1000,
});
if (dossier.length > 1572864) throw new Error('dossier over the 1.5 MiB gate cap: ' + dossier.length + ' bytes');
writeFileSync(join(outputDir, 'dossier.json'), dossier);
console.log('wrote ' + join(outputDir, 'dossier.json') + ' (' + dossier.length + ' bytes)');
console.log('copied app/ (' + readdirSync(join(outputDir, 'app')).length + ' top-level entries) and screenshots/ (' + readdirSync(join(outputDir, 'screenshots')).length + ' images) to ' + outputDir);

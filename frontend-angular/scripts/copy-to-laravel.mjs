import { access, cp, mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.resolve(__dirname, '..');
const laravelPublic = path.resolve(frontendRoot, '..', 'public');

const candidates = [
  path.join(frontendRoot, 'dist', 'mallqui-gym-frontend', 'browser'),
  path.join(frontendRoot, 'dist', 'mallqui-gym-frontend')
];

let buildDir = null;
for (const candidate of candidates) {
  try {
    await access(path.join(candidate, 'index.html'));
    buildDir = candidate;
    break;
  } catch {}
}

if (!buildDir) {
  throw new Error('No se encontró el build de Angular. Ejecuta primero npm run build.');
}

await mkdir(laravelPublic, { recursive: true });

// Limpia únicamente archivos generados por Angular, sin tocar index.php de Laravel.
const current = await readdir(laravelPublic, { withFileTypes: true });
for (const entry of current) {
  const generatedFile = /^(index\.html|main-.*\.js|polyfills-.*\.js|styles-.*\.css|runtime-.*\.js|chunk-.*\.js|3rdpartylicenses\.txt)$/i.test(entry.name);
  const generatedDir = entry.isDirectory() && entry.name === 'assets';
  if (generatedFile || generatedDir) {
    await rm(path.join(laravelPublic, entry.name), { recursive: true, force: true });
  }
}

const buildEntries = await readdir(buildDir, { withFileTypes: true });
for (const entry of buildEntries) {
  // Nunca reemplazamos el front controller de Laravel.
  if (entry.name.toLowerCase() === 'index.php') continue;
  await cp(
    path.join(buildDir, entry.name),
    path.join(laravelPublic, entry.name),
    { recursive: true, force: true }
  );
}

console.log('✓ Angular compilado e integrado en Laravel/public');

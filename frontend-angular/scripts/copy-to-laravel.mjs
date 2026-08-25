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
  throw new Error('No se encontró el build de Angular.');
}

await mkdir(laravelPublic, { recursive: true });

// Elimina únicamente archivos generados por Angular, sin tocar index.php de Laravel.
const current = await readdir(laravelPublic, { withFileTypes: true });
for (const entry of current) {
  const generatedFile = /^(index\.html|main(?:-.*)?\.js|polyfills(?:-.*)?\.js|styles(?:-.*)?\.css|runtime(?:-.*)?\.js|chunk(?:-.*)?\.js|main\.css|3rdpartylicenses\.txt)$/i.test(entry.name);
  const generatedDir = entry.isDirectory() && entry.name === 'assets';

  if (generatedFile || generatedDir) {
    await rm(path.join(laravelPublic, entry.name), { recursive: true, force: true });
  }
}

const buildEntries = await readdir(buildDir, { withFileTypes: true });
for (const entry of buildEntries) {
  if (entry.name.toLowerCase() === 'index.php') continue;

  await cp(
    path.join(buildDir, entry.name),
    path.join(laravelPublic, entry.name),
    { recursive: true, force: true }
  );
}

// Validación final para evitar que Laravel sirva una interfaz sin estilos.
await access(path.join(laravelPublic, 'index.html'));
await access(path.join(laravelPublic, 'styles.css'));
await access(path.join(laravelPublic, 'main.js'));

console.log('✓ Angular integrado en Laravel con estilos y scripts correctos');

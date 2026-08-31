import { access, cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
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

// Limpia únicamente archivos generados por Angular, sin tocar index.php de Laravel.
const current = await readdir(laravelPublic, { withFileTypes: true });
for (const entry of current) {
  const generatedFile = /^(index\.html|main(?:-.*)?\.js|polyfills(?:-.*)?\.js|styles(?:-.*)?\.css|runtime(?:-.*)?\.js|chunk(?:-.*)?\.js|main(?:-.*)?\.css|3rdpartylicenses\.txt)$/i.test(entry.name);
  const generatedDir = entry.isDirectory() && entry.name === 'assets';

  if (generatedFile || generatedDir) {
    await rm(path.join(laravelPublic, entry.name), { recursive: true, force: true });
  }
}

// Copia el build completo de Angular hacia public/ de Laravel.
const buildEntries = await readdir(buildDir, { withFileTypes: true });
for (const entry of buildEntries) {
  if (entry.name.toLowerCase() === 'index.php') continue;

  await cp(
    path.join(buildDir, entry.name),
    path.join(laravelPublic, entry.name),
    { recursive: true, force: true }
  );
}

const indexPath = path.join(laravelPublic, 'index.html');
const mainPath = path.join(laravelPublic, 'main.js');

await access(indexPath);
await access(mainPath);

// Angular puede generar más de un CSS (por ejemplo styles.css y main.css).
// Los unimos TODOS dentro del index para que Laravel siempre muestre el diseño completo.
const publicEntries = await readdir(laravelPublic, { withFileTypes: true });
const cssFiles = publicEntries
  .filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith('.css'))
  .map(entry => entry.name)
  .sort((a, b) => {
    if (a === 'styles.css') return -1;
    if (b === 'styles.css') return 1;
    return a.localeCompare(b);
  });

if (cssFiles.length === 0) {
  throw new Error('Angular no generó archivos CSS. Revisa angular.json.');
}

let combinedCss = '';
for (const cssFile of cssFiles) {
  const css = await readFile(path.join(laravelPublic, cssFile), 'utf8');
  combinedCss += `\n/* ${cssFile} */\n${css}\n`;
}

const safeCss = combinedCss.replace(/<\/style/gi, '<\\/style');
let html = await readFile(indexPath, 'utf8');

// Retira links CSS generados por Angular porque ya quedarán incrustados.
html = html.replace(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi, '');

// Si existía un bloque anterior, lo reemplazamos.
html = html.replace(/<style id=["']mallqui-angular-styles["']>[\s\S]*?<\/style>/i, '');
html = html.replace(
  '</head>',
  `<style id="mallqui-angular-styles">${safeCss}</style></head>`
);

await writeFile(indexPath, html, 'utf8');

console.log(`✓ Angular integrado en Laravel con ${cssFiles.length} archivo(s) CSS: ${cssFiles.join(', ')}`);

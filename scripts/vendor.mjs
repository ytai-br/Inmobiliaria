import { mkdir, copyFile, readdir } from 'node:fs/promises';
const copies = [
  ['bootstrap/dist/css/bootstrap.min.css', 'bootstrap/bootstrap.min.css'],
  ['bootstrap/dist/js/bootstrap.bundle.min.js', 'bootstrap/bootstrap.bundle.min.js'],
  ['jquery/dist/jquery.min.js', 'jquery/jquery.min.js'],
  ['bootstrap/LICENSE', 'bootstrap/LICENSE'],
  ['jquery/LICENSE.txt', 'jquery/LICENSE.txt'],
  ['bootstrap-icons/font/bootstrap-icons.min.css', 'icons/bootstrap-icons.min.css'],
  ['bootstrap-icons/font/fonts/bootstrap-icons.woff2', 'icons/fonts/bootstrap-icons.woff2'],
  ['bootstrap-icons/font/fonts/bootstrap-icons.woff', 'icons/fonts/bootstrap-icons.woff'],
  ['bootstrap-icons/LICENSE', 'icons/LICENSE']
];
for (const [source, target] of copies) {
  const dest = `assets/vendor/${target}`;
  await mkdir(dest.substring(0, dest.lastIndexOf('/')), { recursive: true });
  await copyFile(`node_modules/${source}`, dest);
}
for (const family of ['playfair-display', 'plus-jakarta-sans']) {
  const root = `node_modules/@fontsource/${family}`;
  await mkdir(`assets/fonts/${family}`, { recursive: true });
  await copyFile(`${root}/LICENSE`, `assets/fonts/${family}/LICENSE`);
  for (const file of await readdir(`${root}/files`)) {
    if (/latin-(400|500|600|700)-normal\.woff2$/.test(file)) {
      await copyFile(`${root}/files/${file}`, `assets/fonts/${family}/${file}`);
    }
  }
}
console.log('Bibliotecas y fuentes copiadas a assets.');

// Dependency-free static locale generation. index.html is the LV template.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, 'js/script.js'), 'utf8');
const dictionary = vm.runInNewContext(source.split('const languageSelect =')[0] + '\nJSON.stringify(translations)');
const translations = JSON.parse(dictionary);
const origin = 'https://narcisiwe.github.io/BCS-Steel/';
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
let template = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
template = template.replace(/\s*<!-- generated-seo:start -->[\s\S]*?<!-- generated-seo:end -->\s*/g, '\n');
function render(language) {
  const t = translations[language];
  let html = template.replace(/<html lang="[^"]+">/, `<html lang="${language}">`);
  html = html.replace(/<title>.*?<\/title>/, `<title>${escape(t.metaTitle)}</title>`);
  html = html.replace(/(<meta name="description" content=")[^"]*/, `$1${escape(t.metaDescription)}`);
  html = html.replace(/<([a-z][a-z0-9-]*)([^>]*\bdata-i18n="([^"]+)"[^>]*)>[\s\S]*?<\/\1>/gi, (match, tag, attrs, key) => {
    if (!t[key]) throw new Error(`Missing ${language}:${key}`);
    return `<${tag}${attrs}>${escape(t[key])}</${tag}>`;
  });
  html = html.replace(/<[a-z][^>]*>/gi, tag => {
    for (const attr of ['placeholder', 'alt', 'aria-label']) {
      const key = new RegExp(`data-i18n-${attr}="([^"]+)"`).exec(tag)?.[1];
      if (key) tag = tag.replace(new RegExp(`(?<![\\w-])${attr}="[^"]*"`), `${attr}="${escape(t[key])}"`);
    }
    return tag;
  });
  html = html.replace(/(<button class="menu-btn"[^>]*aria-label=")[^"]*/, `$1${escape(t.openMenu)}`);
  html = html.replace(/(<option value="(?:lv|ru|en)") selected/g, '$1');
  html = html.replace(`<option value="${language}"`, `<option value="${language}" selected`);
  for (let i = 0; i < 4; i++) html = html.replace(new RegExp(`<button[^>]*data-slide="${i}"[^>]*>`), tag => {
    tag = tag.replace(/\saria-label="[^"]*"/g, '');
    return tag.replace('>', ` aria-label="${i + 1}: ${escape(t[['laserTitle','turnTitle','bendTitle','weldTitle'][i]])}">`);
  });
  const canonical = origin + (language === 'lv' ? '' : `${language}/`);
  const seo = `\n  <!-- generated-seo:start -->
  <link rel="canonical" href="${canonical}" />
${['lv','ru','en','x-default'].map(l => `  <link rel="alternate" hreflang="${l}" href="${origin}${l === 'ru' || l === 'en' ? l + '/' : ''}" />`).join('\n')}
  <link rel="icon" href="img/Logo_1.png" type="image/png" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escape(t.metaTitle)}" />
  <meta property="og:description" content="${escape(t.metaDescription)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${origin}img/hero-laser-cut.jpg" />
  <meta name="twitter:card" content="summary_large_image" />
  <script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'Organization',name:'BCS Steel',url:origin,logo:origin+'img/Logo_1.png'})}</script>
  <!-- generated-seo:end -->\n`;
  html = html.replace('</head>', `${seo}</head>`);
  if (language !== 'lv') {
    html = html.replace(/((?:src|href)=")(img\/|css\/|js\/)/g, '$1../$2');
    html = html.replace(/(srcset=")([^"]*)/g, (_, start, value) => start + value.replace(/(^|,\s*)img\//g, '$1../img/'));
  }
  return html;
}
for (const language of ['lv','ru','en']) {
  const directory = language === 'lv' ? root : path.join(root, language);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, 'index.html'), render(language));
}
fs.writeFileSync(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${['', 'ru/', 'en/'].map(route => `  <url><loc>${origin}${route}</loc></url>`).join('\n')}\n</urlset>\n`);
console.log('Generated LV, RU, EN and sitemap.xml');

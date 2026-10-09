const fs = require('node:fs');
const path = require('node:path');
const target = process.argv[2];
if (!target) throw new Error('Output directory required');
fs.mkdirSync(target, { recursive: true });
const redirect = `function memorikoTarget(href) {
  const url = new URL(href);
  let route = url.pathname.replace(/^\\/spaced-repetition(?=\\/|$)/, '') || '/';
  let query = url.search;
  if (query.startsWith('?/')) {
    const decoded = query.slice(1).split('&').map(s => s.replace(/~and~/g, '&')).join('?');
    const split = decoded.indexOf('?');
    route = split === -1 ? decoded : decoded.slice(0, split);
    query = split === -1 ? '' : decoded.slice(split);
  }
  return 'https://memoriko.com' + (route.startsWith('/') ? route : '/' + route) + query + url.hash;
}`;
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Memoriko has moved</title></head><body><p>Memoriko has moved to <a href="https://memoriko.com">memoriko.com</a>.</p><script>${redirect}\nif('serviceWorker' in navigator)navigator.serviceWorker.register('/spaced-repetition/sw.js').catch(()=>{});\nlocation.replace(memorikoTarget(location.href));</script></body></html>`;
for (const name of ['index.html', '404.html']) fs.writeFileSync(path.join(target, name), html);
fs.writeFileSync(
  path.join(target, 'sw.js'),
  `${redirect}\nself.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil((async () => {
  for(const name of await caches.keys())if(name.includes('/spaced-repetition/'))await caches.delete(name);
  await self.clients.claim();
  await self.registration.unregister();
  for(const client of await self.clients.matchAll({type:'window'}))if(new URL(client.url).pathname.startsWith('/spaced-repetition/'))await client.navigate(client.url);
})()));
self.addEventListener('fetch', event => {if(event.request.mode==='navigate')event.respondWith(Response.redirect(memorikoTarget(event.request.url),302));});\n`,
);
fs.writeFileSync(
  path.join(target, 'registerSW.js'),
  "if('serviceWorker' in navigator)navigator.serviceWorker.register('/spaced-repetition/sw.js');\n",
);
console.log('Created legacy redirects and service-worker retirement.');

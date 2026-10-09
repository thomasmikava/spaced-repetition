function memorikoTarget(href) {
  const url = new URL(href);
  let route = url.pathname.replace(/^\/spaced-repetition(?=\/|$)/, '') || '/';
  let query = url.search;
  if (query.startsWith('?/')) {
    const decoded = query.slice(1).split('&').map(s => s.replace(/~and~/g, '&')).join('?');
    const split = decoded.indexOf('?');
    route = split === -1 ? decoded : decoded.slice(0, split);
    query = split === -1 ? '' : decoded.slice(split);
  }
  return 'https://memoriko.com' + (route.startsWith('/') ? route : '/' + route) + query + url.hash;
}
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil((async () => {
  for(const name of await caches.keys())if(name.includes('/spaced-repetition/'))await caches.delete(name);
  await self.clients.claim();
  await self.registration.unregister();
  for(const client of await self.clients.matchAll({type:'window'}))if(new URL(client.url).pathname.startsWith('/spaced-repetition/'))await client.navigate(client.url);
})()));
self.addEventListener('fetch', event => {if(event.request.mode==='navigate')event.respondWith(Response.redirect(memorikoTarget(event.request.url),302));});

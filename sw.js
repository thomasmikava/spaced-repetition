if(!self.define){let e,i={};const s=(s,n)=>(s=new URL(s+".js",n).href,i[s]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=i,document.head.appendChild(e)}else e=s,importScripts(s),i()})).then((()=>{let e=i[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e})));self.define=(n,r)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(i[o])return;let d={};const t=e=>s(e,o),l={module:{uri:o},exports:d,require:t};i[o]=Promise.all(n.map((e=>l[e]||t(e)))).then((e=>(r(...e),d)))}}define(["./workbox-3e911b1d"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"404.html",revision:"a85b9e1e081321d396b966192ee290e2"},{url:"assets/index-CAFp0he3.css",revision:null},{url:"assets/ScriptsPage-C2OBm7TB.js",revision:null},{url:"assets/TestingThings-CILpXa9P.js",revision:null},{url:"index.html",revision:"8b6225e574751b60ee788a21c33eec0f"},{url:"registerSW.js",revision:"d4ebd21ead4a23d2dd6e3b56adb3bf24"},{url:"favicon.ico",revision:"93043cdfd4b45d61fa94dd3c6e849c54"},{url:"pwa-64x64.png",revision:"b9b479f8ff06c80294ebc1651bf6196b"},{url:"pwa-192x192.png",revision:"2387f2a6f0aa64bef1dfef43cdb2fd71"},{url:"pwa-512x512.png",revision:"2ee5bd8cbb3d0224940224f9dba5a776"},{url:"maskable-icon-512x512.png",revision:"a9cb278ca1d580053748c14dd12885a9"},{url:"manifest.webmanifest",revision:"e95c4110349494ca1cf7ea7a45b233b2"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));

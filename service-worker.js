/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js");

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "404.html",
    "revision": "21a2e299bc4a7f8c79e652de2c6d655c"
  },
  {
    "url": "assets/css/0.styles.e6edb600.css",
    "revision": "e8211d695096f448322d6c00382c6713"
  },
  {
    "url": "assets/img/search.83621669.svg",
    "revision": "83621669651b9a3d4bf64d1a670ad856"
  },
  {
    "url": "assets/js/2.a2294941.js",
    "revision": "f36a510acfef445b19ec50ac30e53bfe"
  },
  {
    "url": "assets/js/3.16e07501.js",
    "revision": "dda738d2c5e28bda33ae77e194d37920"
  },
  {
    "url": "assets/js/4.542aa729.js",
    "revision": "d3baf8afcaf620e9ab688fecfce49636"
  },
  {
    "url": "assets/js/5.ee37d52b.js",
    "revision": "c5790600f3f170b6c6c41af68ea0bb80"
  },
  {
    "url": "assets/js/6.dd514ced.js",
    "revision": "a80d90bef3b9402c93812e3f36b8879b"
  },
  {
    "url": "assets/js/7.17ec545f.js",
    "revision": "80436f703bb2274a1722da8298d49d1c"
  },
  {
    "url": "assets/js/8.5b9cba18.js",
    "revision": "afb841017b71e688bf4358826ba3f1e8"
  },
  {
    "url": "assets/js/9.57a0981f.js",
    "revision": "fa4634529913950bd3e6786170bc0c8a"
  },
  {
    "url": "assets/js/app.19fce9f4.js",
    "revision": "e83db2871d102b8037837facc71a20bf"
  },
  {
    "url": "en/index.html",
    "revision": "ba813d23f780e1f5b7a7746dc0b0fcf3"
  },
  {
    "url": "index.html",
    "revision": "0a7bc9170f84506fd02d346fad890d18"
  },
  {
    "url": "joinus/index.html",
    "revision": "04e4739c6224598272b099adeb879b8d"
  },
  {
    "url": "support/index.html",
    "revision": "8ce2be012a5298cd89d21ecd121703ce"
  },
  {
    "url": "TODO.html",
    "revision": "fe79195b877a2dfcd16e530b24efaa35"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
addEventListener('message', event => {
  const replyPort = event.ports[0]
  const message = event.data
  if (replyPort && message && message.type === 'skip-waiting') {
    event.waitUntil(
      self.skipWaiting().then(
        () => replyPort.postMessage({ error: null }),
        error => replyPort.postMessage({ error })
      )
    )
  }
})

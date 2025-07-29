import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '',
  publicDir: 'public',
  plugins: [svelte(), VitePWA({
    injectRegister: false,
    registerType: 'autoUpdate',
    workbox: false,   
    devOptions: {
        enabled: false             // No dev SW
      },
    manifest: {
    "short_name": "RenewInspect",
    "name": "RenewInspect",
    "description": "Web Viewer for Renew file",
    "icons": [
       {
        "src": `./favicon.png`,
        "sizes": "256x256",
        "type": "image/png"
      },
      {
        "src": `./favicon.svg`,
        "sizes": "207x207",
        "type": "image/svg+xml"
      }
    ],
    "start_url": "/renew-inspector/",
    "scope": "/renew-inspector/",
    "display": "standalone",
    "theme_color": "#ff3e00",
    "background_color": "#fff",
    "shortcuts": [  ]
    },
  })],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
})

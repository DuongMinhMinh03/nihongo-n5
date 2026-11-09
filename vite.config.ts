import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';
import { contentPlugin } from './tools/contentPlugin';

export default defineConfig({
  // Deploy ở tên miền gốc (Cloudflare Pages / Netlify / Vercel):
  // dùng '/' để asset luôn được resolve đúng trên mọi route (vd /grammar).
  // 'import.meta.env.BASE_URL' trong code sẽ tự động là '/'.
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  plugins: [
    react(),
    contentPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'],
      manifest: {
        name: 'Nihongo N5 — Học Tiếng Nhật',
        short_name: 'Nihongo N5',
        description: 'Học từ vựng, ngữ pháp và kanji JLPT N5 — hoạt động offline.',
        lang: 'vi',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2,json}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true
      },
      devOptions: {
        enabled: false
      }
    })
  ],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1200
  }
});

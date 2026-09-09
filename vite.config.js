import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

// Stamps a unique build id into the service worker's CACHE_VERSION token
// right after the production build finishes, so every deploy produces a
// byte-different dist/sw.js — without this, a deploy that never touches
// public/sw.js by hand is invisible to the browser's own service-worker
// update check (a byte-for-byte comparison of that exact file), so
// install/activate never re-run and the app's "Update Now" flow never has
// anything real to detect. See the long comment at the top of public/sw.js
// for the full explanation of why that's the main cause of an installed
// Home Screen/PWA copy staying stuck on an old version.
function stampServiceWorkerVersion() {
  let outDir;
  return {
    name: 'stamp-service-worker-version',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const swPath = path.join(outDir, 'sw.js');
      if (!fs.existsSync(swPath)) return;
      const buildId = String(Date.now());
      const contents = fs.readFileSync(swPath, 'utf8');
      fs.writeFileSync(swPath, contents.replaceAll('__SW_BUILD_ID__', buildId));
    }
  };
}

export default defineConfig({
  plugins: [react(), stampServiceWorkerVersion()],
  server: {
    port: 5173,
    host: true
  }
});

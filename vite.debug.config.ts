/**
 * Debug-only dev server: `pnpm dev:debug`. It serves the app exactly as `pnpm dev` does, but
 * injects a small logger into the page and writes what the browser reports to
 * `debug-logs/browser.log`, so a developer (or Claude) can read it while the app is in use.
 *
 * Nothing here is imported by src/, and the normal dev server and build never load this file.
 * It records: console.* output, uncaught errors, pointer/click events (position and target),
 * and changes to `aria-pressed` (for example the "Draw wall" button).
 */
import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { mergeConfig, type Plugin } from 'vite';
import baseConfig from './vite.config.ts';

const LOG_DIR = join(process.cwd(), 'debug-logs');
const LOG_FILE = join(LOG_DIR, 'browser.log');
const ENDPOINT = '/__debug-log';

/** Runs in the page, before the app. Plain JS in a string because it is injected into index.html. */
const clientScript = `
(() => {
  const send = (kind, data) => {
    try {
      fetch('${ENDPOINT}', {
        method: 'POST',
        keepalive: true,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ t: Date.now(), kind, data }),
      }).catch(() => {});
    } catch {}
  };
  const fmt = (v) => {
    try {
      if (v instanceof Error) return v.stack || v.message;
      return typeof v === 'string' ? v : JSON.stringify(v);
    } catch {
      return String(v);
    }
  };
  const describe = (el) => {
    if (!(el instanceof Element)) return String(el);
    const label = el.getAttribute('aria-label') || (el.textContent || '').trim().slice(0, 30);
    return el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (label ? ' "' + label + '"' : '');
  };

  for (const level of ['log', 'info', 'warn', 'error', 'debug']) {
    const original = console[level].bind(console);
    console[level] = (...args) => {
      send('console.' + level, args.map(fmt).join(' '));
      original(...args);
    };
  }
  window.addEventListener('error', (e) =>
    send('error', e.message + ' at ' + e.filename + ':' + e.lineno + ':' + e.colno));
  window.addEventListener('unhandledrejection', (e) => send('unhandledrejection', fmt(e.reason)));

  for (const type of ['pointerdown', 'click']) {
    document.addEventListener(
      type,
      (e) => send(type, { x: e.clientX, y: e.clientY, button: e.button, target: describe(e.target) }),
      true,
    );
  }
  document.addEventListener('DOMContentLoaded', () => {
    new MutationObserver((records) => {
      for (const r of records) {
        send('aria-pressed', describe(r.target) + ' -> ' + r.target.getAttribute('aria-pressed'));
      }
    }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['aria-pressed'] });
    send('page', 'loaded ' + location.href + ' viewport ' + innerWidth + 'x' + innerHeight);
  });
})();
`;

function debugLogPlugin(): Plugin {
  return {
    name: 'debug-log',
    configureServer(server) {
      mkdirSync(LOG_DIR, { recursive: true });
      writeFileSync(LOG_FILE, ''); // each run of the dev server starts a fresh log
      server.middlewares.use(ENDPOINT, (req, res) => {
        const chunks: Buffer[] = [];
        req.on('data', (chunk: Buffer) => chunks.push(chunk));
        req.on('end', () => {
          try {
            const { t, kind, data } = JSON.parse(Buffer.concat(chunks).toString('utf8'));
            const text = typeof data === 'string' ? data : JSON.stringify(data);
            appendFileSync(LOG_FILE, `${new Date(t).toISOString()} [${kind}] ${text}\n`);
          } catch {
            // a malformed report must never break the dev server
          }
          res.statusCode = 204;
          res.end();
        });
      });
    },
    transformIndexHtml() {
      return [{ tag: 'script', children: clientScript, injectTo: 'head-prepend' }];
    },
  };
}

// A different port from `pnpm dev` (5173), so the two can run side by side and Playwright's
// reuseExistingServer never picks up this one.
export default mergeConfig(baseConfig, {
  plugins: [debugLogPlugin()],
  server: { port: 5174, strictPort: true },
});

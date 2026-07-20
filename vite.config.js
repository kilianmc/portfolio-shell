import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

// The portfolio shell is a Module Federation *host*. It loads each showcase
// project as a remote at runtime. The fund dashboard remote URL is
// configurable via VITE_FUND_REMOTE_URL (set per-environment in Vercel);
// it defaults to the production deployment so the shell works out of the box.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const FUND_REMOTE =
    env.VITE_FUND_REMOTE_URL ||
    'https://ai-portfolio-project1.vercel.app/remoteEntry.js';

  // The Module Federation plugin rewrites the module graph in ways that break
  // jsdom test runs. Skip it under Vitest (dev/build keep federation intact);
  // the federated remote import is mocked in tests instead.
  const isTest = process.env.VITEST === 'true';

  return {
    plugins: [
      react(),
      !isTest &&
        federation({
          name: 'shell',
          // JS project (no tsconfig.json) — skip federated type generation.
          dts: false,
          remotes: {
            fundDashboard: {
              type: 'module',
              name: 'fundDashboard',
              entry: FUND_REMOTE,
            },
          },
          // React is shared as a singleton so host + remote use one instance.
          shared: {
            react: { singleton: true, requiredVersion: '^18.2.0' },
            'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
          },
        }),
    ].filter(Boolean),
    // Without the federation plugin (tests), the bare `fundDashboard/App`
    // specifier has nothing to resolve to and Vite's import analysis errors.
    // Alias it to a local stub; the failure-path test overrides this with a
    // throwing vi.mock to simulate an unreachable remote.
    resolve: isTest
      ? {
          alias: {
            'fundDashboard/App': fileURLToPath(
              new URL('./src/test/remoteAppStub.jsx', import.meta.url),
            ),
          },
        }
      : undefined,
    // Ensure the automatic JSX runtime is used when compiling .jsx test files.
    esbuild: { jsx: 'automatic' },
    // Use Dart Sass's modern compiler API (avoids the legacy JS API
    // deprecation warning). SCSS partials live in src/styles.
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
    // Module Federation relies on top-level await; needs a modern target.
    build: {
      target: 'chrome89',
    },
    server: {
      port: 5173,
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/test/setup.js',
    },
  };
});

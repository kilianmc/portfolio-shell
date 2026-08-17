import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
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
          // The `fundDashboard` remote is a plain-JS project — skip federated
          // type generation. The exposed module is typed locally instead via
          // src/types/remotes.d.ts.
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
            react: {
              singleton: true,
              requiredVersion: '^19.0.0',
              strictVersion: true,
            },
            'react-dom': {
              singleton: true,
              requiredVersion: '^19.0.0',
              strictVersion: true,
            },
          },
        }),
    ].filter(Boolean),
    // `dedupe` keeps host and remote on one React copy under federation.
    // Under tests the federation plugin is absent, so the bare
    // `fundDashboard/App` specifier has nothing to resolve to and Vite's import
    // analysis errors; alias it to a local stub, which the failure-path test
    // overrides with a throwing vi.mock to simulate an unreachable remote.
    resolve: {
      dedupe: ['react', 'react-dom'],
      ...(isTest
        ? {
            alias: {
              'fundDashboard/App': fileURLToPath(
                new URL('./src/test/remoteAppStub.tsx', import.meta.url),
              ),
            },
          }
        : {}),
    },
    // Ensure the automatic JSX runtime is used when compiling .tsx test files.
    esbuild: { jsx: 'automatic' },
    // Use Dart Sass's modern compiler (avoids the legacy JS API deprecation
    // warning). Vite 8 makes the modern compiler the default and dropped the
    // explicit `api: 'modern-compiler'` option from its Sass types, so it is
    // no longer set here — the compilation behavior is unchanged. SCSS
    // partials live in src/styles.
    css: {
      preprocessorOptions: {
        scss: {},
      },
    },
    server: {
      port: 5173,
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/test/setup.ts',
    },
  };
});

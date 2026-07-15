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

  return {
    plugins: [
      react(),
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
    ],
    // Module Federation relies on top-level await; needs a modern target.
    build: {
      target: 'chrome89',
    },
    server: {
      port: 5173,
    },
  };
});

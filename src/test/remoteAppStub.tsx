// Test-only stand-in for the federated remotes (`fundDashboard/App` and
// `climbTrainer/App`). Under Vitest the federation plugin is disabled, so those
// bare specifiers have nothing to resolve to; vite.config.ts aliases both to
// this stub for the success/loading paths. The failure path overrides one with a
// throwing `vi.mock('fundDashboard/App', …)` to simulate an offline remote.
export default function RemoteAppStub() {
  return <div data-testid="remote-app">Federated remote</div>;
}

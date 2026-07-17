// Test-only stand-in for the `fundDashboard/App` federated remote. Under
// Vitest the federation plugin is disabled, so the bare `fundDashboard/App`
// specifier has nothing to resolve to; vite.config.js aliases it to this stub
// for the success/loading paths. The failure path overrides it with a
// throwing `vi.mock('fundDashboard/App', …)` to simulate an offline remote.
export default function RemoteAppStub() {
  return <div data-testid="remote-app">Fund dashboard remote</div>;
}

// Ambient type for the Module Federation remote. The `fundDashboard` remote is
// a plain-JS project with federated type generation disabled (`dts: false` in
// vite.config.ts), so there is no auto-generated declaration for the exposed
// module. Declare it here so the lazy `import('fundDashboard/App')` in
// `src/data/projects.ts` type-checks against a React component default export.
declare module 'fundDashboard/App' {
  const App: React.ComponentType;
  export default App;
}

// Ambient types for the Module Federation remotes. Neither ships federated
// types (`dts: false` on both sides — `fundDashboard` is a plain-JS project and
// `climbTrainer` disables generation), so there is no auto-generated
// declaration for either exposed module. Declare them here so the lazy
// `import('<remote>/App')` calls in `src/data/projects.ts` type-check against a
// React component default export.
declare module 'fundDashboard/App' {
  const App: React.ComponentType;
  export default App;
}

declare module 'climbTrainer/App' {
  const App: React.ComponentType;
  export default App;
}

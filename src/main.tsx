import React from 'react';
import ReactDOM from 'react-dom/client';
// Import global styles BEFORE App so the global layer loads before component
// SCSS — preserves the pre-migration cascade source order.
import './index.scss';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

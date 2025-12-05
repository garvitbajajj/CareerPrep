import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

try {
  const root = createRoot(document.getElementById('root'));
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
} catch (error) {
  console.error('Failed to render app:', error);
  document.getElementById('root').innerHTML = `
    <div style="padding: 2rem; text-align: center; font-family: system-ui;">
      <h1>Failed to load application</h1>
      <p>${error.message}</p>
      <button onclick="window.location.reload()">Reload Page</button>
    </div>
  `;
}

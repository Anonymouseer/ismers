import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Immediate Root Theme & Density Restore from localStorage (prevents theme flash on refresh!)
try {
  const savedTheme = localStorage.getItem('theme') || 'light';
  const savedDensity = localStorage.getItem('density') || 'comfortable';
  document.documentElement.setAttribute('data-theme', savedTheme);
  document.documentElement.setAttribute('data-density', savedDensity);
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
} catch {
  // ignore fallback
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { StyledEngineProvider } from '@mui/material/styles';

// Add Vazirmatn font for Farsi support
const link = document.createElement('link');
link.href = 'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css';
link.rel = 'stylesheet';
document.head.appendChild(link);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <StyledEngineProvider injectFirst>
      <App />
    </StyledEngineProvider>
  </React.StrictMode>
);

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
    },
    secondary: {
      main: '#4f46e5',
    },
  },
});

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider theme={theme}>
        <Router>
          <AnimatePresence mode='wait'>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </AnimatePresence>
        </Router>
      </ThemeProvider>
    </I18nextProvider>
  );
}

export default App;

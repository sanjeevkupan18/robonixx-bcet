import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1F2A44',
                  color: '#e2e8f0',
                  border: '1px solid rgba(93,173,226,0.2)',
                  fontFamily: 'Syne, sans-serif',
                  fontSize: '14px',
                },
                success: { iconTheme: { primary: '#5DADE2', secondary: '#1F2A44' } },
                error: { iconTheme: { primary: '#f87171', secondary: '#1F2A44' } },
                duration: 4000,
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);

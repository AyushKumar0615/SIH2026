import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import InstallPrompt from './components/common/InstallPrompt.jsx';
import UpdateBanner from './components/common/UpdateBanner.jsx';
import SyncStatusIndicator from './components/common/SyncStatusIndicator.jsx';
import 'leaflet/dist/leaflet.css';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <InstallPrompt />
    <UpdateBanner />
    <SyncStatusIndicator />
  </React.StrictMode>
);

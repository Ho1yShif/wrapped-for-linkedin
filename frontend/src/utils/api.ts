/**
 * API Utilities
 * Note: This application is now client-side only and processes Excel files locally.
 * Legacy backend API functions are removed. If future server integrations are needed,
 * axios can be reconfigured here.
 */

import axios from 'axios';

// Keep axios configured but not pointing to any backend by default
const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

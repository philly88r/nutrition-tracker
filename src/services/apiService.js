/**
 * API Service for Cloudflare Backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to make authenticated requests
const authFetch = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
};

// Auth API
export const authAPI = {
  // Register new user
  register: async (email, password, pin = '123456') => {
    return authFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, pin }),
    });
  },

  // Login with email and password
  login: async (email, password) => {
    return authFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Verify PIN
  verifyPin: async (email, pin) => {
    return authFetch('/auth/verify-pin', {
      method: 'POST',
      body: JSON.stringify({ pin }),
    });
  },

  // Update PIN
  updatePin: async (currentPin, newPin) => {
    return authFetch('/auth/update-pin', {
      method: 'PUT',
      body: JSON.stringify({ currentPin, newPin }),
    });
  },

  // Get PIN status
  getPinStatus: async () => {
    return authFetch('/auth/pin-status');
  },

  // Verify token
  verifyToken: async () => {
    return authFetch('/auth/verify');
  },
};

// Food Entries API
export const foodEntriesAPI = {
  // Get all food entries
  getAll: async () => {
    return authFetch('/food-entries');
  },

  // Get food entries for date range
  getRange: async (startDate, endDate) => {
    return authFetch(`/food-entries/range?startDate=${startDate}&endDate=${endDate}`);
  },

  // Create food entry
  create: async (entry) => {
    return authFetch('/food-entries', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  },

  // Update food entry
  update: async (id, entry) => {
    return authFetch(`/food-entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entry),
    });
  },

  // Delete food entry
  delete: async (id) => {
    return authFetch(`/food-entries/${id}`, {
      method: 'DELETE',
    });
  },

  // Bulk sync food entries
  sync: async (entries) => {
    return authFetch('/food-entries/sync', {
      method: 'POST',
      body: JSON.stringify({ entries }),
    });
  },
};

// Goals API
export const goalsAPI = {
  // Get daily goals
  get: async () => {
    return authFetch('/goals');
  },

  // Update daily goals
  update: async (goals) => {
    return authFetch('/goals', {
      method: 'PUT',
      body: JSON.stringify(goals),
    });
  },
};

// Grocery API
export const groceryAPI = {
  // Get all grocery items
  getAll: async () => {
    return authFetch('/grocery');
  },

  // Create grocery item
  create: async (item) => {
    return authFetch('/grocery', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  // Update grocery item
  update: async (id, item) => {
    return authFetch(`/grocery/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  },

  // Delete grocery item
  delete: async (id) => {
    return authFetch(`/grocery/${id}`, {
      method: 'DELETE',
    });
  },
};

// Settings API
export const settingsAPI = {
  // Get user settings
  get: async () => {
    return authFetch('/settings');
  },

  // Update user settings
  update: async (settings) => {
    return authFetch('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },
};

// Profile API
export const profileAPI = {
  // Get user profile
  get: async () => {
    return authFetch('/profile');
  },

  // Update user profile
  update: async (profile) => {
    return authFetch('/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  },
};

// KDP API
export const kdpAPI = {
  validateCode: async (code) => {
    return authFetch('/kdp/validate-code', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },
  register: async (code, email, pin) => {
    return authFetch('/kdp/register', {
      method: 'POST',
      body: JSON.stringify({ code, email, pin }),
    });
  },
  login: async (email, pin) => {
    return authFetch('/kdp/login', {
      method: 'POST',
      body: JSON.stringify({ email, pin }),
    });
  },
};

export default {
  authAPI,
  foodEntriesAPI,
  goalsAPI,
  groceryAPI,
  settingsAPI,
  profileAPI,
  kdpAPI,
};

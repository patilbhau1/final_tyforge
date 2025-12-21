/**
 * Centralized API Configuration
 * All API endpoints should use this configuration
 */

// Get API base URL from environment variable with fallback
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Validate that API URL is configured
if (!import.meta.env.VITE_API_BASE_URL && import.meta.env.PROD) {
  console.error('VITE_API_BASE_URL is not configured in production!');
}

/**
 * API Endpoints
 * Centralized endpoint definitions
 */
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    SIGNUP: `${API_BASE_URL}/api/auth/signup`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    REFRESH: `${API_BASE_URL}/api/auth/refresh`,
  },
  
  // Users
  USERS: {
    ME: `${API_BASE_URL}/api/users/me`,
    UPDATE_PROFILE: `${API_BASE_URL}/api/users/me`,
    UPLOAD_AVATAR: `${API_BASE_URL}/api/users/me/avatar`,
  },
  
  // Projects
  PROJECTS: {
    LIST: `${API_BASE_URL}/api/projects`,
    CREATE: `${API_BASE_URL}/api/projects`,
    BY_ID: (id: number) => `${API_BASE_URL}/api/projects/${id}`,
    UPDATE: (id: number) => `${API_BASE_URL}/api/projects/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/api/projects/${id}`,
  },
  
  // Orders
  ORDERS: {
    LIST: `${API_BASE_URL}/api/orders`,
    ME: `${API_BASE_URL}/api/orders/me`,
    CREATE: `${API_BASE_URL}/api/orders`,
    BY_ID: (id: number) => `${API_BASE_URL}/api/orders/${id}`,
  },
  
  // Plans
  PLANS: {
    LIST: `${API_BASE_URL}/api/plans`,
    BY_ID: (id: number) => `${API_BASE_URL}/api/plans/${id}`,
    SELECT: `${API_BASE_URL}/api/select-plan`,
  },
  
  // Meetings
  MEETINGS: {
    LIST: `${API_BASE_URL}/api/meetings`,
    CREATE: `${API_BASE_URL}/api/meetings`,
    BY_ID: (id: number) => `${API_BASE_URL}/api/meetings/${id}`,
  },
  
  // Synopsis
  SYNOPSIS: {
    UPLOAD: `${API_BASE_URL}/api/synopsis/upload`,
    LIST: `${API_BASE_URL}/api/synopsis`,
  },
  
  // Blackbook
  BLACKBOOK: {
    UPLOAD: `${API_BASE_URL}/api/blackbook/upload`,
  },
  
  // Admin
  ADMIN: {
    REQUESTS: `${API_BASE_URL}/api/admin/requests`,
    REQUEST_HELP: `${API_BASE_URL}/api/admin/requests`,
    REQUESTS_ME: `${API_BASE_URL}/api/admin/requests/me`,
    REQUESTS_ALL: `${API_BASE_URL}/api/admin/requests`,
    STATS: `${API_BASE_URL}/api/admin/stats`,
  },
  
  // User
  USER: {
    SIGNUP_STATUS: `${API_BASE_URL}/api/user/signup-status`,
    UPDATE_PROFILE: `${API_BASE_URL}/api/update-profile`,
  },
  
  // Project Ideas
  PROJECT_IDEAS: {
    CREATE: `${API_BASE_URL}/api/create-project-idea`,
    UPLOAD_SYNOPSIS: (projectId: number) => `${API_BASE_URL}/api/upload-synopsis/${projectId}`,
  },
};

/**
 * Helper function to build API URL
 */
export const buildApiUrl = (path: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE_URL}/${cleanPath}`;
};

/**
 * Get auth headers with token
 */
export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('tyforge_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

/**
 * Get auth headers for file upload (multipart/form-data)
 */
export const getAuthHeadersForUpload = (): HeadersInit => {
  const token = localStorage.getItem('tyforge_token');
  return {
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};
